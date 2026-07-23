'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (user) {
      router.replace(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, router]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const errorMsg =
          result.error === 'CredentialsSignin'
            ? 'Invalid email or password.'
            : result.error;
        setServerError(errorMsg);
        return;
      }

      router.refresh();
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setServerError('');
    await signIn('google', { redirect: true, callbackUrl: '/' });
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
            Welcome back to luxury
          </p>
        </div>

        <div className='glass-card p-8 sm:p-10'>
          <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)] text-center'>
            Sign In
          </h2>
          <p className='mt-2 text-center text-sm text-[var(--color-mid-gray)]'>
            Enter your credentials to access your account
          </p>

          {serverError && (
            <div className='mt-6 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-4 text-sm text-[var(--color-error)]'>
              {serverError}
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
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                placeholder='you@example.com'
                className={`mt-1.5 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all ${
                  errors.email ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                }`}
              />
              {errors.email && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.email}</p>}
            </div>

            <div>
              <label className='block text-sm font-medium text-[var(--color-primary)]'>
                Password
              </label>
              <input
                type='password'
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                placeholder='&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;'
                className={`mt-1.5 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all ${
                  errors.password ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                }`}
              />
              {errors.password && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.password}</p>}
            </div>

            <div className='flex items-center justify-between'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  className='h-4 w-4 rounded border-[var(--color-light-gray)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]'
                />
                <span className='text-sm text-[var(--color-dark-gray)]'>Remember me</span>
              </label>
              <Link href='/auth/forgot-password' className='text-sm text-[var(--color-accent)] hover:underline'>
                Forgot password?
              </Link>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='gold-button w-full py-3.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'
            >
              {loading ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-deep-black)] border-t-transparent' />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className='relative my-8'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-[var(--color-light-gray)]' />
            </div>
            <div className='relative flex justify-center'>
              <span className='bg-[var(--color-white)] px-4 text-xs text-[var(--color-mid-gray)] uppercase tracking-wider'>
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className='flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-3 text-sm font-medium text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-all disabled:opacity-70 disabled:cursor-not-allowed'
          >
            {googleLoading ? (
              <div className='h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-dark-gray)] border-t-transparent' />
            ) : (
              <svg className='h-5 w-5' viewBox='0 0 24 24'>
                <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z' />
                <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
              </svg>
            )}
            Continue with Google
          </button>

          <p className='mt-8 text-center text-sm text-[var(--color-mid-gray)]'>
            Don&apos;t have an account?{' '}
            <Link href='/auth/register' className='font-medium text-[var(--color-accent)] hover:underline'>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
