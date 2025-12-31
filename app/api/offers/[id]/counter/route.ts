import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/offers/[id]/counter
 * Make a counter-offer
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    const { counterAmount, message } = await req.json();

    if (!counterAmount || counterAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid counter amount is required' },
        { status: 400 }
      );
    }

    const originalOffer = await db.offer.findUnique({
      where: { id },
      include: {
        listing: true,
      },
    });

    if (!originalOffer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Verify seller owns the listing
    if (originalOffer.listing.sellerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if offer is still pending
    if (originalOffer.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Offer is already ${originalOffer.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Reject original offer
    await db.offer.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    // Create new counter-offer
    const counterOffer = await db.offer.create({
      data: {
        listingId: originalOffer.listingId,
        buyerId: originalOffer.buyerId,
        amount: counterAmount,
        message: message || `Counter-offer: R${counterAmount.toLocaleString()}`,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      },
      include: {
        listing: true,
        buyer: true,
      },
    });

    return NextResponse.json({ offer: counterOffer });
  } catch (error) {
    console.error('Error creating counter-offer:', error);
    return NextResponse.json(
      {
        error: 'Failed to create counter-offer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

