'use client';

import { useState } from 'react';
import Link from 'next/link';

const statsCards = [
  { label: 'Total Orders', value: '12', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', change: '+2 this month', positive: true },
  { label: 'Wishlist Items', value: '8', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', change: '3 saved', positive: true },
  { label: 'Addresses', value: '3', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', change: '1 default', positive: true },
  { label: 'Total Spent', value: 'Rs 8,430', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', change: 'Lifetime', positive: true },
];

const recentOrders = [
  { id: '#ZAAM-004832', date: '2026-06-28', status: 'Delivered', total: 'Rs 2,145', items: 3 },
  { id: '#ZAAM-004701', date: '2026-06-15', status: 'Shipped', total: 'Rs 895', items: 1 },
  { id: '#ZAAM-004589', date: '2026-05-30', status: 'Processing', total: 'Rs 3,450', items: 2 },
  { id: '#ZAAM-004412', date: '2026-05-12', status: 'Delivered', total: 'Rs 1,290', items: 1 },
  { id: '#ZAAM-004398', date: '2026-04-28', status: 'Cancelled', total: 'Rs 520', items: 1 },
];

const quickActions = [
  { label: 'Browse Products', href: '/products', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { label: 'View Orders', href: '/dashboard/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Edit Profile', href: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Manage Addresses', href: '/dashboard/addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  { label: 'Wishlist', href: '/wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { label: 'Settings', href: '#', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const sidebarLinks = [
  { label: 'Overview', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Orders', href: '/dashboard/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Profile', href: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Addresses', href: '/dashboard/addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  { label: 'Wishlist', href: '/wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { label: 'Settings', href: '#', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-[var(--color-success)]/10 text-[var(--color-success)]';
      case 'Shipped': return 'bg-[var(--color-info)]/10 text-[var(--color-info)]';
      case 'Processing': return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]';
      case 'Cancelled': return 'bg-[var(--color-error)]/10 text-[var(--color-error)]';
      default: return 'bg-[var(--color-mid-gray)]/10 text-[var(--color-mid-gray)]';
    }
  };

  return (
    <div className='min-h-screen bg-[var(--color-off-white)] font-[family-name:var(--font-body)]'>
      <div className='flex'>
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-white)] border-r border-[var(--color-light-gray)] transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className='p-6'>
            <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
              My Account
            </h2>
          </div>
          <nav className='px-3 pb-6'>
            {sidebarLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                  link.href === '/dashboard'
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

        {/* Overlay */}
        {sidebarOpen && (
          <div className='fixed inset-0 z-30 bg-black/50 lg:hidden' onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className='flex-1 p-6 lg:p-8'>
          {/* Mobile Header */}
          <div className='mb-8 flex items-center justify-between lg:hidden'>
            <button onClick={() => setSidebarOpen(true)} className='rounded-lg p-2 text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'>
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>Dashboard</h1>
            <div className='w-10' />
          </div>

          {/* Header */}
          <div className='mb-8 hidden lg:block'>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>
              Welcome back, Alexander
            </h1>
            <p className='mt-1 text-[var(--color-mid-gray)]'>
              Here is an overview of your account
            </p>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {statsCards.map((card) => (
              <div key={card.label} className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6 transition-all hover:shadow-md'>
                <div className='flex items-center justify-between'>
                  <div className='rounded-lg bg-[var(--color-accent)]/10 p-3'>
                    <svg className='h-6 w-6 text-[var(--color-accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d={card.icon} />
                    </svg>
                  </div>
                </div>
                <p className='mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-[var(--color-primary)]'>
                  {card.value}
                </p>
                <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>{card.label}</p>
                <p className={`mt-1 text-xs ${card.positive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                  {card.change}
                </p>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className='mt-8'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
                Recent Orders
              </h2>
              <Link href='/dashboard/orders' className='text-sm text-[var(--color-accent)] hover:underline'>
                View All
              </Link>
            </div>
            <div className='overflow-x-auto rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)]'>
              <table className='w-full text-sm'>
                <thead className='hidden md:table-header-group'>
                  <tr className='border-b border-[var(--color-light-gray)] bg-[var(--color-cream)]'>
                    <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Order</th>
                    <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Date</th>
                    <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Status</th>
                    <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Total</th>
                    <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Items</th>
                    <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className='hidden md:table-row border-b border-[var(--color-light-gray)] last:border-b-0 hover:bg-[var(--color-cream)] transition-colors'>
                      <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>{order.id}</td>
                      <td className='px-6 py-4 text-[var(--color-dark-gray)]'>{order.date}</td>
                      <td className='px-6 py-4'>
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>{order.total}</td>
                      <td className='px-6 py-4 text-[var(--color-dark-gray)]'>{order.items}</td>
                      <td className='px-6 py-4'>
                        <Link href={`/dashboard/orders?order=${order.id}`} className='text-sm text-[var(--color-accent)] hover:underline'>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              {recentOrders.length > 0 && (
                <div className='block md:hidden divide-y divide-[var(--color-light-gray)]'>
                  {recentOrders.map((order) => (
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
                        <div className='font-medium text-[var(--color-primary)]'>{order.total}</div>
                        <div className='text-[var(--color-mid-gray)]'>Items:</div>
                        <div className='text-[var(--color-dark-gray)]'>{order.items}</div>
                      </div>
                      <Link href={`/dashboard/orders?order=${order.id}`} className='inline-block text-sm font-medium text-[var(--color-accent)] hover:underline'>
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className='mt-8'>
            <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)] mb-4'>
              Quick Actions
            </h2>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className='flex flex-col items-center gap-3 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6 text-center transition-all hover:shadow-md hover:-translate-y-0.5'
                >
                  <div className='rounded-lg bg-[var(--color-accent)]/10 p-3'>
                    <svg className='h-5 w-5 text-[var(--color-accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d={action.icon} />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-[var(--color-primary)]'>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
