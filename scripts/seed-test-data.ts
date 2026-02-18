#!/usr/bin/env npx tsx
/**
 * Script: seed-test-data.ts
 * Created: 2026-02-18
 * Purpose: Seed test restaurant and dish data into MongoDB via Payload CMS
 * Keywords: seed, test-data, mongodb, payload
 * Status: active
 * Prerequisites:
 *   - MongoDB running locally
 *   - Environment variables configured (.env.local)
 * Changelog:
 *   - 2026-02-18: Initial version
 * See-Also: .claude/CLAUDE.md ##Seed scripts
 *
 * Usage: npx tsx scripts/seed-test-data.ts
 */

import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.DATABASE_URI || 'mongodb://127.0.0.1/payload-template-blank-3-0';

interface Category {
  _id?: ObjectId;
  category: string;
  value: string;
  type: 'dish' | 'restaurant';
  order?: number;
}

interface Dish {
  _id?: ObjectId;
  title: string;
  description: string;
  price: number;
  gram: number;
  availableAmount: number;
  cookTime: number;
  categories?: ObjectId;
  restaurant: ObjectId;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Restaurant {
  _id?: ObjectId;
  title: string;
  description: string;
  address: string;
  deliveryTime: string;
  deliveryPrice: number;
  freeAfterAmount: number;
  workingHours: {
    openTime: string;
    closeTime: string;
  };
  isClosed: boolean;
  isDelivery: boolean;
  categories?: ObjectId[];
  dishes?: ObjectId[];
  budgetCategory: string;
  isBlocked: boolean;
  relatedToUser: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

async function seedTestData() {
  console.log('Connecting to MongoDB:', MONGODB_URI);
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // Check if we have an admin user to associate with
    const customersCollection = db.collection('customers');
    let adminUser = await customersCollection.findOne({ roles: { $in: ['admin'] } });

    if (!adminUser) {
      console.log('Creating admin user for test data...');
      // Create a minimal admin user for testing
      const adminResult = await customersCollection.insertOne({
        email: 'admin@test.com',
        name: 'Test Admin',
        roles: ['admin'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      adminUser = { _id: adminResult.insertedId };
      console.log('Created admin user:', adminUser._id.toString());
    } else {
      console.log('Using existing admin user:', adminUser._id.toString());
    }

    // Clear existing test data
    console.log('Clearing existing test data...');
    const deletedRestaurants = await db.collection('restaurants').deleteMany({ title: /^Test / });
    const deletedDishes = await db.collection('dishes').deleteMany({ title: /^Test / });
    const deletedCategories = await db.collection('categories').deleteMany({ category: /^Test / });
    console.log(`Deleted: ${deletedRestaurants.deletedCount} restaurants, ${deletedDishes.deletedCount} dishes, ${deletedCategories.deletedCount} categories`);

    // Create dish categories
    console.log('Creating dish categories...');
    const dishCategories: Category[] = [
      { category: 'Test Korean', value: 'test-korean', type: 'dish', order: 1 },
      { category: 'Test Main Dishes', value: 'test-main', type: 'dish', order: 2 },
      { category: 'Test Soups', value: 'test-soups', type: 'dish', order: 3 },
      { category: 'Test Noodles', value: 'test-noodles', type: 'dish', order: 4 },
    ];

    const categoryResults = await db.collection('categories').insertMany(dishCategories);
    const categoryIds = Object.values(categoryResults.insertedIds);
    console.log(`Created ${categoryIds.length} dish categories`);

    // Create restaurant category
    const restaurantCategory: Category = {
      category: 'Test Korean Restaurant',
      value: 'test-korean-restaurant',
      type: 'restaurant',
      order: 1,
    };
    const restCatResult = await db.collection('categories').insertOne(restaurantCategory);
    console.log('Created restaurant category:', restCatResult.insertedId.toString());

    // Create restaurant (without dishes first)
    console.log('Creating test restaurant...');
    const restaurant: Restaurant = {
      title: 'Test Seoul Kitchen',
      description: 'Authentic Korean cuisine with traditional recipes and modern presentation.',
      address: '123 Test Street, Seoul District',
      deliveryTime: '45',
      deliveryPrice: 5,
      freeAfterAmount: 50,
      workingHours: {
        openTime: '1000',
        closeTime: '2200',
      },
      isClosed: false,
      isDelivery: true,
      categories: [restCatResult.insertedId],
      budgetCategory: '2',
      isBlocked: false,
      relatedToUser: adminUser._id as ObjectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const restaurantResult = await db.collection('restaurants').insertOne(restaurant);
    const restaurantId = restaurantResult.insertedId;
    console.log('Created restaurant:', restaurantId.toString());

    // Create dishes
    console.log('Creating test dishes...');
    const dishes: Dish[] = [
      {
        title: 'Test Bibimbap',
        description: 'Mixed rice bowl with sauteed vegetables, beef, gochujang sauce, and a fried egg on top.',
        price: 15,
        gram: 450,
        availableAmount: 50,
        cookTime: 15,
        categories: categoryIds[0] as ObjectId,
        restaurant: restaurantId,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Test Bulgogi',
        description: 'Tender marinated beef slices grilled to perfection, served with rice and lettuce wraps.',
        price: 22,
        gram: 350,
        availableAmount: 40,
        cookTime: 20,
        categories: categoryIds[1] as ObjectId,
        restaurant: restaurantId,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Test Kimchi Jjigae',
        description: 'Spicy fermented kimchi stew with tofu, pork, and vegetables in a rich broth.',
        price: 14,
        gram: 400,
        availableAmount: 35,
        cookTime: 25,
        categories: categoryIds[2] as ObjectId,
        restaurant: restaurantId,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Test Japchae',
        description: 'Sweet potato glass noodles stir-fried with vegetables, beef, and sesame oil.',
        price: 16,
        gram: 380,
        availableAmount: 45,
        cookTime: 18,
        categories: categoryIds[3] as ObjectId,
        restaurant: restaurantId,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const dishResults = await db.collection('dishes').insertMany(dishes);
    const dishIds = Object.values(dishResults.insertedIds);
    console.log(`Created ${dishIds.length} dishes`);

    // Update restaurant with dish references
    await db.collection('restaurants').updateOne(
      { _id: restaurantId },
      { $set: { dishes: dishIds } }
    );
    console.log('Updated restaurant with dish references');

    // Create a second restaurant for variety
    console.log('Creating second test restaurant...');
    const restaurant2: Restaurant = {
      title: 'Test Tokyo Ramen House',
      description: 'Authentic Japanese ramen and noodle dishes made with fresh ingredients.',
      address: '456 Test Avenue, Tokyo District',
      deliveryTime: '30',
      deliveryPrice: 3,
      freeAfterAmount: 40,
      workingHours: {
        openTime: '1100',
        closeTime: '2300',
      },
      isClosed: false,
      isDelivery: true,
      budgetCategory: '2',
      isBlocked: false,
      relatedToUser: adminUser._id as ObjectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const restaurant2Result = await db.collection('restaurants').insertOne(restaurant2);
    const restaurant2Id = restaurant2Result.insertedId;
    console.log('Created second restaurant:', restaurant2Id.toString());

    // Create dishes for second restaurant
    const dishes2: Dish[] = [
      {
        title: 'Test Tonkotsu Ramen',
        description: 'Rich pork bone broth ramen with chashu pork, soft boiled egg, green onions, and nori.',
        price: 16,
        gram: 500,
        availableAmount: 30,
        cookTime: 10,
        restaurant: restaurant2Id,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Test Gyoza',
        description: 'Pan-fried Japanese dumplings filled with pork and vegetables, served with dipping sauce.',
        price: 10,
        gram: 200,
        availableAmount: 60,
        cookTime: 12,
        restaurant: restaurant2Id,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Test Chicken Katsu',
        description: 'Crispy breaded chicken cutlet served with tonkatsu sauce, rice, and cabbage salad.',
        price: 18,
        gram: 400,
        availableAmount: 25,
        cookTime: 15,
        restaurant: restaurant2Id,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Test Miso Soup',
        description: 'Traditional Japanese soup with tofu, wakame seaweed, and green onions in miso broth.',
        price: 6,
        gram: 250,
        availableAmount: 100,
        cookTime: 5,
        restaurant: restaurant2Id,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const dish2Results = await db.collection('dishes').insertMany(dishes2);
    const dish2Ids = Object.values(dish2Results.insertedIds);

    // Update second restaurant with dish references
    await db.collection('restaurants').updateOne(
      { _id: restaurant2Id },
      { $set: { dishes: dish2Ids } }
    );
    console.log(`Created ${dish2Ids.length} dishes for second restaurant`);

    console.log('\n========================================');
    console.log('Test data seeded successfully!');
    console.log('========================================');
    console.log('\nSummary:');
    console.log(`- 2 test restaurants created`);
    console.log(`- ${dishIds.length + dish2Ids.length} test dishes created`);
    console.log(`- ${categoryIds.length + 1} categories created`);
    console.log('\nRestaurant IDs:');
    console.log(`  1. Test Seoul Kitchen: ${restaurantId.toString()}`);
    console.log(`  2. Test Tokyo Ramen House: ${restaurant2Id.toString()}`);
    console.log('\nYou can now view these on the homepage or in the Payload admin panel.');

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed.');
  }
}

seedTestData();
