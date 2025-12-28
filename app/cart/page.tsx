'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { getCart, removeFromCart, clearCart, getCartGroupedBySeller, getCartTotal, CartItem } from '@/lib/cart/store';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [grouped, setGrouped] = useState<Record<string, CartItem[]>>({});

  useEffect(() => {
    updateCart();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCart);
    return () => window.removeEventListener('cartUpdated', updateCart);
  }, []);

  function updateCart() {
    const items = getCart();
    setCart(items);
    setGrouped(getCartGroupedBySeller());
  }

  function handleRemove(listingId: string) {
    removeFromCart(listingId);
    updateCart();
  }

  function handleCheckout() {
    if (cart.length === 0) return;
    
    // For now, redirect to checkout for first item
    // TODO: Create multi-item checkout
    router.push(`/checkout?items=${cart.map(i => i.listingId).join(',')}`);
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">
              Start adding items to your cart to see them here
            </p>
            <Link
              href="/browse"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = getCartTotal();
  const sellerCount = Object.keys(grouped).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="mt-1 text-sm text-gray-500">
                {cart.length} {cart.length === 1 ? 'item' : 'items'} from {sellerCount} {sellerCount === 1 ? 'seller' : 'sellers'}
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Clear all items from cart?')) {
                  clearCart();
                  updateCart();
                }
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(grouped).map(([sellerId, items]) => (
              <div key={sellerId} className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <p className="font-semibold text-gray-900">
                      Seller: {items[0].sellerName}
                    </p>
                    <span className="text-sm text-gray-500">
                      ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.listingId} className="p-4 flex items-start gap-4">
                      <img
                        src={item.listingImage}
                        alt={item.listingTitle}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <Link
                          href={`/listing/${item.listingId}`}
                          className="font-semibold text-gray-900 hover:text-orange-600"
                        >
                          {item.listingTitle}
                        </Link>
                        <div className="mt-2 flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              R{item.askingPrice.toLocaleString()}
                            </p>
                            {item.shippingCost > 0 && (
                              <p className="text-sm text-gray-600">
                                + R{item.shippingCost.toLocaleString()} shipping
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemove(item.listingId)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal for this seller:</span>
                    <span className="font-semibold text-gray-900">
                      R{items.reduce((sum, item) => sum + item.askingPrice + (item.shippingCost || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Each seller ships separately
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items ({cart.length})</span>
                  <span className="text-gray-900">
                    R{cart.reduce((sum, item) => sum + item.askingPrice, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    R{cart.reduce((sum, item) => sum + (item.shippingCost || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    R{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Items from different sellers will be shipped separately. Each seller will receive their payment independently.
                </p>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                href="/browse"
                className="block mt-4 text-center text-sm text-gray-600 hover:text-gray-900"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

