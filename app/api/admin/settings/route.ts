import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * GET /api/admin/settings
 * Get platform settings
 */
export async function GET() {
  try {
    await requireAdmin();

    let settings = await db.platformSettings.findUnique({
      where: { id: 'settings' },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await db.platformSettings.create({
        data: {
          id: 'settings',
          marketplaceRate: 0.055,
          freeThreshold: 1000,
          instantOfferRate: 0.05,
          escrowReleaseDays: 2,
        },
      });
    }

    return NextResponse.json({
      ...settings,
      marketplaceRate: Number(settings.marketplaceRate),
      freeThreshold: Number(settings.freeThreshold),
      instantOfferRate: Number(settings.instantOfferRate),
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

/**
 * PATCH /api/admin/settings
 * Update platform settings
 */
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      marketplaceRate,
      freeThreshold,
      instantOfferRate,
      escrowReleaseDays,
      platformBankName,
      platformAccountName,
      platformAccountNumber,
      platformBranchCode,
      emailTemplates,
      smsTemplates,
    } = body;

    const updateData: any = {};
    if (marketplaceRate !== undefined) updateData.marketplaceRate = marketplaceRate;
    if (freeThreshold !== undefined) updateData.freeThreshold = freeThreshold;
    if (instantOfferRate !== undefined) updateData.instantOfferRate = instantOfferRate;
    if (escrowReleaseDays !== undefined) updateData.escrowReleaseDays = escrowReleaseDays;
    if (platformBankName !== undefined) updateData.platformBankName = platformBankName;
    if (platformAccountName !== undefined) updateData.platformAccountName = platformAccountName;
    if (platformAccountNumber !== undefined) updateData.platformAccountNumber = platformAccountNumber;
    if (platformBranchCode !== undefined) updateData.platformBranchCode = platformBranchCode;
    if (emailTemplates !== undefined) updateData.emailTemplates = emailTemplates;
    if (smsTemplates !== undefined) updateData.smsTemplates = smsTemplates;

    const settings = await db.platformSettings.upsert({
      where: { id: 'settings' },
      update: updateData,
      create: {
        id: 'settings',
        marketplaceRate: marketplaceRate ?? 0.055,
        freeThreshold: freeThreshold ?? 1000,
        instantOfferRate: instantOfferRate ?? 0.05,
        escrowReleaseDays: escrowReleaseDays ?? 2,
        ...updateData,
      },
    });

    return NextResponse.json({
      ...settings,
      marketplaceRate: Number(settings.marketplaceRate),
      freeThreshold: Number(settings.freeThreshold),
      instantOfferRate: Number(settings.instantOfferRate),
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      {
        error: 'Failed to update settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

