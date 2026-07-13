'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Coupon {
  id: string;
  code: string;
  discount: string;
  type: 'Percentage' | 'Fixed';
  minPurchase: number;
  validUntil: string;
  usage: number;
  maxUsage: number;
  active: boolean;
}

const initialCoupons: Coupon[] = [
  { id: '1', code: 'ZAAM10', discount: '10%', type: 'Percentage', minPurchase: 500, validUntil: '2026-12-31', usage: 45, maxUsage: 100, active: true },
  { id: '2', code: 'ZAAM20', discount: '20%', type: 'Percentage', minPurchase: 1000, validUntil: '2026-12-31', usage: 28, maxUsage: 50, active: true },
  { id: '3', code: 'VIP500', discount: 'Rs 500', type: 'Fixed', minPurchase: 2500, validUntil: '2026-09-30', usage: 12, maxUsage: 25, active: true },
  { id: '4', code: 'WELCOME', discount: '15%', type: 'Percentage', minPurchase: 0, validUntil: '2026-08-15', usage: 156, maxUsage: 500, active: true },
  { id: '5', code: 'FLASH50', discount: 'Rs 50', type: 'Fixed', minPurchase: 200, validUntil: '2026-07-01', usage: 200, maxUsage: 200, active: false },
  { id: '6', code: 'HOLIDAY25', discount: '25%', type: 'Percentage', minPurchase: 1500, validUntil: '2026-06-30', usage: 67, maxUsage: 100, active: false },
];

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Customers', href: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    code: '', discount: '', type: 'Percentage' as 'Percentage' | 'Fixed',
    minPurchase: '', validUntil: '', maxUsage: '',
  });

  const openAddForm = () => {
    setForm({ code: '', discount: '', type: 'Percentage', minPurchase: '', validUntil: '', maxUsage: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (coupon: Coupon) => {
    setForm({
      code: coupon.code, discount: coupon.discount.replace(/[^0-9]/g, ''),
      type: coupon.type, minPurchase: String(coupon.minPurchase),
      validUntil: coupon.validUntil, maxUsage: String(coupon.maxUsage),
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleSave = () => {
    const discountDisplay = form.type === 'Percentage' ? `${form.discount}%` : `Rs ${form.discount}`;
    const newCoupon: Coupon = {
      id: editingId || String(Date.now()),
      code: form.code.toUpperCase(),
      discount: discountDisplay,
      type: form.type,
      minPurchase: Number(form.minPurchase),
      validUntil: form.validUntil,
      usage: 0,
      maxUsage: Number(form.maxUsage),
      active: true,
    };
    if (editingId) {
      setCoupons(prev => prev.map(c => c.id === editingId ? { ...newCoupon, usage: c.usage, active: c.active } : c));
    } else {
      setCoupons(prev => [...prev, newCoupon]);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const toggleActive = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
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
                  link.href === '/admin/coupons' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
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
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>Coupons</h1>
            <div className='w-10' />
          </div>

          <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='hidden lg:block font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>Coupons</h1>
              <p className='text-[var(--color-mid-gray)] text-sm mt-1'>Manage promotional coupons</p>
            </div>
            {!showForm && (
              <button onClick={openAddForm} className='gold-button flex items-center gap-2 px-4 py-2.5 text-sm font-medium'>
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
                </svg>
                Add Coupon
              </button>
            )}
          </div>

          <div className='grid gap-8 lg:grid-cols-3'>
            <div className='lg:col-span-2'>
              <div className='overflow-x-auto rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)]'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-[var(--color-light-gray)] bg-[var(--color-cream)]'>
                      <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Code</th>
                      <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Discount</th>
                      <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Min. Purchase</th>
                      <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Valid Until</th>
                      <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Usage</th>
                      <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Status</th>
                      <th className='px-6 py-4 text-right font-medium text-[var(--color-primary)]'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className='border-b border-[var(--color-light-gray)] last:border-b-0 hover:bg-[var(--color-cream)] transition-colors'>
                        <td className='px-6 py-4'>
                          <span className='font-mono font-bold text-[var(--color-primary)]'>{coupon.code}</span>
                        </td>
                        <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>{coupon.discount}</td>
                        <td className='px-6 py-4 text-[var(--color-dark-gray)]'>Rs {coupon.minPurchase.toLocaleString()}</td>
                        <td className='px-6 py-4 text-[var(--color-dark-gray)]'>{coupon.validUntil}</td>
                        <td className='px-6 py-4 text-[var(--color-dark-gray)]'>{coupon.usage} / {coupon.maxUsage}</td>
                        <td className='px-6 py-4'>
                          <button
                            onClick={() => toggleActive(coupon.id)}
                            className={`inline-block rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                              coupon.active
                                ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20'
                                : 'bg-[var(--color-mid-gray)]/10 text-[var(--color-mid-gray)] hover:bg-[var(--color-mid-gray)]/20'
                            }`}
                          >
                            {coupon.active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className='px-6 py-4 text-right'>
                          <div className='flex items-center justify-end gap-1'>
                            <button onClick={() => openEditForm(coupon)} className='rounded-lg p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] hover:text-[var(--color-accent)] transition-colors'>
                              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                              </svg>
                            </button>
                            <button onClick={() => setCoupons(prev => prev.filter(c => c.id !== coupon.id))} className='rounded-lg p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] hover:text-[var(--color-error)] transition-colors'>
                              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
              <div className='lg:col-span-1'>
                <div className='sticky top-8 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
                  <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>
                    {editingId ? 'Edit Coupon' : 'New Coupon'}
                  </h2>
                  <div className='mt-6 space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Code</label>
                      <input type='text' value={form.code} onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value }))}
                        placeholder='SAVE20'
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] uppercase' />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Type</label>
                      <select value={form.type} onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as 'Percentage' | 'Fixed' }))}
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'>
                        <option value='Percentage'>Percentage (%)</option>
                        <option value='Fixed'>Fixed Amount (Rs)</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Discount Value</label>
                      <input type='number' value={form.discount} onChange={(e) => setForm(prev => ({ ...prev, discount: e.target.value }))}
                        placeholder={form.type === 'Percentage' ? '10' : '50'}
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Min. Purchase (Rs)</label>
                      <input type='number' value={form.minPurchase} onChange={(e) => setForm(prev => ({ ...prev, minPurchase: e.target.value }))}
                        placeholder='0'
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Valid Until</label>
                      <input type='date' value={form.validUntil} onChange={(e) => setForm(prev => ({ ...prev, validUntil: e.target.value }))}
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Max Usage</label>
                      <input type='number' value={form.maxUsage} onChange={(e) => setForm(prev => ({ ...prev, maxUsage: e.target.value }))}
                        placeholder='100'
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                    </div>
                  </div>
                  <div className='mt-6 flex gap-3'>
                    <button onClick={handleSave} className='gold-button flex-1 py-2.5 text-sm font-medium'>
                      {editingId ? 'Update' : 'Create'}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditingId(null); }}
                      className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2.5 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
