'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  date: string;
  status: 'Delivered' | 'Shipped' | 'Processing' | 'Cancelled' | 'Pending';
  total: number;
  items: number;
  products: { name: string; qty: number; price: number }[];
  shipping: { name: string; address: string; city: string; state: string; zip: string; country: string };
  tracking?: string;
}

const allOrders: Order[] = [
  { id: '#USER-004832', date: '2026-06-28', status: 'Delivered', total: 2145, items: 3, products: [{ name: 'Classic Fit Wool Blazer', qty: 1, price: 1295 }, { name: 'Italian Leather Derby Shoes', qty: 1, price: 895 }], shipping: { name: 'Alexander Blackwood', address: '742 Park Avenue', city: 'New York', state: 'NY', zip: '10021', country: 'United States' }, tracking: '1Z999AA10123456784' },
  { id: '#USER-004701', date: '2026-06-15', status: 'Shipped', total: 895, items: 1, products: [{ name: 'Italian Leather Derby Shoes', qty: 1, price: 895 }], shipping: { name: 'Alexander Blackwood', address: '742 Park Avenue', city: 'New York', state: 'NY', zip: '10021', country: 'United States' }, tracking: '1Z999AA10123456785' },
  { id: '#USER-004589', date: '2026-05-30', status: 'Processing', total: 3450, items: 2, products: [{ name: 'Cashmere Turtleneck Sweater', qty: 1, price: 1450 }, { name: 'Silk Evening Gown', qty: 1, price: 2000 }], shipping: { name: 'Alexander Blackwood', address: '742 Park Avenue', city: 'New York', state: 'NY', zip: '10021', country: 'United States' } },
  { id: '#USER-004412', date: '2026-05-12', status: 'Delivered', total: 1290, items: 1, products: [{ name: 'Double-Breasted Wool Coat', qty: 1, price: 1290 }], shipping: { name: 'Alexander Blackwood', address: '742 Park Avenue', city: 'New York', state: 'NY', zip: '10021', country: 'United States' } },
  { id: '#USER-004398', date: '2026-04-28', status: 'Cancelled', total: 520, items: 1, products: [{ name: 'Leather Aviator Sunglasses', qty: 1, price: 520 }], shipping: { name: 'Alexander Blackwood', address: '742 Park Avenue', city: 'New York', state: 'NY', zip: '10021', country: 'United States' } },
  { id: '#USER-004201', date: '2026-04-10', status: 'Delivered', total: 1895, items: 1, products: [{ name: 'Double-Breasted Wool Coat', qty: 1, price: 1895 }], shipping: { name: 'Alexander Blackwood', address: '742 Park Avenue', city: 'New York', state: 'NY', zip: '10021', country: 'United States' } },
  { id: '#USER-004105', date: '2026-03-22', status: 'Delivered', total: 2150, items: 2, products: [{ name: 'Monogram Canvas Backpack', qty: 1, price: 2150 }], shipping: { name: 'Alexander Blackwood', address: '742 Park Avenue', city: 'New York', state: 'NY', zip: '10021', country: 'United States' } },
  { id: '#USER-003987', date: '2026-03-05', status: 'Pending', total: 480, items: 1, products: [{ name: 'Leather Aviator Sunglasses', qty: 1, price: 480 }], shipping: { name: 'Alexander Blackwood', address: '742 Park Avenue', city: 'New York', state: 'NY', zip: '10021', country: 'United States' } },
];

const statuses = ['All', 'Delivered', 'Shipped', 'Processing', 'Pending', 'Cancelled'];

