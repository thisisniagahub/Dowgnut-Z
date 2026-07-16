'use client';

import { useState } from 'react';
import Link from 'next/link';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Orders', href: '/orders', icon: '📦' },
  { name: 'Products', href: '/products', icon: '🍩' },
  { name: 'Customers', href: '/customers', icon: '👥' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

const stats = [
  { label: 'Total Orders', value: '1,234', change: '+12%', trend: 'up' },
  { label: 'Revenue', value: '$28,450', change: '+8%', trend: 'up' },
  { label: 'Customers', value: '892', change: '+5%', trend: 'up' },
  { label: 'Avg. Order', value: '$23.05', change: '-2%', trend: 'down' },
];

const recentOrders = [
  { id: '#1234', customer: 'John Smith', email: 'john@email.com', items: 3, total: '$45.50', status: 'Delivered', date: '2025-01-15' },
  { id: '#1233', customer: 'Sarah Johnson', email: 'sarah@email.com', items: 2, total: '$28.00', status: 'Preparing', date: '2025-01-15' },
  { id: '#1232', customer: 'Mike Wilson', email: 'mike@email.com', items: 5, total: '$67.25', status: 'Pending', date: '2025-01-14' },
  { id: '#1231', customer: 'Emily Davis', email: 'emily@email.com', items: 1, total: '$12.50', status: 'Delivered', date: '2025-01-14' },
  { id: '#1230', customer: 'Chris Brown', email: 'chris@email.com', items: 4, total: '$52.00', status: 'Out for Delivery', date: '2025-01-13' },
];

const products = [
  { id: 1, name: 'Classic Glazed', category: 'Classic', price: 2.50, stock: 100, status: 'Active' },
  { id: 2, name: 'Chocolate Dream', category: 'Chocolate', price: 3.00, stock: 75, status: 'Active' },
  { id: 3, name: 'Strawberry Swirl', category: 'Fruit', price: 3.00, stock: 50, status: 'Active' },
  { id: 4, name: 'Maple Bacon', category: 'Specialty', price: 3.50, stock: 30, status: 'Low Stock' },
  { id: 5, name: 'Boston Cream', category: 'Filled', price: 3.50, stock: 0, status: 'Out of Stock' },
];

const statusColors: Record<string, string> = {
  Delivered: 'bg-green-100 text-green-800',
  Preparing: 'bg-yellow-100 text-yellow-800',
  Pending: 'bg-gray-100 text-gray-800',
  'Out for Delivery': 'bg-blue-100 text-blue-800',
  Active: 'bg-green-100 text-green-800',
  'Low Stock': 'bg-yellow-100 text-yellow-800',
  'Out of Stock': 'bg-red-100 text-red-800',
};

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`p-4 border-b border-gray-200 ${collapsed ? 'justify-center' : ''}`}>
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🍩</span>
              <span className="font-bold text-xl text-orange-600">DOWGNUT CLUB</span>
            </Link>
          )}
          {collapsed && <span className="text-2xl">🍩</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
              title={collapsed ? item.name : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span className="font-medium text-gray-700 hover:text-orange-600">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            {collapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-medium text-gray-600">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

function StatCard({ label, value, change, trend }: typeof stats[0]) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {trend === 'up' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            )}
          </svg>
        </div>
      </div>
      <p className={`text-sm font-medium mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {change} vs last month
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className={`ml-64 transition-all duration-300 min-h-screen`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-medium">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
            {[
              { id: 'dashboard', label: 'Overview' },
              { id: 'orders', label: 'Recent Orders' },
              { id: 'products', label: 'Products' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Recent Orders</h2>
                  <Link href="/orders" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                    View All
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{order.customer}</div>
                            <div className="text-sm text-gray-500">{order.email}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{order.items}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{order.total}</td>
                          <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                          <td className="px-6 py-4 text-gray-500">{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/orders/new"
                    className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
                  >
                    <div className="text-3xl mb-2">➕</div>
                    <p className="font-medium">New Order</p>
                  </Link>
                  <Link
                    href="/products/new"
                    className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
                  >
                    <div className="text-3xl mb-2">🍩</div>
                    <p className="font-medium">Add Product</p>
                  </Link>
                  <Link
                    href="/customers"
                    className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
                  >
                    <div className="text-3xl mb-2">👥</div>
                    <p className="font-medium">Manage Customers</p>
                  </Link>
                  <Link
                    href="/analytics"
                    className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
                  >
                    <div className="text-3xl mb-2">📈</div>
                    <p className="font-medium">View Analytics</p>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">All Orders</h2>
                <div className="flex gap-3">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Preparing</option>
                    <option>Out for Delivery</option>
                    <option>Delivered</option>
                  </select>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4">{order.customer}</td>
                        <td className="px-6 py-4 text-gray-500">{order.email}</td>
                        <td className="px-6 py-4 text-gray-600">{order.items}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{order.total}</td>
                        <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                        <td className="px-6 py-4 text-gray-500">{order.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm text-orange-600 hover:text-orange-700 font-medium">View</button>
                            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 font-medium">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-500">Showing 1 to 5 of 1,234 results</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50" disabled>Previous</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm">Next</button>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Products</h2>
                <Link
                  href="/products/new"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  Add Product
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-2xl">
                              🍩
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">ID: #{product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{product.category}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={product.stock === 0 ? 'text-red-600' : product.stock < 40 ? 'text-yellow-600' : 'text-green-600'}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm text-orange-600 hover:text-orange-700 font-medium">Edit</button>
                            <button className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}