'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const sidebarLinks = [
  { label: 'Overview', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Orders', href: '/dashboard/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Profile', href: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Addresses', href: '/dashboard/addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  { label: 'Wishlist', href: '/wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?._id || profileLoaded) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await axios.get('/api/auth/me');
        if (cancelled) return;
        const p = res.data?.data?.user;
        if (p) {
          setName(p.name || '');
          setEmail(p.email || '');
          setPhone(p.phone || '');
          if (p.avatar) setAvatar(p.avatar);
        }
      } catch {
        // fallback to session data
        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
        }
      } finally {
        if (!cancelled) setProfileLoaded(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user, profileLoaded]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError('');
    try {
      await axios.put('/api/users', { name, phone, avatar });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    setPasswordError('');
    setPasswordSaved(false);
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    try {
      await axios.put('/api/users', { currentPassword, newPassword });
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || err.message || 'Failed to update password');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
                  link.href === '/dashboard/profile' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
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
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>Profile</h1>
            <div className='w-10' />
          </div>

          <div className='mb-8 hidden lg:block'>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>My Profile</h1>
            <p className='mt-1 text-[var(--color-mid-gray)]'>Manage your personal information</p>
          </div>

          <div className='grid gap-8 lg:grid-cols-3'>
            <div className='lg:col-span-2 space-y-8'>
              {/* Profile Form */}
              <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
                <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Personal Information</h2>
                {saveError && (
                  <p className='mt-2 text-sm text-[var(--color-error)]'>{saveError}</p>
                )}
                <div className='mt-6 space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Full Name</label>
                    <input
                      type='text'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Email</label>
                    <input
                      type='email'
                      value={email}
                      disabled
                      className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-mid-gray)] cursor-not-allowed'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Phone</label>
                    <input
                      type='tel'
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'
                    />
                  </div>
                </div>
                <div className='mt-6 flex items-center gap-4'>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className='gold-button flex items-center gap-2 px-6 py-2.5 text-sm font-medium disabled:opacity-70'
                  >
                    {saving ? (
                      <><div className='h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-deep-black)] border-t-transparent' /> Saving...</>
                    ) : 'Save Changes'}
                  </button>
                  {saved && (
                    <span className='flex items-center gap-1 text-sm text-[var(--color-success)]'>
                      <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                      </svg>
                      Profile updated!
                    </span>
                  )}
                </div>
              </div>

              {/* Password Change */}
              <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
                <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Change Password</h2>
                <div className='mt-6 space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Current Password</label>
                    <input
                      type='password'
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>New Password</label>
                    <input
                      type='password'
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Confirm New Password</label>
                    <input
                      type='password'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'
                    />
                  </div>
                  {passwordError && (
                    <p className='text-sm text-[var(--color-error)]'>{passwordError}</p>
                  )}
                </div>
                <div className='mt-6 flex items-center gap-4'>
                  <button
                    onClick={handleSavePassword}
                    className='gold-button px-6 py-2.5 text-sm font-medium'
                  >
                    Update Password
                  </button>
                  {passwordSaved && (
                    <span className='flex items-center gap-1 text-sm text-[var(--color-success)]'>
                      <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                      </svg>
                      Password updated!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Avatar Section */}
            <div className='lg:col-span-1'>
              <div className='sticky top-8 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
                <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Profile Photo</h2>
                <div className='mt-6 flex flex-col items-center'>
                  <div className='relative h-32 w-32 overflow-hidden rounded-full bg-[var(--color-cream)] border-2 border-[var(--color-light-gray)]'>
                    {avatar ? (
                      <img src={avatar} alt='Profile' className='h-full w-full object-cover' />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center'>
                        <svg className='h-16 w-16 text-[var(--color-mid-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                        </svg>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleAvatarChange}
                    className='hidden'
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className='mt-4 rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'
                  >
                    Upload Photo
                  </button>
                  <p className='mt-2 text-xs text-[var(--color-mid-gray)]'>
                    JPG, PNG or WEBP. Max 2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
