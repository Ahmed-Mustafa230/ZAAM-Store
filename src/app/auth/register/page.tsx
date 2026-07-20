'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(t => t - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
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
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.post('/api/auth/send-otp', { name, email, password });
      setStep('otp');
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setServerError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
      } else {
        setServerError('Failed to send verification code. Please try again.');
      }
    } finally {
      setLoading(false);
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

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < data.length; i++) {
      newOtp[i] = data[i];
    }
    setOtp(newOtp);
    const nextIdx = Math.min(data.length, 5);
    otpRefs.current[nextIdx]?.focus();
  };

  const handleVerifyOtp = async () => {
    setServerError('');
    const code = otp.join('');
    if (code.length !== 6) {
      setServerError('Please enter the complete 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp', {
        email,
        otp: code,
        password,
      });

      if (res.data.signedIn) {
        router.refresh();
        router.push('/');
      } else {
        router.push('/auth/login');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setServerError(err.response?.data?.message || 'Verification failed. Please try again.');
      } else {
        setServerError('Verification failed. Please try again.');
      }
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendLoading || resendTimer > 0) return;
    setResendLoading(true);
    try {
      await axios.post('/api/auth/resend-otp', { email });
      setOtp(['', '', '', '', '', '']);
      setResendTimer(30);
      otpRefs.current[0]?.focus();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setServerError(err.response?.data?.message || 'Failed to resend code.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setServerError('');
    await signIn('google', { redirect: true, callbackUrl: '/' });
  };

  const handleBackToForm = () => {
    setStep('form');
    setServerError('');
    setOtp(['', '', '', '', '', '']);
  };

  if (step === 'otp') {
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) =>
      a + '*'.repeat(Math.min(b.length, 4)) + c
    );

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
              Verify your email address
            </p>
          </div>

          <div className='glass-card p-8 sm:p-10'>
            <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)] text-center'>
              Enter Verification Code
            </h2>
            <p className='mt-3 text-center text-sm text-[var(--color-mid-gray)] leading-relaxed'>
              We sent a 6-digit code to<br />
              <span className='font-medium text-[var(--color-primary)]'>{maskedEmail}</span>
            </p>

            {serverError && (
              <div className='mt-6 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-4 text-sm text-[var(--color-error)]'>
                {serverError}
              </div>
            )}

            <div className='mt-8 flex justify-center gap-2 sm:gap-3'>
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
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  className='h-12 w-11 sm:h-14 sm:w-12 rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] text-center text-xl font-bold text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all outline-none'
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.join('').length !== 6}
              className='gold-button w-full mt-8 py-3.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'
            >
              {loading ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-deep-black)] border-t-transparent' />
                  Verifying...
                </>
              ) : (
                'Verify & Create Account'
              )}
            </button>

            <div className='mt-6 text-center'>
              <p className='text-sm text-[var(--color-mid-gray)]'>
                Didn&apos;t receive the code?{' '}
                <button
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || resendLoading}
                  className='font-medium text-[var(--color-accent)] hover:underline disabled:text-[var(--color-mid-gray)] disabled:no-underline disabled:cursor-not-allowed'
                >
                  {resendLoading
                    ? 'Sending...'
                    : resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : 'Resend code'}
                </button>
              </p>
            </div>

            <button
              onClick={handleBackToForm}
              className='mt-4 w-full text-center text-sm text-[var(--color-mid-gray)] hover:text-[var(--color-primary)] transition-colors'
            >
              &larr; Back to registration
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            Begin your luxury journey
          </p>
        </div>

        <div className='glass-card p-8 sm:p-10'>
          <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)] text-center'>
            Create Account
          </h2>
          <p className='mt-2 text-center text-sm text-[var(--color-mid-gray)]'>
            Join the world of exclusive luxury
          </p>

          {serverError && (
            <div className='mt-6 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-4 text-sm text-[var(--color-error)]'>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSendOtp} className='mt-8 space-y-5'>
            <div>
              <label className='block text-sm font-medium text-[var(--color-primary)]'>
                Full Name
              </label>
              <input
                type='text'
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
                placeholder='Alexander Blackwood'
                className={`mt-1.5 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all ${
                  errors.name ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                }`}
              />
              {errors.name && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.name}</p>}
            </div>

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
                placeholder='Create a strong password'
                className={`mt-1.5 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all ${
                  errors.password ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                }`}
              />
              {errors.password && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.password}</p>}
            </div>

            <div>
              <label className='block text-sm font-medium text-[var(--color-primary)]'>
                Confirm Password
              </label>
              <input
                type='password'
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                placeholder='Repeat your password'
                className={`mt-1.5 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all ${
                  errors.confirmPassword ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                }`}
              />
              {errors.confirmPassword && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.confirmPassword}</p>}
            </div>

            <label className='flex items-start gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={acceptTerms}
                onChange={(e) => { setAcceptTerms(e.target.checked); setErrors(prev => ({ ...prev, acceptTerms: '' })); }}
                className='mt-0.5 h-4 w-4 rounded border-[var(--color-light-gray)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]'
              />
              <span className='text-sm text-[var(--color-dark-gray)]'>
                I agree to the{' '}
                <Link href='#' className='text-[var(--color-accent)] hover:underline'>Terms of Service</Link>
                {' '}and{' '}
                <Link href='#' className='text-[var(--color-accent)] hover:underline'>Privacy Policy</Link>
              </span>
            </label>
            {errors.acceptTerms && <p className='text-xs text-[var(--color-error)]'>{errors.acceptTerms}</p>}

            <button
              type='submit'
              disabled={loading}
              className='gold-button w-full py-3.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'
            >
              {loading ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-deep-black)] border-t-transparent' />
                  Sending code...
                </>
              ) : (
                'Send Verification Code'
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
            Already have an account?{' '}
            <Link href='/auth/login' className='font-medium text-[var(--color-accent)] hover:underline'>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
