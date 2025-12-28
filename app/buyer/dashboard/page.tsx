'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Package, DollarSign, TrendingUp, Heart, Plus } from 'lucide-react';
import Link from 'next/link';

interface BuyerStats {
  spending: {
    total: number;
    completedPurchases: number;
    pendingPurchases: number;
  };
  buyOrders: {
    total: number;
    active: number;
    matched: number;
  };
  offers: {
    total: number;
    pending: number;
    accepted: number;
  };
  rating: number | null;
  totalPurchases: number;
}

export default function BuyerDashboardPage() {
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      // TODO: Replace with buyer-specific stats API
      const [transactionsRes] = await Promise.all([
        fetch('/api/user/transactions?role=buyer&limit=5'),
      ]);

      if (!transactionsRes.ok) throw new Error('Failed to fetch data');

      const transactionsData = await transactionsRes.json();
      setTransactions(transactionsData.transactions);
      
      // Mock stats for now - TODO: Create buyer stats API
      setStats({
        spending: {
          total: transactionsData.transactions
            .filter((t: any) => t.status === 'COMPLETED')
            .reduce((sum: number, t: any) => sum + t.totalAmount, 0),
          completedPurchases: transactionsData.transactions.filter((t: any) => t.status === 'COMPLETED').length,
          pendingPurchases: transactionsData.transactions.filter((t: any) => t.status !== 'COMPLETED').length,
        },
        buyOrders: { total: 0, active: 0, matched: 0 },
        offers: { total: 0, pending: 0, accepted: 0 },
        rating: null,
        totalPurchases: transactionsData.transactions.length,
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold">Error: {error}</p>
            <button
              onClick={fetchData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Spent',
      value: `R${stats.spending.total.toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
      link: '/buyer/dashboard/transactions',
    },
    {
      title: 'Purchases',
      value: stats.totalPurchases.toString(),
      icon: ShoppingBag,
      color: 'blue',
      link: '/buyer/dashboard/transactions',
    },
    {
      title: 'Active Buy Orders',
      value: stats.buyOrders.active.toString(),
      icon: TrendingUp,
      color: 'orange',
      link: '/buyer/dashboard/buy-orders',
    },
    {
      title: 'Pending Offers',
      value: stats.offers.pending.toString(),
      icon: Heart,
      color: 'purple',
      link: '/buyer/dashboard/offers',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Track your purchases and orders</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/browse"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Browse Marketplace
              </Link>
              <Link
                href="/"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Recent Purchases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Purchases</h2>
              <Link
                href="/buyer/dashboard/transactions"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You haven't made any purchases yet</p>
                  <Link
                    href="/browse"
                    className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <Link
                      key={transaction.id}
                      href={`/buyer/dashboard/transactions/${transaction.id}`}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {transaction.listing.images.length > 0 && (
                        <img
                          src={transaction.listing.images[0]}
                          alt={transaction.listing.title}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{transaction.listing.title}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          R{transaction.totalAmount.toLocaleString()} • {transaction.status.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/browse"
                className="block w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg font-medium text-orange-700 transition-colors"
              >
                Browse Marketplace
              </Link>
              <Link
                href="/buy-orders/create"
                className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg font-medium text-blue-700 transition-colors"
              >
                Create Buy Order
              </Link>
              <Link
                href="/buyer/dashboard/transactions"
                className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
              >
                View All Purchases
              </Link>
              <Link
                href="/buyer/dashboard/saved"
                className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
              >
                Saved Items
              </Link>
            </div>
          </div>
        </div>

        {/* Spending Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                R{stats.spending.total.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Purchases</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.spending.completedPurchases}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Purchases</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {stats.spending.pendingPurchases}
              </p>
            </div>
          </div>
          <Link
            href="/buyer/dashboard/transactions"
            className="mt-4 inline-block text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View Transaction History →
          </Link>
        </div>
      </div>
    </div>
  );
}

