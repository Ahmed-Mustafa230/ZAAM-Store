'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import QrCodeUploader from '@/components/admin/QrCodeUploader';

interface WalletSettingsForm {
  enabled: boolean;
  accountTitle: string;
  merchantNumber: string;
  qrCodeImage: string;
}

interface BankTransferSettingsForm {
  enabled: boolean;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  qrCodeImage: string;
}

interface SettingsForm {
  easypaisa: WalletSettingsForm;
  jazzcash: WalletSettingsForm;
  bankTransfer: BankTransferSettingsForm;
}

const emptyWallet: WalletSettingsForm = {
  enabled: true,
  accountTitle: '',
  merchantNumber: '',
  qrCodeImage: '',
};

const emptyBank: BankTransferSettingsForm = {
  enabled: true,
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  iban: '',
  qrCodeImage: '',
};

const initialForm: SettingsForm = {
  easypaisa: { ...emptyWallet },
  jazzcash: { ...emptyWallet },
  bankTransfer: { ...emptyBank },
};

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Profile', href: '/admin/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Users', href: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { label: 'Payment Settings', href: '/admin/payment-settings', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
];

export default function AdminPaymentSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/admin/payment-settings')
      .then((res) => {
        if (!res.ok) return res.json().then((body) => { throw new Error(body.message || `Request failed (${res.status})`); });
        return res.json();
      })
      .then((json) => {
        const s = json.settings;
        setForm({
          easypaisa: {
            enabled: s.easypaisa?.enabled ?? true,
            accountTitle: s.easypaisa?.accountTitle || '',
            merchantNumber: s.easypaisa?.merchantNumber || '',
            qrCodeImage: s.easypaisa?.qrCodeImage || '',
          },
          jazzcash: {
            enabled: s.jazzcash?.enabled ?? true,
            accountTitle: s.jazzcash?.accountTitle || '',
            merchantNumber: s.jazzcash?.merchantNumber || '',
            qrCodeImage: s.jazzcash?.qrCodeImage || '',
          },
          bankTransfer: {
            enabled: s.bankTransfer?.enabled ?? true,
            bankName: s.bankTransfer?.bankName || '',
            accountTitle: s.bankTransfer?.accountTitle || '',
            accountNumber: s.bankTransfer?.accountNumber || '',
            iban: s.bankTransfer?.iban || '',
            qrCodeImage: s.bankTransfer?.qrCodeImage || '',
          },
        });
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load payment settings.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleWalletChange = (key: 'easypaisa' | 'jazzcash', field: keyof WalletSettingsForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const handleBankChange = (field: keyof BankTransferSettingsForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, bankTransfer: { ...prev.bankTransfer, [field]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.message && !json.settings) throw new Error(json.message);
      toast.success('Payment settings saved');
      setError(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save payment settings.');
    } finally {
      setSaving(false);
    }
  };

  const toggleClass = 'h-4 w-4 rounded border-[var(--color-light-gray)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]';
  const inputClass = 'mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]';

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
                  link.href === '/admin/payment-settings' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
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
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>Payment Settings</h1>
            <div className='w-10' />
          </div>

          <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='hidden lg:block font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>Payment Settings</h1>
              <p className='text-[var(--color-mid-gray)] text-sm mt-1'>Manage checkout payment details</p>
            </div>
            <button onClick={handleSave} disabled={saving || loading} className='gold-button px-6 py-2.5 text-sm font-medium disabled:opacity-50'>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <div className='animate-spin h-10 w-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full' />
            </div>
          ) : error ? (
            <div className='text-center py-20'>
              <p className='text-[var(--color-error)] font-medium'>{error}</p>
              <button onClick={() => window.location.reload()} className='mt-4 gold-button px-4 py-2 text-sm'>Retry</button>
            </div>
          ) : (
            <div className='grid gap-6 lg:grid-cols-2'>
              <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
                <div className='flex items-center justify-between'>
                  <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Easypaisa</h2>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input type='checkbox' checked={form.easypaisa.enabled} onChange={(e) => handleWalletChange('easypaisa', 'enabled', e.target.checked)} className={toggleClass} />
                    <span className='text-sm text-[var(--color-dark-gray)]'>Enabled</span>
                  </label>
                </div>
                <div className='mt-5 space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Account Title</label>
                    <input type='text' value={form.easypaisa.accountTitle} onChange={(e) => handleWalletChange('easypaisa', 'accountTitle', e.target.value)} className={inputClass} placeholder='ZAAM Store' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Merchant Number</label>
                    <input type='text' value={form.easypaisa.merchantNumber} onChange={(e) => handleWalletChange('easypaisa', 'merchantNumber', e.target.value)} className={inputClass} placeholder='03XX-XXXXXXX' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>QR Code Image</label>
                    <QrCodeUploader currentImage={form.easypaisa.qrCodeImage} onChange={(url) => handleWalletChange('easypaisa', 'qrCodeImage', url)} />
                  </div>
                </div>
              </div>

              <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
                <div className='flex items-center justify-between'>
                  <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>JazzCash</h2>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input type='checkbox' checked={form.jazzcash.enabled} onChange={(e) => handleWalletChange('jazzcash', 'enabled', e.target.checked)} className={toggleClass} />
                    <span className='text-sm text-[var(--color-dark-gray)]'>Enabled</span>
                  </label>
                </div>
                <div className='mt-5 space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Account Title</label>
                    <input type='text' value={form.jazzcash.accountTitle} onChange={(e) => handleWalletChange('jazzcash', 'accountTitle', e.target.value)} className={inputClass} placeholder='ZAAM Store' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Merchant Number</label>
                    <input type='text' value={form.jazzcash.merchantNumber} onChange={(e) => handleWalletChange('jazzcash', 'merchantNumber', e.target.value)} className={inputClass} placeholder='03XX-XXXXXXX' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>QR Code Image</label>
                    <QrCodeUploader currentImage={form.jazzcash.qrCodeImage} onChange={(url) => handleWalletChange('jazzcash', 'qrCodeImage', url)} />
                  </div>
                </div>
              </div>

              <div className='lg:col-span-2 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
                <div className='flex items-center justify-between'>
                  <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Bank Transfer</h2>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input type='checkbox' checked={form.bankTransfer.enabled} onChange={(e) => handleBankChange('enabled', e.target.checked)} className={toggleClass} />
                    <span className='text-sm text-[var(--color-dark-gray)]'>Enabled</span>
                  </label>
                </div>
                <div className='mt-5 grid gap-4 sm:grid-cols-2'>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Bank Name</label>
                    <input type='text' value={form.bankTransfer.bankName} onChange={(e) => handleBankChange('bankName', e.target.value)} className={inputClass} placeholder='HBL' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Account Title</label>
                    <input type='text' value={form.bankTransfer.accountTitle} onChange={(e) => handleBankChange('accountTitle', e.target.value)} className={inputClass} placeholder='ZAAM Store' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Account Number</label>
                    <input type='text' value={form.bankTransfer.accountNumber} onChange={(e) => handleBankChange('accountNumber', e.target.value)} className={inputClass} placeholder='XXXX-XXXXXX-XXXX' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>IBAN</label>
                    <input type='text' value={form.bankTransfer.iban} onChange={(e) => handleBankChange('iban', e.target.value)} className={inputClass} placeholder='PKXX XXXX XXXX XXXX XXXX' />
                  </div>
                  <div className='sm:col-span-2'>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>QR Code Image</label>
                    <QrCodeUploader currentImage={form.bankTransfer.qrCodeImage} onChange={(url) => handleBankChange('qrCodeImage', url)} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
