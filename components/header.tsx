'use client';

import Link from 'next/link';
import { ShoppingBag, User, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-store';
import { useAuth } from '@/lib/auth-store';
import { useTracking } from '@/hooks/use-tracking';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { trackClick, trackLogout } = useTracking();

  const handleLogout = () => {
    trackLogout('/');
    trackClick('logout_button', '/');
    logout();
  };

  const handleNavClick = (target: string) => {
    trackClick(target, '/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight"
          onClick={() => handleNavClick('logo')}
        >
          <span className="text-primary">VELOCITY</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => handleNavClick('nav_products')}
          >
            Shop All
          </Link>
          <Link
            href="/products?category=tops"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => handleNavClick('nav_tops')}
          >
            Tops
          </Link>
          <Link
            href="/products?category=bottoms"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => handleNavClick('nav_bottoms')}
          >
            Bottoms
          </Link>
          <Link
            href="/products?category=outerwear"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => handleNavClick('nav_outerwear')}
          >
            Outerwear
          </Link>
          <Link
            href="/products?category=accessories"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => handleNavClick('nav_accessories')}
          >
            Accessories
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Admin Link */}
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="hidden text-primary sm:flex"
                onClick={() => handleNavClick('nav_admin')}
              >
                Admin
              </Button>
            </Link>
          )}

          {/* Auth */}
          {isAuthenticated ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavClick('nav_auth')}
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {/* Cart */}
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => handleNavClick('nav_cart')}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col px-4 py-4">
            <Link
              href="/products"
              className="py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => handleNavClick('mobile_nav_products')}
            >
              Shop All
            </Link>
            <Link
              href="/products?category=tops"
              className="py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => handleNavClick('mobile_nav_tops')}
            >
              Tops
            </Link>
            <Link
              href="/products?category=bottoms"
              className="py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => handleNavClick('mobile_nav_bottoms')}
            >
              Bottoms
            </Link>
            <Link
              href="/products?category=outerwear"
              className="py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => handleNavClick('mobile_nav_outerwear')}
            >
              Outerwear
            </Link>
            <Link
              href="/products?category=accessories"
              className="py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => handleNavClick('mobile_nav_accessories')}
            >
              Accessories
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="py-3 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                onClick={() => handleNavClick('mobile_nav_admin')}
              >
                Admin Dashboard
              </Link>
            )}
            {isAuthenticated ? (
              <button
                className="py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={handleLogout}
              >
                Logout ({user?.name})
              </button>
            ) : (
              <Link
                href="/auth"
                className="py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => handleNavClick('mobile_nav_auth')}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
