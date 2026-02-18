import { ExternalProviderAdapter, ShippingProviderError } from './base-adapter';
import type { ShippingRequest, ShippingQuote, ShippingBooking } from '../../types';

/**
 * Baemin Delivery Provider Adapter
 * Integrates with Baemin's delivery API for Korean market
 *
 * CR-07: Provider failures don't block checkout (graceful fallback)
 * CN-01: Credentials from config via getCredential()
 */
export class BaeminAdapter extends ExternalProviderAdapter {
  readonly id = 'baemin';
  readonly name = 'Baemin Delivery';

  private baseUrl: string;
  private apiKey: string;

  constructor(config: Record<string, unknown>) {
    super(config);
    this.baseUrl = this.getCredential('apiUrl');
    this.apiKey = this.getCredential('apiKey');
  }

  /**
   * Check if Baemin can deliver to the customer's location
   * In production: calls Baemin coverage/serviceability API
   */
  async canDeliver(request: ShippingRequest): Promise<boolean> {
    try {
      // Mock implementation - check if in Korean service area
      // Real implementation would call: GET {baseUrl}/v1/coverage?lat=X&lng=Y
      const { latitude, longitude } = request.customerAddress;

      // Baemin operates primarily in South Korea
      // Rough bounds: lat 33-38, lng 124-132
      const isInKorea =
        latitude >= 33 &&
        latitude <= 38 &&
        longitude >= 124 &&
        longitude <= 132;

      return isInKorea;
    } catch {
      // On error, assume not available (fail safe)
      return false;
    }
  }

  /**
   * Get delivery quotes from Baemin
   * Returns array of available delivery options
   */
  async getQuotes(request: ShippingRequest): Promise<ShippingQuote[]> {
    try {
      const canDeliver = await this.canDeliver(request);
      if (!canDeliver) {
        return [];
      }

      // Mock: Get quote from Baemin API
      // Real implementation: POST {baseUrl}/v1/quotes with pickup/delivery coordinates
      const mockResponse = await this.mockBaeminQuoteApi(request);
      return [this.parseQuote(mockResponse)];
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Book a delivery with Baemin using a previously obtained quote
   */
  async book(quoteId: string): Promise<ShippingBooking> {
    try {
      // Validate quote ID belongs to this provider
      if (!quoteId.startsWith(`${this.id}_`)) {
        throw new ShippingProviderError(
          `Invalid quote ID for provider: ${quoteId}`,
          this.id
        );
      }

      // Mock: Create booking with Baemin
      // Real implementation: POST {baseUrl}/v1/bookings with quoteId
      const mockBooking = await this.mockBaeminBookingApi(quoteId);

      return {
        bookingId: mockBooking.bookingId,
        quoteId,
        providerId: this.id,
        status: 'confirmed',
        externalBookingId: mockBooking.baeminOrderId,
        trackingUrl: mockBooking.trackingUrl,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Parse Baemin API response into standardized ShippingQuote
   */
  protected parseQuote(rawQuote: unknown): ShippingQuote {
    const data = rawQuote as {
      price: number;
      eta: number;
      quoteRef: string;
      vehicleType: string;
      expressAvailable?: boolean;
    };

    return {
      quoteId: this.generateQuoteId(),
      providerId: this.id,
      providerName: this.name,
      providerType: this.type,
      price: data.price,
      currency: 'KRW',
      estimatedMinutes: data.eta,
      validUntil: this.getQuoteExpiration(10), // 10 min validity for external
      features: this.buildFeatures(data),
      metadata: {
        baeminQuoteRef: data.quoteRef,
        vehicleType: data.vehicleType,
        expressAvailable: data.expressAvailable,
      },
    };
  }

  /**
   * Build feature list based on quote data
   */
  private buildFeatures(data: {
    vehicleType: string;
    expressAvailable?: boolean;
  }): string[] {
    const features: string[] = [];

    if (data.vehicleType === 'motorcycle') {
      features.push('fast_delivery');
    }
    if (data.expressAvailable) {
      features.push('express_available');
    }
    features.push('real_time_tracking');

    return features;
  }

  // ==================== Mock API Methods ====================
  // Replace with real Baemin API calls in production

  /**
   * Mock Baemin quote API response
   * Real API: POST /v1/quotes
   */
  private async mockBaeminQuoteApi(request: ShippingRequest): Promise<{
    price: number;
    eta: number;
    quoteRef: string;
    vehicleType: string;
    expressAvailable: boolean;
  }> {
    // Simulate API latency
    await this.simulateLatency(100, 300);

    // Calculate mock price based on order total
    const basePrice = 3500; // Base delivery fee in KRW
    const surcharge = request.orderTotal > 30000 ? 0 : 1000; // Surcharge for small orders

    return {
      price: basePrice + surcharge,
      eta: 25 + Math.floor(Math.random() * 15), // 25-40 minutes
      quoteRef: `BM_Q_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      vehicleType: 'motorcycle',
      expressAvailable: request.orderTotal > 20000,
    };
  }

  /**
   * Mock Baemin booking API response
   * Real API: POST /v1/bookings
   */
  private async mockBaeminBookingApi(quoteId: string): Promise<{
    bookingId: string;
    baeminOrderId: string;
    trackingUrl: string;
  }> {
    // Simulate API latency
    await this.simulateLatency(200, 500);

    const orderId = `BM_ORD_${Date.now()}`;

    return {
      bookingId: `booking_${this.id}_${Date.now()}`,
      baeminOrderId: orderId,
      trackingUrl: `https://baemin.com/track/${orderId}`,
    };
  }

  /**
   * Simulate network latency for mock APIs
   */
  private simulateLatency(minMs: number, maxMs: number): Promise<void> {
    const delay = minMs + Math.random() * (maxMs - minMs);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
