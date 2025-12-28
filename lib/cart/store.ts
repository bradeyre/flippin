/**
 * Cart management
 * Session-based cart using localStorage (can upgrade to DB later)
 */

export interface CartItem {
  listingId: string;
  listingTitle: string;
  listingImage: string;
  askingPrice: number;
  shippingCost: number;
  sellerId: string;
  sellerName: string;
  addedAt: string;
}

const CART_STORAGE_KEY = 'flippin_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
  } catch {
    return [];
  }
}

export function addToCart(item: Omit<CartItem, 'addedAt'>): void {
  if (typeof window === 'undefined') return;
  
  const cart = getCart();
  
  // Check if item already in cart
  if (cart.some(i => i.listingId === item.listingId)) {
    return; // Already in cart
  }
  
  cart.push({
    ...item,
    addedAt: new Date().toISOString(),
  });
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  // Dispatch custom event for cart updates
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

export function removeFromCart(listingId: string): void {
  if (typeof window === 'undefined') return;
  
  const cart = getCart();
  const updated = cart.filter(item => item.listingId !== listingId);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

export function getCartItemCount(): number {
  return getCart().length;
}

export function getCartTotal(): number {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.askingPrice + (item.shippingCost || 0), 0);
}

export function getCartGroupedBySeller(): Record<string, CartItem[]> {
  const cart = getCart();
  const grouped: Record<string, CartItem[]> = {};
  
  cart.forEach(item => {
    if (!grouped[item.sellerId]) {
      grouped[item.sellerId] = [];
    }
    grouped[item.sellerId].push(item);
  });
  
  return grouped;
}

