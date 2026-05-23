'use client';

// ===========================================
// CLIENT-SIDE CART STATE MANAGEMENT
// Uses SWR for state sync between components
// ===========================================

import useSWR from 'swr';
import type { CartItem, Product } from './types';

const CART_KEY = 'velocity_cart';

// Get cart from sessionStorage
function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const stored = sessionStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save cart to sessionStorage
function saveCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// SWR fetcher for cart
const cartFetcher = () => getStoredCart();

// ===========================================
// CART HOOK - Main interface for cart operations
// ===========================================
export function useCart() {
  const { data: cart = [], mutate } = useSWR<CartItem[]>('cart', cartFetcher, {
    fallbackData: [],
    revalidateOnFocus: false,
  });

  // Add item to cart
  const addItem = (product: Product, size: string, color: string, quantity: number = 1) => {
    const newCart = [...cart];
    const existingIndex = newCart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.size === size &&
        item.color === color
    );

    if (existingIndex >= 0) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({ product, size, color, quantity });
    }

    saveCart(newCart);
    mutate(newCart);
  };

  // Remove item from cart
  const removeItem = (productId: string, size: string, color: string) => {
    const newCart = cart.filter(
      (item) =>
        !(item.product.id === productId && item.size === size && item.color === color)
    );
    saveCart(newCart);
    mutate(newCart);
  };

  // Update item quantity
  const updateQuantity = (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }

    const newCart = cart.map((item) =>
      item.product.id === productId && item.size === size && item.color === color
        ? { ...item, quantity }
        : item
    );
    saveCart(newCart);
    mutate(newCart);
  };

  // Clear cart
  const clearCart = () => {
    saveCart([]);
    mutate([]);
  };

  // Calculate totals
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
  };
}
