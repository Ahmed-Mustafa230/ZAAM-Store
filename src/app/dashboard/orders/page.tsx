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
  isPaid: boolean;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  itemsPrice?: number;
  taxPrice?: number;
  shippingPrice?: number;
  discountAmount?: number;
  trackingNumber?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentScreenshot?: string;
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
  const [cancelling, setCancelling] = useState(false);

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

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await axios.put(`/api/orders/${selectedOrder._id}`, { status: 'cancelled' });
      setAllOrders(prev =>
        prev.map(o => o._id === selectedOrder._id ? { ...o, status: 'cancelled' } : o)
      );
      setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
    } catch {
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
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

            {/* Order Timeline */}
            <div className='mt-6'>
              <h3 className='text-sm font-medium text-[var(--color-primary)] dark:text-zinc-200 mb-4'>Order Timeline</h3>
              <div className='space-y-0'>
                {[
                  { status: 'pending', label: 'Order Placed' },
                  { status: 'confirmed', label: 'Order Confirmed' },
                  { status: 'processing', label: 'Processing' },
                  { status: 'shipped', label: 'Shipped' },
                  { status: 'delivered', label: 'Delivered' },
                ].map((step, i) => {
                  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
                  const currentIdx = orderStatuses.indexOf(selectedOrder.status);
                  const stepIdx = orderStatuses.indexOf(step.status);
                  const isCompleted = currentIdx >= stepIdx && !['cancelled', 'refunded'].includes(selectedOrder.status);
                  const isCurrent = selectedOrder.status === step.status;
                  const isCancelledOrRefunded = ['cancelled', 'refunded'].includes(selectedOrder.status);
                  return (
                    <div key={step.status} className='flex items-start gap-3'>
                      <div className='flex flex-col items-center'>
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                          isCancelledOrRefunded
                            ? 'border-[var(--color-error)] text-[var(--color-error)]'
                            : isCompleted
                            ? 'border-[var(--color-success)] bg-[var(--color-success)] text-white'
                            : isCurrent
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-deep-black)]'
                            : 'border-[var(--color-light-gray)] text-[var(--color-mid-gray)]'
                        }`}>
                          {isCompleted ? (
                            <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M5 13l4 4L19 7' />
                            </svg>
                          ) : (
                            i + 1
                          )}
                        </div>
                        {i < 4 && <div className={`h-6 w-px ${isCompleted && !isCancelledOrRefunded ? 'bg-[var(--color-success)]' : 'bg-[var(--color-light-gray)]'}`} />}
                      </div>
                      <div className={`pb-6 text-sm ${isCompleted || isCurrent ? 'text-[var(--color-primary)]' : 'text-[var(--color-mid-gray)]'}`}>
                        <p className='font-medium'>{step.label}</p>
                      </div>
                    </div>
                  );
                })}
                {['cancelled', 'refunded'].includes(selectedOrder.status) && (
                  <div className='flex items-start gap-3'>
                    <div className='flex flex-col items-center'>
                      <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-error)] bg-[var(--color-error)] text-white text-xs font-bold'>
                        <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </div>
                    </div>
                    <div className='pb-6 text-sm text-[var(--color-error)]'>
                      <p className='font-medium'>Order {selectedOrder.status === 'cancelled' ? 'Cancelled' : 'Refunded'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='flex items-center gap-4 mb-6'>
              <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${getStatusColor(capitalizeStatus(selectedOrder.status))}`}>
                {capitalizeStatus(selectedOrder.status)}
              </span>
              {selectedOrder.trackingNumber && (
                <span className='text-sm text-[var(--color-dark-gray)] dark:text-zinc-300'>
                  Tracking: {selectedOrder.trackingNumber}
                </span>
              )}
            </div>

            {/* Items */}
            <div className='mt-6'>
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

            {/* Shipping To */}
            <div className='mt-6'>
              <h3 className='text-sm font-medium text-[var(--color-primary)] dark:text-zinc-200 mb-3'>Shipping To</h3>
              <div className='rounded-lg bg-[var(--color-cream)] dark:bg-zinc-800 p-4 text-sm text-[var(--color-dark-gray)] dark:text-zinc-300'>
                {selectedOrder.shippingAddress?.firstName && (
                  <p className='font-medium text-[var(--color-primary)] dark:text-zinc-100'>
                    {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName || ''}
                  </p>
                )}
                {!selectedOrder.shippingAddress?.firstName && selectedOrder.user?.name && (
                  <p className='font-medium text-[var(--color-primary)] dark:text-zinc-100'>{selectedOrder.user.name}</p>
                )}
                <p>{selectedOrder.shippingAddress?.street}</p>
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}</p>
                <p>{selectedOrder.shippingAddress?.country}</p>
                {selectedOrder.shippingAddress?.phone && (
                  <p className='mt-1 text-[var(--color-mid-gray)] dark:text-zinc-400'>{selectedOrder.shippingAddress.phone}</p>
                )}
                {selectedOrder.shippingAddress?.email && (
                  <p className='text-[var(--color-mid-gray)] dark:text-zinc-400'>{selectedOrder.shippingAddress.email}</p>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className='mt-6'>
              <h3 className='text-sm font-medium text-[var(--color-primary)] dark:text-zinc-200 mb-3'>Payment</h3>
              <div className='rounded-lg bg-[var(--color-cream)] dark:bg-zinc-800 p-4 text-sm text-[var(--color-dark-gray)] dark:text-zinc-300 space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-[var(--color-mid-gray)] dark:text-zinc-400'>Method</span>
                  <span className='font-medium capitalize'>{selectedOrder.paymentMethod?.replace('_', ' ') || '—'}</span>
                </div>
                {selectedOrder.transactionId && (
                  <div className='flex justify-between'>
                    <span className='text-[var(--color-mid-gray)] dark:text-zinc-400'>Transaction ID</span>
                    <span className='font-mono font-medium'>{selectedOrder.transactionId}</span>
                  </div>
                )}
                {selectedOrder.paymentScreenshot && (
                  <div>
                    <span className='text-[var(--color-mid-gray)] dark:text-zinc-400 text-xs'>Payment Screenshot</span>
                    <div className='mt-2'>
                      <a href={selectedOrder.paymentScreenshot} target='_blank' rel='noopener noreferrer'>
                        <img src={selectedOrder.paymentScreenshot} alt='Payment screenshot' className='h-32 w-48 rounded-lg border border-[var(--color-light-gray)] object-cover hover:opacity-80 transition-opacity' />
                      </a>
                    </div>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-[var(--color-mid-gray)] dark:text-zinc-400'>Paid</span>
                  <span className={`font-medium ${selectedOrder.isPaid ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                    {selectedOrder.isPaid ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className='mt-6 space-y-2 rounded-lg border border-[var(--color-light-gray)] dark:border-zinc-700 p-4'>
              <div className='flex justify-between text-sm'>
                <span className='text-[var(--color-mid-gray)] dark:text-zinc-400'>Subtotal</span>
                <span className='font-medium text-[var(--color-primary)] dark:text-zinc-100'>Rs {selectedOrder.itemsPrice?.toLocaleString() || selectedOrder.totalPrice.toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-[var(--color-mid-gray)] dark:text-zinc-400'>Shipping</span>
                <span className='font-medium text-[var(--color-primary)] dark:text-zinc-100'>{selectedOrder.shippingPrice === 0 ? 'Free' : `Rs ${selectedOrder.shippingPrice?.toLocaleString() || '0'}`}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-[var(--color-mid-gray)] dark:text-zinc-400'>Tax</span>
                <span className='font-medium text-[var(--color-primary)] dark:text-zinc-100'>Rs {selectedOrder.taxPrice?.toLocaleString() || '0'}</span>
              </div>
              <div className='flex justify-between border-t border-[var(--color-light-gray)] dark:border-zinc-700 pt-2'>
                <span className='font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--color-primary)] dark:text-zinc-100'>Grand Total</span>
                <span className='font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-primary)] dark:text-zinc-100'>
                  Rs {((selectedOrder.itemsPrice || 0) + (selectedOrder.shippingPrice || 0) + (selectedOrder.taxPrice || 0)).toLocaleString()}
                </span>
              </div>
              {selectedOrder.discountAmount ? (
                <div className='flex justify-between text-sm'>
                  <span className='text-[var(--color-success)] dark:text-emerald-400'>Discount</span>
                  <span className='font-medium text-[var(--color-success)] dark:text-emerald-400'>-Rs {selectedOrder.discountAmount.toLocaleString()}</span>
                </div>
              ) : null}
              <div className='flex justify-between border-t border-[var(--color-light-gray)] dark:border-zinc-700 pt-2'>
                <span className='font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--color-primary)] dark:text-zinc-100'>Total Payable</span>
                <span className='font-[family-name:var(--font-heading)] text-xl font-bold text-[var(--color-primary)] dark:text-zinc-100'>
                  Rs {selectedOrder.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Cancel Order */}
            {['pending', 'confirmed'].includes(selectedOrder.status) && (
              <div className='mt-6 pt-4 border-t border-[var(--color-light-gray)] dark:border-zinc-700'>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className='w-full rounded-lg border-2 border-[var(--color-error)] px-6 py-3 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
                <p className='mt-2 text-xs text-[var(--color-mid-gray)] dark:text-zinc-400 text-center'>
                  You can cancel this order within the pending or confirmed status.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
