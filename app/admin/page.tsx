'use client';

import { useEffect, useState } from 'react';
import { Users, ShoppingBag, DollarSign, TrendingUp, Package, Activity } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  overview: {
    totalUsers: number;
    totalListings: number;
    activeListings: number;
    totalTransactions: number;
    completedTransactions: number;
    totalInstantBuyers: number;
    activeInstantBuyers: number;
    totalRevenue: number;
  };
  recentListings: any[];
  recentTransactions: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold">Error: {error}</p>
            <button
              onClick={fetchStats}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.overview.totalUsers.toLocaleString(),
      icon: Users,
      color: 'blue',
      link: '/admin/users',
    },
    {
      title: 'Active Listings',
      value: stats.overview.activeListings.toLocaleString(),
      icon: Package,
      color: 'green',
      link: '/admin/listings?status=ACTIVE',
    },
    {
      title: 'Total Transactions',
      value: stats.overview.completedTransactions.toLocaleString(),
      icon: ShoppingBag,
      color: 'purple',
      link: '/admin/transactions?status=COMPLETED',
    },
    {
      title: 'Platform Revenue',
      value: `R${stats.overview.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'orange',
      link: '/admin/ledger',
    },
    {
      title: 'Instant Buyers',
      value: stats.overview.activeInstantBuyers.toLocaleString(),
      icon: TrendingUp,
      color: 'indigo',
      link: '/admin/instant-buyers?active=true&approved=true',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your marketplace</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/settings"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Settings
              </Link>
              <Link
                href="/"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              purple: 'bg-purple-100 text-purple-600',
              orange: 'bg-orange-100 text-orange-600',
              indigo: 'bg-indigo-100 text-indigo-600',
            };
            return (
              <Link
                key={stat.title}
                href={stat.link}
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
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Listings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Listings</h2>
              <Link
                href="/admin/listings"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {stats.recentListings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No listings yet</p>
              ) : (
                <div className="space-y-4">
                  {stats.recentListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <Link
                          href={`/admin/listings/${listing.id}`}
                          className="font-medium text-gray-900 hover:text-orange-600"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          {listing.seller.firstName} {listing.seller.lastName} • {listing.category.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          R{listing.askingPrice.toLocaleString()} • {listing.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <Link
                href="/admin/transactions"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {stats.recentTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No transactions yet</p>
              ) : (
                <div className="space-y-4">
                  {stats.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <Link
                          href={`/admin/transactions/${transaction.id}`}
                          className="font-medium text-gray-900 hover:text-orange-600"
                        >
                          {transaction.listing.title}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          {transaction.seller.email} → {transaction.buyer.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          R{transaction.totalAmount.toLocaleString()} • {transaction.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/listings"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
            >
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-gray-900">Listings</p>
            </Link>
            <Link
              href="/admin/users"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
            >
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-gray-900">Users</p>
            </Link>
            <Link
              href="/admin/instant-buyers"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
            >
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-gray-900">Instant Buyers</p>
            </Link>
            <Link
              href="/admin/transactions"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
            >
              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-gray-900">Transactions</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

