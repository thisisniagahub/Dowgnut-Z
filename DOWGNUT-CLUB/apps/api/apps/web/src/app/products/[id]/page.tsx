'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

const products: Record<number, { name: string; price: number; description: string; image: string; category: string }> = {
  1: { name: 'Classic Glazed', price: 2.50, description: 'Our signature glazed donut - light, fluffy, and perfectly sweet', image: '🍩', category: 'Classic' },
  2: { name: 'Chocolate Dream', price: 3.00, description: 'Rich chocolate glaze with colorful sprinkles on a fluffy yeast donut', image: '🍫', category: 'Chocolate' },
  3: { name: 'Strawberry Swirl', price: 3.00, description: 'Fresh strawberry glaze with real fruit puree swirled throughout', image: '🍓', category: 'Fruit' },
  4: { name: 'Maple Bacon', price: 3.50, description: 'Maple glaze topped with crispy bacon bits - sweet meets savory', image: '🥓', category: 'Specialty' },
  5: { name: 'Boston Cream', price: 3.50, description: 'Vanilla custard filled, chocolate glazed - a classic favorite', image: '🍮', category: 'Filled' },
  6: { name: 'Cinnamon Sugar', price: 2.50, description: 'Classic cinnamon sugar coating on a cake donut', image: '🍯', category: 'Classic' },
  7: { name: 'Red Velvet', price: 3.50, description: 'Red velvet cake donut with cream cheese glaze', image: '🧁', category: 'Specialty' },
  8: { name: 'Lemon Zest', price: 3.00, description: 'Light lemon glaze with fresh lemon zest', image: '🍋', category: 'Fruit' },
  9: { name: 'Cookies & Cream', price: 3.50, description: 'Chocolate glaze with cookie crumbles and cream filling', image: '🍪', category: 'Chocolate' },
};

export default function ProductPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const product = products[id];
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Donut Not Found</h1>
          <Link href="/products" className="text-orange-600 hover:underline">
            Back to Menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600">DOWGNUT CLUB</Link>
          <nav className="flex gap-6">
            <Link href="/products" className="font-medium text-gray-700 hover:text-orange-600">Menu</Link>
            <Link href="/cart" className="font-medium text-gray-700 hover:text-orange-600">Cart</Link>
            <Link href="/profile" className="font-medium text-gray-700 hover:text-orange-600">Profile</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/products" className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-6">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Menu
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="aspect-square flex items-center justify-center text-9xl bg-gradient-to-br from-orange-50 to-amber-50">
              {product.image}
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
            <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-4">{product.name}</h1>
            <p className="text-gray-600 text-lg mb-6">{product.description}</p>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-bold text-orange-600">${product.price.toFixed(2)}</span>
              <span className="text-gray-500 line-through">$${(product.price * 1.2).toFixed(2)}</span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-8">
              <label className="text-lg font-medium">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-xl font-light"
                >
                  −
                </button>
                <span className="px-6 py-2 text-xl font-medium w-16 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-xl font-light"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button className="w-full bg-orange-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-orange-700 transition-colors">
              Add to Cart - ${(product.price * quantity).toFixed(2)}
            </button>

            <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl">🚚</div>
                <p className="text-sm text-gray-600 mt-1">Free Delivery</p>
                <p className="text-xs text-gray-400">On orders $25+</p>
              </div>
              <div>
                <div className="text-2xl">🔥</div>
                <p className="text-sm text-gray-600 mt-1">Fresh Daily</p>
                <p className="text-xs text-gray-400">Made this morning</p>
              </div>
              <div>
                <div className="text-2xl">⭐</div>
                <p className="text-sm text-gray-600 mt-1">4.9 Rating</p>
                <p className="text-xs text-gray-400">500+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 DOWGNUT CLUB. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
