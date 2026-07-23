'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Profile', href: '/admin/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Users', href: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

type PasswordStep = 'idle' | 'sending' | 'verify' | 'resetting' | 'done';

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<PasswordStep>('idle');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [sendError, setSendError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (session?.user && !profileLoaded) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      if ((session.user as any).image) setAvatar((session.user as any).image);
      setProfileLoaded(true);
    }
  }, [session, profileLoaded]);

  useEffect(() => {
    if (!profileLoaded) return;
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
      }
    }
    load();
    return () => { cancelled = true; };
  }, [profileLoaded]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(t => t - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

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

  const handleSendOtp = async () => {
    setSendError('');
    setStep('sending');
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setStep('verify');
      setResendTimer(30);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setSendError(err.response?.data?.message || 'Failed to send code.');
      } else {
        setSendError('Failed to send code.');
      }
      setStep('idle');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    const code = otp.join('');
    if (code.length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }
    try {
      await axios.post('/api/auth/verify-reset-otp', { email, otp: code });
      setStep('resetting');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setOtpError(err.response?.data?.message || 'Verification failed.');
      } else {
        setOtpError('Verification failed.');
      }
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendLoading || resendTimer > 0) return;
    setResendLoading(true);
    setOtpError('');
    try {
      await axios.post('/api/auth/resend-reset-otp', { email });
      setOtp(['', '', '', '', '', '']);
      setResendTimer(30);
      otpRefs.current[0]?.focus();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setOtpError(err.response?.data?.message || 'Failed to resend code.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setPasswordError('');
    if (!password) {
      setPasswordError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (!confirmPassword) {
      setPasswordError('Please confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    try {
      await axios.post('/api/auth/reset-password', { email, password });
      setStep('done');
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setPasswordError(err.response?.data?.message || 'Failed to reset password.');
      } else {
        setPasswordError('Failed to reset password.');
      }
    }
  };

  const resetFlow = () => {
    setStep('idle');
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setSendError('');
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 4)) + c) : '';

  return (
    <div className='min-h-screen bg-[var(--color-off-white)] font-[family-name:var(--font-body)]'>
      <div className='flex'>
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
                  link.href === '/admin/profile'
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
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>Admin Profile</h1>
            <p className='mt-1 text-[var(--color-mid-gray)]'>Manage your profile and security settings</p>
          </div>

          <div className='grid gap-8 lg:grid-cols-3 max-w-5xl'>
            <div className='lg:col-span-2 space-y-8'>
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

              <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6'>
                <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Update Password</h2>
                <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
                  A verification code will be sent to your email.
                </p>

                {step === 'idle' || step === 'sending' ? (
                  <div className='mt-6'>
                    <button
                      onClick={handleSendOtp}
                      disabled={step === 'sending'}
                      className='gold-button px-6 py-2.5 text-sm font-medium disabled:opacity-70'
                    >
                      {step === 'sending' ? (
                        <><div className='h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-deep-black)] border-t-transparent inline-block mr-1' /> Sending...</>
                      ) : 'Change Password'}
                    </button>
                    {sendError && (
                      <p className='mt-3 text-sm text-[var(--color-error)]'>{sendError}</p>
                    )}
                  </div>
                ) : step === 'verify' ? (
                  <div className='mt-6'>
                    <p className='text-sm text-[var(--color-mid-gray)]'>
                      Enter the 6-digit code sent to <span className='font-medium text-[var(--color-primary)]'>{maskedEmail}</span>
                    </p>
                    {otpError && (
                      <div className='mt-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-3 text-sm text-[var(--color-error)]'>
                        {otpError}
                      </div>
                    )}
                    <div className='mt-4 flex justify-center gap-2 sm:gap-3'>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type='text'
                          inputMode='numeric'
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className='h-12 w-11 sm:h-14 sm:w-12 rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] text-center text-xl font-bold text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] outline-none'
                        />
                      ))}
                    </div>
                    <div className='mt-4 flex items-center justify-center gap-3'>
                      <button
                        onClick={handleVerifyOtp}
                        disabled={otp.join('').length !== 6}
                        className='gold-button px-6 py-2.5 text-sm font-medium disabled:opacity-70'
                      >
                        Verify Code
                      </button>
                      <button
                        onClick={handleResend}
                        disabled={resendTimer > 0 || resendLoading}
                        className='text-sm text-[var(--color-accent)] hover:underline disabled:text-[var(--color-mid-gray)] disabled:no-underline'
                      >
                        {resendLoading ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                      </button>
                    </div>
                    <button onClick={resetFlow} className='mt-3 block w-full text-center text-xs text-[var(--color-mid-gray)] hover:text-[var(--color-primary)]'>
                      &larr; Back
                    </button>
                  </div>
                ) : step === 'resetting' ? (
                  <div className='mt-6 space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>New Password</label>
                      <input
                        type='password'
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                        placeholder='Minimum 6 characters'
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Confirm New Password</label>
                      <input
                        type='password'
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                        placeholder='Repeat your password'
                        className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none'
                      />
                    </div>
                    {passwordError && (
                      <p className='text-sm text-[var(--color-error)]'>{passwordError}</p>
                    )}
                    <div className='flex gap-3'>
                      <button onClick={handleResetPassword} className='gold-button px-6 py-2.5 text-sm font-medium'>
                        Update Password
                      </button>
                      <button onClick={resetFlow} className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2.5 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='mt-6'>
                    <div className='rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 p-4 text-sm text-[var(--color-success)]'>
                      Password has been updated successfully.
                    </div>
                    <button onClick={resetFlow} className='mt-4 gold-button px-6 py-2.5 text-sm font-medium'>
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>

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
