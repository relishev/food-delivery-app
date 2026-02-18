import { ShippingProvider, ShippingRequest, ShippingQuote } from '../types';

/**
 * ManualProvider - For traditional Korean restaurants that set delivery price manually
 * CR-04: Returns price=-1 as pending marker for restaurant to set
 */
export class ManualProvider implements ShippingProvider {
  id = 'manual';
  type: 'manual' = 'manual';
  name = 'Manual Price (Restaurant Sets)';

  async canDeliver(_request: ShippingRequest): Promise<boolean> {
    // Always returns true - restaurant handles delivery manually
    return true;
  }

  async getQuotes(request: ShippingRequest): Promise<ShippingQuote[]> {
    const quoteId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return [
      {
        quoteId,
        providerId: this.id,
        providerName: this.name,
        providerType: this.type,
        price: -1, // CR-04: pending marker - restaurant sets price
        currency: 'KRW',
        estimatedMinutes: 45, // default for manual delivery
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h validity
        metadata: {
          manualQuoteTimeout: '24h',
          requiresRestaurantConfirmation: true,
        },
      },
    ];
  }

  // No book() method - restaurant handles fulfillment externally
}
