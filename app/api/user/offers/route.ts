import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/user/offers
 * Get offers received on user's listings
 */
export async function GET(req: NextRequest) {
  try {
    // TODO: Get user from auth
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

    // Get user's listings
    const userListings = await db.listing.findMany({
      where: { sellerId: testSeller.id },
      select: { id: true },
    });

    const listingIds = userListings.map((l) => l.id);

    const where: any = {
      listingId: { in: listingIds },
    };
    if (status) where.status = status;

    const [offers, total] = await Promise.all([
      db.offer.findMany({
        where,
        skip,
        take: limit,
        include: {
          buyer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              rating: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              images: true,
              askingPrice: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.offer.count({ where }),
    ]);

    return NextResponse.json({
      offers: offers.map((offer) => ({
        id: offer.id,
        amount: Number(offer.amount),
        message: offer.message,
        status: offer.status,
        createdAt: offer.createdAt,
        expiresAt: offer.expiresAt,
        buyer: {
          ...offer.buyer,
          rating: offer.buyer.rating ? Number(offer.buyer.rating) : null,
        },
        listing: {
          ...offer.listing,
          askingPrice: Number(offer.listing.askingPrice),
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
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch offers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

