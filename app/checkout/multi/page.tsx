'use client';

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Building2, Lock, Loader2, AlertCircle, Package } from 'lucide-react';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  askingPrice: number;
  shippingCost: number;
  images: string[];
  seller: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export default function MultiItemCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'EFT' | 'CARD' | null>(null);

  useEffect(() => {
    const itemsParam = searchParams.get('items');
    if (itemsParam) {
      const listingIds = itemsParam.split(',');
      fetchListings(listingIds);
    }
  }, [searchParams]);

  async function fetchListings(listingIds: string[]) {
    try {
      setLoading(true);
      // Fetch all listings
      const promises = listingIds.map(id => 
        fetch(`/api/admin/listings/${id}`).then(r => r.json())
      );
      const results = await Promise.all(promises);
      setListings(results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const response = await fetch('/api/checkout/multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingIds: listings.map(l => l.id),
          paymentMethod: selectedMethod,
          cardToken: null, // TODO: Add card tokenization
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }

      const data = await response.json();

      if (selectedMethod === 'CARD') {
        router.push(`/dashboard/transactions?success=true&count=${data.transactions.length}`);
      } else {
        router.push(`/dashboard/transactions?method=eft&count=${data.transactions.length}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
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

  if (error && listings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/cart"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  // Group listings by seller
  const listingsBySeller = new Map<string, Listing[]>();
  listings.forEach(listing => {
    if (!listingsBySeller.has(listing.seller.id)) {
      listingsBySeller.set(listing.seller.id, []);
    }
    listingsBySeller.get(listing.seller.id)!.push(listing);
  });

  const totalAmount = listings.reduce((sum, listing) => 
    sum + listing.askingPrice + (listing.shippingCost || 0), 0
  );
  const cardFee = selectedMethod === 'CARD' 
    ? Math.round(listings.reduce((sum, listing) => sum + listing.askingPrice, 0) * 0.02)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">
            {listings.length} {listings.length === 1 ? 'item' : 'items'} from {listingsBySeller.size} {listingsBySeller.size === 1 ? 'seller' : 'sellers'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items by Seller */}
            {Array.from(listingsBySeller.entries()).map(([sellerId, sellerListings]) => {
              const sellerTotal = sellerListings.reduce((sum, listing) => 
                sum + listing.askingPrice + (listing.shippingCost || 0), 0
              );
              
              return (
                <div key={sellerId} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      {sellerListings[0].seller.firstName} {sellerListings[0].seller.lastName}
                    </h2>
                    <span className="text-sm text-gray-500">
                      ({sellerListings.length} {sellerListings.length === 1 ? 'item' : 'items'})
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {sellerListings.map((listing) => (
                      <div key={listing.id} className="flex items-start gap-4">
                        {listing.images.length > 0 && (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{listing.title}</h3>
                          <p className="text-sm text-gray-600">
                            R{listing.askingPrice.toLocaleString()}
                            {listing.shippingCost > 0 && (
                              <span> + R{listing.shippingCost.toLocaleString()} shipping</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-900">
                        R{sellerTotal.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This seller will ship separately
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedMethod('EFT')}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    selectedMethod === 'EFT'
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className={`w-5 h-5 ${selectedMethod === 'EFT' ? 'text-orange-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">Bank Transfer (EFT)</span>
                      <p className="text-sm text-gray-600 mt-1">
                        No card fees • Sellers receive more
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMethod('CARD')}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    selectedMethod === 'CARD'
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-5 h-5 ${selectedMethod === 'CARD' ? 'text-orange-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">Credit/Debit Card</span>
                      <p className="text-sm text-gray-600 mt-1">
                        Instant payment • Secure checkout
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {selectedMethod === 'CARD' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Card payment integration coming soon. For now, please use EFT.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Total</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items ({listings.length})</span>
                  <span className="text-gray-900">
                    R{listings.reduce((sum, l) => sum + l.askingPrice, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    R{listings.reduce((sum, l) => sum + (l.shippingCost || 0), 0).toLocaleString()}
                  </span>
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
                    R{(totalAmount + cardFee).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> This will create {listingsBySeller.size} {listingsBySeller.size === 1 ? 'transaction' : 'transactions'} (one per seller). Each seller will ship separately.
                </p>
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
                <span>All payments protected by escrow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

