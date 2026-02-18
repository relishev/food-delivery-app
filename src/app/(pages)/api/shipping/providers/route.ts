import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

// GET: List enabled providers for restaurant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Missing required parameter: restaurantId' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    const providers = await payload.find({
      collection: 'shipping-providers',
      where: { restaurantId: { equals: restaurantId } },
    });

    // CN-01: NEVER return config (contains API credentials)
    const safeProviders = providers.docs.map((p) => ({
      id: p.id,
      providerType: p.providerType,
      isEnabled: p.isEnabled,
      priority: p.priority,
      // Explicitly exclude: config
    }));

    return NextResponse.json({ providers: safeProviders });
  } catch (error) {
    console.error('Get providers error:', error);
    return NextResponse.json({ error: 'Failed to get providers' }, { status: 500 });
  }
}

// POST: Enable/disable provider (admin only)
export async function POST(request: NextRequest) {
  try {
    const { providerId, isEnabled, restaurantId } = await request.json();

    if (!providerId || isEnabled === undefined || !restaurantId) {
      return NextResponse.json(
        { error: 'Missing required fields: providerId, isEnabled, restaurantId' },
        { status: 400 }
      );
    }

    // TODO: Add admin auth check
    // Verify requesting user is admin or restaurant owner

    const payload = await getPayload({ config });

    const updated = await payload.update({
      collection: 'shipping-providers',
      id: providerId,
      data: { isEnabled },
    });

    // Return safe provider data (no config)
    return NextResponse.json({
      success: true,
      provider: {
        id: updated.id,
        providerType: updated.providerType,
        isEnabled: updated.isEnabled,
        priority: updated.priority,
      },
    });
  } catch (error) {
    console.error('Update provider error:', error);
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
  }
}
