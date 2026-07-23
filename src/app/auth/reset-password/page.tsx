'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import axios from 'axios';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    if (!password) {
      setError('Password is required.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (!confirmPassword) {
      setError('Please confirm your password.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    if (!email) {
      setError('Invalid reset session. Please start again.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { email, password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      } else {
        setError('Failed to reset password. Please try again.');
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
            Create a new password
          </p>
        </div>

        <div className='glass-card p-8 sm:p-10'>
          <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)] text-center'>
            Create New Password
          </h2>
          <p className='mt-3 text-center text-sm text-[var(--color-mid-gray)] leading-relaxed'>
            Enter your new password below.
          </p>

          {error && (
            <div className='mt-6 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-4 text-sm text-[var(--color-error)]'>
              {error}
            </div>
          )}

          {success && (
            <div className='mt-6 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 p-4 text-sm text-[var(--color-success)]'>
              Password has been updated successfully. Redirecting to sign in...
            </div>
          )}

          <form onSubmit={handleSubmit} className='mt-8 space-y-5'>
            <div>
              <label className='block text-sm font-medium text-[var(--color-primary)]'>
                New Password
              </label>
              <input
                type='password'
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder='Minimum 6 characters'
                className='mt-1.5 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all outline-none'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-[var(--color-primary)]'>
                Confirm Password
              </label>
              <input
                type='password'
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder='Repeat your password'
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
                  Updating Password...
                </>
              ) : success ? (
                'Redirecting...'
              ) : (
                'Update Password'
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen bg-[var(--color-off-white)] flex items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent' />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
