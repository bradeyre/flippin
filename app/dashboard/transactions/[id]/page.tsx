'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, AlertCircle, Copy, CreditCard, Building2, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  itemPrice: number;
  shippingCost: number;
  totalAmount: number;
  platformFee: number;
  cardFee: number;
  sellerReceives: number;
  paymentMethod: 'EFT' | 'CARD' | null;
  paymentStatus: string;
  paymentReference: string | null;
  deliveryStatus: string;
  trackingNumber: string | null;
  courierName: string | null;
  status: string;
  role: 'seller' | 'buyer';
  listing: {
    id: string;
    title: string;
    images: string[];
    description: string;
  };
  seller: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    rating: number | null;
    verified: boolean;
  };
  buyer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    rating: number | null;
    verified: boolean;
  };
  offer: {
    id: string;
    amount: number;
    message: string | null;
  } | null;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchTransaction();
    }
  }, [params.id]);

  async function fetchTransaction() {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/transactions/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch transaction');
      
      const data = await response.json();
      setTransaction(data.transaction);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transaction');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function confirmDelivery() {
    if (!confirm('Confirm that you have received the item and it matches the description?')) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${params.id}/confirm-delivery`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to confirm delivery');
      
      await fetchTransaction();
      alert('Delivery confirmed! Payment will be released to the seller.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to confirm delivery');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transaction...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error || 'Transaction not found'}</p>
            <Link
              href="/dashboard/transactions"
              className="mt-4 inline-block text-orange-600 hover:text-orange-700"
            >
              ← Back to Transactions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = searchParams.get('success') === 'true';
  const isEFT = searchParams.get('method') === 'eft';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/transactions"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
              <p className="mt-1 text-sm text-gray-500">ID: {transaction.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Payment Successful!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your payment has been processed. The seller will be notified to ship your item.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* EFT Instructions */}
        {isEFT && transaction.paymentMethod === 'EFT' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Next Step: Make Bank Transfer</h3>
            <p className="text-sm text-blue-700 mb-4">
              Transfer R{transaction.totalAmount.toLocaleString()} to our escrow account using the reference below.
            </p>
            {transaction.paymentReference && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Payment Reference</p>
                    <p className="font-mono font-semibold text-gray-900">{transaction.paymentReference}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(transaction.paymentReference!)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Copy className={`w-5 h-5 ${copied ? 'text-green-600' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs text-blue-600">
              Once payment is verified, the seller will be notified to ship your item.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Item Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h2>
              <div className="flex items-start gap-4">
                {transaction.listing.images.length > 0 && (
                  <img
                    src={transaction.listing.images[0]}
                    alt={transaction.listing.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{transaction.listing.title}</h3>
                  <Link
                    href={`/listing/${transaction.listing.id}`}
                    className="text-sm text-orange-600 hover:text-orange-700 mt-1 inline-block"
                  >
                    View Listing →
                  </Link>
                </div>
              </div>
            </div>

            {/* Transaction Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Transaction Created</p>
                    <p className="text-sm text-gray-600">{new Date(transaction.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {transaction.paidAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Payment Received</p>
                      <p className="text-sm text-gray-600">{new Date(transaction.paidAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {transaction.shippedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Item Shipped</p>
                      <p className="text-sm text-gray-600">{new Date(transaction.shippedAt).toLocaleString()}</p>
                      {transaction.trackingNumber && (
                        <p className="text-sm text-gray-600 mt-1">
                          Tracking: <span className="font-mono">{transaction.trackingNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {transaction.deliveredAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Item Delivered</p>
                      <p className="text-sm text-gray-600">{new Date(transaction.deliveredAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {transaction.completedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Transaction Completed</p>
                      <p className="text-sm text-gray-600">{new Date(transaction.completedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            {transaction.trackingNumber && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
                <div className="space-y-2">
                  {transaction.courierName && (
                    <div>
                      <p className="text-sm text-gray-500">Courier</p>
                      <p className="font-medium text-gray-900">{transaction.courierName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Tracking Number</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-medium text-gray-900">{transaction.trackingNumber}</p>
                      <button
                        onClick={() => copyToClipboard(transaction.trackingNumber!)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Copy className={`w-4 h-4 ${copied ? 'text-green-600' : 'text-gray-600'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buyer Actions */}
            {transaction.role === 'buyer' && transaction.deliveredAt && !transaction.completedAt && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Inspection Period</h2>
                <p className="text-gray-600 mb-4">
                  You have 48 hours to inspect the item. Once confirmed, payment will be released to the seller.
                </p>
                <button
                  onClick={confirmDelivery}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Confirm Delivery & Release Payment
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {transaction.role === 'seller' ? 'Payout Summary' : 'Payment Summary'}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Item Price</span>
                  <span className="text-gray-900">R{transaction.itemPrice.toLocaleString()}</span>
                </div>
                {transaction.role === 'seller' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform Fee (5.5%)</span>
                      <span className="text-red-600">-R{transaction.platformFee.toLocaleString()}</span>
                    </div>
                    {transaction.cardFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Card Fee (2%)</span>
                        <span className="text-red-600">-R{transaction.cardFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-200 flex justify-between">
                      <span className="font-semibold text-gray-900">You Receive</span>
                      <span className="text-xl font-bold text-green-600">
                        R{transaction.sellerReceives.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
                {transaction.role === 'buyer' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">R{transaction.shippingCost.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between">
                      <span className="font-semibold text-gray-900">Total Paid</span>
                      <span className="text-xl font-bold text-gray-900">
                        R{transaction.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="flex items-center gap-3">
                {transaction.paymentMethod === 'CARD' ? (
                  <CreditCard className="w-5 h-5 text-gray-400" />
                ) : (
                  <Building2 className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {transaction.paymentMethod === 'CARD' ? 'Credit/Debit Card' : 'Bank Transfer (EFT)'}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">{transaction.paymentStatus.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {transaction.role === 'seller' ? 'Buyer' : 'Seller'} Information
              </h2>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {transaction.role === 'seller'
                    ? `${transaction.buyer.firstName} ${transaction.buyer.lastName}`
                    : `${transaction.seller.firstName} ${transaction.seller.lastName}`}
                </p>
                <p className="text-sm text-gray-600">
                  {transaction.role === 'seller' ? transaction.buyer.email : transaction.seller.email}
                </p>
                {transaction.role === 'seller' && transaction.buyer.phone && (
                  <p className="text-sm text-gray-600">{transaction.buyer.phone}</p>
                )}
                {transaction.role === 'buyer' && transaction.seller.phone && (
                  <p className="text-sm text-gray-600">{transaction.seller.phone}</p>
                )}
                <Link
                  href={`/messages/${transaction.role === 'seller' ? transaction.buyer.id : transaction.seller.id}?listing=${transaction.listing.id}`}
                  className="inline-block mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Send Message →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shipping Form Component
function ShippingForm({ transactionId, onSuccess }: { transactionId: string; onSuccess: () => void }) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transactionId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim(),
          courierName: courierName.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update shipping');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shipping');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Tracking Number <span className="text-red-500">*</span>
        </label>
        <input
          id="trackingNumber"
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Enter tracking number"
        />
      </div>
      <div>
        <label htmlFor="courierName" className="block text-sm font-medium text-gray-700 mb-2">
          Courier Name <span className="text-gray-400">(Optional)</span>
        </label>
        <select
          id="courierName"
          value={courierName}
          onChange={(e) => setCourierName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">Select courier...</option>
          <option value="Paxi">Paxi</option>
          <option value="PostNet">PostNet</option>
          <option value="FastWay">FastWay</option>
          <option value="CourierGuy">CourierGuy</option>
          <option value="DHL">DHL</option>
          <option value="FedEx">FedEx</option>
          <option value="Other">Other</option>
        </select>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={!trackingNumber.trim() || submitting}
        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Truck className="w-5 h-5" />
            Mark as Shipped
          </>
        )}
      </button>
      <p className="text-xs text-gray-500">
        The buyer will be notified once you add tracking information.
      </p>
    </form>
  );
}

