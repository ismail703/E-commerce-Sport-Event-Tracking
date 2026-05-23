'use client';

import Link from 'next/link';
import { useTracking } from '@/hooks/use-tracking';

export function Footer() {
  const { trackClick } = useTracking();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-primary">VELOCITY</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium sports clothing for athletes who demand performance and
              style.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Shop
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => trackClick('footer_shop_all', 'footer')}
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=tops"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => trackClick('footer_tops', 'footer')}
                >
                  Tops
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=bottoms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => trackClick('footer_bottoms', 'footer')}
                >
                  Bottoms
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=outerwear"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => trackClick('footer_outerwear', 'footer')}
                >
                  Outerwear
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Support
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <span className="text-sm text-muted-foreground">
                  Contact Us
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Shipping Info
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Returns
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Size Guide
                </span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <span className="text-sm text-muted-foreground">About Us</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Careers</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Press</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Sustainability
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Velocity Sports. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