export default function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredOrders = selectedStatus === 'All'
    ? allOrders
    : allOrders.filter(o => o.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-[var(--color-success)]/10 text-[var(--color-success)]';
      case 'Shipped': return 'bg-[var(--color-info)]/10 text-[var(--color-info)]';
      case 'Processing': return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]';
      case 'Cancelled': return 'bg-[var(--color-error)]/10 text-[var(--color-error)]';
      case 'Pending': return 'bg-[var(--color-mid-gray)]/10 text-[var(--color-mid-gray)]';
      default: return 'bg-[var(--color-mid-gray)]/10 text-[var(--color-mid-gray)]';
    }
  };

  const sidebarLinks = [
    { label: 'Overview', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Orders', href: '/dashboard/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Profile', href: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Addresses', href: '/dashboard/addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
    { label: 'Wishlist', href: '/wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  ];

  if (allOrders.length === 0) {
    return (
      <div className='min-h-screen bg-[var(--color-off-white)] font-[family-name:var(--font-body)]'>
        <div className='container-luxury flex flex-col items-center justify-center py-24'>
          <svg className='mb-6 h-24 w-24 text-[var(--color-light-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
          </svg>
          <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]'>No orders yet</h2>
          <p className='mt-2 text-[var(--color-mid-gray)]'>Start shopping to see your orders here</p>
          <Link href='/products' className='gold-button mt-8 px-8 py-3 text-sm font-medium'>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--color-off-white)] font-[family-name:var(--font-body)]'>
      <div className='flex'>
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-white)] border-r border-[var(--color-light-gray)] transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className='p-6'>
            <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>My Account</h2>
          </div>
          <nav className='px-3 pb-6'>
            {sidebarLinks.map((link) => (
              <Link key={link.label} href={link.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                  link.href === '/dashboard/orders' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                }`}>
                <svg className='h-5 w-5 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d={link.icon} />
                </svg>
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && <div className='fixed inset-0 z-30 bg-black/50 lg:hidden' onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <div className='flex-1 p-6 lg:p-8'>
          <div className='mb-8 flex items-center justify-between lg:hidden'>
            <button onClick={() => setSidebarOpen(true)} className='rounded-lg p-2 text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'>
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>Orders</h1>
            <div className='w-10' />
          </div>

          <div className='mb-8 hidden lg:block'>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>My Orders</h1>
            <p className='mt-1 text-[var(--color-mid-gray)]'>Track and manage your orders</p>
          </div>

          {/* Filter Tabs */}
          <div className='mb-6 flex flex-wrap gap-2'>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-[var(--color-accent)] text-[var(--color-deep-black)]'
                    : 'bg-[var(--color-white)] text-[var(--color-dark-gray)] border border-[var(--color-light-gray)] hover:bg-[var(--color-cream)]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className='overflow-x-auto rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)]'>
              <table className='w-full text-sm'>
              <thead className='hidden md:table-header-group'>
                <tr className='border-b border-[var(--color-light-gray)] bg-[var(--color-cream)]'>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Order</th>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Date</th>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Status</th>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Total</th>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Items</th>
                  <th className='px-6 py-4 text-right font-medium text-[var(--color-primary)]'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className='hidden md:table-row border-b border-[var(--color-light-gray)] last:border-b-0 hover:bg-[var(--color-cream)] transition-colors'>
                    <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>{order.id}</td>
                    <td className='px-6 py-4 text-[var(--color-dark-gray)]'>{order.date}</td>
                    <td className='px-6 py-4'>
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>Rs {order.total.toLocaleString()}</td>
                    <td className='px-6 py-4 text-[var(--color-dark-gray)]'>{order.items}</td>
                    <td className='px-6 py-4 text-right'>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className='text-sm text-[var(--color-accent)] hover:underline'
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            {filteredOrders.length > 0 && (
              <div className='block md:hidden divide-y divide-[var(--color-light-gray)]'>
                {filteredOrders.map((order) => (
                  <div key={order.id} className='p-4 space-y-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0 flex-1'>
                        <p className='font-medium text-[var(--color-primary)]'>{order.id}</p>
                        <p className='text-sm text-[var(--color-dark-gray)]'>{order.date}</p>
                      </div>
                      <span className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className='grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm'>
                      <div className='text-[var(--color-mid-gray)]'>Total:</div>
                      <div className='font-medium text-[var(--color-primary)]'>Rs {order.total.toLocaleString()}</div>
                      <div className='text-[var(--color-mid-gray)]'>Items:</div>
                      <div className='text-[var(--color-dark-gray)]'>{order.items}</div>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className='text-sm font-medium text-[var(--color-accent)] hover:underline'
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setSelectedOrder(null)} />
          <div className='relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--color-white)] p-8 shadow-xl animate-scale-in'>
            <button
              onClick={() => setSelectedOrder(null)}
              className='absolute right-4 top-4 rounded-full p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] transition-colors'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>

            <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]'>
              Order {selectedOrder.id}
            </h2>
            <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>Placed on {selectedOrder.date}</p>

            {/* Status and Tracking */}
            <div className='mt-6 flex items-center gap-4'>
              <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
              {selectedOrder.tracking && (
                <span className='text-sm text-[var(--color-dark-gray)]'>
                  Tracking: {selectedOrder.tracking}
                </span>
              )}
            </div>

            {selectedOrder.status === 'Shipped' && (
              <button className='mt-3 gold-button px-6 py-2.5 text-sm font-medium'>
                Track Order
              </button>
            )}

            {/* Products */}
            <div className='mt-8'>
              <h3 className='text-sm font-medium text-[var(--color-primary)] mb-3'>Items</h3>
              <div className='space-y-3'>
                {selectedOrder.products.map((product, i) => (
                  <div key={i} className='flex items-center justify-between rounded-lg bg-[var(--color-cream)] p-4'>
                    <div>
                      <p className='text-sm font-medium text-[var(--color-primary)]'>{product.name}</p>
                      <p className='text-xs text-[var(--color-mid-gray)]'>Qty: {product.qty}</p>
                    </div>
                    <span className='text-sm font-medium text-[var(--color-primary)]'>
                      Rs {(product.price * product.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div className='mt-6'>
              <h3 className='text-sm font-medium text-[var(--color-primary)] mb-3'>Shipping To</h3>
              <div className='rounded-lg bg-[var(--color-cream)] p-4 text-sm text-[var(--color-dark-gray)]'>
                <p className='font-medium text-[var(--color-primary)]'>{selectedOrder.shipping.name}</p>
                <p>{selectedOrder.shipping.address}</p>
                <p>{selectedOrder.shipping.city}, {selectedOrder.shipping.state} {selectedOrder.shipping.zip}</p>
                <p>{selectedOrder.shipping.country}</p>
              </div>
            </div>

            {/* Total */}
            <div className='mt-6 flex items-center justify-between rounded-lg border border-[var(--color-light-gray)] p-4'>
              <span className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Total</span>
              <span className='font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-primary)]'>
                Rs {selectedOrder.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
