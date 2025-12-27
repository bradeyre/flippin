import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * GET /api/admin/stats
 * Get platform statistics and overview
 */
export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalListings,
      activeListings,
      totalTransactions,
      completedTransactions,
      totalInstantBuyers,
      activeInstantBuyers,
      totalRevenue,
      recentListings,
      recentTransactions,
    ] = await Promise.all([
      db.user.count(),
      db.listing.count(),
      db.listing.count({ where: { status: 'ACTIVE' } }),
      db.transaction.count(),
      db.transaction.count({ where: { status: 'COMPLETED' } }),
      db.instantBuyer.count(),
      db.instantBuyer.count({ where: { active: true, approved: true } }),
      db.ledgerEntry.aggregate({
        where: {
          type: 'PLATFORM_FEE',
          status: 'COMPLETED',
        },
        _sum: {
          platformRevenue: true,
        },
      }),
      db.listing.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
      db.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: {
            select: {
              email: true,
            },
          },
          buyer: {
            select: {
              email: true,
            },
          },
          listing: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      overview: {
        totalUsers,
        totalListings,
        activeListings,
        totalTransactions,
        completedTransactions,
        totalInstantBuyers,
        activeInstantBuyers,
        totalRevenue: totalRevenue._sum.platformRevenue ? Number(totalRevenue._sum.platformRevenue) : 0,
      },
      recentListings: recentListings.map((l) => ({
        id: l.id,
        title: l.title,
        status: l.status,
        askingPrice: Number(l.askingPrice),
        seller: l.seller,
        category: l.category,
        createdAt: l.createdAt,
      })),
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        status: t.status,
        totalAmount: Number(t.totalAmount),
        seller: t.seller,
        buyer: t.buyer,
        listing: t.listing,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

