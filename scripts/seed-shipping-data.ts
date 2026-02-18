#!/usr/bin/env npx tsx
/**
 * Script: seed-shipping-data.ts
 * Created: 2026-02-19
 * Purpose: Seed shipping providers, delivery origins, and distance tiers for existing restaurants
 * Keywords: seed, shipping, delivery, distance-tiers, providers
 * Status: active
 * Prerequisites:
 *   - MongoDB running
 *   - Restaurants already exist in database
 * Changelog:
 *   - 2026-02-19: Initial version
 * See-Also: .claude/CLAUDE.md ##Seed scripts
 *
 * Usage: npx tsx scripts/seed-shipping-data.ts
 */

import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.DATABASE_URI || 'mongodb://127.0.0.1/payload-template-blank-3-0';

// Seoul district coordinates for delivery origins
const SEOUL_LOCATIONS = [
  { name: 'Gangnam Kitchen', district: 'Gangnam-gu', lat: 37.4979, lng: 127.0276, address: '123 Gangnam-daero, Gangnam-gu, Seoul' },
  { name: 'Hongdae Kitchen', district: 'Mapo-gu', lat: 37.5563, lng: 126.9237, address: '45 Hongik-ro, Mapo-gu, Seoul' },
  { name: 'Myeongdong Kitchen', district: 'Jung-gu', lat: 37.5636, lng: 126.9869, address: '78 Myeongdong-gil, Jung-gu, Seoul' },
  { name: 'Itaewon Kitchen', district: 'Yongsan-gu', lat: 37.5344, lng: 126.9948, address: '56 Itaewon-ro, Yongsan-gu, Seoul' },
  { name: 'Jamsil Kitchen', district: 'Songpa-gu', lat: 37.5133, lng: 127.1001, address: '89 Olympic-ro, Songpa-gu, Seoul' },
];

// Standard operating hours (9 AM - 10 PM, every day)
// day is stored as number: 0=Sunday, 1=Monday, ..., 6=Saturday (matches JS Date.getDay())
const OPERATING_HOURS = [
  { day: 0, open: '09:00', close: '22:00' }, // Sunday
  { day: 1, open: '09:00', close: '22:00' }, // Monday
  { day: 2, open: '09:00', close: '22:00' }, // Tuesday
  { day: 3, open: '09:00', close: '22:00' }, // Wednesday
  { day: 4, open: '09:00', close: '22:00' }, // Thursday
  { day: 5, open: '09:00', close: '23:00' }, // Friday
  { day: 6, open: '09:00', close: '23:00' }, // Saturday
];

// Distance tiers pricing (in KRW)
const DISTANCE_TIERS = [
  { minDistanceKm: 0, maxDistanceKm: 2, price: 2000, estimatedMinutes: 20, freeAfterAmount: 25000 },
  { minDistanceKm: 2, maxDistanceKm: 4, price: 3000, estimatedMinutes: 30, freeAfterAmount: 35000 },
  { minDistanceKm: 4, maxDistanceKm: 6, price: 4000, estimatedMinutes: 40, freeAfterAmount: 50000 },
  { minDistanceKm: 6, maxDistanceKm: 10, price: 5500, estimatedMinutes: 50, freeAfterAmount: null },
];

