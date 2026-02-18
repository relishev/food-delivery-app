// ShippingProvider interface - CR-01: Universal contract
export interface ShippingProvider {
  id: string;
  name: string;
  type: 'distance' | 'manual' | 'external';
  canDeliver(request: ShippingRequest): Promise<boolean>;
  getQuotes(request: ShippingRequest): Promise<ShippingQuote[]>;
  book?(quoteId: string): Promise<ShippingBooking>;
}

// ShippingRequest
export interface ShippingRequest {
  restaurantId: string;
  customerAddress: {
    latitude: number;
    longitude: number;
    fullAddress: string;
  };
  orderTotal: number;
  scheduledTime?: Date;
}

// ShippingQuote - DB-04: Client-generated quoteId with providerId prefix
export interface ShippingQuote {
  quoteId: string; // format: {providerId}_{timestamp}_{random}
  providerId: string;
  providerName: string;
  providerType: ShippingProvider['type'];
  price: number; // -1 for manual/pending (CR-04)
  currency: string;
  estimatedMinutes: number;
  validUntil: Date; // CR-06: Quotes expire
  features?: string[];
  trackingUrl?: string;
  metadata?: Record<string, unknown>;
}

// ShippingBooking
export interface ShippingBooking {
  bookingId: string;
  quoteId: string;
  providerId: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'delivered' | 'cancelled';
  trackingUrl?: string;
  externalBookingId?: string;
}

// DeliveryOrigin (restaurant delivery points)
export interface DeliveryOrigin {
  id: string;
  restaurantId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  operatingHours: { day: number; open: string; close: string }[];
  maxCapacity: number;
  currentLoad: number;
  isActive: boolean;
}

// DistanceTier (distance-based pricing)
export interface DistanceTier {
  id: string;
  restaurantId: string;
  minDistanceKm: number;
  maxDistanceKm: number;
  price: number;
  estimatedMinutes: number;
  freeAfterAmount?: number;
}

// Helper types
export type QuoteResult = {
  quotes: ShippingQuote[];
  error?: string;
  fallbackReason?: 'external_failed' | 'all_failed';
};
