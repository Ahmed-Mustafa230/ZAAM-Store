'use client';

import { useState } from 'react';
import Link from 'next/link';

const statsCards = [
  { label: 'Total Sales', value: 'Rs 84,250', change: '+12.5%', positive: true, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Orders', value: '342', change: '+8.2%', positive: true, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Customers', value: '1,284', change: '+18.3%', positive: true, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Products', value: '156', change: '+6', positive: true, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
];

const recentOrders = [
  { id: '#ZAAM-004832', customer: 'Alexander Blackwood', date: '2026-06-28', total: 'Rs 2,145', status: 'Delivered' },
  { id: '#ZAAM-004831', customer: 'Victoria Laurent', date: '2026-06-27', total: 'Rs 4,890', status: 'Shipped' },
  { id: '#ZAAM-004830', customer: 'Marcus Chen', date: '2026-06-27', total: 'Rs 1,295', status: 'Processing' },
  { id: '#ZAAM-004829', customer: 'Isabella Rossi', date: '2026-06-26', total: 'Rs 3,200', status: 'Pending' },
  { id: '#ZAAM-004828', customer: 'James Harrington', date: '2026-06-26', total: 'Rs 895', status: 'Delivered' },
];

const topProducts = [
  { name: 'Classic Fit Wool Blazer', sales: 89, revenue: 'Rs 115,355' },
  { name: 'Italian Leather Derby Shoes', sales: 72, revenue: 'Rs 64,440' },
  { name: 'Cashmere Turtleneck Sweater', sales: 54, revenue: 'Rs 78,300' },
  { name: 'Silk Evening Gown', sales: 41, revenue: 'Rs 131,200' },
  { name: 'Double-Breasted Wool Coat', sales: 38, revenue: 'Rs 72,010' },
];

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Customers', href: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen bg-[var(--color-off-white)] font-[family-name:var(--font-body)]'>
      <div className='flex'>
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-white)] border-r border-[var(--color-light-gray)] transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className='p-6 border-b border-[var(--color-light-gray)]'>
            <Link href='/admin' className='font-[family-name:var(--font-heading)] text-xl font-bold gold-gradient'>
              ZAAM Admin
            </Link>
          </div>
          <nav className='px-3 py-4'>
            {sidebarLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors mb-0.5 ${
                  link.href === '/admin'
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium'
                    : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                }`}
              >
                <svg className='h-5 w-5 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d={link.icon} />
                </svg>
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {sidebarOpen && <div className='fixed inset-0 z-30 bg-black/50 lg:hidden' onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <div className='flex-1 p-6 lg:p-8'>
          <div className='mb-8 flex items-center justify-between lg:hidden'>
            <button onClick={() => setSidebarOpen(true)} className='rounded-lg p-2 text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'>
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>Dashboard</h1>
            <div className='w-10' />
          </div>

          <div className='mb-8 hidden lg:block'>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>Admin Dashboard</h1>
            <p className='mt-1 text-[var(--color-mid-gray)]'>Welcome back, Admin. Here is your store overview.</p>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {statsCards.map((card) => (
              <div key={card.label} className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6 transition-all hover:shadow-md'>
                <div className='flex items-center justify-between'>
                  <div className='rounded-lg bg-[var(--color-accent)]/10 p-3'>
                    <svg className='h-6 w-6 text-[var(--color-accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d={card.icon} />
                    </svg>
                  </div>
                  <span className={`text-xs font-medium ${card.positive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                    {card.change}
                  </span>
                </div>
                <p className='mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-[var(--color-primary)]'>{card.value}</p>
                <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>{card.label}</p>
              </div>
            ))}
          </div>

          {/* Chart Placeholder */}
          <div className='mt-8 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
            <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Revenue Overview</h2>
            <div className='mt-6 flex items-end gap-2 h-48'>
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                <div key={i} className='flex-1 flex flex-col items-center gap-1'>
                  <div
                    className='w-full rounded-t-md bg-gradient-to-t from-[var(--color-accent-dark)] to-[var(--color-accent)] transition-all hover:opacity-80'
                    style={{ height: `${h}%` }}
                  />
                  <span className='text-[10px] text-[var(--color-mid-gray)]'>
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders & Top Products */}
          <div className='mt-8 grid gap-8 lg:grid-cols-2'>
            <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Recent Orders</h2>
                <Link href='/admin/orders' className='text-sm text-[var(--color-accent)] hover:underline'>View All</Link>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-[var(--color-light-gray)]'>
                      <th className='px-4 py-3 text-left font-medium text-[var(--color-primary)]'>Order</th>
                      <th className='px-4 py-3 text-left font-medium text-[var(--color-primary)]'>Customer</th>
                      <th className='px-4 py-3 text-left font-medium text-[var(--color-primary)]'>Status</th>
                      <th className='px-4 py-3 text-right font-medium text-[var(--color-primary)]'>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className='border-b border-[var(--color-light-gray)] last:border-b-0 hover:bg-[var(--color-cream)] transition-colors'>
                        <td className='px-4 py-3 font-medium text-[var(--color-primary)]'>{order.id}</td>
                        <td className='px-4 py-3 text-[var(--color-dark-gray)]'>{order.customer}</td>
                        <td className='px-4 py-3'>
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            order.status === 'Delivered' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' :
                            order.status === 'Shipped' ? 'bg-[var(--color-info)]/10 text-[var(--color-info)]' :
                            order.status === 'Processing' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' :
                            'bg-[var(--color-mid-gray)]/10 text-[var(--color-mid-gray)]'
                          }`}>{order.status}</span>
                        </td>
                        <td className='px-4 py-3 text-right font-medium text-[var(--color-primary)]'>{order.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
              <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] mb-4'>Top Selling Products</h2>
              <div className='space-y-4'>
                {topProducts.map((product, i) => (
                  <div key={i} className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <span className='flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-xs font-bold text-[var(--color-accent)]'>
                        {i + 1}
                      </span>
                      <div>
                        <p className='text-sm font-medium text-[var(--color-primary)]'>{product.name}</p>
                        <p className='text-xs text-[var(--color-mid-gray)]'>{product.sales} sales</p>
                      </div>
                    </div>
                    <span className='text-sm font-medium text-[var(--color-primary)]'>{product.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='mt-8 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
            <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] mb-4'>Quick Actions</h2>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
              <Link href='/admin/products' className='flex flex-col items-center gap-2 rounded-lg border border-[var(--color-light-gray)] p-4 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                <svg className='h-5 w-5 text-[var(--color-accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M12 4v16m8-8H4' />
                </svg>
                Add Product
              </Link>
              <Link href='/admin/coupons' className='flex flex-col items-center gap-2 rounded-lg border border-[var(--color-light-gray)] p-4 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                <svg className='h-5 w-5 text-[var(--color-accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' />
                </svg>
                New Coupon
              </Link>
              <Link href='/admin/analytics' className='flex flex-col items-center gap-2 rounded-lg border border-[var(--color-light-gray)] p-4 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                <svg className='h-5 w-5 text-[var(--color-accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                </svg>
                View Reports
              </Link>
              <Link href='/admin/orders' className='flex flex-col items-center gap-2 rounded-lg border border-[var(--color-light-gray)] p-4 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                <svg className='h-5 w-5 text-[var(--color-accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                </svg>
                Manage Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
