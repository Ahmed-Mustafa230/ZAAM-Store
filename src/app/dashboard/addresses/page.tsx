'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

const emptyForm: AddressFormData = {
  street: '', city: '', state: '', zip: '', country: 'United States', isDefault: false,
};

const sidebarLinks = [
  { label: 'Overview', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Orders', href: '/dashboard/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Profile', href: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Addresses', href: '/dashboard/addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  { label: 'Wishlist', href: '/wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
];

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<AddressFormData>(emptyForm);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await axios.get('/api/auth/me');
        if (cancelled) return;
        const data = res.data?.data?.user;
        if (data?.addresses) setAddresses(data.addresses);
      } catch {
        // silently fail
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  const persistAddresses = async (updated: Address[]) => {
    await axios.put('/api/users', { addresses: updated });
  };

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingIndex(null);
    setShowForm(true);
  };

  const openEditForm = (address: Address, index: number) => {
    setForm({ ...address });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSavingAddr(true);
    try {
      let updated: Address[];
      if (editingIndex !== null) {
        updated = addresses.map((a, i) =>
          i === editingIndex ? { ...form } : form.isDefault ? { ...a, isDefault: false } : a
        );
      } else {
        const newAddr: Address = { ...form, isDefault: form.isDefault || addresses.length === 0 };
        updated = form.isDefault
          ? addresses.map(a => ({ ...a, isDefault: false })).concat(newAddr)
          : [...addresses, newAddr];
      }
      await persistAddresses(updated);
      setAddresses(updated);
      setShowForm(false);
      setEditingIndex(null);
    } catch {
      // silently fail
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDelete = async (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    await persistAddresses(updated);
    setAddresses(updated);
    setDeletingIndex(null);
  };

  const setAsDefault = async (index: number) => {
    const updated = addresses.map((a, i) => ({ ...a, isDefault: i === index }));
    await persistAddresses(updated);
    setAddresses(updated);
  };

  return (
    <div className='min-h-screen bg-[var(--color-off-white)] font-[family-name:var(--font-body)]'>
      <div className='flex'>
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-white)] border-r border-[var(--color-light-gray)] transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className='p-6'>
            <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>My Account</h2>
          </div>
          <nav className='px-3 pb-6'>
            {sidebarLinks.map((link) => (
              <Link key={link.label} href={link.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                  link.href === '/dashboard/addresses' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
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
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>Addresses</h1>
            <div className='w-10' />
          </div>

          <div className='mb-8 flex items-center justify-between'>
            <div>
              <h1 className='hidden lg:block font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>My Addresses</h1>
              <p className='mt-1 text-[var(--color-mid-gray)]'>Manage your shipping addresses</p>
            </div>
            {!showForm && (
              <button onClick={openAddForm} className='gold-button flex items-center gap-2 px-4 py-2.5 text-sm font-medium'>
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
                </svg>
                Add New Address
              </button>
            )}
          </div>

          <div className='grid gap-8 lg:grid-cols-3'>
            <div className='lg:col-span-2 space-y-4'>
              {addresses.length === 0 && !showForm ? (
                <div className='flex flex-col items-center justify-center rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] py-16'>
                  <svg className='mb-4 h-16 w-16 text-[var(--color-light-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                  </svg>
                  <h3 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>No addresses saved</h3>
                  <p className='mt-2 text-[var(--color-mid-gray)]'>Add your first shipping address</p>
                </div>
              ) : (
                addresses.map((address, index) => (
                  <div key={index} className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6 transition-all hover:shadow-md'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start gap-3'>
                        <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          address.isDefault ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-mid-gray)]'
                        }`}>
                          {address.isDefault && (
                            <svg className='h-3 w-3 text-[var(--color-deep-black)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 13l4 4L19 7' />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-medium text-[var(--color-primary)]'>Address {index + 1}</h3>
                            {address.isDefault && (
                              <span className='rounded-full bg-[var(--color-accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent-dark)]'>
                                Default
                              </span>
                            )}
                          </div>
                          <p className='mt-1 text-sm text-[var(--color-dark-gray)]'>{address.street}</p>
                          <p className='text-sm text-[var(--color-dark-gray)]'>{address.city}, {address.state} {address.zip}</p>
                          <p className='text-sm text-[var(--color-dark-gray)]'>{address.country}</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button onClick={() => openEditForm(address, index)} className='rounded-lg p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] hover:text-[var(--color-accent)] transition-colors'>
                          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                          </svg>
                        </button>
                        <button onClick={() => setDeletingIndex(index)} className='rounded-lg p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] hover:text-[var(--color-error)] transition-colors'>
                          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {!address.isDefault && (
                      <button onClick={() => setAsDefault(index)} className='mt-4 text-xs text-[var(--color-accent)] hover:underline'>
                        Set as default
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
              <div className='lg:col-span-1'>
                <div className='sticky top-8 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
                  <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>
                    {editingIndex !== null ? 'Edit Address' : 'New Address'}
                  </h2>
                  <div className='mt-6 space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Street</label>
                      <input type='text' value={form.street} onChange={(e) => handleChange('street', e.target.value)} className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-[var(--color-primary)]'>City</label>
                        <input type='text' value={form.city} onChange={(e) => handleChange('city', e.target.value)} className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-[var(--color-primary)]'>State</label>
                        <input type='text' value={form.state} onChange={(e) => handleChange('state', e.target.value)} className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-[var(--color-primary)]'>ZIP Code</label>
                        <input type='text' value={form.zip} onChange={(e) => handleChange('zip', e.target.value)} className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-[var(--color-primary)]'>Country</label>
                        <select value={form.country} onChange={(e) => handleChange('country', e.target.value)} className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'>
                          <option value='United States'>United States</option>
                          <option value='Canada'>Canada</option>
                          <option value='United Kingdom'>United Kingdom</option>
                        </select>
                      </div>
                    </div>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={form.isDefault}
                        onChange={(e) => handleChange('isDefault', e.target.checked)}
                        className='h-4 w-4 rounded border-[var(--color-light-gray)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]'
                      />
                      <span className='text-sm text-[var(--color-primary)]'>Set as default address</span>
                    </label>
                  </div>
                  <div className='mt-6 flex gap-3'>
                    <button onClick={handleSave} disabled={savingAddr} className='gold-button flex-1 py-2.5 text-sm font-medium disabled:opacity-70'>
                      {savingAddr ? 'Saving...' : editingIndex !== null ? 'Save Changes' : 'Add Address'}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditingIndex(null); }} className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2.5 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deletingIndex !== null && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setDeletingIndex(null)} />
          <div className='relative rounded-2xl bg-[var(--color-white)] p-8 shadow-xl animate-scale-in max-w-sm w-full'>
            <h3 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>Delete Address?</h3>
            <p className='mt-2 text-sm text-[var(--color-mid-gray)]'>This action cannot be undone.</p>
            <div className='mt-6 flex gap-3'>
              <button onClick={() => handleDelete(deletingIndex)} className='flex-1 rounded-lg bg-[var(--color-error)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-error)]/90 transition-colors'>
                Delete
              </button>
              <button onClick={() => setDeletingIndex(null)} className='flex-1 rounded-lg border border-[var(--color-light-gray)] px-4 py-2.5 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
