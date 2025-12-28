'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, User, Shield, Heart, MessageSquare, TrendingUp, Package, Truck } from 'lucide-react';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  description: string;
  askingPrice: number;
  shippingCost: number | null;
  condition: string;
  brand: string | null;
  model: string | null;
  variant: string | null;
  images: string[];
  province: string;
  city: string;
  deliveryMethods: string[];
  category: {
    name: string;
  };
  seller: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    rating: number | null;
    verified: boolean;
    totalSales: number;
  };
  views: number;
  saves: number;
  createdAt: string;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showMakeOffer, setShowMakeOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  async function fetchListing() {
    try {
      setLoading(true);
      // TODO: Create public listing detail API
      // For now, using admin API
      const response = await fetch(`/api/admin/listings/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch listing');
      
      const data = await response.json();
      setListing(data);
      setOfferAmount(data.askingPrice.toString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  }

  async function handleMakeOffer() {
    router.push(`/listing/${params.id}/offer`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading listing...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error || 'Listing not found'}</p>
            <Link
              href="/browse"
              className="mt-4 inline-block text-orange-600 hover:text-orange-700"
            >
              ← Back to Browse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const conditionColors: Record<string, string> = {
    NEW: 'bg-green-100 text-green-800',
    LIKE_NEW: 'bg-blue-100 text-blue-800',
    GOOD: 'bg-yellow-100 text-yellow-800',
    FAIR: 'bg-orange-100 text-orange-800',
    POOR: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span>/</span>
            <Link href="/browse" className="hover:text-orange-600">Browse</Link>
            <span>/</span>
            <Link href={`/browse?category=${listing.category.name}`} className="hover:text-orange-600">
              {listing.category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{listing.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                {listing.images.length > 0 ? (
                  <>
                    <img
                      src={listing.images[selectedImage]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {listing.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                          disabled={selectedImage === 0}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white px-3 py-2 rounded-lg disabled:opacity-50"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => setSelectedImage(Math.min(listing.images.length - 1, selectedImage + 1))}
                          disabled={selectedImage === listing.images.length - 1}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white px-3 py-2 rounded-lg disabled:opacity-50"
                        >
                          →
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-24 h-24" />
                  </div>
                )}
              </div>
              {listing.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {listing.images.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === idx ? 'border-orange-600' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${listing.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>
            </div>

            {/* Product Details */}
            {(listing.brand || listing.model || listing.variant) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  {listing.brand && (
                    <div>
                      <p className="text-sm text-gray-500">Brand</p>
                      <p className="font-medium text-gray-900">{listing.brand}</p>
                    </div>
                  )}
                  {listing.model && (
                    <div>
                      <p className="text-sm text-gray-500">Model</p>
                      <p className="font-medium text-gray-900">{listing.model}</p>
                    </div>
                  )}
                  {listing.variant && (
                    <div>
                      <p className="text-sm text-gray-500">Variant</p>
                      <p className="font-medium text-gray-900">{listing.variant}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Condition</p>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                        conditionColors[listing.condition] || conditionColors.GOOD
                      }`}
                    >
                      {listing.condition.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping & Delivery */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping & Delivery</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Delivery Methods</p>
                    <p className="text-sm text-gray-600">
                      {listing.deliveryMethods.map((m) => m.replace(/_/g, ' ')).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">
                      {listing.city}, {listing.province.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                {listing.shippingCost && (
                  <div>
                    <p className="font-medium text-gray-900">Shipping Cost</p>
                    <p className="text-sm text-gray-600">R{listing.shippingCost.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Purchase Box */}
          <div className="space-y-6">
            {/* Price & Actions */}
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-4xl font-bold text-gray-900">
                  R{listing.askingPrice.toLocaleString()}
                </p>
                {listing.shippingCost && (
                  <p className="text-sm text-gray-600 mt-1">
                    + R{listing.shippingCost.toLocaleString()} shipping
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowMakeOffer(!showMakeOffer)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Make Offer
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          listingId: listing.id,
                          paymentMethod: 'EFT', // Default to EFT, can change in checkout
                        }),
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to create checkout');
                      }

                      const data = await response.json();
                      router.push(`/checkout/${data.transaction.id}`);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : 'Failed to proceed to checkout');
                    }
                  }}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Buy Now
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4" />
                  Save for Later
                </button>
              </div>

              {/* Make Offer Form */}
              {showMakeOffer && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Offer
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder={listing.askingPrice.toString()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                      onClick={handleMakeOffer}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Send
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Seller will be notified of your offer
                  </p>
                </div>
              )}

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Protected by Flippin escrow</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">48-hour inspection period</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-600">Free under R1,000</span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Seller Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {listing.seller.firstName} {listing.seller.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {listing.seller.rating && (
                        <span className="text-sm text-gray-600">
                          ⭐ {listing.seller.rating.toFixed(1)}
                        </span>
                      )}
                      {listing.seller.verified && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Sales</p>
                      <p className="font-medium text-gray-900">{listing.seller.totalSales}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Response Rate</p>
                      <p className="font-medium text-gray-900">100%</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message Seller
                </button>
              </div>
            </div>

            {/* Listing Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Listing Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium text-gray-900">{listing.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Saves</span>
                  <span className="font-medium text-gray-900">{listing.saves}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-medium text-gray-900">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

