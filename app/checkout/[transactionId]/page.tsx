'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Building2, Lock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  itemPrice: number;
  shippingCost: number;
  totalAmount: number;
  platformFee: number;
  cardFee: number;
  listing: {
    id: string;
    title: string;
    images: string[];
  };
  seller: {
    firstName: string | null;
    lastName: string | null;
  };
  paymentMethod: 'EFT' | 'CARD' | null;
  paymentStatus: string;
  status: string;
}

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'EFT' | 'CARD' | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [cardToken, setCardToken] = useState<string | null>(null);

  useEffect(() => {
    if (params.transactionId) {
      fetchTransaction();
    }
  }, [params.transactionId]);

  async function fetchTransaction() {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/transactions/${params.transactionId}`);
      if (!response.ok) throw new Error('Failed to fetch transaction');
      
      const data = await response.json();
      setTransaction(data.transaction);
      setSelectedMethod(data.transaction.paymentMethod || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transaction');
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentMethodSelect(method: 'EFT' | 'CARD') {
    setSelectedMethod(method);
    setError(null);

    if (method === 'EFT') {
      // Fetch bank details
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.platformBankName) {
            setBankDetails({
              bankName: data.platformBankName,
              accountName: data.platformAccountName || 'Flippin Escrow',
              accountNumber: data.platformAccountNumber || '',
              branchCode: data.platformBranchCode || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch bank details:', err);
      }
    }
  }

  async function handleCheckout() {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    if (selectedMethod === 'CARD' && !cardToken) {
      setError('Please enter card details');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: transaction?.listing.id,
          paymentMethod: selectedMethod,
          cardToken: cardToken || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const data = await response.json();

      if (selectedMethod === 'CARD') {
        // Card payment - redirect to success
        router.push(`/dashboard/transactions/${data.transaction.id}?success=true`);
      } else {
        // EFT payment - show instructions
        setBankDetails(data.paymentResult.bankDetails);
        // Transaction is created, show EFT instructions
        router.push(`/dashboard/transactions/${data.transaction.id}?method=eft`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error && !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/dashboard/transactions"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  const cardFee = selectedMethod === 'CARD' ? Math.round(transaction.itemPrice * 0.02) : 0;
  const totalWithCardFee = transaction.totalAmount + cardFee;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">Complete your purchase</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="flex items-start gap-4 mb-4">
                {transaction.listing.images.length > 0 && (
                  <img
                    src={transaction.listing.images[0]}
                    alt={transaction.listing.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{transaction.listing.title}</h3>
                  <p className="text-sm text-gray-600">
                    Seller: {transaction.seller.firstName} {transaction.seller.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                {/* EFT Option */}
                <button
                  onClick={() => handlePaymentMethodSelect('EFT')}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    selectedMethod === 'EFT'
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedMethod === 'EFT' ? 'bg-orange-600' : 'bg-gray-100'
                    }`}>
                      <Building2 className={`w-5 h-5 ${
                        selectedMethod === 'EFT' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Bank Transfer (EFT)</span>
                        {selectedMethod === 'EFT' && (
                          <CheckCircle className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        No card fees • Seller receives more
                      </p>
                    </div>
                  </div>
                </button>

                {/* Card Option */}
                <button
                  onClick={() => handlePaymentMethodSelect('CARD')}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    selectedMethod === 'CARD'
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedMethod === 'CARD' ? 'bg-orange-600' : 'bg-gray-100'
                    }`}>
                      <CreditCard className={`w-5 h-5 ${
                        selectedMethod === 'CARD' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Credit/Debit Card</span>
                        {selectedMethod === 'CARD' && (
                          <CheckCircle className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Instant payment • Secure checkout
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Card Payment Form */}
              {selectedMethod === 'CARD' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-4">
                    Card payment integration coming soon. For now, please use EFT.
                  </p>
                  {/* TODO: Add Stripe/Paystack card form here */}
                </div>
              )}

              {/* EFT Instructions */}
              {selectedMethod === 'EFT' && bankDetails && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Bank Transfer Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-medium text-gray-900">{bankDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-medium text-gray-900">{bankDetails.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-medium text-gray-900 font-mono">{bankDetails.accountNumber}</span>
                    </div>
                    {bankDetails.branchCode && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Branch Code:</span>
                        <span className="font-medium text-gray-900">{bankDetails.branchCode}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-medium text-gray-900 font-mono">
                        {transaction.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Use this reference when making the transfer. We'll verify payment and notify the seller to ship.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Sidebar - Order Total */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Total</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Item Price</span>
                  <span className="text-gray-900">R{transaction.itemPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">R{transaction.shippingCost.toLocaleString()}</span>
                </div>
                {selectedMethod === 'CARD' && cardFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Card Processing Fee</span>
                    <span className="text-gray-900">R{cardFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    R{selectedMethod === 'CARD' ? totalWithCardFee.toLocaleString() : transaction.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!selectedMethod || processing}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    {selectedMethod === 'CARD' ? 'Pay Now' : 'Continue with EFT'}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Lock className="w-4 h-4" />
                <span>Your payment is protected by escrow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

