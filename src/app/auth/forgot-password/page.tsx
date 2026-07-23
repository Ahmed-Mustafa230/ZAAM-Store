'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email address.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/auth/verify-reset-otp?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[var(--color-off-white)] flex items-center justify-center p-4 font-[family-name:var(--font-body)]'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <Link href='/' className='inline-block'>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-bold gold-gradient'>
              ZAAM
            </h1>
          </Link>
          <p className='mt-2 text-[var(--color-mid-gray)] text-sm'>
            Reset your password securely
          </p>
        </div>

        <div className='glass-card p-8 sm:p-10'>
          <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)] text-center'>
            Forgot Password
          </h2>
          <p className='mt-3 text-center text-sm text-[var(--color-mid-gray)] leading-relaxed'>
            Enter your email address to receive a password reset code.
          </p>

          {error && (
            <div className='mt-6 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-4 text-sm text-[var(--color-error)]'>
              {error}
            </div>
          )}

          {success && (
            <div className='mt-6 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 p-4 text-sm text-[var(--color-success)]'>
              If an account exists with this email, a verification code has been sent.
            </div>
          )}

          <form onSubmit={handleSubmit} className='mt-8 space-y-5'>
            <div>
              <label className='block text-sm font-medium text-[var(--color-primary)]'>
                Email Address
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder='you@example.com'
                className='mt-1.5 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all outline-none'
              />
            </div>

            <button
              type='submit'
              disabled={loading || success}
              className='gold-button w-full py-3.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'
            >
              {loading ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-deep-black)] border-t-transparent' />
                  Sending...
                </>
              ) : success ? (
                'Redirecting...'
              ) : (
                'Next'
              )}
            </button>
          </form>

          <p className='mt-8 text-center text-sm text-[var(--color-mid-gray)]'>
            Remember your password?{' '}
            <Link href='/auth/login' className='font-medium text-[var(--color-accent)] hover:underline'>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
