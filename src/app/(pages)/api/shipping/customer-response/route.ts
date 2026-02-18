import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function POST(request: NextRequest) {
  try {
    const { orderId, action, customerId } = await request.json();

    if (!orderId || !action || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, action, customerId' },
        { status: 400 }
      );
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "accept" or "reject"' }, { status: 400 });
    }

    const payload = await getPayload({ config });

    // Get order and verify customer ownership
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // TODO: Verify customerId matches order.customer

    // Update shipping status based on action
    const newStatus = action === 'accept' ? 'confirmed' : 'cancelled';

    // Update shipping booking status
    const bookingsResult = await payload.find({
      collection: 'shipping-bookings',
      where: {
        orderId: { equals: orderId },
      },
      limit: 1,
    });

    if (bookingsResult.docs.length > 0) {
      const booking = bookingsResult.docs[0];
      await payload.update({
        collection: 'shipping-bookings',
        id: booking.id,
        data: {
          status: newStatus,
        },
      });
    }

    // Placeholder for restaurant notification on reject
    // if (action === 'reject') {
    //   await notifyRestaurant(order.restaurant, 'customer_rejected_delivery', { orderId });
    // }

    return NextResponse.json({ success: true, orderId, status: newStatus });
  } catch (error) {
    console.error('Customer response error:', error);
    return NextResponse.json({ error: 'Failed to process response' }, { status: 500 });
  }
}
