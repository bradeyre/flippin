import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * GET /api/admin/listings/[id]
 * Get single listing with full details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        seller: true,
        category: true,
        offers: {
          include: {
            buyer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        instantOffers: {
          include: {
            buyer: {
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
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        transactions: {
          include: {
            buyer: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...listing,
      askingPrice: Number(listing.askingPrice),
      shippingCost: listing.shippingCost ? Number(listing.shippingCost) : null,
      aiSuggestedPrice: listing.aiSuggestedPrice ? Number(listing.aiSuggestedPrice) : null,
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch listing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

/**
 * PATCH /api/admin/listings/[id]
 * Update listing (admin can edit almost anything)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      status,
      title,
      description,
      askingPrice,
      shippingCost,
      condition,
      brand,
      model,
      variant,
      categoryId,
      province,
      city,
      onMarketplace,
      sentToBuyerNetwork,
      deliveryMethods,
      images,
      detailedSpecs,
      // Admin can also update seller if needed
      sellerId,
    } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (askingPrice !== undefined) updateData.askingPrice = askingPrice;
    if (shippingCost !== undefined) updateData.shippingCost = shippingCost;
    if (condition !== undefined) updateData.condition = condition;
    if (brand !== undefined) updateData.brand = brand;
    if (model !== undefined) updateData.model = model;
    if (variant !== undefined) updateData.variant = variant;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (province !== undefined) updateData.province = province;
    if (city !== undefined) updateData.city = city;
    if (onMarketplace !== undefined) updateData.onMarketplace = onMarketplace;
    if (sentToBuyerNetwork !== undefined) updateData.sentToBuyerNetwork = sentToBuyerNetwork;
    if (deliveryMethods !== undefined) updateData.deliveryMethods = deliveryMethods;
    if (images !== undefined) updateData.images = images;
    if (detailedSpecs !== undefined) updateData.detailedSpecs = detailedSpecs;
    if (sellerId !== undefined) updateData.sellerId = sellerId;

    const listing = await db.listing.update({
      where: { id: params.id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json({
      ...listing,
      askingPrice: Number(listing.askingPrice),
      shippingCost: listing.shippingCost ? Number(listing.shippingCost) : null,
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      {
        error: 'Failed to update listing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

/**
 * DELETE /api/admin/listings/[id]
 * Delete listing (soft delete by setting status to REMOVED)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const listing = await db.listing.update({
      where: { id: params.id },
      data: {
        status: 'REMOVED',
      },
    });

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete listing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

