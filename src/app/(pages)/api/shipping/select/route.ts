import { NextRequest, NextResponse } from 'next/server';
import { shippingService } from '@/app/shipping/services/shipping-service';

export async function POST(request: NextRequest) {
  try {
    const { quoteId, orderId, customerId } = await request.json();

    if (!quoteId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: quoteId, orderId' },
        { status: 400 }
      );
    }

    const booking = await shippingService.selectQuote(quoteId, orderId, customerId);

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Select quote error:', error);
    const message = error instanceof Error ? error.message : 'Failed to select quote';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
