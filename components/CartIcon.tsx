'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { getCartItemCount } from '@/lib/cart/store';

export function CartIcon() {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    function updateCount() {
      setItemCount(getCartItemCount());
    }

    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  if (itemCount === 0) return null;

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Link>
  );
}

