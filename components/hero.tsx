'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTracking } from '@/hooks/use-tracking';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  const { trackClick } = useTracking();

  return (
    <section className="relative overflow-hidden bg-secondary py-24 sm:py-32 lg:py-40">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
            New Collection 2026
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Push Your Limits with Premium Performance Gear
          </h1>
          <p className="mt-6 text-pretty text-lg text-muted-foreground">
            Engineered for athletes who demand more. Our cutting-edge sportswear
            combines innovative materials with sleek design to help you perform
            at your best.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/products">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => trackClick('hero_shop_now', '/')}
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/products?category=outerwear">
              <Button
                variant="outline"
                size="lg"
                onClick={() => trackClick('hero_new_arrivals', '/')}
              >
                New Arrivals
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
