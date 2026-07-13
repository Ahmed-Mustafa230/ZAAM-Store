'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  joined: string;
  status: 'Active' | 'Inactive';
  avatar: string;
}

const customers: Customer[] = [
  { id: '1', name: 'Alexander Blackwood', email: 'alex@blackwood.com', totalOrders: 12, totalSpent: 8430, joined: '2025-01-15', status: 'Active', avatar: 'AB' },
  { id: '2', name: 'Victoria Laurent', email: 'victoria@laurent.com', totalOrders: 8, totalSpent: 12450, joined: '2025-03-22', status: 'Active', avatar: 'VL' },
  { id: '3', name: 'Marcus Chen', email: 'marcus@chen.com', totalOrders: 5, totalSpent: 4295, joined: '2025-04-10', status: 'Active', avatar: 'MC' },
  { id: '4', name: 'Isabella Rossi', email: 'isabella@rossi.com', totalOrders: 15, totalSpent: 28750, joined: '2025-02-08', status: 'Active', avatar: 'IR' },
  { id: '5', name: 'James Harrington', email: 'james@harrington.com', totalOrders: 3, totalSpent: 1895, joined: '2025-06-01', status: 'Inactive', avatar: 'JH' },
  { id: '6', name: 'Sophia Kim', email: 'sophia@kim.com', totalOrders: 9, totalSpent: 9800, joined: '2025-05-14', status: 'Active', avatar: 'SK' },
  { id: '7', name: 'Oliver Grant', email: 'oliver@grant.com', totalOrders: 2, totalSpent: 2150, joined: '2025-07-20', status: 'Inactive', avatar: 'OG' },
  { id: '8', name: 'Charlotte Dubois', email: 'charlotte@dubois.com', totalOrders: 11, totalSpent: 15400, joined: '2025-02-28', status: 'Active', avatar: 'CD' },
];

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Customers', href: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

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
                  link.href === '/admin/customers' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
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
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>Customers</h1>
            <div className='w-10' />
          </div>

          <div className='mb-8 hidden lg:block'>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>Customers</h1>
            <p className='mt-1 text-[var(--color-mid-gray)]'>View and manage your customers</p>
          </div>

          <div className='mb-6'>
            <div className='relative max-w-md'>
              <svg className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-mid-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
              <input type='text' placeholder='Search customers...' value={search} onChange={(e) => setSearch(e.target.value)}
                className='w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] pl-10 pr-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
            </div>
          </div>

          <div className='overflow-x-auto rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)]'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-[var(--color-light-gray)] bg-[var(--color-cream)]'>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Customer</th>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Email</th>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Orders</th>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Total Spent</th>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Joined</th>
                  <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Status</th>
                  <th className='px-6 py-4 text-right font-medium text-[var(--color-primary)]'>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className='border-b border-[var(--color-light-gray)] last:border-b-0 hover:bg-[var(--color-cream)] transition-colors'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-xs font-bold text-[var(--color-accent)]'>
                          {customer.avatar}
                        </div>
                        <span className='font-medium text-[var(--color-primary)]'>{customer.name}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-[var(--color-dark-gray)]'>{customer.email}</td>
                    <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>{customer.totalOrders}</td>
                    <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>Rs {customer.totalSpent.toLocaleString()}</td>
                    <td className='px-6 py-4 text-[var(--color-dark-gray)]'>{customer.joined}</td>
                    <td className='px-6 py-4'>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        customer.status === 'Active' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-mid-gray)]/10 text-[var(--color-mid-gray)]'
                      }`}>{customer.status}</span>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <button onClick={() => setSelectedCustomer(customer)}
                        className='text-sm text-[var(--color-accent)] hover:underline'>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setSelectedCustomer(null)} />
          <div className='relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-[var(--color-white)] p-8 shadow-xl animate-scale-in'>
            <button onClick={() => setSelectedCustomer(null)}
              className='absolute right-4 top-4 rounded-full p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] transition-colors'>
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
            <div className='flex flex-col items-center'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-2xl font-bold text-[var(--color-accent)]'>
                {selectedCustomer.avatar}
              </div>
              <h2 className='mt-4 font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>{selectedCustomer.name}</h2>
              <span className={`mt-2 rounded-full px-3 py-1 text-xs font-medium ${
                selectedCustomer.status === 'Active' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-mid-gray)]/10 text-[var(--color-mid-gray)]'
              }`}>{selectedCustomer.status}</span>
            </div>
            <div className='mt-6 space-y-4'>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Email</span>
                <span className='text-sm font-medium text-[var(--color-primary)]'>{selectedCustomer.email}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Total Orders</span>
                <span className='text-sm font-medium text-[var(--color-primary)]'>{selectedCustomer.totalOrders}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Total Spent</span>
                <span className='text-sm font-medium text-[var(--color-primary)]'>Rs {selectedCustomer.totalSpent.toLocaleString()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Member Since</span>
                <span className='text-sm font-medium text-[var(--color-primary)]'>{selectedCustomer.joined}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
