'use client';

import { useEffect, useState } from 'react';
import { Package, DollarSign, TrendingUp, Eye, MessageSquare, ShoppingBag, Plus } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  listings: {
    total: number;
    active: number;
    sold: number;
  };
  offers: {
    total: number;
    pending: number;
  };
  earnings: {
    total: number;
    completedSales: number;
    pendingSales: number;
  };
  spending: {
    total: number;
    completedPurchases: number;
    pendingPurchases: number;
  };
  rating: number | null;
  totalSales: number;
  totalPurchases: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [statsRes, listingsRes, offersRes] = await Promise.all([
        fetch('/api/user/stats'),
        fetch('/api/user/listings?limit=5'),
        fetch('/api/user/offers?status=PENDING&limit=5'),
      ]);

      if (!statsRes.ok || !listingsRes.ok || !offersRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [statsData, listingsData, offersData] = await Promise.all([
        statsRes.json(),
        listingsRes.json(),
        offersRes.json(),
      ]);

      setStats(statsData);
      setListings(listingsData.listings);
      setOffers(offersData.offers);
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

  if (error) {
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

  if (!stats) return null;

  const statCards = [
    {
      title: 'Active Listings',
      value: stats.listings.active.toString(),
      icon: Package,
      color: 'blue',
      link: '/dashboard/listings?status=ACTIVE',
    },
    {
      title: 'Total Earnings',
      value: `R${stats.earnings.total.toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
      link: '/dashboard/transactions?role=seller',
    },
    {
      title: 'Pending Offers',
      value: stats.offers.pending.toString(),
      icon: MessageSquare,
      color: 'orange',
      link: '/dashboard/offers?status=PENDING',
    },
    {
      title: 'Items Sold',
      value: stats.listings.sold.toString(),
      icon: TrendingUp,
      color: 'purple',
      link: '/dashboard/listings?status=SOLD',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your listings, offers, and sales</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/sell"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Sell Something
              </Link>
              <Link
                href="/"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Browse
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* My Listings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My Listings</h2>
              <Link
                href="/dashboard/listings"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {listings.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You haven't created any listings yet</p>
                  <Link
                    href="/sell"
                    className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Create Your First Listing
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/dashboard/listings/${listing.id}`}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {listing.images.length > 0 && (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{listing.title}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          R{listing.askingPrice.toLocaleString()} • {listing.status.replace(/_/g, ' ')}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {listing.views} views
                          </span>
                          <span>{listing._count.offers} offers</span>
                          <span>{listing._count.instantOffers} instant offers</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pending Offers */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pending Offers</h2>
              <Link
                href="/dashboard/offers"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {offers.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending offers</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            R{offer.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {offer.listing.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            From {offer.buyer.firstName} {offer.buyer.lastName}
                            {offer.buyer.rating && ` • ⭐ ${offer.buyer.rating.toFixed(1)}`}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                      {offer.message && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{offer.message}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                R{stats.earnings.total.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Sales</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.earnings.completedSales}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Sales</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {stats.earnings.pendingSales}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/transactions?role=seller"
            className="mt-4 inline-block text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View Transaction History →
          </Link>
        </div>
      </div>
    </div>
  );
}

