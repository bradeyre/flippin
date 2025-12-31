import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * GET /api/admin/transactions/[id]
 * Get single transaction with full details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const transaction = await db.transaction.findUnique({
      where: { id },
      include: {
        seller: true,
        buyer: true,
        listing: true,
        review: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...transaction,
      itemPrice: Number(transaction.itemPrice),
      shippingCost: Number(transaction.shippingCost),
      totalAmount: Number(transaction.totalAmount),
      platformFee: Number(transaction.platformFee),
      sellerReceives: Number(transaction.sellerReceives),
      listing: {
        ...transaction.listing,
        askingPrice: Number(transaction.listing.askingPrice),
      },
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

/**
 * PATCH /api/admin/transactions/[id]
 * Update transaction (admin can update status, payment, etc.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const {
      status,
      paymentStatus,
      paymentMethod,
      paymentProof,
      paymentRef,
      deliveryStatus,
      trackingNumber,
      courierName,
      deliveryMethod,
      disputeReason,
    } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === 'VERIFIED' && !body.paidAt) {
        updateData.paidAt = new Date();
      }
    }
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (paymentProof !== undefined) updateData.paymentProof = paymentProof;
    if (paymentRef !== undefined) updateData.paymentRef = paymentRef;
    if (deliveryStatus !== undefined) {
      updateData.deliveryStatus = deliveryStatus;
      if (deliveryStatus === 'SHIPPED' && !body.shippedAt) {
        updateData.shippedAt = new Date();
      }
      if (deliveryStatus === 'DELIVERED' && !body.deliveredAt) {
        updateData.deliveredAt = new Date();
      }
    }
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (courierName !== undefined) updateData.courierName = courierName;
    if (deliveryMethod !== undefined) updateData.deliveryMethod = deliveryMethod;
    if (disputeReason !== undefined) {
      updateData.disputeReason = disputeReason;
      if (disputeReason) {
        updateData.disputedAt = new Date();
        updateData.status = 'DISPUTED';
      }
    }

    const transaction = await db.transaction.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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

    return NextResponse.json({
      ...transaction,
      itemPrice: Number(transaction.itemPrice),
      shippingCost: Number(transaction.shippingCost),
      totalAmount: Number(transaction.totalAmount),
      platformFee: Number(transaction.platformFee),
      sellerReceives: Number(transaction.sellerReceives),
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      {
        error: 'Failed to update transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

