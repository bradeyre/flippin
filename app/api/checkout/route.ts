import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/sender';
import { emailTemplates } from '@/lib/email/templates';

/**
 * POST /api/checkout
 * Create checkout session for a listing or offer
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listingId, offerId, paymentMethod } = await req.json();

    if (!listingId && !offerId) {
      return NextResponse.json(
        { error: 'Listing ID or Offer ID is required' },
        { status: 400 }
      );
    }

    let listing;
    let offer;
    let totalAmount = 0;
    let sellerId = '';

    if (offerId) {
      offer = await db.offer.findUnique({
        where: { id: offerId },
        include: {
          listing: {
            include: {
              seller: true,
            },
          },
          buyer: true,
        },
      });

      if (!offer) {
        return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
      }

      if (offer.buyerId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (offer.status !== 'ACCEPTED') {
        return NextResponse.json(
          { error: 'Offer must be accepted before checkout' },
          { status: 400 }
        );
      }

      listing = offer.listing;
      totalAmount = offer.amount + (listing.shippingCost || 0);
      sellerId = listing.sellerId;
    } else {
      listing = await db.listing.findUnique({
        where: { id: listingId },
        include: {
          seller: true,
        },
      });

      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }

      if (listing.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Listing is not available for purchase' },
          { status: 400 }
        );
      }

      totalAmount = listing.askingPrice + (listing.shippingCost || 0);
      sellerId = listing.sellerId;
    }

    // Check if transaction already exists
    const existingTransaction = await db.transaction.findFirst({
      where: {
        listingId: listing.id,
        buyerId: user.id,
        status: {
          in: ['PAYMENT_PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'INSPECTION_PERIOD'],
        },
      },
    });

    if (existingTransaction) {
      return NextResponse.json(
        {
          error: 'Transaction already exists',
          transaction: existingTransaction,
        },
        { status: 400 }
      );
    }

    // Calculate fees
    const itemPrice = offer ? offer.amount : listing.askingPrice;
    const shippingCost = listing.shippingCost || 0;
    const platformFee = itemPrice >= 1000
      ? Math.round(itemPrice * 0.055) // 5.5% over R1,000
      : 0; // Free under R1,000
    const sellerReceives = itemPrice - platformFee;

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        listingId: listing.id,
        sellerId,
        buyerId: user.id,
        offerId: offer?.id || null,
        itemPrice,
        shippingCost,
        totalAmount: itemPrice + shippingCost,
        platformFee,
        sellerReceives,
        status: 'PAYMENT_PENDING',
        paymentStatus: 'PENDING',
        deliveryStatus: 'NOT_SHIPPED',
        transactionType: offer ? 'OFFER' : 'MARKETPLACE',
      },
      include: {
        listing: true,
        seller: true,
        buyer: true,
      },
    });

    // Update listing status
    await db.listing.update({
      where: { id: listing.id },
      data: { status: 'SOLD' },
    });

    // If this was from an offer, mark it as accepted
    if (offer) {
      await db.offer.update({
        where: { id: offer.id },
        data: { status: 'ACCEPTED' },
      });
    }

    // Send payment instructions email
    try {
      await sendEmail(
        user.email!,
        {
          subject: `💳 Payment instructions for "${listing.title}"`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>💳 Payment Instructions</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>Hey there! 👋</p>
                <p>You're one step away from getting <strong>"${listing.title}"</strong>!</p>
                <div style="background: white; border: 2px solid #f97316; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                  <p style="margin: 0; color: #6b7280;">Total Amount</p>
                  <div style="font-size: 36px; font-weight: bold; color: #f97316;">R${totalAmount.toLocaleString()}</div>
                </div>
                <p><strong>How to pay:</strong></p>
                <ol>
                  <li>Make a bank transfer to our escrow account</li>
                  <li>Use reference: <code style="background: white; padding: 4px 8px; border-radius: 4px;">${transaction.id.slice(0, 8)}</code></li>
                  <li>Upload proof of payment in your dashboard</li>
                  <li>We'll verify and notify the seller to ship</li>
                </ol>
                <p><strong>Bank Details:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p style="margin: 5px 0;"><strong>Bank:</strong> Flippin Escrow Account</p>
                  <p style="margin: 5px 0;"><strong>Account Number:</strong> [Your bank account]</p>
                  <p style="margin: 5px 0;"><strong>Reference:</strong> ${transaction.id.slice(0, 8)}</p>
                </div>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/transactions/${transaction.id}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">Complete Payment</a>
                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                  Your money is safe in escrow until you confirm delivery! 🛡️
                </p>
              </div>
            </body>
            </html>
          `,
          text: `Payment Instructions\n\nTotal: R${totalAmount.toLocaleString()}\n\nReference: ${transaction.id.slice(0, 8)}\n\nComplete payment: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/transactions/${transaction.id}`,
        }
      );
    } catch (emailError) {
      console.error('Failed to send payment email:', emailError);
    }

    return NextResponse.json({
      transaction,
      paymentInstructions: {
        amount: totalAmount,
        reference: transaction.id.slice(0, 8),
        bankAccount: '[Your bank account details]', // TODO: Get from platform settings
      },
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

