'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    if (redirectStatus === 'succeeded' || redirectStatus === 'processing') {
      setStatus('success');
      return;
    }

    if (paymentIntent) {
      const verify = async () => {
        try {
          const res = await axios.get(`/api/orders?payment_intent=${paymentIntent}`);
          const orders = res.data?.orders || res.data?.data?.orders || [];
          if (orders.length > 0) {
            setOrderId(orders[0]._id);
          }
        } catch {
          /* ignore */
        }
        setStatus('success');
      };
      verify();
    } else {
      setStatus('success');
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-[var(--color-white)] flex items-center justify-center'>
        <div className='h-8 w-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--color-white)] font-[family-name:var(--font-body)]'>
      <div className='container-luxury flex flex-col items-center justify-center py-24'>
        <div className='rounded-full bg-[var(--color-success)]/10 p-4'>
          <svg className='h-16 w-16 text-[var(--color-success)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
        </div>
        <h1 className='mt-6 font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>
          Payment Successful!
        </h1>
        <p className='mt-2 text-[var(--color-mid-gray)] text-center max-w-md'>
          Thank you for your purchase. Your order has been placed and you will receive a confirmation email shortly.
        </p>
        <div className='mt-8 flex gap-4'>
          <Link href='/dashboard/orders' className='gold-button px-8 py-3 text-sm font-medium'>
            View Orders
          </Link>
          <Link href='/products' className='rounded-lg border border-[var(--color-light-gray)] px-8 py-3 text-sm font-medium text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen bg-[var(--color-white)] flex items-center justify-center'>
        <div className='h-8 w-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin' />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
