import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/sender';
import { emailTemplates } from '@/lib/email/templates';

/**
 * POST /api/offers/[id]/accept
 * Accept an offer on a listing
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

    const offer = await db.offer.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            seller: true,
          },
        },
        buyer: true,
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
      data: { status: 'ACCEPTED' },
      include: {
        listing: true,
        buyer: true,
      },
    });

    // Update listing status
    await db.listing.update({
      where: { id: offer.listingId },
      data: { status: 'SOLD' },
    });

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        listingId: offer.listingId,
        sellerId: offer.listing.sellerId,
        buyerId: offer.buyerId,
        offerId: offer.id,
        itemPrice: offer.amount,
        shippingCost: offer.listing.shippingCost || 0,
        totalAmount: offer.amount + (offer.listing.shippingCost || 0),
        platformFee: Math.round(offer.amount * 0.055), // 5.5% marketplace fee
        sellerReceives: Math.round(offer.amount * 0.945), // Seller gets 94.5%
        status: 'PAYMENT_PENDING',
        paymentStatus: 'PENDING',
        deliveryStatus: 'NOT_SHIPPED',
        transactionType: 'MARKETPLACE',
      },
    });

    // Send emails
    try {
      // Email to seller
      await sendEmail(
        offer.listing.seller.email,
        emailTemplates.offerAccepted(
          offer.amount,
          offer.listing.title,
          `${offer.buyer.firstName} ${offer.buyer.lastName}`
        )
      );

      // Email to buyer
      await sendEmail(
        offer.buyer.email,
        emailTemplates.offerAcceptedBuyer(
          offer.amount,
          offer.listing.title,
          `${offer.listing.seller.firstName} ${offer.listing.seller.lastName}`
        )
      );
    } catch (emailError) {
      console.error('Failed to send emails:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      offer: updatedOffer,
      transaction,
    });
  } catch (error) {
    console.error('Error accepting offer:', error);
    return NextResponse.json(
      {
        error: 'Failed to accept offer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

