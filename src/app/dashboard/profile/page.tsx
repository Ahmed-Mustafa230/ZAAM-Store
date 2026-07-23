'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import DashboardSidebar from '@/components/dashboard/Sidebar';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
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
        const p = res.data?.user;
        if (p) {
          setName(p.name || '');
          setEmail(p.email || '');
          setPhone(p.phone || '');
          if (p.avatar) setAvatar(p.avatar);
        }
      } catch {
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
    <div className='min-h-screen bg-[var(--color-off-white)] dark:bg-zinc-950 font-[family-name:var(--font-body)]'>
      <div className='flex'>
        <DashboardSidebar activeHref='/dashboard/profile' sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className='flex-1 p-6 lg:p-8'>
          <div className='mb-8 flex items-center justify-between lg:hidden'>
            <button onClick={() => setSidebarOpen(true)} className='rounded-lg p-2 text-[var(--color-dark-gray)] dark:text-zinc-400 hover:bg-[var(--color-cream)] dark:hover:bg-zinc-800'>
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)] dark:text-zinc-100'>Profile</h1>
            <div className='w-10' />
          </div>

          <div className='mb-8 hidden lg:block'>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)] dark:text-zinc-100'>My Profile</h1>
            <p className='mt-1 text-[var(--color-mid-gray)] dark:text-zinc-400'>Manage your personal information</p>
          </div>

          <div className='grid gap-8 lg:grid-cols-3'>
            <div className='lg:col-span-2'>
              <div className='rounded-xl border border-[var(--color-light-gray)] dark:border-zinc-800 bg-[var(--color-white)] dark:bg-zinc-900 p-6'>
                <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] dark:text-zinc-100'>Personal Information</h2>
                {saveError && (
                  <p className='mt-2 text-sm text-[var(--color-error)]'>{saveError}</p>
                )}
                <div className='mt-6 space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)] dark:text-zinc-200'>Full Name</label>
                    <input
                      type='text'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] dark:border-zinc-700 bg-[var(--color-cream)] dark:bg-zinc-800 px-4 py-3 text-sm text-[var(--color-primary)] dark:text-zinc-100 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)] dark:text-zinc-200'>Email</label>
                    <input
                      type='email'
                      value={email}
                      disabled
                      className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] dark:border-zinc-700 bg-[var(--color-cream)] dark:bg-zinc-800 px-4 py-3 text-sm text-[var(--color-mid-gray)] dark:text-zinc-500 cursor-not-allowed'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)] dark:text-zinc-200'>Phone</label>
                    <input
                      type='tel'
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] dark:border-zinc-700 bg-[var(--color-cream)] dark:bg-zinc-800 px-4 py-3 text-sm text-[var(--color-primary)] dark:text-zinc-100 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'
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
            </div>

            <div className='lg:col-span-1'>
              <div className='sticky top-8 rounded-xl border border-[var(--color-light-gray)] dark:border-zinc-800 bg-[var(--color-white)] dark:bg-zinc-900 p-6'>
                <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] dark:text-zinc-100'>Profile Photo</h2>
                <div className='mt-6 flex flex-col items-center'>
                  <div className='relative h-32 w-32 overflow-hidden rounded-full bg-[var(--color-cream)] dark:bg-zinc-800 border-2 border-[var(--color-light-gray)] dark:border-zinc-700'>
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
                    className='mt-4 rounded-lg border border-[var(--color-light-gray)] dark:border-zinc-700 px-4 py-2 text-sm text-[var(--color-dark-gray)] dark:text-zinc-300 hover:bg-[var(--color-cream)] dark:hover:bg-zinc-800 transition-colors'
                  >
                    Upload Photo
                  </button>
                  <p className='mt-2 text-xs text-[var(--color-mid-gray)] dark:text-zinc-400'>
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
