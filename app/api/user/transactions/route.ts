import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/user/transactions
 * Get user's transactions (as seller and buyer)
 */
export async function GET(req: NextRequest) {
  try {
    // TODO: Get user from auth
    const testUser = await db.user.findFirst({
      where: { email: 'seller@test.com' },
    });

    if (!testUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'seller' or 'buyer'
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role === 'seller') {
      where.sellerId = testUser.id;
    } else if (role === 'buyer') {
      where.buyerId = testUser.id;
    } else {
      // Both
      where.OR = [
        { sellerId: testUser.id },
        { buyerId: testUser.id },
      ];
    }
    if (status) where.status = status;

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
              images: true,
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
        id: t.id,
        status: t.status,
        paymentStatus: t.paymentStatus,
        deliveryStatus: t.deliveryStatus,
        itemPrice: Number(t.itemPrice),
        shippingCost: Number(t.shippingCost),
        totalAmount: Number(t.totalAmount),
        platformFee: Number(t.platformFee),
        sellerReceives: Number(t.sellerReceives),
        transactionType: t.transactionType,
        createdAt: t.createdAt,
        paidAt: t.paidAt,
        shippedAt: t.shippedAt,
        deliveredAt: t.deliveredAt,
        completedAt: t.completedAt,
        seller: t.seller,
        buyer: t.buyer,
        listing: t.listing,
        role: t.sellerId === testUser.id ? 'seller' : 'buyer',
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
      { status: 500 }
    );
  }
}

