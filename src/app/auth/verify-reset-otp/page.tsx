'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import axios from 'axios';

function VerifyResetOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(t => t - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  useEffect(() => {
    otpRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!email) {
      router.replace('/auth/forgot-password');
    }
  }, [email, router]);

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

  const handleVerify = async () => {
    setError('');
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/verify-reset-otp', { email, otp: code });
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Verification failed. Please try again.');
      } else {
        setError('Verification failed. Please try again.');
      }
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendLoading || resendTimer > 0) return;
    setResendLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/resend-reset-otp', { email });
      setOtp(['', '', '', '', '', '']);
      setResendTimer(30);
      otpRefs.current[0]?.focus();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to resend code.');
      }
    } finally {
      setResendLoading(false);
    }
  };

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
            Verify your identity
          </p>
        </div>

        <div className='glass-card p-8 sm:p-10'>
          <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)] text-center'>
            Verify Reset Code
          </h2>
          <p className='mt-3 text-center text-sm text-[var(--color-mid-gray)] leading-relaxed'>
            Enter the 6-digit code sent to<br />
            <span className='font-medium text-[var(--color-primary)]'>{maskedEmail}</span>
          </p>

          {error && (
            <div className='mt-6 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-4 text-sm text-[var(--color-error)]'>
              {error}
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
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className='gold-button w-full mt-8 py-3.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'
          >
            {loading ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-deep-black)] border-t-transparent' />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>

          <div className='mt-6 text-center'>
            <p className='text-sm text-[var(--color-mid-gray)]'>
              Didn&apos;t receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={resendTimer > 0 || resendLoading}
                className='font-medium text-[var(--color-accent)] hover:underline disabled:text-[var(--color-mid-gray)] disabled:no-underline disabled:cursor-not-allowed'
              >
                {resendLoading
                  ? 'Sending...'
                  : resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : 'Resend Code'}
              </button>
            </p>
          </div>

          <Link
            href='/auth/forgot-password'
            className='mt-4 block w-full text-center text-sm text-[var(--color-mid-gray)] hover:text-[var(--color-primary)] transition-colors'
          >
            &larr; Back
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyResetOtpPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen bg-[var(--color-off-white)] flex items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent' />
      </div>
    }>
      <VerifyResetOtpContent />
    </Suspense>
  );
}
