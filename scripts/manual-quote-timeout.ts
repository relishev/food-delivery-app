#!/usr/bin/env npx ts-node
/**
 * Script: manual-quote-timeout.ts
 * Created: 2026-02-18
 * Purpose: Expire orders with pending manual quotes after 24 hours
 * Keywords: shipping, manual-quote, timeout, cron, expiration
 * Status: active
 *
 * Run: cron job every hour OR via Vercel cron
 *
 * Usage:
 *   npx ts-node scripts/manual-quote-timeout.ts
 *   # Or via npm script: npm run timeout:manual-quotes
 *
 * Changelog:
 *   - 2026-02-18: Initial version
 */

import { getPayload } from 'payload';
import config from '../src/payload.config';

const MANUAL_QUOTE_TIMEOUT_HOURS = 24;

interface ShippingQuote {
  id: string;
  quoteId: string;
  providerId: string;
  providerType?: 'distance' | 'manual' | 'external';
  price: number;
  validUntil: string;
  customerId: string;
  restaurantId: string;
  request?: unknown;
  metadata?: unknown;
}

async function expireManualQuotes(): Promise<void> {
  const payload = await getPayload({ config });

  const now = new Date();

  // Find manual quotes that have expired (validUntil < now) and still have price = -1 (pending)
  // Manual quotes are identified by:
  // - providerType = 'manual' OR providerId starts with 'manual'
  // - price = -1 (indicating pending/awaiting manual price entry)
  // - validUntil has passed
  const expiredQuotes = await payload.find({
    collection: 'shipping-quotes',
    where: {
      and: [
        {
          or: [
            { providerType: { equals: 'manual' } },
            { providerId: { contains: 'manual' } },
          ],
        },
        { price: { equals: -1 } }, // Still pending (no price set)
        { validUntil: { less_than: now.toISOString() } },
      ],
    },
    limit: 1000, // Process up to 1000 quotes per run
  });

  console.log(`[${now.toISOString()}] Found ${expiredQuotes.docs.length} expired manual quotes`);

  let expiredCount = 0;
  let errorCount = 0;

  for (const quote of expiredQuotes.docs as ShippingQuote[]) {
    try {
      // Update quote metadata to mark as expired
      // Since there's no status field, we use metadata to track expiration
      const existingMetadata = (quote.metadata as Record<string, unknown>) || {};

      await payload.update({
        collection: 'shipping-quotes',
        id: quote.id,
        data: {
          metadata: {
            ...existingMetadata,
            expired: true,
            expiredAt: now.toISOString(),
            expirationReason: 'manual_quote_timeout',
          },
        },
      });

      // TODO: Notify customer via webhook or notification system
      // await notifyCustomer(quote.customerId, {
      //   type: 'manual_quote_expired',
      //   quoteId: quote.id,
      //   restaurantId: quote.restaurantId,
      // });

      console.log(
        `  Expired quote ${quote.quoteId} (id=${quote.id}) for customer ${quote.customerId}`
      );
      expiredCount++;
    } catch (error) {
      console.error(`  Failed to expire quote ${quote.id}:`, error);
      errorCount++;
    }
  }

  console.log(
    `[${now.toISOString()}] Manual quote timeout job completed: ${expiredCount} expired, ${errorCount} errors`
  );
}

// Run if called directly
expireManualQuotes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Job failed:', error);
    process.exit(1);
  });
