// ===========================================
// TYPE DEFINITIONS FOR E-COMMERCE & TRACKING
// ===========================================

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

// ===========================================
// TRACKING EVENT TYPES
// Comprehensive type definitions for all user interactions
// ===========================================

export type EventType =
  | 'page_view'
  | 'click'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'update_cart'
  | 'checkout_start'
  | 'purchase_complete'
  | 'login'
  | 'logout';

// Metadata varies by event type for granular tracking
export interface TrackingMetadata {
  page?: string;
  target?: string;
  productId?: string | null;
  prodId?: string;
  productName?: string;
  size?: string;
  color?: string;
  quantity?: number | null;
  dwellTimeMs?: number | null;
  timeInCart?: number | null;
  referrer?: string;
  searchQuery?: string;
  cartTotal?: number;
  orderId?: string;
}

// Core tracking event structure - matches log format spec
export interface TrackingEvent {
  timestamp: string;
  sessionId: string;
  userId: string | null;
  eventType: EventType;
  metadata: TrackingMetadata;
}

// API response types
export interface TrackingResponse {
  success: boolean;
  message?: string;
}

// ===========================================
// ADMIN DASHBOARD TYPES
// ===========================================

export interface DashboardMetrics {
  totalSessions: number;
  uniqueVisitors: number;
  pageViews: { page: string; count: number }[];
  productEngagement: {
    productId: string;
    productName: string;
    views: number;
    avgDwellTime: number;
  }[];
  conversionFunnel: {
    views: number;
    addToCart: number;
    checkoutStart: number;
    purchaseComplete: number;
  };
  clickHeatmap: { target: string; count: number }[];
  authActivity: {
    logins: number;
    logouts: number;
  };
}

export type TimeRange = '24h' | '7d' | '30d';

// Order Types
export interface Order {
  id: string;
  userId: string | null;
  items: CartItem[];
  total: number;
  createdAt: string;
}
