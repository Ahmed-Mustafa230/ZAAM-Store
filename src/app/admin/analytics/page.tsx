'use client';

import { useState } from 'react';
import Link from 'next/link';

const overviewCards = [
  { label: 'Total Revenue', value: 'Rs 284,250', change: '+18.2%', positive: true, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Avg. Order Value', value: 'Rs 832', change: '+5.4%', positive: true, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { label: 'Conversion Rate', value: '3.8%', change: '+0.6%', positive: true, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { label: 'Active Customers', value: '892', change: '+12.4%', positive: true, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
];

const monthlyRevenue = [
  { month: 'Jan', revenue: 18500, orders: 42 },
  { month: 'Feb', revenue: 22300, orders: 55 },
  { month: 'Mar', revenue: 19800, orders: 48 },
  { month: 'Apr', revenue: 28500, orders: 62 },
  { month: 'May', revenue: 24200, orders: 58 },
  { month: 'Jun', revenue: 31800, orders: 71 },
  { month: 'Jul', revenue: 27500, orders: 65 },
  { month: 'Aug', revenue: 29200, orders: 68 },
  { month: 'Sep', revenue: 33500, orders: 79 },
  { month: 'Oct', revenue: 30100, orders: 73 },
  { month: 'Nov', revenue: 36500, orders: 85 },
  { month: 'Dec', revenue: 42350, orders: 98 },
];

const topProducts = [
  { name: 'Classic Fit Wool Blazer', sales: 89, revenue: 115355, growth: '+12%' },
  { name: 'Italian Leather Derby Shoes', sales: 72, revenue: 64440, growth: '+8%' },
  { name: 'Cashmere Turtleneck Sweater', sales: 54, revenue: 78300, growth: '+15%' },
  { name: 'Silk Evening Gown', sales: 41, revenue: 131200, growth: '+22%' },
  { name: 'Double-Breasted Wool Coat', sales: 38, revenue: 72010, growth: '+6%' },
];

const categoryBreakdown = [
  { category: 'Blazers', percentage: 25, revenue: 71062 },
  { category: 'Shoes', percentage: 20, revenue: 56850 },
  { category: 'Knitwear', percentage: 18, revenue: 51165 },
  { category: 'Accessories', percentage: 15, revenue: 42637 },
  { category: 'Outerwear', percentage: 12, revenue: 34110 },
  { category: 'Other', percentage: 10, revenue: 28426 },
];

const monthlyGrowth = [
  { month: 'Jan', customers: 45 },
  { month: 'Feb', customers: 52 },
  { month: 'Mar', customers: 48 },
  { month: 'Apr', customers: 68 },
  { month: 'May', customers: 55 },
  { month: 'Jun', customers: 72 },
  { month: 'Jul', customers: 61 },
  { month: 'Aug', customers: 78 },
  { month: 'Sep', customers: 85 },
  { month: 'Oct', customers: 70 },
  { month: 'Nov', customers: 92 },
  { month: 'Dec', customers: 105 },
];

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Customers', href: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function AdminAnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
  const maxCustomers = Math.max(...monthlyGrowth.map(m => m.customers));

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
                  link.href === '/admin/analytics' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
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
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>Analytics</h1>
            <div className='w-10' />
          </div>

          <div className='mb-8 hidden lg:block'>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>Analytics</h1>
            <p className='mt-1 text-[var(--color-mid-gray)]'>Track your store performance</p>
          </div>

          {/* Overview Cards */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {overviewCards.map((card) => (
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

          {/* Revenue Chart */}
          <div className='mt-8 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
            <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Monthly Revenue</h2>
            <div className='mt-6'>
              <div className='flex items-end gap-2 h-48'>
                {monthlyRevenue.map((m) => (
                  <div key={m.month} className='flex-1 flex flex-col items-center gap-1'>
                    <div
                      className='w-full rounded-t-md bg-gradient-to-t from-[var(--color-accent-dark)] to-[var(--color-accent)] transition-all hover:opacity-80 relative group'
                      style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                    >
                      <div className='absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[var(--color-deep-black)] text-[var(--color-white)] text-xs rounded px-2 py-1 whitespace-nowrap'>
                        Rs {m.revenue.toLocaleString()}
                      </div>
                    </div>
                    <span className='text-[10px] text-[var(--color-mid-gray)]'>{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className='mt-8 grid gap-8 lg:grid-cols-2'>
            {/* Top Products */}
            <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
              <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] mb-4'>Top Products</h2>
              <div className='space-y-4'>
                {topProducts.map((product, i) => (
                  <div key={i} className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-xs font-bold text-[var(--color-accent)]'>
                        {i + 1}
                      </span>
                      <div>
                        <p className='text-sm font-medium text-[var(--color-primary)]'>{product.name}</p>
                        <p className='text-xs text-[var(--color-mid-gray)]'>{product.sales} sales</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium text-[var(--color-primary)]'>Rs {product.revenue.toLocaleString()}</p>
                      <p className='text-xs text-[var(--color-success)]'>{product.growth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
              <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] mb-4'>Category Breakdown</h2>
              <div className='space-y-4'>
                {categoryBreakdown.map((cat) => (
                  <div key={cat.category}>
                    <div className='flex items-center justify-between text-sm mb-1'>
                      <span className='text-[var(--color-primary)]'>{cat.category}</span>
                      <div className='text-right'>
                        <span className='font-medium text-[var(--color-primary)]'>{cat.percentage}%</span>
                        <span className='text-[var(--color-mid-gray)] ml-2'>Rs {cat.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className='h-2 rounded-full bg-[var(--color-light-gray)]'>
                      <div
                        className='h-full rounded-full bg-gradient-to-r from-[var(--color-accent-dark)] to-[var(--color-accent)]'
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Growth */}
          <div className='mt-8 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
            <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Customer Growth</h2>
            <div className='mt-6'>
              <div className='flex items-end gap-2 h-32'>
                {monthlyGrowth.map((m) => (
                  <div key={m.month} className='flex-1 flex flex-col items-center gap-1'>
                    <div
                      className='w-full rounded-t-md bg-gradient-to-t from-[var(--color-info)] to-[var(--color-accent-light)] transition-all hover:opacity-80 relative group'
                      style={{ height: `${(m.customers / maxCustomers) * 100}%` }}
                    >
                      <div className='absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[var(--color-deep-black)] text-[var(--color-white)] text-xs rounded px-2 py-1 whitespace-nowrap'>
                        +{m.customers}
                      </div>
                    </div>
                    <span className='text-[10px] text-[var(--color-mid-gray)]'>{m.month}</span>
                  </div>
                ))}
              </div>
              <p className='mt-4 text-center text-sm text-[var(--color-mid-gray)]'>
                Total new customers this year: {monthlyGrowth.reduce((sum, m) => sum + m.customers, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
