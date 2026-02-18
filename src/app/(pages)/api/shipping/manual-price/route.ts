import { NextRequest, NextResponse } from 'next/server';
import { shippingService } from '@/app/shipping/services/shipping-service';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function POST(request: NextRequest) {
  try {
    const { orderId, price, restaurantId } = await request.json();

    if (!orderId || price === undefined || !restaurantId) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, price, restaurantId' },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json({ error: 'Price must be non-negative' }, { status: 400 });
    }

    // TODO: Add restaurant auth check
    // Verify the requesting user is the restaurant owner

    const result = await shippingService.setManualPrice(orderId, price, restaurantId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Placeholder for customer notification
    // await notifyCustomer(orderId, 'manual_price_set', { price });

    return NextResponse.json({ success: true, orderId, price });
  } catch (error) {
    console.error('Manual price error:', error);
    return NextResponse.json({ error: 'Failed to set manual price' }, { status: 500 });
  }
}
