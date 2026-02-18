import { getPayload } from 'payload';
import config from '@payload-config';
import type { ShippingProvider, ShippingRequest, ShippingQuote, QuoteResult } from '../types';
import { DistanceBasedProvider } from '../providers/distance-provider';
import { ManualProvider } from '../providers/manual-provider';
import { BaeminAdapter } from '../providers/external/baemin-adapter';

/**
 * Extended request with customerId for quote caching
 */
export interface ShippingServiceRequest extends ShippingRequest {
  customerId: string;
}

/**
 * ShippingService - Orchestrates all shipping providers
 *
 * CR-05: Aggregates quotes from ALL enabled providers
 * CR-07: Provider failures don't block checkout (Promise.allSettled)
 * CN-02: External failure → fallback to internal providers
 */
export class ShippingService {
  private readonly QUOTE_TIMEOUT_MS = 2000; // 2s total timeout per provider

  /**
   * Get quotes from all enabled providers for a restaurant
   * Uses Promise.allSettled to ensure one provider failure doesn't block others
   */
  async getQuotes(request: ShippingServiceRequest): Promise<QuoteResult> {
    // 1. Load enabled providers for restaurant
    const providers = await this.loadProviders(request.restaurantId);

    if (providers.length === 0) {
      return { quotes: [], error: 'no_providers_enabled' };
    }

    // 2. Get quotes from all providers concurrently (Promise.allSettled)
    // CR-07: Provider failures don't block checkout
    const results = await Promise.allSettled(
      providers.map((p) => this.withTimeout(p.getQuotes(request), this.QUOTE_TIMEOUT_MS))
    );

    // 3. Collect successful quotes
    const quotes = results
      .filter((r): r is PromiseFulfilledResult<ShippingQuote[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    // 4. Track provider failures for fallback logic
    const failedProviders = results
      .map((r, i) => (r.status === 'rejected' ? providers[i] : null))
      .filter((p): p is ShippingProvider => p !== null);

    const externalFailed = failedProviders.some((p) => p.type === 'external');
    const internalProviders = providers.filter((p) => p.type !== 'external');
    const internalSucceeded = results.some(
      (r, i) => r.status === 'fulfilled' && providers[i].type !== 'external'
    );

    // 5. Handle no quotes scenario
    if (quotes.length === 0) {
      // CN-02: If external failed but internal providers exist, note fallback opportunity
      if (externalFailed && internalProviders.length > 0) {
        return { quotes: [], fallbackReason: 'external_failed' };
      }
      return { quotes: [], error: 'delivery_not_available' };
    }

    // 6. Note if external failed but we have internal quotes
    const fallbackReason = externalFailed && internalSucceeded ? 'external_failed' : undefined;

    // 7. Cache quotes in ShippingQuotes collection for later retrieval
    await this.cacheQuotes(quotes, request);

    return { quotes, fallbackReason };
  }

  /**
   * Select a quote for checkout
   * Validates quote, calls book() for external providers, creates booking record
   */
  async selectQuote(
    quoteId: string,
    orderId: string,
    customerId: string
  ): Promise<{ success: boolean; error?: string; bookingId?: string }> {
    const payload = await getPayload({ config });

    // Find the cached quote
    const quotesResult = await payload.find({
      collection: 'shipping-quotes',
      where: {
        quoteId: { equals: quoteId },
        customerId: { equals: customerId },
      },
      limit: 1,
    });

    if (quotesResult.docs.length === 0) {
      return { success: false, error: 'quote_not_found' };
    }

    const quote = quotesResult.docs[0];

    // Validate quote not expired
    const validUntil = new Date(quote.validUntil as string);
    if (validUntil < new Date()) {
      return { success: false, error: 'quote_expired' };
    }

    // For external providers, attempt to book
    if (quote.providerType === 'external') {
      try {
        const provider = this.instantiateProviderByType(
          quote.providerId as string,
          (quote.metadata as Record<string, unknown>) || {}
        );

        if (provider.book) {
          const booking = await provider.book(quoteId);

          // Create ShippingBooking record
          const bookingRecord = await payload.create({
            collection: 'shipping-bookings',
            data: {
              bookingId: booking.bookingId,
              quoteId: quoteId,
              orderId: orderId,
              providerId: booking.providerId,
              status: booking.status,
              trackingUrl: booking.trackingUrl,
              externalBookingId: booking.externalBookingId,
            },
          });

          return { success: true, bookingId: bookingRecord.id };
        }
      } catch (error) {
        // CR-07: External booking failure - could fall back to internal
        return {
          success: false,
          error: `external_booking_failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }

    // For internal providers (distance, manual), just record the selection
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    await payload.create({
      collection: 'shipping-bookings',
      data: {
        bookingId: bookingId,
        quoteId: quoteId,
        orderId: orderId,
        providerId: quote.providerId,
        status: quote.providerType === 'manual' ? 'pending' : 'confirmed',
        // No trackingUrl for internal providers initially
      },
    });

    return { success: true, bookingId };
  }

  /**
   * Set manual price (restaurant action)
   * CR-04: Restaurant sets delivery price for manual quotes
   */
  async setManualPrice(
    orderId: string,
    price: number,
    restaurantId: string
  ): Promise<{ success: boolean; error?: string }> {
    const payload = await getPayload({ config });

    // Find the booking for this order
    const bookingsResult = await payload.find({
      collection: 'shipping-bookings',
      where: {
        orderId: { equals: orderId },
      },
      limit: 1,
    });

    if (bookingsResult.docs.length === 0) {
      return { success: false, error: 'booking_not_found' };
    }

    const booking = bookingsResult.docs[0];

    // Verify this is a manual provider booking
    if (booking.providerId !== 'manual') {
      return { success: false, error: 'not_manual_provider' };
    }

    // Get the original quote to verify restaurant ownership
    const quotesResult = await payload.find({
      collection: 'shipping-quotes',
      where: {
        quoteId: { equals: booking.quoteId },
      },
      limit: 1,
    });

    if (quotesResult.docs.length === 0) {
      return { success: false, error: 'quote_not_found' };
    }

    const quote = quotesResult.docs[0];

    // Validate restaurant ownership
    if (quote.restaurantId !== restaurantId) {
      return { success: false, error: 'unauthorized' };
    }

    // Update the quote with the manual price
    await payload.update({
      collection: 'shipping-quotes',
      id: quote.id,
      data: {
        price: price,
        metadata: {
          ...((quote.metadata as Record<string, unknown>) || {}),
          manualPriceSetAt: new Date().toISOString(),
          manualPriceSetBy: restaurantId,
        },
      },
    });

    // Update booking status to confirmed
    await payload.update({
      collection: 'shipping-bookings',
      id: booking.id,
      data: {
        status: 'confirmed',
      },
    });

    // TODO: Notify customer of price set (placeholder for notification system)
    // await notificationService.notifyCustomer(quote.customerId, { type: 'shipping_price_set', price });

    return { success: true };
  }

  /**
   * Load enabled providers for a restaurant, sorted by priority
   */
  private async loadProviders(restaurantId: string): Promise<ShippingProvider[]> {
    const payload = await getPayload({ config });

    const providerConfigs = await payload.find({
      collection: 'shipping-providers',
      overrideAccess: true,
      where: {
        and: [{ restaurantId: { equals: restaurantId } }, { isEnabled: { equals: true } }],
      },
      sort: 'priority',
    });

    return providerConfigs.docs.map((providerConfig) =>
      this.instantiateProvider(providerConfig as unknown as Record<string, unknown>)
    );
  }

  /**
   * Instantiate a provider from its database configuration
   */
  private instantiateProvider(providerConfig: Record<string, unknown>): ShippingProvider {
    const providerType = providerConfig.providerType as string;
    const providerConfigData = (providerConfig.config as Record<string, unknown>) || {};

    return this.instantiateProviderByType(providerType, providerConfigData);
  }

  /**
   * Instantiate a provider by type with optional config
   */
  private instantiateProviderByType(
    providerType: string,
    providerConfig: Record<string, unknown> = {}
  ): ShippingProvider {
    switch (providerType) {
      case 'distance':
        return new DistanceBasedProvider();

      case 'manual':
        return new ManualProvider();

      case 'baemin':
        return new BaeminAdapter(providerConfig);

      case 'coupang':
        // TODO: Implement CoupangAdapter when available
        throw new Error('Coupang adapter not yet implemented');

      case 'yogiyo':
        // TODO: Implement YogiyoAdapter when available
        throw new Error('Yogiyo adapter not yet implemented');

      default:
        throw new Error(`Unknown provider type: ${providerType}`);
    }
  }

  /**
   * Wrap a promise with a timeout
   * CR-07: Prevents slow providers from blocking the entire request
   */
  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Provider timeout after ${ms}ms`)), ms)
    );
    return Promise.race([promise, timeout]);
  }

  /**
   * Cache quotes in ShippingQuotes collection for later retrieval
   * Allows quote validation during checkout
   */
  private async cacheQuotes(
    quotes: ShippingQuote[],
    request: ShippingServiceRequest
  ): Promise<void> {
    const payload = await getPayload({ config });

    for (const quote of quotes) {
      try {
        await payload.create({
          collection: 'shipping-quotes',
          data: {
            quoteId: quote.quoteId,
            providerId: quote.providerId,
            providerName: quote.providerName,
            providerType: quote.providerType,
            customerId: request.customerId,
            restaurantId: request.restaurantId,
            price: quote.price,
            estimatedMinutes: quote.estimatedMinutes,
            validUntil: quote.validUntil.toISOString(),
            request: {
              customerAddress: request.customerAddress,
              orderTotal: request.orderTotal,
              scheduledTime: request.scheduledTime?.toISOString(),
            },
            metadata: quote.metadata || {},
          },
        });
      } catch (error) {
        // Log but don't fail the entire operation if caching fails
        // The quotes are still valid and can be used
        console.error(`Failed to cache quote ${quote.quoteId}:`, error);
      }
    }
  }
}

// Export singleton instance for convenience
export const shippingService = new ShippingService();
