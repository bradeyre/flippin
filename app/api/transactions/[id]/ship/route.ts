import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/sender';
import { emailTemplates } from '@/lib/email/templates';

/**
 * POST /api/transactions/[id]/ship
 * Add shipping information to a transaction
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

    const { trackingNumber, courierName } = await req.json();

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    const transaction = await db.transaction.findUnique({
      where: { id },
      include: {
        listing: true,
        buyer: true,
        seller: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Verify seller owns this transaction
    if (transaction.sellerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if payment has been received
    if (transaction.paymentStatus !== 'VERIFIED' && transaction.paymentStatus !== 'HELD_ESCROW') {
      return NextResponse.json(
        { error: 'Payment must be received before shipping' },
        { status: 400 }
      );
    }

    // Update transaction with shipping info
    const updated = await db.transaction.update({
      where: { id },
      data: {
        trackingNumber,
        courierName: courierName || null,
        deliveryStatus: 'SHIPPED',
        status: 'SHIPPED',
        shippedAt: new Date(),
      },
      include: {
        listing: true,
        buyer: true,
      },
    });

    // Send email to buyer
    try {
      await sendEmail(
        transaction.buyer.email,
        emailTemplates.itemShipped(
          transaction.listing.title,
          trackingNumber
        )
      );
    } catch (emailError) {
      console.error('Failed to send shipping email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ transaction: updated });
  } catch (error) {
    console.error('Error updating shipping info:', error);
    return NextResponse.json(
      {
        error: 'Failed to update shipping information',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

