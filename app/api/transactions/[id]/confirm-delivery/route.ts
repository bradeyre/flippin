import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/sender';
import { emailTemplates } from '@/lib/email/templates';

/**
 * POST /api/transactions/[id]/confirm-delivery
 * Buyer confirms delivery and releases payment
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

    const transaction = await db.transaction.findUnique({
      where: { id },
      include: {
        listing: true,
        seller: true,
        buyer: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Verify buyer owns this transaction
    if (transaction.buyerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if item has been delivered
    if (!transaction.deliveredAt) {
      return NextResponse.json(
        { error: 'Item must be delivered before confirming' },
        { status: 400 }
      );
    }

    // Check if already completed
    if (transaction.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Transaction already completed' },
        { status: 400 }
      );
    }

    // Update transaction to completed
    const updated = await db.transaction.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        deliveryStatus: 'DELIVERED',
        completedAt: new Date(),
      },
      include: {
        listing: true,
        seller: true,
      },
    });

    // Update seller stats
    await db.user.update({
      where: { id: transaction.sellerId },
      data: {
        totalSales: {
          increment: 1,
        },
      },
    });

    // Update buyer stats
    await db.user.update({
      where: { id: transaction.buyerId },
      data: {
        totalPurchases: {
          increment: 1,
        },
      },
    });

    // Send email to seller
    try {
      await sendEmail(
        transaction.seller.email,
        emailTemplates.paymentReceived(
          transaction.sellerReceives.toNumber(),
          transaction.listing.title
        )
      );
    } catch (emailError) {
      console.error('Failed to send payment email:', emailError);
    }

    // TODO: Create ledger entry for payout
    // TODO: Schedule payout to seller's bank account

    return NextResponse.json({ transaction: updated });
  } catch (error) {
    console.error('Error confirming delivery:', error);
    return NextResponse.json(
      {
        error: 'Failed to confirm delivery',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

