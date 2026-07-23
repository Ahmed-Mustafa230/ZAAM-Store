'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import DashboardSidebar from '@/components/dashboard/Sidebar';

type PasswordStep = 'idle' | 'sending' | 'verify' | 'resetting' | 'done';

export default function SettingsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleSendOtp = async () => {
    setSendError('');
    setStep('sending');
    try {
      await axios.post('/api/auth/forgot-password', { email: user?.email });
      setStep('verify');
      setResendTimer(30);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setSendError(err.response?.data?.message || 'Failed to send code. Please try again.');
      } else {
        setSendError('Failed to send code. Please try again.');
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
      await axios.post('/api/auth/verify-reset-otp', { email: user?.email, otp: code });
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
      await axios.post('/api/auth/resend-reset-otp', { email: user?.email });
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
      await axios.post('/api/auth/reset-password', { email: user?.email, password });
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

  const maskedEmail = user?.email
    ? user.email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 4)) + c)
    : '';

  return (
    <div className='min-h-screen bg-[var(--color-off-white)] dark:bg-zinc-950 font-[family-name:var(--font-body)]'>
      <div className='flex'>
        <DashboardSidebar activeHref='/dashboard/settings' sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className='flex-1 p-6 lg:p-8'>
          <div className='mb-8 flex items-center justify-between lg:hidden'>
            <button onClick={() => setSidebarOpen(true)} className='rounded-lg p-2 text-[var(--color-dark-gray)] dark:text-zinc-400 hover:bg-[var(--color-cream)] dark:hover:bg-zinc-800'>
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)] dark:text-zinc-100'>Settings</h1>
            <div className='w-10' />
          </div>

          <div className='mb-8 hidden lg:block'>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)] dark:text-zinc-100'>Settings</h1>
            <p className='mt-1 text-[var(--color-mid-gray)] dark:text-zinc-400'>Manage your account settings</p>
          </div>

          <div className='space-y-8 max-w-2xl'>
            {/* Security Section */}
            <div className='rounded-xl border border-[var(--color-light-gray)] dark:border-zinc-800 bg-[var(--color-white)] dark:bg-zinc-900 p-6'>
              <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] dark:text-zinc-100'>Security</h2>
              <p className='mt-1 text-sm text-[var(--color-mid-gray)] dark:text-zinc-400'>
                Update your password securely using email verification.
              </p>

              {step === 'idle' || step === 'sending' ? (
                <div className='mt-6'>
                  <div className='flex items-center justify-between rounded-lg border border-[var(--color-light-gray)] dark:border-zinc-700 p-4'>
                    <div>
                      <p className='text-sm font-medium text-[var(--color-primary)] dark:text-zinc-100'>Password</p>
                      <p className='text-xs text-[var(--color-mid-gray)] dark:text-zinc-400'>Last changed: —</p>
                    </div>
                    <button
                      onClick={handleSendOtp}
                      disabled={step === 'sending'}
                      className='gold-button px-4 py-2 text-sm font-medium disabled:opacity-70'
                    >
                      {step === 'sending' ? (
                        <><div className='h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-deep-black)] border-t-transparent inline-block mr-1' /> Sending...</>
                      ) : 'Change Password'}
                    </button>
                  </div>
                  {sendError && (
                    <p className='mt-3 text-sm text-[var(--color-error)]'>{sendError}</p>
                  )}
                </div>
              ) : step === 'verify' ? (
                <div className='mt-6'>
                  <p className='text-sm text-[var(--color-mid-gray)] dark:text-zinc-400'>
                    Enter the 6-digit code sent to <span className='font-medium text-[var(--color-primary)] dark:text-zinc-100'>{maskedEmail}</span>
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
                        className='h-12 w-11 sm:h-14 sm:w-12 rounded-lg border border-[var(--color-light-gray)] dark:border-zinc-700 bg-[var(--color-cream)] dark:bg-zinc-800 text-center text-xl font-bold text-[var(--color-primary)] dark:text-zinc-100 focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] outline-none'
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
                  <button
                    onClick={resetFlow}
                    className='mt-3 block w-full text-center text-xs text-[var(--color-mid-gray)] dark:text-zinc-500 hover:text-[var(--color-primary)] dark:hover:text-zinc-300'
                  >
                    &larr; Back
                  </button>
                </div>
              ) : step === 'resetting' ? (
                <div className='mt-6 space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)] dark:text-zinc-200'>New Password</label>
                    <input
                      type='password'
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                      placeholder='Minimum 6 characters'
                      className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] dark:border-zinc-700 bg-[var(--color-cream)] dark:bg-zinc-800 px-4 py-3 text-sm text-[var(--color-primary)] dark:text-zinc-100 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)] dark:text-zinc-200'>Confirm New Password</label>
                    <input
                      type='password'
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                      placeholder='Repeat your password'
                      className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] dark:border-zinc-700 bg-[var(--color-cream)] dark:bg-zinc-800 px-4 py-3 text-sm text-[var(--color-primary)] dark:text-zinc-100 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none'
                    />
                  </div>
                  {passwordError && (
                    <p className='text-sm text-[var(--color-error)]'>{passwordError}</p>
                  )}
                  <div className='flex gap-3'>
                    <button
                      onClick={handleResetPassword}
                      className='gold-button px-6 py-2.5 text-sm font-medium'
                    >
                      Update Password
                    </button>
                    <button
                      onClick={resetFlow}
                      className='rounded-lg border border-[var(--color-light-gray)] dark:border-zinc-700 px-4 py-2.5 text-sm text-[var(--color-dark-gray)] dark:text-zinc-300 hover:bg-[var(--color-cream)] dark:hover:bg-zinc-800 transition-colors'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className='mt-6'>
                  <div className='rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 p-4 text-sm text-[var(--color-success)]'>
                    Password has been updated successfully.
                  </div>
                  <button
                    onClick={resetFlow}
                    className='mt-4 gold-button px-6 py-2.5 text-sm font-medium'
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Account Section */}
            <div className='rounded-xl border border-[var(--color-light-gray)] dark:border-zinc-800 bg-[var(--color-white)] dark:bg-zinc-900 p-6'>
              <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] dark:text-zinc-100'>Account</h2>
              <div className='mt-4 space-y-4'>
                <div className='flex items-center justify-between rounded-lg border border-[var(--color-light-gray)] dark:border-zinc-700 p-4'>
                  <div>
                    <p className='text-sm font-medium text-[var(--color-primary)] dark:text-zinc-100'>Username</p>
                    <p className='text-xs text-[var(--color-mid-gray)] dark:text-zinc-400'>Username is not supported in the current database schema.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Preferences */}
            <div className='rounded-xl border border-[var(--color-light-gray)] dark:border-zinc-800 bg-[var(--color-white)] dark:bg-zinc-900 p-6'>
              <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] dark:text-zinc-100'>Preferences</h2>
              <p className='mt-1 text-sm text-[var(--color-mid-gray)] dark:text-zinc-400'>
                Account preferences and notification settings will appear here in a future update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
