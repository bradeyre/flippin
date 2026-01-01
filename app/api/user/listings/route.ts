import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
// TODO: Add auth check once implemented
// import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/user/listings
 * Get current user's listings
 */
export async function GET(req: NextRequest) {
  try {
    // TODO: Get user from auth
    // const supabase = await createClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // For now, use test seller
    const testSeller = await db.user.findFirst({
      where: { email: 'seller@test.com' },
    });

    if (!testSeller) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = { sellerId: testSeller.id };
    if (status) where.status = status;

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
            _count: {
              select: {
                offers: true,
                instantOffers: true,
              },
            },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings: listings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        status: listing.status,
        askingPrice: Number(listing.askingPrice),
        shippingCost: listing.shippingCost ? Number(listing.shippingCost) : null,
        condition: listing.condition,
        images: listing.images,
        category: listing.category,
        views: listing.views,
        saves: listing.saves,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        soldAt: listing.soldAt,
        _count: listing._count,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch listings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

