import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { calculatePaymentFees, processEFTPayment, processCardPayment } from '@/lib/payments/processor';
import { sendEmail } from '@/lib/email/sender';
import { emailTemplates } from '@/lib/email/templates';

/**
 * POST /api/checkout/multi
 * Create checkout for multiple items (cart checkout)
 * Creates one transaction per seller
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listingIds, paymentMethod, cardToken } = await req.json();

    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one listing ID is required' },
        { status: 400 }
      );
    }

    if (!paymentMethod || !['EFT', 'CARD'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Payment method must be EFT or CARD' },
        { status: 400 }
      );
    }

    // Get all listings
    const listings = await db.listing.findMany({
      where: {
        id: { in: listingIds },
        status: 'ACTIVE',
      },
      include: {
        seller: true,
      },
    });

    if (listings.length !== listingIds.length) {
      return NextResponse.json(
        { error: 'Some listings are not available' },
        { status: 400 }
      );
    }

    // Get platform settings
    const platformSettings = await db.platformSettings.findUnique({
      where: { id: 'settings' },
    });

    // Group listings by seller
    const listingsBySeller = new Map<string, typeof listings>();
    listings.forEach(listing => {
      if (!listingsBySeller.has(listing.sellerId)) {
        listingsBySeller.set(listing.sellerId, []);
      }
      listingsBySeller.get(listing.sellerId)!.push(listing);
    });

    // Create transactions (one per seller)
    const transactions = [];
    let totalAmount = 0;
    const paymentReferences: string[] = [];

    for (const [sellerId, sellerListings] of listingsBySeller.entries()) {
      // Calculate totals for this seller
      const sellerItemTotal = sellerListings.reduce((sum, listing) => sum + listing.askingPrice.toNumber(), 0);
      const sellerShippingTotal = sellerListings.reduce((sum, listing) => sum + (listing.shippingCost?.toNumber() || 0), 0);
      const sellerTotal = sellerItemTotal + sellerShippingTotal;

      // Calculate fees
      const fees = calculatePaymentFees(sellerItemTotal, paymentMethod as 'EFT' | 'CARD');
      const { platformFee, cardFee, sellerReceives } = fees;

      // Process payment for this seller's items
      let paymentResult;
      if (paymentMethod === 'CARD') {
        // For multi-item, we'll process one payment and split it
        // For now, create separate payment intents per seller
        // Use first listing ID for metadata (card processor expects single ID)
        paymentResult = await processCardPayment(
          sellerTotal,
          cardToken!,
          {
            sellerId,
            listingId: sellerListings[0].id,
          }
        );
      } else {
        const reference = `FLP${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        paymentResult = await processEFTPayment(sellerTotal, reference);
        paymentReferences.push(reference);
      }

      // Create transaction for this seller
      const transaction = await db.transaction.create({
        data: {
          listingId: sellerListings[0].id, // Primary listing (we'll handle multi-item transactions later)
          sellerId,
          buyerId: user.id,
          itemPrice: sellerItemTotal,
          shippingCost: sellerShippingTotal,
          totalAmount: sellerTotal,
          platformFee,
          cardFee: paymentMethod === 'CARD' ? cardFee : 0,
          sellerReceives,
          paymentMethod: paymentMethod === 'CARD' ? 'CARD' : 'BANK_TRANSFER',
          paymentReference: paymentResult.reference || paymentResult.transactionId || null,
          paymentRef: paymentResult.reference || paymentResult.transactionId || null,
          status: paymentMethod === 'CARD' ? 'PAID' : 'PAYMENT_PENDING',
          paymentStatus: paymentMethod === 'CARD' ? 'VERIFIED' : 'PENDING',
          deliveryStatus: 'PENDING',
          transactionType: 'MARKETPLACE',
          paidAt: paymentMethod === 'CARD' ? new Date() : null,
        },
        include: {
          listing: true,
          seller: true,
          buyer: true,
        },
      });

      transactions.push(transaction);
      totalAmount += sellerTotal;

      // Update listing status
      await db.listing.updateMany({
        where: {
          id: { in: sellerListings.map(l => l.id) },
        },
        data: { status: 'SOLD' },
      });
    }

    // Send emails
    try {
      if (paymentMethod === 'CARD') {
        await sendEmail(
          user.email!,
          {
            subject: `✅ Payment successful! ${transactions.length} ${transactions.length === 1 ? 'item' : 'items'} purchased`,
            html: `
              <!DOCTYPE html>
              <html>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1>✅ Payment Successful!</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p>Hey there! 👋</p>
                  <p>Great news: Your payment of <strong>R${totalAmount.toLocaleString()}</strong> for ${transactions.length} ${transactions.length === 1 ? 'item' : 'items'} has been processed successfully!</p>
                  <p>The ${transactions.length === 1 ? 'seller has' : 'sellers have'} been notified and ${transactions.length === 1 ? 'will ship' : 'will ship'} your ${transactions.length === 1 ? 'item' : 'items'} soon. You'll get tracking numbers once ${transactions.length === 1 ? "it's" : "they're"} on the way. 📦</p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/transactions" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">View Transactions</a>
                </div>
              </body>
              </html>
            `,
            text: `Payment Successful!\n\nR${totalAmount.toLocaleString()} paid for ${transactions.length} ${transactions.length === 1 ? 'item' : 'items'}\n\nView: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/transactions`,
          }
        );
      }
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    return NextResponse.json({
      transactions,
      totalAmount,
      paymentMethod,
      paymentResult: paymentMethod === 'CARD'
        ? { success: true, transactionIds: transactions.map(t => t.id) }
        : {
            amount: totalAmount,
            references: paymentReferences,
            bankDetails: platformSettings ? {
              bankName: platformSettings.platformBankName,
              accountName: platformSettings.platformAccountName,
              accountNumber: platformSettings.platformAccountNumber,
              branchCode: platformSettings.platformBranchCode,
            } : null,
          },
    });
  } catch (error) {
    console.error('Error creating multi-item checkout:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

