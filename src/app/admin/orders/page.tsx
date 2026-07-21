'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface OrderItem {
  product: { _id: string; name: string; images: { secure_url: string }[] };
  name: string;
  quantity: number;
  price: number;
  image: string;
  size: string;
  color: string;
}

interface OrderType {
  _id: string;
  user: { _id: string; name: string; email: string };
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdAt: string;
  isPaid: boolean;
  isDelivered: boolean;
  shippingAddress: {
    street: string; city: string; state: string; zip: string; country: string;
  };
  paymentMethod: string;
  trackingNumber: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  discountAmount: number;
  couponApplied: string;
}

interface Pagination {
  page: number; limit: number; total: number; totalPages: number;
  hasNextPage: boolean; hasPrevPage: boolean;
}

const statuses = ['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Users', href: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({ all: 'true', page: String(page), limit: '15' });
    if (selectedStatus !== 'All') params.set('status', selectedStatus);
    if (search.trim()) params.set('search', search.trim());
    fetch(`/api/orders?${params}`)
      .then((res) => {
        if (!res.ok) return res.json().then((body) => { throw new Error(body.message || `Request failed (${res.status})`); });
        return res.json();
      })
      .then((json) => {
        if (ignore) return;
        setOrders(json.orders);
        setPagination(json.pagination);
        setError(null);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setError(err instanceof Error ? err.message : 'Failed to load orders.');
        setOrders([]);
      })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [page, selectedStatus, search]);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ all: 'true', page: String(page), limit: '15' });
    if (selectedStatus !== 'All') params.set('status', selectedStatus);
    if (search.trim()) params.set('search', search.trim());
    fetch(`/api/orders?${params}`)
      .then((res) => {
        if (!res.ok) return res.json().then((body) => { throw new Error(body.message || `Request failed (${res.status})`); });
        return res.json();
      })
      .then((json) => {
        setOrders(json.orders);
        setPagination(json.pagination);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load orders.');
      })
      .finally(() => setLoading(false));
  }, [page, selectedStatus, search]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.message && !json.order) throw new Error(json.message);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-[var(--color-success)]/10 text-[var(--color-success)]';
      case 'shipped': return 'bg-[var(--color-info)]/10 text-[var(--color-info)]';
      case 'processing': case 'confirmed': return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]';
      case 'cancelled': case 'refunded': return 'bg-[var(--color-error)]/10 text-[var(--color-error)]';
      default: return 'bg-[var(--color-mid-gray)]/10 text-[var(--color-mid-gray)]';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className='min-h-screen bg-[var(--color-off-white)] font-[family-name:var(--font-body)]'>
      <div className='flex'>
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-white)] border-r border-[var(--color-light-gray)] transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className='p-6 border-b border-[var(--color-light-gray)]'>
            <Link href='/admin' className='font-[family-name:var(--font-heading)] text-xl font-bold gold-gradient'>ZAAM Admin</Link>
          </div>
          <nav className='px-3 py-4'>
            {sidebarLinks.map((link) => (
              <Link key={link.label} href={link.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors mb-0.5 ${
                  link.href === '/admin/orders' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                }`}>
                <svg className='h-5 w-5 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d={link.icon} />
                </svg>
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {sidebarOpen && <div className='fixed inset-0 z-30 bg-black/50 lg:hidden' onClick={() => setSidebarOpen(false)} />}

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
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>Orders</h1>
            <p className='mt-1 text-[var(--color-mid-gray)]'>Manage customer orders</p>
          </div>

          <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex flex-wrap gap-2'>
              {statuses.map((s) => (
                <button key={s} onClick={() => { setSelectedStatus(s); setPage(1); }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedStatus === s ? 'bg-[var(--color-accent)] text-[var(--color-deep-black)]' : 'bg-[var(--color-white)] border border-[var(--color-light-gray)] text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                  }`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
              ))}
            </div>
            <form onSubmit={handleSearch} className='relative max-w-xs w-full'>
              <svg className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-mid-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
              <input type='text' placeholder='Search customers...' value={search} onChange={(e) => setSearch(e.target.value)}
                className='w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] pl-10 pr-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
            </form>
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <div className='animate-spin h-10 w-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full' />
            </div>
          ) : error ? (
            <div className='text-center py-20'>
              <p className='text-[var(--color-error)] font-medium'>{error}</p>
              <button onClick={fetchOrders} className='mt-4 gold-button px-4 py-2 text-sm'>Retry</button>
            </div>
          ) : (
            <>
              <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)]'>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead className='hidden md:table-header-group'>
                      <tr className='border-b border-[var(--color-light-gray)] bg-[var(--color-cream)]'>
                        <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Order</th>
                        <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Customer</th>
                        <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Date</th>
                        <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Status</th>
                        <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Total</th>
                        <th className='px-6 py-4 text-right font-medium text-[var(--color-primary)]'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr><td colSpan={6} className='px-6 py-12 text-center text-[var(--color-mid-gray)]'>No orders found.</td></tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order._id} className='hidden md:table-row border-b border-[var(--color-light-gray)] last:border-b-0 hover:bg-[var(--color-cream)] transition-colors'>
                          <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>
                            #ZAAM-{String(order._id).slice(-6).toUpperCase()}
                          </td>
                          <td className='px-6 py-4'>
                            <div>
                              <p className='font-medium text-[var(--color-primary)]'>{order.user?.name || 'Unknown'}</p>
                              <p className='text-xs text-[var(--color-mid-gray)]'>{order.user?.email || ''}</p>
                            </div>
                          </td>
                          <td className='px-6 py-4 text-[var(--color-dark-gray)]'>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className='px-6 py-4'>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              disabled={updatingId === order._id}
                              className={`rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-[var(--color-accent)] ${getStatusColor(order.status)}`}
                            >
                              {statuses.filter((s) => s !== 'All').map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                          <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>
                            Rs {order.totalPrice.toLocaleString()}
                          </td>
                          <td className='px-6 py-4 text-right'>
                            <button onClick={() => setSelectedOrder(order)}
                              className='text-sm text-[var(--color-accent)] hover:underline'>
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                </div>
                {/* Mobile Cards */}
                {orders.length > 0 && (
                  <div className='block md:hidden divide-y divide-[var(--color-light-gray)]'>
                    {orders.map((order) => (
                      <div key={order._id} className='p-4 space-y-3'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='min-w-0 flex-1'>
                            <p className='font-medium text-[var(--color-primary)] text-sm'>
                              #ZAAM-{String(order._id).slice(-6).toUpperCase()}
                            </p>
                            <p className='text-sm text-[var(--color-dark-gray)] truncate'>{order.user?.name || 'Unknown'}</p>
                          </div>
                          <button onClick={() => setSelectedOrder(order)}
                            className='shrink-0 text-sm text-[var(--color-accent)] hover:underline'>
                            View Details
                          </button>
                        </div>
                        <div className='grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm'>
                          <div className='text-[var(--color-mid-gray)]'>Email:</div>
                          <div className='text-[var(--color-dark-gray)] truncate'>{order.user?.email || ''}</div>
                          <div className='text-[var(--color-mid-gray)]'>Date:</div>
                          <div className='text-[var(--color-dark-gray)]'>{new Date(order.createdAt).toLocaleDateString()}</div>
                          <div className='text-[var(--color-mid-gray)]'>Status:</div>
                          <div>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              disabled={updatingId === order._id}
                              className={`rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-[var(--color-accent)] ${getStatusColor(order.status)}`}
                            >
                              {statuses.filter((s) => s !== 'All').map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                          <div className='text-[var(--color-mid-gray)]'>Total:</div>
                          <div className='font-medium text-[var(--color-primary)]'>Rs {order.totalPrice.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className='mt-6 flex items-center justify-between'>
                  <p className='text-sm text-[var(--color-mid-gray)]'>
                    Showing {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </p>
                  <div className='flex gap-2'>
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage}
                      className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed'>
                      Previous
                    </button>
                    <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage}
                      className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed'>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setSelectedOrder(null)} />
          <div className='relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--color-white)] p-8 shadow-xl animate-scale-in'>
            <button onClick={() => setSelectedOrder(null)}
              className='absolute right-4 top-4 rounded-full p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] transition-colors'>
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
            <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]'>
              #ZAAM-{String(selectedOrder._id).slice(-6).toUpperCase()}
            </h2>
            <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
              Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
            </p>
            <div className='mt-6 space-y-4'>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Customer</span>
                <span className='text-sm font-medium text-[var(--color-primary)]'>{selectedOrder.user?.name || 'Unknown'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Email</span>
                <span className='text-sm font-medium text-[var(--color-primary)]'>{selectedOrder.user?.email || ''}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Items</span>
                <span className='text-sm font-medium text-[var(--color-primary)]'>{selectedOrder.items.length}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Status</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Payment</span>
                <span className='text-sm font-medium text-[var(--color-primary)]'>{selectedOrder.paymentMethod}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Paid</span>
                <span className={`text-sm font-medium ${selectedOrder.isPaid ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                  {selectedOrder.isPaid ? 'Yes' : 'No'}
                </span>
              </div>
              {selectedOrder.trackingNumber && (
                <div className='flex justify-between'>
                  <span className='text-sm text-[var(--color-mid-gray)]'>Tracking</span>
                  <span className='text-sm font-medium text-[var(--color-primary)]'>{selectedOrder.trackingNumber}</span>
                </div>
              )}
              <div className='border-t border-[var(--color-light-gray)] pt-4 space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-[var(--color-mid-gray)]'>Subtotal</span>
                  <span className='font-medium text-[var(--color-primary)]'>Rs {selectedOrder.itemsPrice.toLocaleString()}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-[var(--color-mid-gray)]'>Shipping</span>
                  <span className='font-medium text-[var(--color-primary)]'>Rs {selectedOrder.shippingPrice.toLocaleString()}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-[var(--color-mid-gray)]'>Tax</span>
                  <span className='font-medium text-[var(--color-primary)]'>Rs {selectedOrder.taxPrice.toLocaleString()}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-[var(--color-mid-gray)]'>Discount</span>
                    <span className='font-medium text-[var(--color-success)]'>-Rs {selectedOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className='flex justify-between border-t border-[var(--color-light-gray)] pt-4'>
                  <span className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Total</span>
                  <span className='font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-primary)]'>
                    Rs {selectedOrder.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
