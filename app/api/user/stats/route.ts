import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/user/stats
 * Get user's statistics (listings, sales, earnings, etc.)
 */
export async function GET() {
  try {
    // TODO: Get user from auth
    const testUser = await db.user.findFirst({
      where: { email: 'seller@test.com' },
    });

    if (!testUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [
      totalListings,
      activeListings,
      soldListings,
      totalOffers,
      pendingOffers,
      sellerTransactions,
      buyerTransactions,
      totalEarnings,
      totalSpent,
    ] = await Promise.all([
      db.listing.count({ where: { sellerId: testUser.id } }),
      db.listing.count({ where: { sellerId: testUser.id, status: 'ACTIVE' } }),
      db.listing.count({ where: { sellerId: testUser.id, status: 'SOLD' } }),
      db.offer.count({
        where: {
          listing: { sellerId: testUser.id },
        },
      }),
      db.offer.count({
        where: {
          listing: { sellerId: testUser.id },
          status: 'PENDING',
        },
      }),
      db.transaction.findMany({
        where: { sellerId: testUser.id },
        select: {
          sellerReceives: true,
          status: true,
        },
      }),
      db.transaction.findMany({
        where: { buyerId: testUser.id },
        select: {
          totalAmount: true,
          status: true,
        },
      }),
      db.transaction.aggregate({
        where: {
          sellerId: testUser.id,
          status: 'COMPLETED',
        },
        _sum: {
          sellerReceives: true,
        },
      }),
      db.transaction.aggregate({
        where: {
          buyerId: testUser.id,
          status: 'COMPLETED',
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    return NextResponse.json({
      listings: {
        total: totalListings,
        active: activeListings,
        sold: soldListings,
      },
      offers: {
        total: totalOffers,
        pending: pendingOffers,
      },
      earnings: {
        total: totalEarnings._sum.sellerReceives ? Number(totalEarnings._sum.sellerReceives) : 0,
        completedSales: sellerTransactions.filter((t) => t.status === 'COMPLETED').length,
        pendingSales: sellerTransactions.filter((t) => t.status !== 'COMPLETED').length,
      },
      spending: {
        total: totalSpent._sum.totalAmount ? Number(totalSpent._sum.totalAmount) : 0,
        completedPurchases: buyerTransactions.filter((t) => t.status === 'COMPLETED').length,
        pendingPurchases: buyerTransactions.filter((t) => t.status !== 'COMPLETED').length,
      },
      rating: testUser.rating ? Number(testUser.rating) : null,
      totalSales: testUser.totalSales,
      totalPurchases: testUser.totalPurchases,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

