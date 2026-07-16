'use client';

import { useState } from 'react';
import Link from 'next/link';

const orders = [
  { id: 'ORD-001', date: '2025-01-15', status: 'Delivered', total: 28.49, items: 4 },
  { id: 'ORD-002', date: '2025-01-10', status: 'Delivered', total: 15.99, items: 2 },
  { id: 'ORD-003', date: '2025-01-05', status: 'Cancelled', total: 12.50, items: 1 },
];

const favorites = [
  { id: 1, name: 'Classic Glazed', price: 2.50, image: '🍩' },
  { id: 2, name: 'Chocolate Dream', price: 3.00, image: '🍫' },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<'orders' | 'favorites' | 'settings'>('orders');

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600">DOWGNUT CLUB</Link>
          <nav className="flex gap-6">
            <Link href="/products" className="font-medium text-gray-700 hover:text-orange-600">Menu</Link>
            <Link href="/cart" className="font-medium text-gray-700 hover:text-orange-600">Cart</Link>
            <Link href="/profile" className="font-medium text-orange-600">Profile</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl">
                  🍩
                </div>
                <div>
                  <h2 className="font-bold text-lg">John Doe</h2>
                  <p className="text-sm text-gray-500">john@example.com</p>
                </div>
              </div>
              <nav className="space-y-2">
                {[
                  { id: 'orders', label: 'My Orders', icon: '📦' },
                  { id: 'favorites', label: 'Favorites', icon: '❤️' },
                  { id: 'settings', label: 'Settings', icon: '⚙️' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id as typeof tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      tab === item.id
                        ? 'bg-orange-50 text-orange-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Orders Tab */}
            {tab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold">Order History</h2>
                  <p className="text-gray-600 mt-1">Track and manage your orders</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <div key={order.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-2xl">
                          🍩
                        </div>
                        <div>
                          <h3 className="font-semibold">{order.id}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            • {order.items} items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="font-bold text-lg text-orange-600">${order.total.toFixed(2)}</span>
                        <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites Tab */}
            {tab === 'favorites' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Your Favorites</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {favorites.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-orange-300 transition-colors">
                      <div className="text-4xl">{item.image}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-orange-600 font-bold">${item.price.toFixed(2)}</p>
                      </div>
                      <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
                {favorites.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-4xl mb-2">❤️</p>
                    <p>No favorites yet. Start exploring the menu!</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {tab === 'settings' && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        defaultValue="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        defaultValue="john@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        defaultValue="(555) 123-4567"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Order Updates', desc: 'Get notified about order status changes' },
                      { label: 'Promotions', desc: 'Receive special offers and discounts' },
                      { label: 'New Products', desc: 'Be the first to know about new donuts' },
                    ].map((item, i) => (
                      <label key={i} className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-orange-600 rounded border-gray-300" />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <button className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
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