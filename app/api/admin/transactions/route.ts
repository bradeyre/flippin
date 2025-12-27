import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * GET /api/admin/transactions
 * Get all transactions with filters and pagination
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const transactionType = searchParams.get('transactionType');
    const sellerId = searchParams.get('sellerId');
    const buyerId = searchParams.get('buyerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (transactionType) where.transactionType = transactionType;
    if (sellerId) where.sellerId = sellerId;
    if (buyerId) where.buyerId = buyerId;

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        skip,
        take: limit,
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
              askingPrice: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        ...t,
        itemPrice: Number(t.itemPrice),
        shippingCost: Number(t.shippingCost),
        totalAmount: Number(t.totalAmount),
        platformFee: Number(t.platformFee),
        sellerReceives: Number(t.sellerReceives),
        listing: {
          ...t.listing,
          askingPrice: Number(t.listing.askingPrice),
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

