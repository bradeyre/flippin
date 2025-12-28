'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Building, CreditCard, TrendingUp, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface UserDetail {
  id: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  type: string;
  verified: boolean;
  verificationLevel: string;
  companyName: string | null;
  province: string | null;
  city: string | null;
  bankName: string | null;
  accountHolder: string | null;
  accountNumber: string | null;
  branchCode: string | null;
  bankingVerified: boolean;
  rating: number | null;
  totalSales: number;
  totalPurchases: number;
  listings: any[];
  buyOrders: any[];
  sellerTransactions: any[];
  buyerTransactions: any[];
  instantBuyer: any;
  _count: {
    listings: number;
    buyOrders: number;
    offers: number;
    sellerTransactions: number;
    buyerTransactions: number;
    reviews: number;
  };
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  async function fetchUser() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      
      const data = await response.json();
      setUser(data);
      setFormData({
        email: data.email,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type,
        verified: data.verified,
        verificationLevel: data.verificationLevel,
        companyName: data.companyName,
        province: data.province,
        city: data.city,
        bankName: data.bankName,
        accountHolder: data.accountHolder,
        accountNumber: data.accountNumber,
        branchCode: data.branchCode,
        bankingVerified: data.bankingVerified,
        rating: data.rating,
        totalSales: data.totalSales,
        totalPurchases: data.totalPurchases,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update user');
      
      await fetchUser();
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading user...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error || 'User not found'}</p>
            <Link
              href="/admin/users"
              className="mt-4 inline-block text-orange-600 hover:text-orange-700"
            >
              ← Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    PERSONAL_SELLER: 'bg-blue-100 text-blue-800',
    PERSONAL_BUYER: 'bg-green-100 text-green-800',
    BUSINESS_SELLER: 'bg-purple-100 text-purple-800',
    BUSINESS_BUYER: 'bg-indigo-100 text-indigo-800',
    INSTANT_BUYER: 'bg-orange-100 text-orange-800',
    ADMIN: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/users"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {editing ? 'Edit User' : user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                </h1>
                <p className="mt-1 text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      fetchUser();
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
            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName || ''}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName || ''}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                    <select
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="PERSONAL_SELLER">Personal Seller</option>
                      <option value="PERSONAL_BUYER">Personal Buyer</option>
                      <option value="BUSINESS_SELLER">Business Seller</option>
                      <option value="BUSINESS_BUYER">Business Buyer</option>
                      <option value="INSTANT_BUYER">Instant Buyer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                      <select
                        value={formData.province || ''}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select Province</option>
                        <option value="GAUTENG">Gauteng</option>
                        <option value="WESTERN_CAPE">Western Cape</option>
                        <option value="KWAZULU_NATAL">KwaZulu-Natal</option>
                        <option value="EASTERN_CAPE">Eastern Cape</option>
                        <option value="FREE_STATE">Free State</option>
                        <option value="LIMPOPO">Limpopo</option>
                        <option value="MPUMALANGA">Mpumalanga</option>
                        <option value="NORTH_WEST">North West</option>
                        <option value="NORTHERN_CAPE">Northern Cape</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : 'Not set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    {user.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{user.phone}</p>
                        </div>
                      </div>
                    )}
                    {(user.province || user.city) && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium text-gray-900">
                            {user.city && user.province
                              ? `${user.city}, ${user.province.replace(/_/g, ' ')}`
                              : user.city || user.province?.replace(/_/g, ' ') || 'Not set'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Verification & Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification & Status</h2>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.verified || false}
                        onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Verified</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification Level</label>
                    <select
                      value={formData.verificationLevel || ''}
                      onChange={(e) => setFormData({ ...formData, verificationLevel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="BASIC">Basic</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="BUSINESS">Business</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {user.verified ? (
                      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Not Verified
                      </span>
                    )}
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                      {user.verificationLevel}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        typeColors[user.type] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Banking Details */}
            {(user.bankName || user.accountNumber || editing) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Banking Details</h2>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={formData.bankName || ''}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder</label>
                      <input
                        type="text"
                        value={formData.accountHolder || ''}
                        onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                        <input
                          type="text"
                          value={formData.accountNumber || ''}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Branch Code</label>
                        <input
                          type="text"
                          value={formData.branchCode || ''}
                          onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.bankingVerified || false}
                          onChange={(e) => setFormData({ ...formData, bankingVerified: e.target.checked })}
                          className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">Banking Verified</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {user.bankName && (
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Bank</p>
                          <p className="font-medium text-gray-900">{user.bankName}</p>
                        </div>
                      </div>
                    )}
                    {user.accountHolder && (
                      <div>
                        <p className="text-sm text-gray-500">Account Holder</p>
                        <p className="font-medium text-gray-900">{user.accountHolder}</p>
                      </div>
                    )}
                    {user.accountNumber && (
                      <div>
                        <p className="text-sm text-gray-500">Account Number</p>
                        <p className="font-medium text-gray-900">****{user.accountNumber.slice(-4)}</p>
                      </div>
                    )}
                    {user.bankingVerified && (
                      <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                        Banking Verified
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Activity Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{user._count.listings}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sales</p>
                  <p className="text-2xl font-bold text-green-600">{user._count.sellerTransactions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purchases</p>
                  <p className="text-2xl font-bold text-blue-600">{user._count.buyerTransactions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.rating ? `⭐ ${user.rating.toFixed(1)}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Listings */}
            {user.listings.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Listings</h2>
                  <Link
                    href={`/admin/listings?sellerId=${user.id}`}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {user.listings.slice(0, 5).map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/admin/listings/${listing.id}`}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{listing.title}</p>
                        <p className="text-sm text-gray-600">
                          R{listing.askingPrice.toLocaleString()} • {listing.status}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Instant Buyer Info */}
            {user.instantBuyer && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Instant Buyer Profile</h2>
                  <Link
                    href={`/admin/instant-buyers/${user.instantBuyer.id}`}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    View Details
                  </Link>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Company Name</p>
                    <p className="font-medium text-gray-900">{user.instantBuyer.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex gap-2 mt-1">
                      {user.instantBuyer.approved ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                      {user.instantBuyer.active ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Paused
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Sales</span>
                  <span className="font-semibold text-gray-900">{user.totalSales}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Purchases</span>
                  <span className="font-semibold text-gray-900">{user.totalPurchases}</span>
                </div>
                {user.rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rating</span>
                    <span className="font-semibold text-gray-900">⭐ {user.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href={`/admin/listings?sellerId=${user.id}`}
                  className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  View All Listings
                </Link>
                <Link
                  href={`/admin/transactions?sellerId=${user.id}`}
                  className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  View Transactions
                </Link>
                {user.instantBuyer && (
                  <Link
                    href={`/admin/instant-buyers/${user.instantBuyer.id}`}
                    className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    Manage Instant Buyer
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

