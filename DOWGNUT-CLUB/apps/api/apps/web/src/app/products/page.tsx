'use client';

import Link from 'next/link';

const products = [
  { id: 1, name: 'Classic Glazed', price: 2.50, description: 'Our signature glazed donut', image: '🍩', category: 'Classic' },
  { id: 2, name: 'Chocolate Dream', price: 3.00, description: 'Rich chocolate glaze with sprinkles', image: '🍫', category: 'Chocolate' },
  { id: 3, name: 'Strawberry Swirl', price: 3.00, description: 'Fresh strawberry glaze', image: '🍓', category: 'Fruit' },
  { id: 4, name: 'Maple Bacon', price: 3.50, description: 'Maple glaze with crispy bacon bits', image: '🥓', category: 'Specialty' },
  { id: 5, name: 'Boston Cream', price: 3.50, description: 'Custard filled, chocolate glazed', image: '🍮', category: 'Filled' },
  { id: 6, name: 'Cinnamon Sugar', price: 2.50, description: 'Classic cinnamon sugar coating', image: '🍯', category: 'Classic' },
  { id: 7, name: 'Red Velvet', price: 3.50, description: 'Red velvet cake donut, cream cheese glaze', image: '🧁', category: 'Specialty' },
  { id: 8, name: 'Lemon Zest', price: 3.00, description: 'Light lemon glaze with zest', image: '🍋', category: 'Fruit' },
  { id: 9, name: 'Cookies & Cream', price: 3.50, description: 'Chocolate glaze, cookie crumbles', image: '🍪', category: 'Chocolate' },
];

const categories = ['All', 'Classic', 'Chocolate', 'Fruit', 'Filled', 'Specialty'];

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600">DOWGNUT CLUB</Link>
          <nav className="flex gap-6">
            <Link href="/products" className="font-medium text-orange-600">Menu</Link>
            <Link href="/cart" className="font-medium text-gray-700 hover:text-orange-600">Cart</Link>
            <Link href="/profile" className="font-medium text-gray-700 hover:text-orange-600">Profile</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Our Menu</h1>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                cat === 'All'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="aspect-square relative bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-7xl">
                {product.image}
                <span className="absolute top-3 right-3 bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg group-hover:text-orange-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-bold text-orange-600">${product.price.toFixed(2)}</span>
                  <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                    Add to Cart
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 DOWGNUT CLUB. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