async function seedShippingData() {
  console.log('Connecting to MongoDB:', MONGODB_URI);
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const now = new Date();

    // Get all restaurants with isDelivery=true
    const restaurantsCollection = db.collection('restaurants');
    const restaurants = await restaurantsCollection.find({ isDelivery: true }).toArray();

    if (restaurants.length === 0) {
      console.log('No restaurants with isDelivery=true found.');
      console.log('Checking all restaurants...');
      const allRestaurants = await restaurantsCollection.find({}).toArray();
      console.log(`Found ${allRestaurants.length} total restaurants`);

      if (allRestaurants.length === 0) {
        console.log('No restaurants in database. Run seed-test-data.ts first.');
        return;
      }

      // Use all restaurants
      restaurants.push(...allRestaurants);
    }

    console.log(`Found ${restaurants.length} restaurants to configure shipping for`);

    // Collections
    const deliveryOriginsCollection = db.collection('delivery-origins');
    const distanceTiersCollection = db.collection('distance-tiers');
    const shippingProvidersCollection = db.collection('shipping-providers');

    // Clear existing shipping data for these restaurants
    const restaurantIds = restaurants.map(r => r._id);
    const restaurantIdStrings = restaurantIds.map(id => id.toString());

    console.log('Clearing existing shipping data...');
    // Delete by both string and ObjectId formats (handles re-seeding)
    const deleteFilter = {
      $or: [
        { restaurantId: { $in: restaurantIds } },
        { restaurantId: { $in: restaurantIdStrings } },
      ]
    };
    const deletedOrigins = await deliveryOriginsCollection.deleteMany(deleteFilter);
    const deletedTiers = await distanceTiersCollection.deleteMany(deleteFilter);
    const deletedProviders = await shippingProvidersCollection.deleteMany(deleteFilter);
    console.log(`Deleted: ${deletedOrigins.deletedCount} origins, ${deletedTiers.deletedCount} tiers, ${deletedProviders.deletedCount} providers`);

    let totalOrigins = 0;
    let totalTiers = 0;
    let totalProviders = 0;

    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      const restaurantId = restaurant._id; // Keep as ObjectId - Payload relationship fields require ObjectId
      const restaurantName = restaurant.title || restaurant.name || `Restaurant ${i + 1}`;

      console.log(`\n--- Configuring: ${restaurantName} ---`);

      // Pick 1-2 Seoul locations for this restaurant
      const locationIndex = i % SEOUL_LOCATIONS.length;
      const primaryLocation = SEOUL_LOCATIONS[locationIndex];
      const locations = [primaryLocation];

      // Add secondary location for some restaurants
      if (i % 3 === 0 && SEOUL_LOCATIONS.length > 1) {
        const secondaryIndex = (locationIndex + 2) % SEOUL_LOCATIONS.length;
        locations.push(SEOUL_LOCATIONS[secondaryIndex]);
      }

      // Create delivery origins
      for (const location of locations) {
        const origin = {
          restaurantId: restaurantId,
          name: `${restaurantName} - ${location.name}`,
          address: location.address,
          latitude: location.lat,
          longitude: location.lng,
          operatingHours: OPERATING_HOURS,
          maxCapacity: 30 + Math.floor(Math.random() * 20),
          currentLoad: Math.floor(Math.random() * 10),
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };

        await deliveryOriginsCollection.insertOne(origin);
        totalOrigins++;
        console.log(`  Created origin: ${origin.name} (${location.lat}, ${location.lng})`);
      }

      // Create distance tiers
      for (const tier of DISTANCE_TIERS) {
        const distanceTier = {
          restaurantId: restaurantId,
          minDistanceKm: tier.minDistanceKm,
          maxDistanceKm: tier.maxDistanceKm,
          price: tier.price,
          estimatedMinutes: tier.estimatedMinutes,
          freeAfterAmount: tier.freeAfterAmount,
          createdAt: now,
          updatedAt: now,
        };

        await distanceTiersCollection.insertOne(distanceTier);
        totalTiers++;
      }
      console.log(`  Created ${DISTANCE_TIERS.length} distance tiers`);

      // Create shipping providers
      // 1. Distance-based provider (priority 0 - highest)
      const distanceProvider = {
        restaurantId: restaurantId,
        providerType: 'distance',
        isEnabled: true,
        priority: 0,
        config: {},
        createdAt: now,
        updatedAt: now,
      };
      await shippingProvidersCollection.insertOne(distanceProvider);
      totalProviders++;
      console.log('  Created distance provider (priority 0)');

      // 2. Manual provider (priority 1 - fallback)
      const manualProvider = {
        restaurantId: restaurantId,
        providerType: 'manual',
        isEnabled: true,
        priority: 1,
        config: {},
        createdAt: now,
        updatedAt: now,
      };
      await shippingProvidersCollection.insertOne(manualProvider);
      totalProviders++;
      console.log('  Created manual provider (priority 1)');
    }

    console.log('\n========================================');
    console.log('Shipping Data Seeding Complete!');
    console.log('========================================');
    console.log(`Restaurants configured: ${restaurants.length}`);
    console.log(`Delivery origins created: ${totalOrigins}`);
    console.log(`Distance tiers created: ${totalTiers}`);
    console.log(`Shipping providers created: ${totalProviders}`);
    console.log('');
    console.log('Distance Tier Pricing (KRW):');
    DISTANCE_TIERS.forEach(t => {
      const free = t.freeAfterAmount ? ` (free if order > ₩${t.freeAfterAmount.toLocaleString()})` : '';
      console.log(`  ${t.minDistanceKm}-${t.maxDistanceKm}km: ₩${t.price.toLocaleString()}${free}`);
    });

  } catch (error) {
    console.error('Error seeding shipping data:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the seed
seedShippingData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
