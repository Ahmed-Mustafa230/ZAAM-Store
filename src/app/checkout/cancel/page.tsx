'use client';

import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className='min-h-screen bg-[var(--color-white)] font-[family-name:var(--font-body)]'>
      <div className='container-luxury flex flex-col items-center justify-center py-24'>
        <div className='rounded-full bg-[var(--color-error)]/10 p-4'>
          <svg className='h-16 w-16 text-[var(--color-error)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </div>
        <h1 className='mt-6 font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>
          Payment Cancelled
        </h1>
        <p className='mt-2 text-[var(--color-mid-gray)] text-center max-w-md'>
          Your payment was not completed. No charges have been made. You can try again or continue shopping.
        </p>
        <div className='mt-8 flex gap-4'>
          <Link href='/checkout' className='gold-button px-8 py-3 text-sm font-medium'>
            Try Again
          </Link>
          <Link href='/products' className='rounded-lg border border-[var(--color-light-gray)] px-8 py-3 text-sm font-medium text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
