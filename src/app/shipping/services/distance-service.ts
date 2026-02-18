import { distance, point } from '@turf/turf';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { DeliveryOrigin, DistanceTier } from '@/payload-types';

export interface DistanceResult {
  distanceKm: number;
  origin: DeliveryOrigin;
}

export interface TierResult {
  tier: DistanceTier;
  price: number;
  estimatedMinutes: number;
}

export class DistanceService {
  /**
   * Calculate Haversine distance between customer and origin
   * Uses @turf/turf distance() for accurate geodesic calculation (DB-01)
   */
  calculateDistance(
    customerLat: number,
    customerLng: number,
    originLat: number,
    originLng: number
  ): number {
    const from = point([customerLng, customerLat]);
    const to = point([originLng, originLat]);
    return distance(from, to, { units: 'kilometers' });
  }

  /**
   * Find nearest available origin for restaurant
   * Filters by: active status, operating hours, capacity
   */
  async findNearestOrigin(
    restaurantId: string,
    customerLat: number,
    customerLng: number,
    scheduledTime?: Date
  ): Promise<DistanceResult | null> {
    const payload = await getPayload({ config });

    // Get active origins for restaurant
    const originsResult = await payload.find({
      collection: 'delivery-origins',
      where: {
        and: [{ restaurantId: { equals: restaurantId } }, { isActive: { equals: true } }],
      },
    });

    if (originsResult.docs.length === 0) {
      return null;
    }

    const now = scheduledTime || new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let nearestOrigin: DeliveryOrigin | null = null;
    let nearestDistance = Infinity;

    for (const origin of originsResult.docs) {
      // Check capacity
      const currentLoad = origin.currentLoad ?? 0;
      const maxCapacity = origin.maxCapacity ?? 50;
      if (currentLoad >= maxCapacity) {
        continue;
      }

      // Check operating hours
      const operatingHours = origin.operatingHours ?? [];
      const todayHours = operatingHours.find((h) => h.day === currentDay);
      if (!todayHours) {
        continue;
      }

      // Check if current time is within operating hours
      if (!this.isTimeInRange(currentTime, todayHours.open, todayHours.close)) {
        continue;
      }

      // Calculate distance using Haversine formula via @turf/distance
      const distanceKm = this.calculateDistance(
        customerLat,
        customerLng,
        origin.latitude,
        origin.longitude
      );

      if (distanceKm < nearestDistance) {
        nearestDistance = distanceKm;
        nearestOrigin = origin;
      }
    }

    if (!nearestOrigin) {
      return null;
    }

    return {
      distanceKm: nearestDistance,
      origin: nearestOrigin,
    };
  }

  /**
   * Get pricing tier for distance
   * Returns tier where minDistanceKm <= distance < maxDistanceKm
   */
  async getTierForDistance(
    restaurantId: string,
    distanceKm: number
  ): Promise<TierResult | null> {
    const payload = await getPayload({ config });

    const tiersResult = await payload.find({
      collection: 'distance-tiers',
      where: { restaurantId: { equals: restaurantId } },
      sort: 'minDistanceKm',
    });

    if (tiersResult.docs.length === 0) {
      return null;
    }

    // Find tier where minDistanceKm <= distance < maxDistanceKm
    const matchingTier = tiersResult.docs.find(
      (tier) => distanceKm >= tier.minDistanceKm && distanceKm < tier.maxDistanceKm
    );

    if (!matchingTier) {
      return null;
    }

    return {
      tier: matchingTier,
      price: matchingTier.price,
      estimatedMinutes: matchingTier.estimatedMinutes,
    };
  }

  /**
   * Get maximum delivery distance configured for restaurant
   */
  async getMaxDeliveryDistance(restaurantId: string): Promise<number> {
    const payload = await getPayload({ config });

    const tiersResult = await payload.find({
      collection: 'distance-tiers',
      where: { restaurantId: { equals: restaurantId } },
      sort: '-maxDistanceKm',
      limit: 1,
    });

    if (tiersResult.docs.length === 0) {
      return 0;
    }

    return tiersResult.docs[0].maxDistanceKm;
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

export const distanceService = new DistanceService();
