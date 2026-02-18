import { NextRequest, NextResponse } from 'next/server';
import { shippingService } from '@/app/shipping/services/shipping-service';
import type { ShippingServiceRequest } from '@/app/shipping/services/shipping-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { restaurantId, customerId, destinationLat, destinationLng, orderTotal } = body;

    if (!restaurantId || !destinationLat || !destinationLng) {
      return NextResponse.json(
        { error: 'Missing required fields: restaurantId, destinationLat, destinationLng' },
        { status: 400 }
      );
    }

    // Transform API request to service request format
    const shippingRequest: ShippingServiceRequest = {
      restaurantId,
      customerId: customerId || 'anonymous',
      customerAddress: {
        latitude: destinationLat,
        longitude: destinationLng,
        fullAddress: body.fullAddress || '',
      },
      orderTotal: orderTotal || 0,
      scheduledTime: body.scheduledTime ? new Date(body.scheduledTime) : undefined,
    };

    const result = await shippingService.getQuotes(shippingRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Quote endpoint error:', error);
    return NextResponse.json({ error: 'Failed to get shipping quotes' }, { status: 500 });
  }
}
