'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: 'Delivered' | 'Shipped' | 'Processing' | 'Pending' | 'Cancelled';
  items: number;
  email: string;
}

const allOrders: Order[] = [
  { id: '#ZAAM-004832', customer: 'Alexander Blackwood', date: '2026-06-28', total: 2145, status: 'Delivered', items: 3, email: 'alex@blackwood.com' },
  { id: '#ZAAM-004831', customer: 'Victoria Laurent', date: '2026-06-27', total: 4890, status: 'Shipped', items: 2, email: 'victoria@laurent.com' },
  { id: '#ZAAM-004830', customer: 'Marcus Chen', date: '2026-06-27', total: 1295, status: 'Processing', items: 1, email: 'marcus@chen.com' },
  { id: '#ZAAM-004829', customer: 'Isabella Rossi', date: '2026-06-26', total: 3200, status: 'Pending', items: 1, email: 'isabella@rossi.com' },
  { id: '#ZAAM-004828', customer: 'James Harrington', date: '2026-06-26', total: 895, status: 'Delivered', items: 1, email: 'james@harrington.com' },
  { id: '#ZAAM-004827', customer: 'Sophia Kim', date: '2026-06-25', total: 4500, status: 'Processing', items: 3, email: 'sophia@kim.com' },
  { id: '#ZAAM-004826', customer: 'Oliver Grant', date: '2026-06-24', total: 2150, status: 'Cancelled', items: 1, email: 'oliver@grant.com' },
  { id: '#ZAAM-004825', customer: 'Charlotte Dubois', date: '2026-06-23', total: 1750, status: 'Delivered', items: 2, email: 'charlotte@dubois.com' },
];

const statuses = ['All', 'Delivered', 'Shipped', 'Processing', 'Pending', 'Cancelled'];

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Customers', href: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(allOrders);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = selectedStatus === 'All' ? orders : orders.filter(o => o.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-[var(--color-success)]/10 text-[var(--color-success)]';
      case 'Shipped': return 'bg-[var(--color-info)]/10 text-[var(--color-info)]';
      case 'Processing': return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]';
      case 'Cancelled': return 'bg-[var(--color-error)]/10 text-[var(--color-error)]';
      case 'Pending': return 'bg-[var(--color-mid-gray)]/10 text-[var(--color-mid-gray)]';
      default: return '';
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
    ));
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

          <div className='mb-6 flex flex-wrap gap-2'>
            {statuses.map((s) => (
              <button key={s} onClick={() => setSelectedStatus(s)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedStatus === s ? 'bg-[var(--color-accent)] text-[var(--color-deep-black)]' : 'bg-[var(--color-white)] border border-[var(--color-light-gray)] text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                }`}>{s}</button>
            ))}
          </div>

          <div className='overflow-x-auto rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)]'>
            <table className='w-full text-sm'>
              <thead>
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
                {filtered.map((order) => (
                  <tr key={order.id} className='border-b border-[var(--color-light-gray)] last:border-b-0 hover:bg-[var(--color-cream)] transition-colors'>
                    <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>{order.id}</td>
                    <td className='px-6 py-4'>
                      <div>
                        <p className='font-medium text-[var(--color-primary)]'>{order.customer}</p>
                        <p className='text-xs text-[var(--color-mid-gray)]'>{order.email}</p>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-[var(--color-dark-gray)]'>{order.date}</td>
                    <td className='px-6 py-4'>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-[var(--color-accent)] ${getStatusColor(order.status)}`}
                      >
                        {statuses.filter(s => s !== 'All').map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>Rs {order.total.toLocaleString()}</td>
                    <td className='px-6 py-4 text-right'>
                      <button onClick={() => setSelectedOrder(order)}
                        className='text-sm text-[var(--color-accent)] hover:underline'>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
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
            <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]'>{selectedOrder.id}</h2>
            <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>Placed on {selectedOrder.date}</p>
            <div className='mt-6 space-y-4'>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Customer</span>
                <span className='text-sm font-medium text-[var(--color-primary)]'>{selectedOrder.customer}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Email</span>
                <span className='text-sm font-medium text-[var(--color-primary)]'>{selectedOrder.email}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Items</span>
                <span className='text-sm font-medium text-[var(--color-primary)]'>{selectedOrder.items}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Status</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className='flex justify-between border-t border-[var(--color-light-gray)] pt-4'>
                <span className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Total</span>
                <span className='font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-primary)]'>
                  Rs {selectedOrder.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
