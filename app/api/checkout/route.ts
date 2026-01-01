import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/sender';
import { emailTemplates } from '@/lib/email/templates';
import { calculatePaymentFees, processEFTPayment, processCardPayment } from '@/lib/payments/processor';

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

    const { listingId, offerId, paymentMethod, cardToken } = await req.json();

    if (!paymentMethod || !['EFT', 'CARD'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Payment method must be EFT or CARD' },
        { status: 400 }
      );
    }

    if (paymentMethod === 'CARD' && !cardToken) {
      return NextResponse.json(
        { error: 'Card token is required for card payments' },
        { status: 400 }
      );
    }

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
      totalAmount = Number(offer.amount) + Number(listing.shippingCost || 0);
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

      totalAmount = Number(listing.askingPrice) + Number(listing.shippingCost || 0);
      sellerId = listing.sellerId;
    }

    // Get bank details from platform settings (needed early for existing transactions)
    const platformSettings = await db.platformSettings.findUnique({
      where: { id: 'settings' },
    });

    // Check if transaction already exists (only for active transactions)
    const existingTransaction = await db.transaction.findFirst({
      where: {
        listingId: listing.id,
        buyerId: user.id,
        status: {
          in: ['PAYMENT_PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'INSPECTION_PERIOD', 'CREATED'],
        },
      },
    });

    if (existingTransaction) {
      // Return existing transaction instead of error
      return NextResponse.json({
        transaction: existingTransaction,
        paymentMethod: existingTransaction.paymentMethod,
        paymentResult: existingTransaction.paymentMethod === 'CARD'
          ? { success: true, transactionId: existingTransaction.paymentReference }
          : {
              amount: existingTransaction.totalAmount.toNumber(),
              reference: existingTransaction.paymentReference,
              bankDetails: platformSettings ? {
                bankName: platformSettings.platformBankName,
                accountName: platformSettings.platformAccountName,
                accountNumber: platformSettings.platformAccountNumber,
                branchCode: platformSettings.platformBranchCode,
              } : null,
            },
      });
    }

    // Calculate fees based on payment method
    const itemPrice = offer ? Number(offer.amount) : Number(listing.askingPrice);
    const shippingCost = Number(listing.shippingCost || 0);
    
    const fees = calculatePaymentFees(itemPrice, paymentMethod as 'EFT' | 'CARD');
    const { platformFee, cardFee, totalFee, sellerReceives } = fees;

    // Process payment
    let paymentResult;
    if (paymentMethod === 'CARD') {
      paymentResult = await processCardPayment(
        itemPrice + shippingCost,
        cardToken,
        {
          listingId: listing.id,
          buyerId: user.id,
        }
      );

      if (!paymentResult.success) {
        return NextResponse.json(
          { error: paymentResult.error || 'Payment failed' },
          { status: 400 }
        );
      }
    } else {
      // EFT - create pending payment
      const reference = `FLP${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      paymentResult = await processEFTPayment(itemPrice + shippingCost, reference);
    }

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        listingId: listing.id,
        sellerId,
        buyerId: user.id,
        itemPrice: Number(itemPrice),
        shippingCost: Number(shippingCost),
        totalAmount: Number(itemPrice) + Number(shippingCost),
        platformFee,
        cardFee: paymentMethod === 'CARD' ? cardFee : 0,
        sellerReceives,
        paymentMethod: paymentMethod === 'CARD' ? 'CARD' : 'BANK_TRANSFER',
        paymentReference: paymentResult.reference || paymentResult.transactionId || null,
        paymentRef: paymentResult.reference || paymentResult.transactionId || null, // Keep for backward compatibility
        status: paymentMethod === 'CARD' ? 'PAID' : 'PAYMENT_PENDING', // TransactionStatus.PAID exists
        paymentStatus: paymentMethod === 'CARD' ? 'VERIFIED' : 'PENDING',
        deliveryStatus: 'PENDING',
        transactionType: 'MARKETPLACE', // Offers are also marketplace transactions
        paidAt: paymentMethod === 'CARD' ? new Date() : null,
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

    // Send appropriate email based on payment method
    try {
      if (paymentMethod === 'CARD') {
        // Card payment - already processed
        await sendEmail(
          user.email!,
          {
            subject: `✅ Payment successful! "${listing.title}"`,
            html: `
              <!DOCTYPE html>
              <html>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1>✅ Payment Successful!</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p>Hey there! 👋</p>
                  <p>Great news: Your payment of <strong>R${totalAmount.toLocaleString()}</strong> for <strong>"${listing.title}"</strong> has been processed successfully!</p>
                  <p>The seller has been notified and will ship your item soon. You'll get a tracking number once it's on its way. 📦</p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/transactions/${transaction.id}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">View Transaction</a>
                </div>
              </body>
              </html>
            `,
            text: `Payment Successful!\n\nR${totalAmount.toLocaleString()} paid for "${listing.title}"\n\nView: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/transactions/${transaction.id}`,
          }
        );
      } else {
        // EFT payment - send instructions
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
                    <li>Use reference: <code style="background: white; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${paymentResult.reference}</code></li>
                    <li>We'll verify payment and notify the seller to ship</li>
                  </ol>
                  <p><strong>Bank Details:</strong></p>
                  <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    ${platformSettings?.platformBankName ? `<p style="margin: 5px 0;"><strong>Bank:</strong> ${platformSettings.platformBankName}</p>` : ''}
                    ${platformSettings?.platformAccountName ? `<p style="margin: 5px 0;"><strong>Account Name:</strong> ${platformSettings.platformAccountName}</p>` : ''}
                    ${platformSettings?.platformAccountNumber ? `<p style="margin: 5px 0;"><strong>Account Number:</strong> ${platformSettings.platformAccountNumber}</p>` : ''}
                    ${platformSettings?.platformBranchCode ? `<p style="margin: 5px 0;"><strong>Branch Code:</strong> ${platformSettings.platformBranchCode}</p>` : ''}
                    <p style="margin: 5px 0;"><strong>Reference:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${paymentResult.reference}</code></p>
                  </div>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/transactions/${transaction.id}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">View Transaction</a>
                  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                    Your money is safe in escrow until you confirm delivery! 🛡️
                  </p>
                </div>
              </body>
              </html>
            `,
            text: `Payment Instructions\n\nTotal: R${totalAmount.toLocaleString()}\n\nReference: ${paymentResult.reference}\n\nView: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/transactions/${transaction.id}`,
          }
        );
      }
    } catch (emailError) {
      console.error('Failed to send payment email:', emailError);
    }

    return NextResponse.json({
      transaction,
      paymentMethod,
      paymentResult: paymentMethod === 'CARD' 
        ? { success: true, transactionId: paymentResult.transactionId }
        : {
            amount: totalAmount,
            reference: paymentResult.reference,
            bankDetails: platformSettings ? {
              bankName: platformSettings.platformBankName,
              accountName: platformSettings.platformAccountName,
              accountNumber: platformSettings.platformAccountNumber,
              branchCode: platformSettings.platformBranchCode,
            } : null,
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

