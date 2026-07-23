'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import DashboardSidebar from '@/components/dashboard/Sidebar';

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
        const data = res.data?.orders || [];
        setAllOrders(data);
      } catch {
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
      <div className='min-h-screen bg-[var(--color-off-white)] dark:bg-zinc-950 font-[family-name:var(--font-body)]'>
        <div className='container-luxury flex flex-col items-center justify-center py-24'>
          <svg className='mb-6 h-24 w-24 text-[var(--color-light-gray)] dark:text-zinc-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
          </svg>
          <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)] dark:text-zinc-100'>No orders yet</h2>
          <p className='mt-2 text-[var(--color-mid-gray)] dark:text-zinc-400'>Start shopping to see your orders here</p>
          <Link href='/products' className='gold-button mt-8 px-8 py-3 text-sm font-medium'>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--color-off-white)] dark:bg-zinc-950 font-[family-name:var(--font-body)]'>
      <div className='flex'>
        <DashboardSidebar activeHref='/dashboard/orders' sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className='flex-1 p-6 lg:p-8'>
          <div className='mb-8 flex items-center justify-between lg:hidden'>
            <button onClick={() => setSidebarOpen(true)} className='rounded-lg p-2 text-[var(--color-dark-gray)] dark:text-zinc-400 hover:bg-[var(--color-cream)] dark:hover:bg-zinc-800'>
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)] dark:text-zinc-100'>Orders</h1>
            <div className='w-10' />
          </div>

          <div className='mb-8 hidden lg:block'>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)] dark:text-zinc-100'>My Orders</h1>
            <p className='mt-1 text-[var(--color-mid-gray)] dark:text-zinc-400'>Track and manage your orders</p>
          </div>

          <div className='mb-6 flex flex-wrap gap-2'>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-[var(--color-accent)] text-[var(--color-deep-black)]'
                    : 'bg-[var(--color-white)] dark:bg-zinc-900 text-[var(--color-dark-gray)] dark:text-zinc-300 border border-[var(--color-light-gray)] dark:border-zinc-700 hover:bg-[var(--color-cream)] dark:hover:bg-zinc-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className='overflow-x-auto rounded-xl border border-[var(--color-light-gray)] dark:border-zinc-800 bg-[var(--color-white)] dark:bg-zinc-900'>
            <table className='w-full text-sm'>
              <thead className='hidden md:table-header-group'>
                <tr className='border-b border-[var(--color-light-gray)] dark:border-zinc-800 bg-[var(--color-cream)] dark:bg-zinc-800'>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)] dark:text-zinc-200'>Order</th>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)] dark:text-zinc-200'>Date</th>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)] dark:text-zinc-200'>Status</th>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)] dark:text-zinc-200'>Total</th>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)] dark:text-zinc-200'>Items</th>
                  <th className='px-6 py-4 text-right font-medium text-[var(--color-primary)] dark:text-zinc-200'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const status = capitalizeStatus(order.status);
                  const date = order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : '—';
                  return (
                    <tr key={order._id} className='hidden md:table-row border-b border-[var(--color-light-gray)] dark:border-zinc-800 last:border-b-0 hover:bg-[var(--color-cream)] dark:hover:bg-zinc-800 transition-colors'>
                      <td className='px-6 py-4 font-medium text-[var(--color-primary)] dark:text-zinc-100'>#{order._id.toString().slice(-6).toUpperCase()}</td>
                      <td className='px-6 py-4 text-[var(--color-dark-gray)] dark:text-zinc-300'>{date}</td>
                      <td className='px-6 py-4'>
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className='px-6 py-4 font-medium text-[var(--color-primary)] dark:text-zinc-100'>Rs {order.totalPrice.toLocaleString()}</td>
                      <td className='px-6 py-4 text-[var(--color-dark-gray)] dark:text-zinc-300'>{order.items?.length || 0}</td>
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

            {filteredOrders.length > 0 && (
              <div className='block md:hidden divide-y divide-[var(--color-light-gray)] dark:divide-zinc-800'>
                {filteredOrders.map((order) => {
                  const status = capitalizeStatus(order.status);
                  const date = order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : '—';
                  return (
                    <div key={order._id} className='p-4 space-y-3'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0 flex-1'>
                          <p className='font-medium text-[var(--color-primary)] dark:text-zinc-100'>#{order._id.toString().slice(-6).toUpperCase()}</p>
                          <p className='text-sm text-[var(--color-dark-gray)] dark:text-zinc-300'>{date}</p>
                        </div>
                        <span className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      <div className='grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm'>
                        <div className='text-[var(--color-mid-gray)] dark:text-zinc-400'>Total:</div>
                        <div className='font-medium text-[var(--color-primary)] dark:text-zinc-100'>Rs {order.totalPrice.toLocaleString()}</div>
                        <div className='text-[var(--color-mid-gray)] dark:text-zinc-400'>Items:</div>
                        <div className='text-[var(--color-dark-gray)] dark:text-zinc-300'>{order.items?.length || 0}</div>
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

      {selectedOrder && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setSelectedOrder(null)} />
          <div className='relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--color-white)] dark:bg-zinc-900 p-8 shadow-xl animate-scale-in'>
            <button
              onClick={() => setSelectedOrder(null)}
              className='absolute right-4 top-4 rounded-full p-2 text-[var(--color-mid-gray)] dark:text-zinc-400 hover:bg-[var(--color-cream)] dark:hover:bg-zinc-800 transition-colors'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>

            <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)] dark:text-zinc-100'>
              Order #{selectedOrder._id.toString().slice(-6).toUpperCase()}
            </h2>
            <p className='mt-1 text-sm text-[var(--color-mid-gray)] dark:text-zinc-400'>
              Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : '—'}
            </p>

            <div className='mt-6 flex items-center gap-4'>
              <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${getStatusColor(capitalizeStatus(selectedOrder.status))}`}>
                {capitalizeStatus(selectedOrder.status)}
              </span>
              {selectedOrder.trackingNumber && (
                <span className='text-sm text-[var(--color-dark-gray)] dark:text-zinc-300'>
                  Tracking: {selectedOrder.trackingNumber}
                </span>
              )}
            </div>

            <div className='mt-8'>
              <h3 className='text-sm font-medium text-[var(--color-primary)] dark:text-zinc-200 mb-3'>Items</h3>
              <div className='space-y-3'>
                {(selectedOrder.items || []).map((product, i) => (
                  <div key={i} className='flex items-center justify-between rounded-lg bg-[var(--color-cream)] dark:bg-zinc-800 p-4'>
                    <div className='flex items-center gap-3'>
                      {product.image && (
                        <img src={product.image} alt={product.name} className='h-12 w-12 rounded-lg object-cover' />
                      )}
                      <div>
                        <p className='text-sm font-medium text-[var(--color-primary)] dark:text-zinc-100'>{product.name}</p>
                        <p className='text-xs text-[var(--color-mid-gray)] dark:text-zinc-400'>Qty: {product.quantity}</p>
                      </div>
                    </div>
                    <span className='text-sm font-medium text-[var(--color-primary)] dark:text-zinc-100'>
                      Rs {(product.price * product.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='mt-6'>
              <h3 className='text-sm font-medium text-[var(--color-primary)] dark:text-zinc-200 mb-3'>Shipping To</h3>
              <div className='rounded-lg bg-[var(--color-cream)] dark:bg-zinc-800 p-4 text-sm text-[var(--color-dark-gray)] dark:text-zinc-300'>
                {selectedOrder.user?.name && (
                  <p className='font-medium text-[var(--color-primary)] dark:text-zinc-100'>{selectedOrder.user.name}</p>
                )}
                <p>{selectedOrder.shippingAddress?.street}</p>
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}</p>
                <p>{selectedOrder.shippingAddress?.country}</p>
              </div>
            </div>

            <div className='mt-6 flex items-center justify-between rounded-lg border border-[var(--color-light-gray)] dark:border-zinc-700 p-4'>
              <span className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] dark:text-zinc-100'>Total</span>
              <span className='font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-primary)] dark:text-zinc-100'>
                Rs {selectedOrder.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
