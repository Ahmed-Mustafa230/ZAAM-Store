'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  trackingNumber?: string;
  user?: { name: string; email: string };
}

const statuses = ['All', 'Delivered', 'Shipped', 'Processing', 'Pending', 'Cancelled'];

function capitalizeStatus(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const sidebarLinks = [
  { label: 'Overview', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Orders', href: '/dashboard/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Profile', href: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Addresses', href: '/dashboard/addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  { label: 'Wishlist', href: '/wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
];

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await axios.get('/api/orders?limit=50');
        if (cancelled) return;
        const data = res.data?.data?.orders || res.data?.orders || [];
        setAllOrders(data);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredOrders = selectedStatus === 'All'
    ? allOrders
    : allOrders.filter(o => capitalizeStatus(o.status) === selectedStatus);

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

  if (!loading && allOrders.length === 0) {
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
                {filteredOrders.map((order) => {
                  const status = capitalizeStatus(order.status);
                  const date = order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : '—';
                  return (
                    <tr key={order._id} className='hidden md:table-row border-b border-[var(--color-light-gray)] last:border-b-0 hover:bg-[var(--color-cream)] transition-colors'>
                      <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>#{order._id.toString().slice(-6).toUpperCase()}</td>
                      <td className='px-6 py-4 text-[var(--color-dark-gray)]'>{date}</td>
                      <td className='px-6 py-4'>
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>Rs {order.totalPrice.toLocaleString()}</td>
                      <td className='px-6 py-4 text-[var(--color-dark-gray)]'>{order.items?.length || 0}</td>
                      <td className='px-6 py-4 text-right'>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className='text-sm text-[var(--color-accent)] hover:underline'
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Cards */}
            {filteredOrders.length > 0 && (
              <div className='block md:hidden divide-y divide-[var(--color-light-gray)]'>
                {filteredOrders.map((order) => {
                  const status = capitalizeStatus(order.status);
                  const date = order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : '—';
                  return (
                    <div key={order._id} className='p-4 space-y-3'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0 flex-1'>
                          <p className='font-medium text-[var(--color-primary)]'>#{order._id.toString().slice(-6).toUpperCase()}</p>
                          <p className='text-sm text-[var(--color-dark-gray)]'>{date}</p>
                        </div>
                        <span className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      <div className='grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm'>
                        <div className='text-[var(--color-mid-gray)]'>Total:</div>
                        <div className='font-medium text-[var(--color-primary)]'>Rs {order.totalPrice.toLocaleString()}</div>
                        <div className='text-[var(--color-mid-gray)]'>Items:</div>
                        <div className='text-[var(--color-dark-gray)]'>{order.items?.length || 0}</div>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className='text-sm font-medium text-[var(--color-accent)] hover:underline'
                      >
                        View Details
                      </button>
                    </div>
                  );
                })}
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
              Order #{selectedOrder._id.toString().slice(-6).toUpperCase()}
            </h2>
            <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
              Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : '—'}
            </p>

            {/* Status and Tracking */}
            <div className='mt-6 flex items-center gap-4'>
              <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${getStatusColor(capitalizeStatus(selectedOrder.status))}`}>
                {capitalizeStatus(selectedOrder.status)}
              </span>
              {selectedOrder.trackingNumber && (
                <span className='text-sm text-[var(--color-dark-gray)]'>
                  Tracking: {selectedOrder.trackingNumber}
                </span>
              )}
            </div>

            {/* Items */}
            <div className='mt-8'>
              <h3 className='text-sm font-medium text-[var(--color-primary)] mb-3'>Items</h3>
              <div className='space-y-3'>
                {(selectedOrder.items || []).map((product, i) => (
                  <div key={i} className='flex items-center justify-between rounded-lg bg-[var(--color-cream)] p-4'>
                    <div className='flex items-center gap-3'>
                      {product.image && (
                        <img src={product.image} alt={product.name} className='h-12 w-12 rounded-lg object-cover' />
                      )}
                      <div>
                        <p className='text-sm font-medium text-[var(--color-primary)]'>{product.name}</p>
                        <p className='text-xs text-[var(--color-mid-gray)]'>Qty: {product.quantity}</p>
                      </div>
                    </div>
                    <span className='text-sm font-medium text-[var(--color-primary)]'>
                      Rs {(product.price * product.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div className='mt-6'>
              <h3 className='text-sm font-medium text-[var(--color-primary)] mb-3'>Shipping To</h3>
              <div className='rounded-lg bg-[var(--color-cream)] p-4 text-sm text-[var(--color-dark-gray)]'>
                {selectedOrder.user?.name && (
                  <p className='font-medium text-[var(--color-primary)]'>{selectedOrder.user.name}</p>
                )}
                <p>{selectedOrder.shippingAddress?.street}</p>
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}</p>
                <p>{selectedOrder.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Total */}
            <div className='mt-6 flex items-center justify-between rounded-lg border border-[var(--color-light-gray)] p-4'>
              <span className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Total</span>
              <span className='font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-primary)]'>
                Rs {selectedOrder.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
