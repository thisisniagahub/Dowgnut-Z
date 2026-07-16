'use client';

import Link from 'next/link';

const products = [
  { id: 1, name: 'Classic Glazed', price: 2.50, description: 'Our signature glazed donut', image: '🍩' },
  { id: 2, name: 'Chocolate Dream', price: 3.00, description: 'Rich chocolate glaze with sprinkles', image: '🍫' },
  { id: 3, name: 'Strawberry Swirl', price: 3.00, description: 'Fresh strawberry glaze', image: '🍓' },
  { id: 4, name: 'Maple Bacon', price: 3.50, description: 'Maple glaze with crispy bacon bits', image: '🥓' },
  { id: 5, name: 'Boston Cream', price: 3.50, description: 'Custard filled, chocolate glazed', image: '🍮' },
  { id: 6, name: 'Cinnamon Sugar', price: 2.50, description: 'Classic cinnamon sugar coating', image: '🍯' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-red-500 to-amber-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            DOWGNUT <span className="text-yellow-300">CLUB</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
            Premium donuts crafted fresh daily. Delivered to your door or ready for pickup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Order Now
            </Link>
            <Link
              href="/products"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              View Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2">Free Delivery</h3>
            <p className="text-gray-600">On orders over $25</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-xl font-semibold mb-2">Fresh Daily</h3>
            <p className="text-gray-600">Made fresh every morning</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">Rewards</h3>
            <p className="text-gray-600">Earn points on every order</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Donuts</h2>
            <Link
              href="/products"
              className="text-orange-600 font-semibold hover:text-orange-700"
            >
              View All →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="aspect-square flex items-center justify-center text-6xl bg-gradient-to-br from-orange-50 to-amber-50">
                  {product.image}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg group-hover:text-orange-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xl font-bold text-orange-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-orange-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join the Dowgnut Club today and get 10% off your first order!
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-orange-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Start Your Order
          </Link>
        </div>
      </section>
    </main>
  );
}
