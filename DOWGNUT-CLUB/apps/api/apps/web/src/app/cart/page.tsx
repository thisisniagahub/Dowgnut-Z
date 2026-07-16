'use client';

import Link from 'next/link';
import { useState } from 'react';

const cartItems = [
  { id: 1, name: 'Classic Glazed', price: 2.50, quantity: 2, image: '🍩' },
  { id: 2, name: 'Chocolate Dream', price: 3.00, quantity: 1, image: '🍫' },
  { id: 3, name: 'Maple Bacon', price: 3.50, quantity: 1, image: '🥓' },
];

export default function CartPage() {
  const [items] = useState(cartItems);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal >= 25 ? 0 : 3.99;
  const total = subtotal + delivery;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600">DOWGNUT CLUB</Link>
          <nav className="flex gap-6">
            <Link href="/products" className="font-medium text-gray-700 hover:text-orange-600">Menu</Link>
            <Link href="/cart" className="font-medium text-orange-600">Cart</Link>
            <Link href="/profile" className="font-medium text-gray-700 hover:text-orange-600">Profile</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🍩</div>
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any donuts yet.</p>
            <Link
              href="/products"
              className="inline-block bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
            >
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-4xl flex-shrink-0">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button className="px-3 py-1 bg-gray-50 hover:bg-gray-100">−</button>
                        <span className="px-4 py-1 text-center w-10">{item.quantity}</span>
                        <button className="px-3 py-1 bg-gray-50 hover:bg-gray-100">+</button>
                      </div>
                      <span className="font-semibold ml-auto">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-red-500 self-start">🗑️</button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 h-fit">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>
                    {delivery === 0 ? 'Free' : `$${delivery.toFixed(2)}`}
                  </span>
                </div>
                {delivery > 0 && (
                  <p className="text-sm text-green-600">Add ${(25 - subtotal).toFixed(2)} more for free delivery!</p>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="block w-full bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg text-center hover:bg-orange-700 transition-colors"
              >
                Proceed to Checkout
              </Link>
              <p className="text-center text-sm text-gray-500 mt-4">Secure checkout powered by Stripe</p>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 DOWGNUT CLUB. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
