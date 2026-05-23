'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart-store';
import { useAuth } from '@/lib/auth-store';
import { useTracking } from '@/hooks/use-tracking';
import { ChevronLeft, Loader2, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const { trackPageView, trackClick, trackPurchaseComplete } = useTracking();

  // Form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Pre-fill email if logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Track page view
  useEffect(() => {
    trackPageView('/checkout', document.referrer);
  }, [trackPageView]);

  // Redirect if cart is empty (unless order is complete)
  useEffect(() => {
    if (cart.length === 0 && !orderComplete) {
      router.push('/cart');
    }
  }, [cart.length, orderComplete, router]);

  // Calculate totals
  const shippingThreshold = 100;
  const freeShipping = subtotal >= shippingThreshold;
  const shipping = freeShipping ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    trackClick('place_order_button', '/checkout');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          userId: user?.id || null,
          email,
          shipping: { firstName, lastName, address, city, zip },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Track purchase complete per cart item so each product gets its own timing metadata
        cart.forEach((item) => {
          trackPurchaseComplete(
            data.order.id,
            item.product.id,
            total,
            '/checkout',
            item.size,
            item.color
          );
        });

        // Clear cart and show success
        clearCart();
        setOrderId(data.order.id);
        setOrderComplete(true);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Order Complete State
  if (orderComplete) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="mx-auto max-w-md px-4 py-16 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="mt-6 text-2xl font-bold">Order Confirmed!</h1>
            <p className="mt-4 text-muted-foreground">
              Thank you for your order. Your order number is:
            </p>
            <p className="mt-2 font-mono text-lg font-semibold text-primary">
              {orderId}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              We&apos;ve sent a confirmation email with your order details.
            </p>
            <Link href="/products">
              <Button className="mt-8" onClick={() => trackClick('continue_shopping_success', '/checkout')}>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/cart"
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => trackClick('back_to_cart', '/checkout')}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Checkout Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h2 className="text-lg font-semibold">Contact Information</h2>
                  <div className="mt-4">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-muted-foreground"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h2 className="text-lg font-semibold">Shipping Address</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-muted-foreground"
                      >
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-muted-foreground"
                      >
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-muted-foreground"
                      >
                        Address
                      </label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="mt-1"
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-muted-foreground"
                      >
                        City
                      </label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="zip"
                        className="block text-sm font-medium text-muted-foreground"
                      >
                        ZIP Code
                      </label>
                      <Input
                        id="zip"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment (Simulated) */}
                <div>
                  <h2 className="text-lg font-semibold">Payment</h2>
                  <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      This is a demo checkout. No real payment will be processed.
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Place Order - $${total.toFixed(2)}`
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Order Summary</h2>

                {/* Items */}
                <div className="mt-6 divide-y divide-border">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      className="flex gap-4 py-4"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.size} / {item.color}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-6 space-y-3 border-t border-border pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})
                    </span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{freeShipping ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
