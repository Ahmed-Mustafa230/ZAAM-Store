'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CouponType {
  _id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Users', href: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'flat',
    discountValue: '',
    minPurchase: '0',
    maxDiscount: '0',
    validFrom: '',
    validUntil: '',
    usageLimit: '0',
    isActive: true,
  });

  useEffect(() => {
    let ignore = false;
    fetch('/api/coupons')
      .then((res) => {
        if (!res.ok) return res.json().then((body) => { throw new Error(body.message || `Request failed (${res.status})`); });
        return res.json();
      })
      .then((json) => {
        if (ignore) return;
        setCoupons(json.coupons);
        setError(null);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setError(err instanceof Error ? err.message : 'Failed to load coupons.');
        setCoupons([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, []);

  const fetchCoupons = () => {
    setLoading(true);
    setError(null);
    fetch('/api/coupons')
      .then((res) => {
        if (!res.ok) return res.json().then((body) => { throw new Error(body.message || `Request failed (${res.status})`); });
        return res.json();
      })
      .then((json) => {
        setCoupons(json.coupons);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load coupons.');
      })
      .finally(() => setLoading(false));
  };

  const openAddForm = () => {
    setForm({
      code: '', discountType: 'percentage', discountValue: '',
      minPurchase: '0', maxDiscount: '0', validFrom: '', validUntil: '',
      usageLimit: '0', isActive: true,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (coupon: CouponType) => {
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minPurchase: String(coupon.minPurchase),
      maxDiscount: String(coupon.maxDiscount),
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      usageLimit: String(coupon.usageLimit),
      isActive: coupon.isActive,
    });
    setEditingId(coupon._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minPurchase: Number(form.minPurchase),
        maxDiscount: Number(form.maxDiscount),
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || undefined,
        usageLimit: Number(form.usageLimit),
        isActive: form.isActive,
      };

      const url = editingId ? `/api/coupons/${editingId}` : '/api/coupons';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.message && !json.coupon) throw new Error(json.message);

      await fetchCoupons();
      setShowForm(false);
      setEditingId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save coupon.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon: CouponType) => {
    try {
      const res = await fetch(`/api/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const json = await res.json();
      if (json.message && !json.coupon) throw new Error(json.message);
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle coupon.');
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.message) throw new Error(json.message);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete coupon.');
    }
  };

  const formatDiscount = (coupon: CouponType) => {
    return coupon.discountType === 'percentage'
      ? `${coupon.discountValue}%`
      : `Rs ${coupon.discountValue.toLocaleString()}`;
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
              {loading ? (
                <div className='flex items-center justify-center py-20'>
                  <div className='animate-spin h-10 w-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full' />
                </div>
              ) : error ? (
                <div className='text-center py-20'>
                  <p className='text-[var(--color-error)] font-medium'>{error}</p>
                  <button onClick={fetchCoupons} className='mt-4 gold-button px-4 py-2 text-sm'>Retry</button>
                </div>
              ) : (
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
                      {coupons.length === 0 ? (
                        <tr><td colSpan={7} className='px-6 py-12 text-center text-[var(--color-mid-gray)]'>No coupons created yet.</td></tr>
                      ) : (
                        coupons.map((coupon) => (
                          <tr key={coupon._id} className='border-b border-[var(--color-light-gray)] last:border-b-0 hover:bg-[var(--color-cream)] transition-colors'>
                            <td className='px-6 py-4'>
                              <span className='font-mono font-bold text-[var(--color-primary)]'>{coupon.code}</span>
                            </td>
                            <td className='px-6 py-4 font-medium text-[var(--color-primary)]'>{formatDiscount(coupon)}</td>
                            <td className='px-6 py-4 text-[var(--color-dark-gray)]'>Rs {coupon.minPurchase.toLocaleString()}</td>
                            <td className='px-6 py-4 text-[var(--color-dark-gray)]'>
                              {new Date(coupon.validUntil).toLocaleDateString()}
                            </td>
                            <td className='px-6 py-4 text-[var(--color-dark-gray)]'>{coupon.usedCount} / {coupon.usageLimit}</td>
                            <td className='px-6 py-4'>
                              <button
                                onClick={() => toggleActive(coupon)}
                                className={`inline-block rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                  coupon.isActive
                                    ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20'
                                    : 'bg-[var(--color-mid-gray)]/10 text-[var(--color-mid-gray)] hover:bg-[var(--color-mid-gray)]/20'
                                }`}
                              >
                                {coupon.isActive ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className='px-6 py-4 text-right'>
                              <div className='flex items-center justify-end gap-1'>
                                <button onClick={() => openEditForm(coupon)} className='rounded-lg p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] hover:text-[var(--color-accent)] transition-colors'>
                                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                                  </svg>
                                </button>
                                <button onClick={() => deleteCoupon(coupon._id)} className='rounded-lg p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] hover:text-[var(--color-error)] transition-colors'>
                                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

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
                      <select value={form.discountType} onChange={(e) => setForm(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'flat' }))}
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'>
                        <option value='percentage'>Percentage (%)</option>
                        <option value='flat'>Fixed Amount (Rs)</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Discount Value</label>
                      <input type='number' value={form.discountValue} onChange={(e) => setForm(prev => ({ ...prev, discountValue: e.target.value }))}
                        placeholder={form.discountType === 'percentage' ? '10' : '500'}
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Min. Purchase (Rs)</label>
                      <input type='number' value={form.minPurchase} onChange={(e) => setForm(prev => ({ ...prev, minPurchase: e.target.value }))}
                        placeholder='0'
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Max Discount (Rs)</label>
                      <input type='number' value={form.maxDiscount} onChange={(e) => setForm(prev => ({ ...prev, maxDiscount: e.target.value }))}
                        placeholder='0'
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Valid From</label>
                      <input type='date' value={form.validFrom} onChange={(e) => setForm(prev => ({ ...prev, validFrom: e.target.value }))}
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Valid Until</label>
                      <input type='date' value={form.validUntil} onChange={(e) => setForm(prev => ({ ...prev, validUntil: e.target.value }))}
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Usage Limit</label>
                      <input type='number' value={form.usageLimit} onChange={(e) => setForm(prev => ({ ...prev, usageLimit: e.target.value }))}
                        placeholder='100'
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                    </div>
                  </div>
                  <div className='mt-6 flex gap-3'>
                    <button onClick={handleSave} disabled={saving} className='gold-button flex-1 py-2.5 text-sm font-medium disabled:opacity-50'>
                      {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
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
