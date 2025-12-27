import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * GET /api/admin/users/[id]
 * Get single user with full details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        listings: {
          select: {
            id: true,
            title: true,
            status: true,
            askingPrice: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        buyOrders: {
          select: {
            id: true,
            title: true,
            status: true,
            offerPrice: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        instantBuyer: true,
        sellerTransactions: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        buyerTransactions: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            listings: true,
            buyOrders: true,
            offers: true,
            sellerTransactions: true,
            buyerTransactions: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      rating: user.rating ? Number(user.rating) : null,
      listings: user.listings.map((l) => ({
        ...l,
        askingPrice: Number(l.askingPrice),
      })),
      buyOrders: user.buyOrders.map((b) => ({
        ...b,
        offerPrice: Number(b.offerPrice),
      })),
      sellerTransactions: user.sellerTransactions.map((t) => ({
        ...t,
        totalAmount: Number(t.totalAmount),
      })),
      buyerTransactions: user.buyerTransactions.map((t) => ({
        ...t,
        totalAmount: Number(t.totalAmount),
      })),
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user (admin can edit almost anything)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      email,
      phone,
      firstName,
      lastName,
      type,
      verified,
      verificationLevel,
      companyName,
      cipcNumber,
      province,
      city,
      bankName,
      accountHolder,
      accountNumber,
      branchCode,
      accountType,
      bankingVerified,
      rating,
      totalSales,
      totalPurchases,
    } = body;

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (type !== undefined) updateData.type = type;
    if (verified !== undefined) updateData.verified = verified;
    if (verificationLevel !== undefined) updateData.verificationLevel = verificationLevel;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (cipcNumber !== undefined) updateData.cipcNumber = cipcNumber;
    if (province !== undefined) updateData.province = province;
    if (city !== undefined) updateData.city = city;
    if (bankName !== undefined) updateData.bankName = bankName;
    if (accountHolder !== undefined) updateData.accountHolder = accountHolder;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
    if (branchCode !== undefined) updateData.branchCode = branchCode;
    if (accountType !== undefined) updateData.accountType = accountType;
    if (bankingVerified !== undefined) updateData.bankingVerified = bankingVerified;
    if (rating !== undefined) updateData.rating = rating;
    if (totalSales !== undefined) updateData.totalSales = totalSales;
    if (totalPurchases !== undefined) updateData.totalPurchases = totalPurchases;

    const user = await db.user.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      ...user,
      rating: user.rating ? Number(user.rating) : null,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

