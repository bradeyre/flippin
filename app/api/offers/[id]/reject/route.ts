import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/offers/[id]/reject
 * Reject an offer on a listing
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offer = await db.offer.findUnique({
      where: { id: params.id },
      include: {
        listing: true,
      },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Verify seller owns the listing
    if (offer.listing.sellerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if offer is still pending
    if (offer.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Offer is already ${offer.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Update offer status
    const updatedOffer = await db.offer.update({
      where: { id: params.id },
      data: { status: 'REJECTED' },
      include: {
        listing: true,
        buyer: true,
      },
    });

    return NextResponse.json({ offer: updatedOffer });
  } catch (error) {
    console.error('Error rejecting offer:', error);
    return NextResponse.json(
      {
        error: 'Failed to reject offer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

