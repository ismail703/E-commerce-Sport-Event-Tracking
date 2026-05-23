'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { getProductById, products } from '@/lib/data';
import { useCart } from '@/lib/cart-store';
import { useTracking, useProductDwellTime } from '@/hooks/use-tracking';
import { ChevronLeft, Minus, Plus, Check } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const product = getProductById(id);

  // State for selections
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Hooks
  const { addItem } = useCart();
  const { trackClick, trackAddToCart } = useTracking();

  // Track dwell time on this product page
  useProductDwellTime(id, product?.name ?? id, `/products/${id}`);

  // Set defaults when product loads
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || '');
      setSelectedColor(product.colors[0] || '');
    }
  }, [product]);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;

    addItem(product, selectedSize, selectedColor, quantity);
    trackAddToCart(product.id, quantity, `/products/${id}`, selectedSize, selectedColor);
    trackClick('add_to_cart_button', `/products/${id}`);

    // Show confirmation
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(1, Math.min(10, quantity + delta));
    setQuantity(newQty);
    trackClick(`quantity_${delta > 0 ? 'increase' : 'decrease'}`, `/products/${id}`);
  };

  // Get related products (same category, different product)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/products"
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => trackClick('back_to_products', `/products/${id}`)}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Shop
          </Link>

          {/* Product Details */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {product.category}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-4 text-2xl font-semibold">${product.price}</p>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Size Selection */}
              <div className="mt-8">
                <p className="mb-3 text-sm font-medium">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        trackClick(`size_${size}`, `/products/${id}`);
                      }}
                      className={`min-w-[3rem] rounded-md border px-4 py-2 text-sm font-medium transition-colors ${selectedSize === size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-foreground'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mt-6">
                <p className="mb-3 text-sm font-medium">Color</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        trackClick(`color_${color}`, `/products/${id}`);
                      }}
                      className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${selectedColor === color
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-foreground'
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-6">
                <p className="mb-3 text-sm font-medium">Quantity</p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[2rem] text-center text-lg font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="mt-8">
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || added}
                >
                  {added ? (
                    <>
                      <Check className="h-5 w-5" />
                      Added to Cart
                    </>
                  ) : product.inStock ? (
                    'Add to Cart'
                  ) : (
                    'Out of Stock'
                  )}
                </Button>
              </div>

              {/* Product Details List */}
              <div className="mt-8 border-t border-border pt-8">
                <h3 className="text-sm font-medium">Product Details</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>Premium performance fabric</li>
                  <li>Moisture-wicking technology</li>
                  <li>Machine washable</li>
                  <li>Free shipping on orders over $100</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16 border-t border-border pt-16">
              <h2 className="mb-8 text-xl font-bold">You Might Also Like</h2>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
                {relatedProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="group block"
                    onClick={() => trackClick(`related_product_${p.id}`, `/products/${id}`)}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(min-width: 768px) 33vw, 50vw"
                      />
                    </div>
                    <h3 className="mt-4 font-medium group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-sm font-semibold">${p.price}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
