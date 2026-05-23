'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { useTracking } from '@/hooks/use-tracking';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { trackClick } = useTracking();

  const handleClick = () => {
    trackClick(`product_card_${product.id}`, '/products');
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block"
      onClick={handleClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
        />
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="text-sm font-medium text-muted-foreground">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.category}
        </p>
        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm font-semibold text-foreground">${product.price}</p>
      </div>
    </Link>
  );
}
