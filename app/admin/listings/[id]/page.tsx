'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Edit2, CheckCircle, XCircle, Trash2, Package, DollarSign, User, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  description: string;
  status: string;
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
  onMarketplace: boolean;
  sentToBuyerNetwork: boolean;
  category: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  offers: any[];
  instantOffers: any[];
  transactions: any[];
  views: number;
  saves: number;
  createdAt: string;
  updatedAt: string;
  soldAt: string | null;
}

export default function AdminListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  async function fetchListing() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/listings/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch listing');
      
      const data = await response.json();
      setListing(data);
      setFormData({
        title: data.title,
        description: data.description,
        status: data.status,
        askingPrice: data.askingPrice,
        shippingCost: data.shippingCost,
        condition: data.condition,
        brand: data.brand,
        model: data.model,
        variant: data.variant,
        categoryId: data.categoryId,
        province: data.province,
        city: data.city,
        onMarketplace: data.onMarketplace,
        sentToBuyerNetwork: data.sentToBuyerNetwork,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/listings/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update listing');
      
      await fetchListing();
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(status: string) {
    try {
      const response = await fetch(`/api/admin/listings/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      await fetchListing();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error || 'Listing not found'}</p>
            <Link
              href="/admin/listings"
              className="mt-4 inline-block text-orange-600 hover:text-orange-700"
            >
              ← Back to Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    SOLD: 'bg-blue-100 text-blue-800',
    EXPIRED: 'bg-gray-100 text-gray-800',
    REMOVED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/listings"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {editing ? 'Edit Listing' : 'Listing Details'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">ID: {listing.id}</p>
              </div>
            </div>
            <div className="flex gap-3">
              {!editing ? (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  {listing.status === 'PENDING_APPROVAL' && (
                    <>
                      <button
                        onClick={() => updateStatus('ACTIVE')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus('REMOVED')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      fetchListing();
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveChanges}
                    disabled={saving}
                    className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.images.map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`${listing.title} ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <input
                        type="text"
                        value={formData.brand || ''}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input
                        type="text"
                        value={formData.model || ''}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{listing.title}</h3>
                    <p className="text-gray-600 mt-2 whitespace-pre-wrap">{listing.description}</p>
                  </div>
                  {(listing.brand || listing.model) && (
                    <div className="flex gap-4 text-sm">
                      {listing.brand && (
                        <div>
                          <span className="text-gray-500">Brand:</span>{' '}
                          <span className="font-medium">{listing.brand}</span>
                        </div>
                      )}
                      {listing.model && (
                        <div>
                          <span className="text-gray-500">Model:</span>{' '}
                          <span className="font-medium">{listing.model}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pricing & Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Details</h2>
              {editing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asking Price</label>
                    <input
                      type="number"
                      value={formData.askingPrice || ''}
                      onChange={(e) => setFormData({ ...formData, askingPrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost</label>
                    <input
                      type="number"
                      value={formData.shippingCost || ''}
                      onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || null })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                      value={formData.condition || ''}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="NEW">New</option>
                      <option value="LIKE_NEW">Like New</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PENDING_APPROVAL">Pending Approval</option>
                      <option value="ACTIVE">Active</option>
                      <option value="SOLD">Sold</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="REMOVED">Removed</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Asking Price</p>
                    <p className="text-2xl font-bold text-gray-900">R{listing.askingPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shipping Cost</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {listing.shippingCost ? `R${listing.shippingCost.toLocaleString()}` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Condition</p>
                    <p className="text-lg font-medium text-gray-900">{listing.condition.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                        statusColors[listing.status] || statusColors.DRAFT
                      }`}
                    >
                      {listing.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Offers */}
            {listing.offers.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Offers ({listing.offers.length})</h2>
                <div className="space-y-3">
                  {listing.offers.map((offer) => (
                    <div key={offer.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">R{offer.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">
                            From {offer.buyer.firstName} {offer.buyer.lastName}
                          </p>
                          {offer.message && (
                            <p className="text-sm text-gray-500 mt-1 italic">"{offer.message}"</p>
                          )}
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {offer.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instant Offers */}
            {listing.instantOffers.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Instant Offers ({listing.instantOffers.length})
                </h2>
                <div className="space-y-3">
                  {listing.instantOffers.map((offer) => (
                    <div key={offer.id} className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            R{offer.sellerReceives.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            From {offer.buyer.companyName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Buyer pays: R{offer.buyerPays.toLocaleString()} (includes R{offer.platformFee.toLocaleString()} fee)
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {offer.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Seller</p>
                    <Link
                      href={`/admin/users/${listing.seller.id}`}
                      className="text-sm font-medium text-orange-600 hover:text-orange-700"
                    >
                      {listing.seller.firstName} {listing.seller.lastName}
                    </Link>
                    <p className="text-xs text-gray-500">{listing.seller.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="text-sm font-medium text-gray-900">{listing.category.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {listing.city}, {listing.province.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Views</p>
                    <p className="text-sm font-medium text-gray-900">{listing.views}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Saves</p>
                    <p className="text-sm font-medium text-gray-900">{listing.saves}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribution</h2>
              {editing ? (
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.onMarketplace || false}
                      onChange={(e) => setFormData({ ...formData, onMarketplace: e.target.checked })}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">On Marketplace</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.sentToBuyerNetwork || false}
                      onChange={(e) => setFormData({ ...formData, sentToBuyerNetwork: e.target.checked })}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Sent to Buyer Network</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {listing.onMarketplace ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-700">On Marketplace</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {listing.sentToBuyerNetwork ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-700">Sent to Buyer Network</span>
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(listing.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(listing.updatedAt).toLocaleString()}
                  </p>
                </div>
                {listing.soldAt && (
                  <div>
                    <p className="text-gray-500">Sold At</p>
                    <p className="font-medium text-gray-900">
                      {new Date(listing.soldAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

