'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Save, Building, TrendingUp, DollarSign, Package, CheckCircle, XCircle, Pause, Play } from 'lucide-react';
import Link from 'next/link';

interface InstantBuyerDetail {
  id: string;
  companyName: string;
  approved: boolean;
  active: boolean;
  baseOffer: number;
  conditionRules: any;
  categories: string[];
  totalPurchases: number;
  totalSpent: number;
  pausedAt: string | null;
  pausedReason: string | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  offers: any[];
}

export default function AdminInstantBuyerDetailPage() {
  const params = useParams();
  const [buyer, setBuyer] = useState<InstantBuyerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (params.id) {
      fetchBuyer();
    }
  }, [params.id]);

  async function fetchBuyer() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/instant-buyers/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch instant buyer');
      
      const data = await response.json();
      setBuyer(data);
      setFormData({
        companyName: data.companyName,
        approved: data.approved,
        active: data.active,
        baseOffer: data.baseOffer,
        conditionRules: data.conditionRules,
        categories: data.categories,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instant buyer');
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/instant-buyers/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update instant buyer');
      
      await fetchBuyer();
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update instant buyer');
    } finally {
      setSaving(false);
    }
  }

  async function toggleApproval() {
    await saveChanges();
  }

  async function toggleActive() {
    const newActive = !buyer?.active;
    setFormData({ ...formData, active: newActive });
    const response = await fetch(`/api/admin/instant-buyers/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: newActive }),
    });
    if (response.ok) await fetchBuyer();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading instant buyer...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !buyer) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error || 'Instant buyer not found'}</p>
            <Link
              href="/admin/instant-buyers"
              className="mt-4 inline-block text-orange-600 hover:text-orange-700"
            >
              ← Back to Instant Buyers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const conditionRules = buyer.conditionRules as Record<string, number> || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/instant-buyers"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {editing ? 'Edit Instant Buyer' : buyer.companyName}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {buyer.user.firstName} {buyer.user.lastName} • {buyer.user.email}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {!editing ? (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Edit
                  </button>
                  {!buyer.approved && (
                    <button
                      onClick={() => {
                        setFormData({ ...formData, approved: true });
                        saveChanges();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={toggleActive}
                    className={`${
                      buyer.active
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2`}
                  >
                    {buyer.active ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Resume
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      fetchBuyer();
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
            {/* Company Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={formData.companyName || ''}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.approved || false}
                        onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Approved</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.active || false}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Company Name</p>
                      <p className="font-medium text-gray-900">{buyer.companyName}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {buyer.approved ? (
                      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                        ✓ Approved
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    )}
                    {buyer.active ? (
                      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                        Paused
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Rules */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Rules</h2>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Offer Percentage
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={formData.baseOffer || 0}
                        onChange={(e) => setFormData({ ...formData, baseOffer: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {(buyer.baseOffer * 100).toFixed(0)}% of market value
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition Multipliers
                    </label>
                    <div className="space-y-2">
                      {['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'].map((condition) => (
                        <div key={condition} className="flex items-center gap-3">
                          <label className="w-24 text-sm text-gray-700">{condition.replace(/_/g, ' ')}</label>
                          <input
                            type="number"
                            step="0.01"
                            value={conditionRules[condition] || 1.0}
                            onChange={(e) => {
                              const newRules = { ...conditionRules, [condition]: parseFloat(e.target.value) };
                              setFormData({ ...formData, conditionRules: newRules });
                            }}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          />
                          <span className="text-xs text-gray-500 w-16">
                            {conditionRules[condition] ? `×${conditionRules[condition].toFixed(2)}` : '×1.00'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Base Offer</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(buyer.baseOffer * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">of market value</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Condition Multipliers</p>
                    <div className="space-y-2">
                      {Object.entries(conditionRules).map(([condition, multiplier]) => (
                        <div key={condition} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{condition.replace(/_/g, ' ')}</span>
                          <span className="font-medium text-gray-900">×{multiplier.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Offers */}
            {buyer.offers.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Offers ({buyer.offers.length})
                </h2>
                <div className="space-y-3">
                  {buyer.offers.slice(0, 10).map((offer) => (
                    <div key={offer.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            R{offer.sellerReceives.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {offer.listing.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(offer.createdAt).toLocaleDateString()} • {offer.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Purchases</p>
                  <p className="text-2xl font-bold text-gray-900">{buyer.totalPurchases}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-2xl font-bold text-green-600">
                    R{buyer.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Offers</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {buyer.offers.filter((o) => o.status === 'PENDING').length}
                  </p>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">
                    {buyer.user.firstName} {buyer.user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{buyer.user.email}</p>
                </div>
                <Link
                  href={`/admin/users/${buyer.user.id}`}
                  className="inline-block mt-4 text-sm text-orange-600 hover:text-orange-700"
                >
                  View User Profile →
                </Link>
              </div>
            </div>

            {/* Status Info */}
            {buyer.pausedAt && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pause Information</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Paused At</p>
                    <p className="font-medium text-gray-900">
                      {new Date(buyer.pausedAt).toLocaleString()}
                    </p>
                  </div>
                  {buyer.pausedReason && (
                    <div>
                      <p className="text-sm text-gray-500">Reason</p>
                      <p className="font-medium text-gray-900">{buyer.pausedReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

