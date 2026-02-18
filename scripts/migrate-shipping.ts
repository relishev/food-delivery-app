#!/usr/bin/env npx tsx
/**
 * Script: migrate-shipping.ts
 * Created: 2026-02-18
 * Purpose: Create default shipping providers for existing restaurants with delivery enabled
 * Keywords: migration, shipping, providers, restaurants
 * Status: active
 * Prerequisites:
 *   - MongoDB running locally
 *   - Environment variables configured (.env.local)
 * Changelog:
 *   - 2026-02-18: Initial version
 * See-Also: .claude/CLAUDE.md ##Управление скриптами
 *
 * Usage: npx tsx scripts/migrate-shipping.ts
 */

import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.DATABASE_URI || 'mongodb://127.0.0.1/payload-template-blank-3-0';

interface ShippingProvider {
  _id?: ObjectId;
  restaurantId: ObjectId;
  providerType: 'distance' | 'manual' | 'external';
  isEnabled: boolean;
  priority: number;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

async function migrateShipping() {
  console.log('Starting shipping migration...');
  console.log(`Connecting to: ${MONGODB_URI}`);

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const restaurantsCollection = db.collection('restaurants');
    const shippingProvidersCollection = db.collection('shipping-providers');
    const deliveryOriginsCollection = db.collection('delivery-origins');

    // Get all restaurants with isDelivery=true
    const restaurants = await restaurantsCollection
      .find({ isDelivery: true })
      .toArray();

    console.log(`Found ${restaurants.length} restaurants with delivery enabled`);

    let created = 0;
    let skipped = 0;

    for (const restaurant of restaurants) {
      // Check if restaurant already has shipping providers
      const existingProvider = await shippingProvidersCollection.findOne({
        restaurantId: restaurant._id,
      });

      if (existingProvider) {
        console.log(`Skipping ${restaurant.title || restaurant.name} - already has providers`);
        skipped++;
        continue;
      }

      const now = new Date();

      // Create default manual provider
      const manualProvider: ShippingProvider = {
        restaurantId: restaurant._id,
        providerType: 'manual',
        isEnabled: true,
        priority: 1,
        config: {},
        createdAt: now,
        updatedAt: now,
      };

      await shippingProvidersCollection.insertOne(manualProvider);

      // If restaurant has delivery origins, also create distance provider
      const hasOrigins = await deliveryOriginsCollection.findOne({
        restaurantId: restaurant._id,
      });

      if (hasOrigins) {
        const distanceProvider: ShippingProvider = {
          restaurantId: restaurant._id,
          providerType: 'distance',
          isEnabled: true,
          priority: 0, // Higher priority than manual
          config: {},
          createdAt: now,
          updatedAt: now,
        };

        await shippingProvidersCollection.insertOne(distanceProvider);
        console.log(`Created distance + manual providers for ${restaurant.title || restaurant.name}`);
      } else {
        console.log(`Created manual provider for ${restaurant.title || restaurant.name}`);
      }

      created++;
    }

    console.log('\n--- Migration Complete ---');
    console.log(`Created providers for: ${created} restaurants`);
    console.log(`Skipped (already had providers): ${skipped}`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

migrateShipping()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
