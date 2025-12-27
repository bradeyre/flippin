'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Pause, Play, Edit, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface InstantBuyer {
  id: string;
  companyName: string;
  approved: boolean;
  active: boolean;
  baseOffer: number;
  totalPurchases: number;
  totalSpent: number;
  pausedAt: string | null;
  pausedReason: string | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
  _count: {
    offers: number;
  };
}

export default function AdminInstantBuyersPage() {
  const [buyers, setBuyers] = useState<InstantBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    approved: '',
    active: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchBuyers();
  }, [filters]);

  async function fetchBuyers() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.approved !== '') params.append('approved', filters.approved);
      if (filters.active !== '') params.append('active', filters.active);
      params.append('page', filters.page.toString());
      params.append('limit', '50');

      const response = await fetch(`/api/admin/instant-buyers?${params}`);
      if (!response.ok) throw new Error('Failed to fetch instant buyers');
      
      const data = await response.json();
      setBuyers(data.instantBuyers);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instant buyers');
    } finally {
      setLoading(false);
    }
  }

  async function updateBuyer(id: string, updates: any) {
    try {
      const response = await fetch(`/api/admin/instant-buyers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update instant buyer');
      
      fetchBuyers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update instant buyer');
    }
  }

  async function approveBuyer(id: string) {
    await updateBuyer(id, { approved: true });
  }

  async function rejectBuyer(id: string) {
    await updateBuyer(id, { approved: false });
  }

  async function toggleActive(id: string, currentlyActive: boolean) {
    await updateBuyer(id, { active: !currentlyActive });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Instant Buyers Management</h1>
              <p className="mt-1 text-sm text-gray-500">Manage instant buyer companies</p>
            </div>
            <Link
              href="/admin"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Approval Status</label>
              <select
                value={filters.approved}
                onChange={(e) => setFilters({ ...filters, approved: e.target.value, page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All</option>
                <option value="true">Approved</option>
                <option value="false">Pending Approval</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Active Status</label>
              <select
                value={filters.active}
                onChange={(e) => setFilters({ ...filters, active: e.target.value, page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Paused</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ approved: '', active: '', page: 1 })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
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
            <p className="mt-4 text-gray-600">Loading instant buyers...</p>
          </div>
        ) : (
          <>
            {/* Buyers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Base Offer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {buyers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No instant buyers found
                        </td>
                      </tr>
                    ) : (
                      buyers.map((buyer) => (
                        <tr key={buyer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <Link
                                href={`/admin/instant-buyers/${buyer.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-orange-600"
                              >
                                {buyer.companyName}
                              </Link>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {buyer.user.firstName} {buyer.user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{buyer.user.email}</div>
                            {buyer.user.phone && (
                              <div className="text-xs text-gray-500">{buyer.user.phone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {(buyer.baseOffer * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">of market value</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {buyer.approved ? (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  Approved
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                              )}
                              {buyer.active ? (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Paused
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>Purchases: {buyer.totalPurchases}</div>
                            <div>Total Spent: R{buyer.totalSpent.toLocaleString()}</div>
                            <div>Offers: {buyer._count.offers}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/instant-buyers/${buyer.id}`}
                                className="text-orange-600 hover:text-orange-900"
                                title="View Details"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              {!buyer.approved && (
                                <button
                                  onClick={() => approveBuyer(buyer.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              {buyer.approved && (
                                <>
                                  <button
                                    onClick={() => toggleActive(buyer.id, buyer.active)}
                                    className={buyer.active ? 'text-yellow-600 hover:text-yellow-900' : 'text-blue-600 hover:text-blue-900'}
                                    title={buyer.active ? 'Pause' : 'Resume'}
                                  >
                                    {buyer.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => rejectBuyer(buyer.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Reject"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} instant buyers
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

