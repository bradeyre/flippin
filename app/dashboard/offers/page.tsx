'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, CheckCircle, XCircle, User, Eye } from 'lucide-react';
import Link from 'next/link';

interface Offer {
  id: string;
  amount: number;
  message: string | null;
  status: string;
  createdAt: string;
  expiresAt: string;
  buyer: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    rating: number | null;
  };
  listing: {
    id: string;
    title: string;
    images: string[];
    askingPrice: number;
  };
}

export default function MyOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOffers();
  }, [filters]);

  async function fetchOffers() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      params.append('page', filters.page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/user/offers?${params}`);
      if (!response.ok) throw new Error('Failed to fetch offers');
      
      const data = await response.json();
      setOffers(data.offers);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  }

  async function respondToOffer(offerId: string, action: 'accept' | 'reject') {
    try {
      const response = await fetch(`/api/offers/${offerId}/${action}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} offer`);
      }

      // Refresh offers list
      await fetchOffers();
      alert(`Offer ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing offer:`, error);
      alert(error instanceof Error ? error.message : `Failed to ${action} offer`);
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-gray-100 text-gray-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Offers Received</h1>
              <p className="mt-1 text-sm text-gray-500">Manage offers on your listings</p>
            </div>
            <Link
              href="/dashboard"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <button
              onClick={() => setFilters({ status: '', page: 1 })}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading offers...</p>
          </div>
        ) : (
          <>
            {/* Offers List */}
            {offers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No offers found</h3>
                <p className="text-gray-600">
                  {filters.status ? 'Try changing your filter' : "You haven't received any offers yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-6">
                      {/* Listing Image */}
                      {offer.listing.images.length > 0 && (
                        <img
                          src={offer.listing.images[0]}
                          alt={offer.listing.title}
                          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                        />
                      )}

                      {/* Offer Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Link
                              href={`/dashboard/listings/${offer.listing.id}`}
                              className="text-lg font-semibold text-gray-900 hover:text-orange-600"
                            >
                              {offer.listing.title}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                              Asking: R{offer.listing.askingPrice.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              R{offer.amount.toLocaleString()}
                            </p>
                            <span
                              className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                                statusColors[offer.status] || statusColors.PENDING
                              }`}
                            >
                              {offer.status}
                            </span>
                          </div>
                        </div>

                        {/* Buyer Info */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {offer.buyer.firstName} {offer.buyer.lastName}
                            </span>
                            {offer.buyer.rating && (
                              <span className="text-xs text-gray-500">
                                ⭐ {offer.buyer.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Message */}
                        {offer.message && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-gray-700 italic">"{offer.message}"</p>
                          </div>
                        )}

                        {/* Actions */}
                        {offer.status === 'PENDING' && (
                          <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => respondToOffer(offer.id, 'accept')}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Accept Offer
                            </button>
                            <button
                              onClick={() => respondToOffer(offer.id, 'reject')}
                              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                            <Link
                              href={`/dashboard/listings/${offer.listing.id}`}
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Listing
                            </Link>
                          </div>
                        )}

                        {/* Expiration */}
                        {offer.status === 'PENDING' && offer.expiresAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Expires: {new Date(offer.expiresAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} offers
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={filters.page >= pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

