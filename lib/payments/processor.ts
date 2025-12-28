/**
 * Payment processor for Flippin
 * Handles both EFT and card payments
 */

export interface PaymentMethod {
  type: 'EFT' | 'CARD';
  details?: {
    // For EFT
    bankName?: string;
    accountNumber?: string;
    branchCode?: string;
    reference?: string;
    // For Card
    cardToken?: string;
    last4?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  paymentMethod: PaymentMethod['type'];
  amount: number;
  fee: number;
  reference?: string;
  error?: string;
}

/**
 * Calculate fees based on payment method
 */
export function calculatePaymentFees(
  itemPrice: number,
  paymentMethod: 'EFT' | 'CARD'
): {
  platformFee: number;
  cardFee: number;
  totalFee: number;
  sellerReceives: number;
} {
  // Platform fee: 5.5% over R1,000, free under
  const platformFee = itemPrice >= 1000
    ? Math.round(itemPrice * 0.055)
    : 0;

  // Card fee: 2% if paid by card (we absorb this)
  const cardFee = paymentMethod === 'CARD'
    ? Math.round(itemPrice * 0.02)
    : 0;

  const totalFee = platformFee + cardFee;
  const sellerReceives = itemPrice - totalFee;

  return {
    platformFee,
    cardFee,
    totalFee,
    sellerReceives,
  };
}

/**
 * Process EFT payment
 * In production, this would integrate with your bank's API
 */
export async function processEFTPayment(
  amount: number,
  reference: string
): Promise<PaymentResult> {
  // For now, we just create a pending payment record
  // In production, you'd:
  // 1. Generate bank account details
  // 2. Create payment instruction
  // 3. Wait for bank confirmation (webhook or manual verification)

  return {
    success: true,
    transactionId: reference,
    paymentMethod: 'EFT',
    amount,
    fee: 0, // No card fee for EFT
    reference,
  };
}

/**
 * Process card payment
 * In production, this would integrate with Stripe, Paystack, or similar
 */
export async function processCardPayment(
  amount: number,
  cardToken: string,
  metadata?: Record<string, string>
): Promise<PaymentResult> {
  // TODO: Integrate with payment processor (Stripe, Paystack, etc.)
  // For now, this is a placeholder

  // Example Stripe integration:
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: Math.round(amount * 100), // Convert to cents
  //   currency: 'zar',
  //   payment_method: cardToken,
  //   confirm: true,
  //   metadata,
  // });

  // Calculate fees
  const cardFee = Math.round(amount * 0.02); // 2% card fee

  return {
    success: true,
    transactionId: `card_${Date.now()}`,
    paymentMethod: 'CARD',
    amount,
    fee: cardFee,
  };
}

/**
 * Verify EFT payment
 * Check if payment has been received
 */
export async function verifyEFTPayment(
  reference: string
): Promise<{ verified: boolean; amount?: number; paidAt?: Date }> {
  // TODO: Integrate with bank API or manual verification system
  // For now, return pending
  return {
    verified: false,
  };
}

