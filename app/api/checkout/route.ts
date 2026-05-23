// ===========================================
// CHECKOUT API ENDPOINT
// Simulates order processing - generates mock order ID
// ===========================================

import { NextResponse } from 'next/server';
import type { CartItem } from '@/lib/types';

// Generate mock order ID
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

export async function POST(request: Request) {
  try {
    const { items, userId } = await request.json();

    // Validate cart items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate total
    const total = items.reduce(
      (sum: number, item: CartItem) => sum + item.product.price * item.quantity,
      0
    );

    // Generate order
    const order = {
      id: generateOrderId(),
      userId: userId || null,
      items,
      total,
      createdAt: new Date().toISOString(),
      status: 'completed',
    };

    // In a real app, you would:
    // 1. Process payment
    // 2. Save order to database
    // 3. Send confirmation email
    // 4. Update inventory

    // Log order for demo purposes
    console.log('[Checkout] Order created:', order.id);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        total: order.total,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('[Checkout API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
