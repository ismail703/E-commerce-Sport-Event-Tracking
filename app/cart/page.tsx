'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-store';
import { useTracking } from '@/hooks/use-tracking';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { trackPageView, trackClick, trackRemoveFromCart, trackUpdateCart, trackCheckoutStart } =
    useTracking();

  // Track page view
  useEffect(() => {
    trackPageView('/cart', document.referrer);
  }, [trackPageView]);

  const handleRemoveItem = (productId: string, size: string, color: string) => {
    const item = cart.find(
      (i) => i.product.id === productId && i.size === size && i.color === color
    );
    if (item) {
      trackRemoveFromCart(productId, item.quantity, '/cart', size, color);
      trackClick(`remove_item_${productId}`, '/cart');
    }
    removeItem(productId, size, color);
  };

  const handleUpdateQuantity = (
    productId: string,
    size: string,
    color: string,
    newQuantity: number
  ) => {
    trackUpdateCart(productId, newQuantity, '/cart');
    updateQuantity(productId, size, color, newQuantity);
  };

  const handleCheckout = () => {
    trackCheckoutStart(subtotal, '/cart');
    trackClick('checkout_button', '/cart');
  };

  // Shipping threshold
  const shippingThreshold = 100;
  const freeShipping = subtotal >= shippingThreshold;
  const amountToFreeShipping = shippingThreshold - subtotal;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>

          {cart.length === 0 ? (
            /* Empty Cart State */
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
              <h2 className="mt-6 text-xl font-semibold">Your cart is empty</h2>
              <p className="mt-2 text-muted-foreground">
                Looks like you haven&apos;t added anything yet.
              </p>
              <Link href="/products">
                <Button className="mt-8 gap-2" onClick={() => trackClick('continue_shopping_empty', '/cart')}>
                  Continue Shopping
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                {/* Free Shipping Progress */}
                {!freeShipping && (
                  <div className="mb-6 rounded-lg bg-secondary p-4">
                    <p className="text-sm">
                      Add{' '}
                      <span className="font-semibold text-primary">
                        ${amountToFreeShipping.toFixed(2)}
                      </span>{' '}
                      more to get free shipping!
                    </p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="divide-y divide-border">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      className="flex gap-4 py-6"
                    >
                      {/* Product Image */}
                      <Link href={`/products/${item.product.id}`} className="shrink-0">
                        <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-secondary sm:h-32 sm:w-32">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link
                            href={`/products/${item.product.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.size} / {item.color}
                          </p>
                          <p className="mt-1 font-semibold">${item.product.price}</p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product.id,
                                  item.size,
                                  item.color,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="min-w-[2.5rem] text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product.id,
                                  item.size,
                                  item.color,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= 10}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              handleRemoveItem(item.product.id, item.size, item.color)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Line Total (Desktop) */}
                      <div className="hidden text-right sm:block">
                        <p className="font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold">Order Summary</h2>

                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})
                      </span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {freeShipping ? 'Free' : '$9.99'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">Calculated at checkout</span>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold">
                          ${(subtotal + (freeShipping ? 0 : 9.99)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <Button className="mt-6 w-full gap-2" size="lg" onClick={handleCheckout}>
                      Checkout
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Link href="/products">
                    <Button
                      variant="ghost"
                      className="mt-2 w-full"
                      onClick={() => trackClick('continue_shopping', '/cart')}
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
