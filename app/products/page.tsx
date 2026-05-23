'use client';

import { useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { ProductGrid } from '@/components/product-grid';
import { Footer } from '@/components/footer';
import { products, getProductsByCategory } from '@/lib/data';
import { useTracking } from '@/hooks/use-tracking';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const categories = [
  { key: 'all', label: 'All' },
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'outerwear', label: 'Outerwear' },
  { key: 'accessories', label: 'Accessories' },
];

// 1. Extract the inner content into its own component
function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const { trackPageView, trackClick } = useTracking();

  // Track page view
  useEffect(() => {
    trackPageView('/products', document.referrer);
  }, [trackPageView]);

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (category === 'all') return products;
    return getProductsByCategory(category);
  }, [category]);

  const handleCategoryClick = (cat: string) => {
    trackClick(`category_filter_${cat}`, '/products');
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Shop All</h1>
        <p className="mt-2 text-muted-foreground">
          Explore our complete collection of premium athletic wear.
        </p>
      </div>

      {/* Category Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            href={cat.key === 'all' ? '/products' : `/products?category=${cat.key}`}
            onClick={() => handleCategoryClick(cat.key)}
          >
            <Button
              variant={category === cat.key ? 'default' : 'outline'}
              size="sm"
            >
              {cat.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Product Grid */}
      <ProductGrid products={filteredProducts} />

      {/* Results Count */}
      <p className="mt-8 text-sm text-muted-foreground">
        Showing {filteredProducts.length} product
        {filteredProducts.length !== 1 ? 's' : ''}
      </p>
    </>
  );
}

// 2. The main page component now wraps the content in <Suspense>
export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

          {/* 3. Suspense boundary catches the search params during build */}
          <Suspense fallback={
            <div className="py-12 text-center text-muted-foreground">
              Loading products...
            </div>
          }>
            <ProductsContent />
          </Suspense>

        </div>
      </main>
      <Footer />
    </div>
  );
}