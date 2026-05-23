'use client';

// ===========================================
// MODULAR USER BEHAVIOR TRACKING HOOK
// Frontend service for capturing all user interactions
// ===========================================

import { useCallback, useEffect, useRef } from 'react';
import type { EventType, TrackingMetadata } from '@/lib/types';

const cartTimers = new Map<string, number>();

function getCartItemKey(productId: string, size?: string, color?: string): string {
  return `${productId}:${size ?? ''}:${color ?? ''}`;
}

function startCartTimer(productId: string, size?: string, color?: string): void {
  const key = getCartItemKey(productId, size, color);
  if (!cartTimers.has(key)) {
    cartTimers.set(key, Date.now());
  }
}

function getCartTimeInMs(productId: string, size?: string, color?: string): number | null {
  const key = getCartItemKey(productId, size, color);
  const startedAt = cartTimers.get(key);
  if (!startedAt) return null;

  return Date.now() - startedAt;
}

function clearCartTimer(productId: string, size?: string, color?: string): void {
  cartTimers.delete(getCartItemKey(productId, size, color));
}

// Generate or retrieve persistent session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('tracking_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('tracking_session_id', sessionId);
  }
  return sessionId;
}

// Get user ID from localStorage (set on login)
function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_id');
}

// Core tracking function - sends events to backend API
async function sendTrackingEvent(
  eventType: EventType,
  metadata: TrackingMetadata
): Promise<void> {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      userId: getUserId(),
      eventType,
      metadata,
    };

    // Fire-and-forget tracking - don't block UI
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Silent fail for tracking - shouldn't affect user experience
    console.error('[Tracking] Failed to send event:', error);
  }
}

// ===========================================
// MAIN TRACKING HOOK
// ===========================================
export function useTracking() {
  // Track page view
  const trackPageView = useCallback((page: string, referrer?: string) => {
    sendTrackingEvent('page_view', { page, referrer });
  }, []);

  // Track button/element clicks
  const trackClick = useCallback((target: string, page: string) => {
    sendTrackingEvent('click', { target, page });
  }, []);

  // Track product view with dwell time support
  const trackProductView = useCallback(
    (productId: string, productName: string, page: string, dwellTimeMs?: number) => {
      sendTrackingEvent('product_view', { productId, productName, page, dwellTimeMs });
    },
    []
  );

  // Track add to cart
  const trackAddToCart = useCallback(
    (productId: string, quantity: number, page: string, size: string, color: string) => {
      startCartTimer(productId, size, color);
      sendTrackingEvent('add_to_cart', { productId, quantity, page, size, color });
    },
    []
  );

  // Track remove from cart
  const trackRemoveFromCart = useCallback(
    (productId: string, quantity: number, page: string, size?: string, color?: string) => {
      const timeInCart = getCartTimeInMs(productId, size, color);
      sendTrackingEvent('remove_from_cart', { productId, quantity, page, size, color, timeInCart });
      clearCartTimer(productId, size, color);
    },
    []
  );

  // Track cart quantity update
  const trackUpdateCart = useCallback(
    (productId: string, quantity: number, page: string) => {
      sendTrackingEvent('update_cart', { productId, quantity, page });
    },
    []
  );

  // Track checkout start
  const trackCheckoutStart = useCallback((cartTotal: number, page: string) => {
    sendTrackingEvent('checkout_start', { cartTotal, page });
  }, []);

  // Track purchase complete
  const trackPurchaseComplete = useCallback(
    (orderId: string, prodId: string, cartTotal: number, page: string, size?: string, color?: string) => {
      const timeInCart = getCartTimeInMs(prodId, size, color);
      sendTrackingEvent('purchase_complete', {
        orderId,
        prodId,
        cartTotal,
        page,
        size,
        color,
        timeInCart,
      });
      clearCartTimer(prodId, size, color);
    },
    []
  );

  // Track login
  const trackLogin = useCallback((page: string) => {
    sendTrackingEvent('login', { page });
  }, []);

  // Track logout
  const trackLogout = useCallback((page: string) => {
    sendTrackingEvent('logout', { page });
  }, []);

  return {
    trackPageView,
    trackClick,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackUpdateCart,
    trackCheckoutStart,
    trackPurchaseComplete,
    trackLogin,
    trackLogout,
  };
}

// ===========================================
// PRODUCT DWELL TIME HOOK
// Uses Page Visibility API to accurately track viewing time
// ===========================================
export function useProductDwellTime(productId: string, productName: string, page: string) {
  const startTimeRef = useRef<number>(Date.now());
  const totalTimeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const { trackProductView } = useTracking();

  useEffect(() => {
    startTimeRef.current = Date.now();
    totalTimeRef.current = 0;
    isVisibleRef.current = true;

    // Handle visibility changes (tab switching, minimizing)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page became hidden - accumulate time
        if (isVisibleRef.current) {
          totalTimeRef.current += Date.now() - startTimeRef.current;
          isVisibleRef.current = false;
        }
      } else {
        // Page became visible - restart timing
        startTimeRef.current = Date.now();
        isVisibleRef.current = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track dwell time on unmount (navigation away)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Calculate final dwell time
      if (isVisibleRef.current) {
        totalTimeRef.current += Date.now() - startTimeRef.current;
      }

      // Send tracking event with total dwell time
      trackProductView(productId, productName, page, totalTimeRef.current);
    };
  }, [productId, productName, page, trackProductView]);
}
