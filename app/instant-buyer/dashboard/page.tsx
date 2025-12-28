'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Package, Pause, Play, Settings, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface InstantBuyerStats {
  activeOffers: number;
  pendingAcceptances: number;
  totalPurchases: number;
  totalSpent: number;
  thisMonthSpent: number;
  averagePurchasePrice: number;
  acceptanceRate: number;
}

export default function InstantBuyerDashboardPage() {
  const [stats, setStats] = useState<InstantBuyerStats | null>(null);
  const [buyer, setBuyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      // TODO: Get current user's instant buyer profile
      // For now, fetch first instant buyer as example
      const response = await fetch('/api/admin/instant-buyers?approved=true&active=true&limit=1');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      if (data.instantBuyers.length > 0) {
        const buyerId = data.instantBuyers[0].id;
        const buyerRes = await fetch(`/api/admin/instant-buyers/${buyerId}`);
        if (buyerRes.ok) {
          const buyerData = await buyerRes.json();
          setBuyer(buyerData);
          
          // Calculate stats
          const activeOffers = buyerData.offers.filter((o: any) => o.status === 'PENDING').length;
          const acceptedOffers = buyerData.offers.filter((o: any) => o.status === 'ACCEPTED').length;
          const totalPurchases = buyerData.totalPurchases;
          const totalSpent = buyerData.totalSpent;
          
          setStats({
            activeOffers,
            pendingAcceptances: acceptedOffers,
            totalPurchases,
            totalSpent,
            thisMonthSpent: totalSpent * 0.3, // Mock - TODO: Calculate from transactions
            averagePurchasePrice: totalPurchases > 0 ? totalSpent / totalPurchases : 0,
            acceptanceRate: buyerData.offers.length > 0 ? (acceptedOffers / buyerData.offers.length) * 100 : 0,
          });
        }
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive() {
    if (!buyer) return;
    try {
      const response = await fetch(`/api/admin/instant-buyers/${buyer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !buyer.active }),
      });
      if (response.ok) await fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !buyer || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold">Error: {error || 'Instant buyer profile not found'}</p>
            <p className="text-sm text-gray-600 mt-2">
              You need to be an approved instant buyer to access this dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Offers',
      value: stats.activeOffers.toString(),
      icon: TrendingUp,
      color: 'orange',
    },
    {
      title: 'Total Purchases',
      value: stats.totalPurchases.toString(),
      icon: Package,
      color: 'blue',
    },
    {
      title: 'Total Spent',
      value: `R${stats.totalSpent.toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Acceptance Rate',
      value: `${stats.acceptanceRate.toFixed(0)}%`,
      icon: CheckCircle,
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{buyer.companyName}</h1>
              <p className="mt-1 text-sm text-gray-500">Instant Buyer Dashboard</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={toggleActive}
                className={`${
                  buyer.active
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2`}
              >
                {buyer.active ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause Offers
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Resume Offers
                  </>
                )}
              </button>
              <Link
                href="/instant-buyer/settings"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className={`rounded-lg p-4 mb-6 ${
          buyer.active && buyer.approved
            ? 'bg-green-50 border border-green-200'
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                {buyer.active && buyer.approved
                  ? '✓ Offers are active and running'
                  : buyer.approved
                  ? '⚠ Offers are paused'
                  : '⏳ Pending approval'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Base offer: {(buyer.baseOffer * 100).toFixed(0)}% of market value
              </p>
            </div>
            {!buyer.approved && (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Awaiting Admin Approval
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              purple: 'bg-purple-100 text-purple-600',
              orange: 'bg-orange-100 text-orange-600',
            };
            return (
              <div
                key={stat.title}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${colorClasses[stat.color as keyof typeof colorClasses]} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Offers */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Offers</h2>
              <Link
                href="/instant-buyer/offers"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {buyer.offers.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No offers made yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {buyer.offers.slice(0, 5).map((offer: any) => (
                    <div key={offer.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            R{offer.sellerReceives.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">{offer.listing.title}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          offer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {offer.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Average Purchase Price</span>
                  <span className="font-semibold text-gray-900">
                    R{stats.averagePurchasePrice.toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">This Month Spent</span>
                  <span className="font-semibold text-green-600">
                    R{stats.thisMonthSpent.toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Acceptance Rate</span>
                  <span className="font-semibold text-gray-900">
                    {stats.acceptanceRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Base Offer</span>
                  <span className="font-semibold text-gray-900">
                    {(buyer.baseOffer * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/instant-buyer/settings"
              className="mt-4 inline-block text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Edit Pricing Rules →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/instant-buyer/offers"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
            >
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-gray-900">View All Offers</p>
            </Link>
            <Link
              href="/instant-buyer/purchases"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
            >
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-gray-900">Purchase History</p>
            </Link>
            <Link
              href="/instant-buyer/settings"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
            >
              <Settings className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-gray-900">Pricing Settings</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

