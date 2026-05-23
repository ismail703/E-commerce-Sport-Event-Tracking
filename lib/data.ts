// ===========================================
// SAMPLE PRODUCT & USER DATA
// Pre-seeded data for the sports clothing store
// ===========================================

import type { Product, User } from './types';

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Performance Running Tee',
    description: 'Lightweight, moisture-wicking fabric designed for maximum breathability during intense workouts. Features flatlock seams to prevent chafing.',
    price: 45,
    category: 'tops',
    image: '/images/running-tee.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Navy'],
    inStock: true,
  },
  {
    id: 'prod-002',
    name: 'Elite Training Shorts',
    description: 'Built for high-intensity training with 4-way stretch fabric and built-in compression liner. Quick-dry technology keeps you comfortable.',
    price: 55,
    category: 'bottoms',
    image: '/images/training-shorts.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gray', 'Blue'],
    inStock: true,
  },
  {
    id: 'prod-003',
    name: 'Pro Compression Leggings',
    description: 'Second-skin fit with targeted compression zones for muscle support. Reflective details for low-light visibility.',
    price: 85,
    category: 'bottoms',
    image: '/images/compression-leggings.jpg',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Charcoal'],
    inStock: true,
  },
  {
    id: 'prod-004',
    name: 'Windbreaker Jacket',
    description: 'Lightweight protection against wind and light rain. Packable design fits in its own pocket for easy carrying.',
    price: 120,
    category: 'outerwear',
    image: '/images/windbreaker.jpg',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Red', 'Navy'],
    inStock: true,
  },
  {
    id: 'prod-005',
    name: 'Training Hoodie',
    description: 'Premium cotton-blend hoodie with kangaroo pocket. Perfect for warm-ups and cool-downs.',
    price: 75,
    category: 'outerwear',
    image: '/images/training-hoodie.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gray', 'White'],
    inStock: true,
  },
  {
    id: 'prod-006',
    name: 'Sports Bra - High Impact',
    description: 'Maximum support for high-impact activities. Moisture-wicking fabric with mesh panels for ventilation.',
    price: 50,
    category: 'tops',
    image: '/images/sports-bra.jpg',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'White', 'Pink'],
    inStock: true,
  },
  {
    id: 'prod-007',
    name: 'Athletic Crew Socks (3-Pack)',
    description: 'Cushioned heel and toe with arch support. Breathable mesh panels keep feet cool.',
    price: 25,
    category: 'accessories',
    image: '/images/crew-socks.jpg',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'White', 'Mixed'],
    inStock: true,
  },
  {
    id: 'prod-008',
    name: 'Performance Cap',
    description: 'Structured fit with curved brim. Moisture-wicking sweatband and adjustable back closure.',
    price: 30,
    category: 'accessories',
    image: '/images/performance-cap.jpg',
    sizes: ['One Size'],
    colors: ['Black', 'White', 'Red'],
    inStock: true,
  },
];

// Sample users for authentication simulation
export const users: User[] = [
  {
    id: 'user-001',
    email: 'admin@velocity.com',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: 'user-002',
    email: 'demo@velocity.com',
    name: 'Demo User',
    role: 'user',
  },
  {
    id: 'user-003',
    email: 'demo02@velocity.com',
    name: 'Second Demo User',
    role: 'user',
  },
];

// Helper function to get product by ID
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

// Helper function to get products by category
export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

// Helper function to search products
export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
  );
}
