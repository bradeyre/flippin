import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/sender';
import { emailTemplates } from '@/lib/email/templates';

/**
 * POST /api/offers/create
 * Create a new offer on a listing
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listingId, amount, message } = await req.json();

    if (!listingId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Listing ID and valid amount are required' },
        { status: 400 }
      );
    }

    // Get listing
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Listing is not available for offers' },
        { status: 400 }
      );
    }

    if (listing.sellerId === user.id) {
      return NextResponse.json(
        { error: 'You cannot make an offer on your own listing' },
        { status: 400 }
      );
    }

    // Check if offer is reasonable (at least 50% of asking price)
    if (amount < listing.askingPrice * 0.5) {
      return NextResponse.json(
        { error: 'Offer must be at least 50% of the asking price' },
        { status: 400 }
      );
    }

    // Create offer
    const offer = await db.offer.create({
      data: {
        listingId,
        buyerId: user.id,
        amount,
        message: message || null,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            rating: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Send email to seller
    try {
      await sendEmail(
        listing.seller.email,
        emailTemplates.offerReceived(
          amount,
          listing.title,
          `${offer.buyer.firstName} ${offer.buyer.lastName}`,
          offer.id
        )
      );
    } catch (emailError) {
      console.error('Failed to send offer email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      {
        error: 'Failed to create offer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

