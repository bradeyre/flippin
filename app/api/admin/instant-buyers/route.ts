import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * GET /api/admin/instant-buyers
 * Get all instant buyers
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const approved = searchParams.get('approved');
    const active = searchParams.get('active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (approved !== null) where.approved = approved === 'true';
    if (active !== null) where.active = active === 'true';

    const [instantBuyers, total] = await Promise.all([
      db.instantBuyer.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          _count: {
            select: {
              offers: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.instantBuyer.count({ where }),
    ]);

    return NextResponse.json({
      instantBuyers: instantBuyers.map((buyer) => ({
        ...buyer,
        baseOffer: Number(buyer.baseOffer),
        totalSpent: Number(buyer.totalSpent),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching instant buyers:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch instant buyers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

