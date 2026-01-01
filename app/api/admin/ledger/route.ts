import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * GET /api/admin/ledger
 * Get ledger entries (financial audit trail)
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const fromUserId = searchParams.get('fromUserId');
    const toUserId = searchParams.get('toUserId');
    const transactionId = searchParams.get('transactionId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (fromUserId) where.fromUserId = fromUserId;
    if (toUserId) where.toUserId = toUserId;
    if (transactionId) where.transactionId = transactionId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [entries, total] = await Promise.all([
      db.ledgerEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.ledgerEntry.count({ where }),
    ]);

    // Calculate totals
    const totals = await db.ledgerEntry.aggregate({
      where: {
        ...where,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
        platformRevenue: true,
      },
    });

    return NextResponse.json({
      entries: entries.map((e) => ({
        ...e,
        amount: Number(e.amount),
        platformRevenue: e.platformRevenue ? Number(e.platformRevenue) : null,
      })),
      totals: {
        totalAmount: totals._sum.amount ? Number(totals._sum.amount) : 0,
        totalPlatformRevenue: totals._sum.platformRevenue ? Number(totals._sum.platformRevenue) : 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching ledger:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch ledger',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

