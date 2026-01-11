import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateListingCopy } from '@/lib/ai/listing-generator';
import { calculateInstantOffer } from '@/lib/ai/pricing';
import { roundToFriendly } from '@/lib/utils/pricing';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // TODO: Re-enable auth once we have login
    // const supabase = await createClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const {
      imageUrls,
      confirmedDetails,
      analysis, // Full vision analysis from previous step
      pricing, // Pricing data from previous step
      province,
      city,
      deliveryMethods, // Array of DeliveryMethod: ['PAXI', 'DOOR_TO_DOOR', 'LOCKER_TO_LOCKER']
      onMarketplace = false,
      sentToBuyerNetwork = false,
    } = await req.json();

    console.log('Create listing request:', {
      imageCount: imageUrls?.length,
      hasAnalysis: !!analysis,
      hasPricing: !!pricing,
      deliveryMethods,
    });

    // Validate required fields
    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    if (!confirmedDetails || !analysis) {
      return NextResponse.json(
        { error: 'Analysis and confirmed details are required' },
        { status: 400 }
      );
    }

    if (!deliveryMethods || deliveryMethods.length === 0) {
      return NextResponse.json(
        { error: 'At least one delivery method is required' },
        { status: 400 }
      );
    }

    // Get or create test seller (for now, until auth is ready)
    // TODO: Replace with actual user from auth
    let seller = await db.user.findFirst({
      where: { email: 'seller@test.com' },
    });

    if (!seller) {
      seller = await db.user.create({
        data: {
          email: 'seller@test.com',
          type: 'PERSONAL_SELLER',
          verified: true,
          province: province || 'GAUTENG',
          city: city || 'Johannesburg',
        },
      });
    }

    // Find category by name
    const category = await db.category.findFirst({
      where: { name: analysis.category },
    });

    if (!category) {
      return NextResponse.json(
        { error: `Category "${analysis.category}" not found` },
        { status: 400 }
      );
    }

    // Use user-provided listing copy if available, otherwise generate it
    let listingCopy;
    if (confirmedDetails.listingCopy && confirmedDetails.listingCopy.title) {
      listingCopy = confirmedDetails.listingCopy;
    } else {
      listingCopy = await generateListingCopy(analysis, JSON.stringify(confirmedDetails.specs || {}));
    }

    // Determine asking price - prioritize user input
    let askingPrice = confirmedDetails.askingPrice;
    
    // If user didn't provide a price, use AI suggestion or fallback
    if (!askingPrice) {
      askingPrice = pricing?.recommended;
      
      if (!askingPrice) {
        // Fallback: use a simple calculation based on condition
        const conditionMultipliers: Record<string, number> = {
          NEW: 0.90,
          LIKE_NEW: 0.75,
          GOOD: 0.60,
          FAIR: 0.45,
          POOR: 0.25,
        };
        // This is a fallback - in production, we should always have pricing
        askingPrice = 10000 * (conditionMultipliers[analysis.condition] || 0.60);
      }
    }

    // Apply friendly pricing to asking price
    askingPrice = roundToFriendly(askingPrice);

    // Default shipping cost
    const shippingCost = 150; // R150 default

    // Create listing
    const listing = await db.listing.create({
      data: {
        sellerId: seller.id,
        status: 'DRAFT',
        title: listingCopy.title,
        description: listingCopy.description,
        categoryId: category.id,
        condition: analysis.condition,
        brand: confirmedDetails.brand || analysis.brand,
        model: confirmedDetails.model || analysis.model,
        variant: confirmedDetails.variant || analysis.variant || null,
        askingPrice: askingPrice,
        shippingCost: shippingCost,
        aiSuggestedPrice: pricing?.recommended ? roundToFriendly(pricing.recommended) : null,
        images: imageUrls,
        province: province || 'GAUTENG',
        city: city || 'Johannesburg',
        deliveryMethods: deliveryMethods,
        onMarketplace: onMarketplace,
        sentToBuyerNetwork: sentToBuyerNetwork,
        aiAnalysis: analysis,
        detailedSpecs: confirmedDetails.specs || {},
        sellerConfirmed: true,
        aiConfidence: analysis.confidence?.toString() || null,
      },
      include: {
        category: true,
        seller: true,
      },
    });

    console.log('Listing created:', listing.id);

    // Find active instant buyers in this category
    const instantBuyers = await db.instantBuyer.findMany({
      where: {
        active: true,
        approved: true,
        categories: {
          has: category.id,
        },
      },
      include: {
        user: true,
      },
    });

    console.log(`Found ${instantBuyers.length} instant buyers for category ${category.name}`);

    // Generate instant offers
    const instantOffers = [];
    const marketPrice = pricing?.recommended || askingPrice;

    for (const buyer of instantBuyers) {
      try {
        // Get condition rules from buyer (or use defaults)
        const conditionRules = (buyer.conditionRules as Record<string, number>) || undefined;

        // Calculate offer
        const offer = calculateInstantOffer(
          marketPrice,
          analysis.condition,
          Number(buyer.baseOffer),
          conditionRules
        );

        // Create instant offer record
        const instantOffer = await db.instantOffer.create({
          data: {
            listingId: listing.id,
            buyerId: buyer.id,
            sellerReceives: offer.sellerReceives,
            buyerPays: offer.buyerPays,
            platformFee: offer.platformFee,
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
          },
          include: {
            buyer: {
              include: {
                user: true,
              },
            },
          },
        });

        instantOffers.push({
          id: instantOffer.id,
          sellerReceives: Number(instantOffer.sellerReceives),
          buyerPays: Number(instantOffer.buyerPays),
          platformFee: Number(instantOffer.platformFee),
          status: instantOffer.status,
          expiresAt: instantOffer.expiresAt,
          buyer: {
            id: buyer.id,
            companyName: buyer.companyName,
            user: {
              id: buyer.user.id,
              email: buyer.user.email,
            },
          },
        });
      } catch (error) {
        console.error(`Error creating offer for buyer ${buyer.id}:`, error);
        // Continue with other buyers even if one fails
      }
    }

    // Sort offers by sellerReceives (highest first)
    instantOffers.sort((a, b) => b.sellerReceives - a.sellerReceives);

    console.log(`Created ${instantOffers.length} instant offers`);

    return NextResponse.json({
      listing: {
        id: listing.id,
        title: listing.title,
        status: listing.status,
        askingPrice: Number(listing.askingPrice),
        shippingCost: Number(listing.shippingCost),
      },
      instantOffers,
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      {
        error: 'Failed to create listing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

