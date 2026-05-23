'use client';

import { useEffect } from 'react';
import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { ProductGrid } from '@/components/product-grid';
import { Footer } from '@/components/footer';
import { products } from '@/lib/data';
import { useTracking } from '@/hooks/use-tracking';

export default function HomePage() {
  const { trackPageView } = useTracking();

  // Track page view on mount
  useEffect(() => {
    trackPageView('/', document.referrer);
  }, [trackPageView]);

  // Featured products - show first 4
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        
        {/* Featured Products Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Featured Gear</h2>
              <a
                href="/products"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View All
              </a>
            </div>
            <ProductGrid products={featuredProducts} />
          </div>
        </section>

        {/* Categories Section */}
        <section className="border-t border-border bg-card py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-2xl font-bold tracking-tight">
              Shop by Category
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href="/products?category=tops"
                className="group relative aspect-square overflow-hidden rounded-lg bg-secondary"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 transition-colors group-hover:bg-background/40">
                  <span className="text-xl font-bold tracking-wider uppercase">
                    Tops
                  </span>
                </div>
              </a>
              <a
                href="/products?category=bottoms"
                className="group relative aspect-square overflow-hidden rounded-lg bg-secondary"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 transition-colors group-hover:bg-background/40">
                  <span className="text-xl font-bold tracking-wider uppercase">
                    Bottoms
                  </span>
                </div>
              </a>
              <a
                href="/products?category=outerwear"
                className="group relative aspect-square overflow-hidden rounded-lg bg-secondary"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 transition-colors group-hover:bg-background/40">
                  <span className="text-xl font-bold tracking-wider uppercase">
                    Outerwear
                  </span>
                </div>
              </a>
              <a
                href="/products?category=accessories"
                className="group relative aspect-square overflow-hidden rounded-lg bg-secondary"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 transition-colors group-hover:bg-background/40">
                  <span className="text-xl font-bold tracking-wider uppercase">
                    Accessories
                  </span>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
