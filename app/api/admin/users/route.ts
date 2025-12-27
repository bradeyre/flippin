import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * GET /api/admin/users
 * Get all users with filters and pagination
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const verified = searchParams.get('verified');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (verified !== null) where.verified = verified === 'true';
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          avatar: true,
          type: true,
          verified: true,
          verificationLevel: true,
          companyName: true,
          province: true,
          city: true,
          rating: true,
          totalSales: true,
          totalPurchases: true,
          bankingVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              listings: true,
              buyOrders: true,
              offers: true,
              sellerTransactions: true,
              buyerTransactions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        rating: user.rating ? Number(user.rating) : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

