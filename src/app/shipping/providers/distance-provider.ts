import { distance, point } from '@turf/turf';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { ShippingProvider, ShippingRequest, ShippingQuote } from '../types';

/**
 * DistanceBasedProvider - CR-02: Distance-based shipping using Haversine formula
 * Uses @turf/distance for accurate distance calculation
 */
export class DistanceBasedProvider implements ShippingProvider {
  id = 'distance';
  type: 'distance' = 'distance';
  name = 'Distance-Based Delivery';

  /**
   * Check if delivery is possible to the customer address
   * Filters origins by: active status, operating hours, capacity, and max distance
   */
  async canDeliver(request: ShippingRequest): Promise<boolean> {
    const availableOrigins = await this.getAvailableOrigins(request);
    return availableOrigins.length > 0;
  }

  /**
   * Get delivery quotes for the request
   * Returns quote from nearest available origin with tier-based pricing
   */
  async getQuotes(request: ShippingRequest): Promise<ShippingQuote[]> {
    const payload = await getPayload({ config });
    const availableOrigins = await this.getAvailableOrigins(request);

    if (availableOrigins.length === 0) {
      return [];
    }

    // Find nearest origin
    const nearestOrigin = availableOrigins.reduce((nearest, current) =>
      current.distanceKm < nearest.distanceKm ? current : nearest
    );

    // Get distance tiers for restaurant
    const tiersResult = await payload.find({
      collection: 'distance-tiers',
      where: {
        restaurantId: { equals: request.restaurantId },
      },
      sort: 'minDistanceKm',
    });

    if (tiersResult.docs.length === 0) {
      return [];
    }

    // Find matching tier for distance
    const matchingTier = tiersResult.docs.find(
      (tier) =>
        nearestOrigin.distanceKm >= (tier.minDistanceKm as number) &&
        nearestOrigin.distanceKm < (tier.maxDistanceKm as number)
    );

    if (!matchingTier) {
      return [];
    }

    // Calculate price (check for free delivery threshold)
    let finalPrice = matchingTier.price as number;
    if (
      matchingTier.freeAfterAmount &&
      request.orderTotal >= (matchingTier.freeAfterAmount as number)
    ) {
      finalPrice = 0;
    }

    // Generate quote ID: {providerId}_{timestamp}_{random}
    const quoteId = `${this.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // CR-06: Quotes expire after 15 minutes
    const validUntil = new Date(Date.now() + 15 * 60 * 1000);

    const quote: ShippingQuote = {
      quoteId,
      providerId: this.id,
      providerName: this.name,
      providerType: this.type,
      price: finalPrice,
      currency: 'KRW',
      estimatedMinutes: matchingTier.estimatedMinutes as number,
      validUntil,
      features: ['distance-based', 'haversine-calculation'],
      metadata: {
        originId: nearestOrigin.id,
        originName: nearestOrigin.name,
        distanceKm: Math.round(nearestOrigin.distanceKm * 100) / 100,
        tierId: matchingTier.id,
      },
    };

    return [quote];
  }

  /**
   * Get available origins filtered by operating hours, capacity, and max distance
   */
  private async getAvailableOrigins(
    request: ShippingRequest
  ): Promise<{ id: string; name: string; distanceKm: number }[]> {
    const payload = await getPayload({ config });

    // Get all active origins for restaurant
    const originsResult = await payload.find({
      collection: 'delivery-origins',
      where: {
        restaurantId: { equals: request.restaurantId },
        isActive: { equals: true },
      },
    });

    if (originsResult.docs.length === 0) {
      return [];
    }

    // Get max distance from tiers
    const tiersResult = await payload.find({
      collection: 'distance-tiers',
      where: {
        restaurantId: { equals: request.restaurantId },
      },
      sort: '-maxDistanceKm',
      limit: 1,
    });

    const maxDeliveryDistance =
      tiersResult.docs.length > 0 ? (tiersResult.docs[0].maxDistanceKm as number) : 0;

    if (maxDeliveryDistance === 0) {
      return [];
    }

    const now = request.scheduledTime || new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const customerPoint = point([request.customerAddress.longitude, request.customerAddress.latitude]);

    const availableOrigins: { id: string; name: string; distanceKm: number }[] = [];

    for (const origin of originsResult.docs) {
      // Check capacity
      const currentLoad = (origin.currentLoad as number) || 0;
      const maxCapacity = (origin.maxCapacity as number) || 50;
      if (currentLoad >= maxCapacity) {
        continue;
      }

      // Check operating hours
      const operatingHours = (origin.operatingHours as { day: number; open: string; close: string }[]) || [];
      const todayHours = operatingHours.find((h) => h.day === currentDay);
      if (!todayHours) {
        continue;
      }

      // Check if current time is within operating hours
      if (!this.isTimeInRange(currentTime, todayHours.open, todayHours.close)) {
        continue;
      }

      // Calculate distance using Haversine formula via @turf/distance
      const originPoint = point([origin.longitude as number, origin.latitude as number]);
      const distanceKm = distance(originPoint, customerPoint, { units: 'kilometers' });

      // Check if within max delivery distance
      if (distanceKm > maxDeliveryDistance) {
        continue;
      }

      availableOrigins.push({
        id: origin.id,
        name: origin.name as string,
        distanceKm,
      });
    }

    return availableOrigins;
  }

  /**
   * Check if a time string is within a range (handles overnight ranges)
   */
  private isTimeInRange(time: string, open: string, close: string): boolean {
    // Handle overnight ranges (e.g., 22:00 - 02:00)
    if (close < open) {
      return time >= open || time < close;
    }
    return time >= open && time < close;
  }
}
