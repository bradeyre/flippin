import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * GET /api/admin/listings
 * Get all listings with filters and pagination
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const sellerId = searchParams.get('sellerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (sellerId) where.sellerId = sellerId;

    const [listings, total] = await Promise.all([
      db.listing.findMany({
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
              views: true,
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
        brand: listing.brand,
        model: listing.model,
        images: listing.images,
        province: listing.province,
        city: listing.city,
        seller: listing.seller,
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
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch listings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

