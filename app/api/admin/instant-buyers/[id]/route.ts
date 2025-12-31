import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * GET /api/admin/instant-buyers/[id]
 * Get single instant buyer with full details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const instantBuyer = await db.instantBuyer.findUnique({
      where: { id },
      include: {
        user: true,
        offers: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                status: true,
                askingPrice: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 20,
        },
      },
    });

    if (!instantBuyer) {
      return NextResponse.json({ error: 'Instant buyer not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...instantBuyer,
      baseOffer: Number(instantBuyer.baseOffer),
      totalSpent: Number(instantBuyer.totalSpent),
      offers: instantBuyer.offers.map((offer) => ({
        ...offer,
        sellerReceives: Number(offer.sellerReceives),
        buyerPays: Number(offer.buyerPays),
        platformFee: Number(offer.platformFee),
        listing: {
          ...offer.listing,
          askingPrice: Number(offer.listing.askingPrice),
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching instant buyer:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch instant buyer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

/**
 * PATCH /api/admin/instant-buyers/[id]
 * Update instant buyer (approve, pause, edit settings)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const {
      approved,
      active,
      companyName,
      categories,
      baseOffer,
      conditionRules,
      pausedReason,
    } = body;

    const updateData: any = {};
    if (approved !== undefined) updateData.approved = approved;
    if (active !== undefined) {
      updateData.active = active;
      if (active) {
        updateData.pausedAt = null;
        updateData.pausedReason = null;
      } else {
        updateData.pausedAt = new Date();
        if (pausedReason) updateData.pausedReason = pausedReason;
      }
    }
    if (companyName !== undefined) updateData.companyName = companyName;
    if (categories !== undefined) updateData.categories = categories;
    if (baseOffer !== undefined) updateData.baseOffer = baseOffer;
    if (conditionRules !== undefined) updateData.conditionRules = conditionRules;

    const instantBuyer = await db.instantBuyer.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...instantBuyer,
      baseOffer: Number(instantBuyer.baseOffer),
      totalSpent: Number(instantBuyer.totalSpent),
    });
  } catch (error) {
    console.error('Error updating instant buyer:', error);
    return NextResponse.json(
      {
        error: 'Failed to update instant buyer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

