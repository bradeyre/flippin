'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Package, DollarSign, Truck, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  itemPrice: number;
  shippingCost: number;
  totalAmount: number;
  platformFee: number;
  cardFee?: number;
  sellerReceives: number;
  transactionType: string;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  seller: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  buyer: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  listing: {
    id: string;
    title: string;
    images: string[];
  };
  role: 'seller' | 'buyer';
}

export default function MyTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    role: '',
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
    fetchTransactions();
  }, [filters]);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      params.append('page', filters.page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/user/transactions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    CREATED: 'bg-gray-100 text-gray-800',
    PAYMENT_PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-indigo-100 text-indigo-800',
    INSPECTION_PERIOD: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-green-100 text-green-800',
    DISPUTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    REFUNDED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Transactions</h1>
              <p className="mt-1 text-sm text-gray-500">Track your sales and purchases</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All (Seller & Buyer)</option>
                <option value="seller">As Seller</option>
                <option value="buyer">As Buyer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All Statuses</option>
                <option value="PAYMENT_PENDING">Payment Pending</option>
                <option value="PAID">Paid</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="INSPECTION_PERIOD">Inspection Period</option>
                <option value="COMPLETED">Completed</option>
                <option value="DISPUTED">Disputed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ role: '', status: '', page: 1 })}
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
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        ) : (
          <>
            {/* Transactions List */}
            {transactions.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">
                  {filters.status || filters.role ? 'Try changing your filters' : "You haven't made any transactions yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-6">
                      {/* Listing Image */}
                      {transaction.listing.images.length > 0 && (
                        <img
                          src={transaction.listing.images[0]}
                          alt={transaction.listing.title}
                          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                        />
                      )}

                      {/* Transaction Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {transaction.listing.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {transaction.role === 'seller' ? (
                                <>Buyer: {transaction.buyer.firstName} {transaction.buyer.lastName}</>
                              ) : (
                                <>Seller: {transaction.seller.firstName} {transaction.seller.lastName}</>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            {transaction.role === 'seller' ? (
                              <>
                                <p className="text-2xl font-bold text-green-600">
                                  R{transaction.sellerReceives.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">You receive</p>
                              </>
                            ) : (
                              <>
                                <p className="text-2xl font-bold text-gray-900">
                                  R{transaction.totalAmount.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">You paid</p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="flex items-center gap-4 mb-3">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              statusColors[transaction.status] || statusColors.CREATED
                            }`}
                          >
                            {transaction.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            Payment: {transaction.paymentStatus.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            Delivery: {transaction.deliveryStatus.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Timeline */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {transaction.paidAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              Paid {new Date(transaction.paidAt).toLocaleDateString()}
                            </div>
                          )}
                          {transaction.shippedAt && (
                            <div className="flex items-center gap-1">
                              <Truck className="w-3 h-3 text-blue-600" />
                              Shipped {new Date(transaction.shippedAt).toLocaleDateString()}
                            </div>
                          )}
                          {transaction.deliveredAt && (
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3 text-purple-600" />
                              Delivered {new Date(transaction.deliveredAt).toLocaleDateString()}
                            </div>
                          )}
                          {transaction.completedAt && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-green-600" />
                              Completed {new Date(transaction.completedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {/* Fee Breakdown (for sellers) */}
                        {transaction.role === 'seller' && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Payout Breakdown</p>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Item Price</span>
                                  <span className="font-medium text-gray-900">
                                    R{transaction.itemPrice.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Platform Fee (5.5%)</span>
                                  <span className="font-medium text-red-600">
                                    -R{transaction.platformFee.toLocaleString()}
                                  </span>
                                </div>
                                {(transaction as any).cardFee && (transaction as any).cardFee > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                      Card Processing Fee (2%)
                                      <span className="ml-2 text-xs text-gray-500">(paid by card)</span>
                                    </span>
                                    <span className="font-medium text-red-600">
                                      -R{(transaction.cardFee || 0).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {(!transaction.cardFee || transaction.cardFee === 0) && (transaction as any).paymentMethod === 'EFT' && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                      Card Processing Fee
                                      <span className="ml-2 text-xs text-green-600">(EFT - no fee)</span>
                                    </span>
                                    <span className="font-medium text-green-600">R0.00</span>
                                  </div>
                                )}
                                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                                  <span className="font-semibold text-gray-900">You Receive</span>
                                  <span className="text-lg font-bold text-green-600">
                                    R{transaction.sellerReceives.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
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
                  {pagination.total} transactions
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

