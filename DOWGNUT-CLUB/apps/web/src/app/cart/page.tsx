'use client';

import { useState } from 'react';
import Link from 'next/link';

const cartItems = [
  { id: 1, name: 'Classic Glazed', price: 2.50, quantity: 2, image: '🍩' },
  { id: 2, name: 'Chocolate Dream', price: 3.00, quantity: 1, image: '🍫' },
  { id: 3, name: 'Maple Bacon', price: 3.50, quantity: 1, image: '🥓' },
];

export default function CartPage() {
  const [items, setItems] = useState(cartItems);

  const updateQuantity = (id: number, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.09;
  const delivery = subtotal > 25 ? 0 : 3.99;
  const total = subtotal + tax + delivery;

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
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍩</div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some delicious donuts to get started!</p>
            <Link
              href="/products"
              className="inline-block bg-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-700 transition-colors"
            >
              Browse Menu
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
                    <p className="text-orange-600 font-bold">${item.price.toFixed(2)} each</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        +
                      </button>
                      <span className="font-semibold ml-4">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-2 flex-shrink-0"
                    aria-label="Remove item"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 h-fit">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className={delivery === 0 ? 'text-green-600' : ''}>
                    {delivery === 0 ? 'Free' : `$${delivery.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>
              </div>
              
              {subtotal < 25 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                  <p className="text-sm text-amber-800">
                    Add ${(25 - subtotal).toFixed(2)} more for free delivery!
                  </p>
                </div>
              )}

              <Link
                href="/checkout"
                className="block w-full text-center bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Proceed to Checkout
              </Link>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                Secure checkout powered by Stripe
              </p>
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