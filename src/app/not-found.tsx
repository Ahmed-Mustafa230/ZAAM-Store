import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-[var(--color-white)] flex items-center justify-center p-4 font-[family-name:var(--font-body)]'>
      <div className='text-center max-w-lg'>
        {/* Animated 404 */}
        <div className='relative mb-8'>
          <h1 className='font-[family-name:var(--font-heading)] text-[10rem] font-bold leading-none gold-gradient animate-float'>
            404
          </h1>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='h-32 w-32 rounded-full border-2 border-[var(--color-accent)]/20 animate-pulse' />
          </div>
          <div className='absolute -top-4 -right-4 h-20 w-20 rounded-full bg-[var(--color-accent)]/5 animate-float stagger-2' />
          <div className='absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-[var(--color-accent)]/5 animate-float stagger-3' />
        </div>

        <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)] sm:text-3xl'>
          Page Not Found
        </h2>

        <p className='mt-4 text-[var(--color-mid-gray)] leading-relaxed'>
          The page you are looking for does not exist or has been moved.
          Let us guide you back to the luxury experience you deserve.
        </p>

        <div className='mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
          <Link
            href='/'
            className='gold-button inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium'
          >
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
            </svg>
            Go Home
          </Link>
          <Link
            href='/products'
            className='outline-button inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium'
          >
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
            Browse Products
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className='mt-12 flex items-center justify-center gap-4'>
          <div className='luxury-divider' />
          <span className='text-xs uppercase tracking-[0.2em] text-[var(--color-mid-gray)]'>
            ZAAM Luxury
          </span>
          <div className='luxury-divider' />
        </div>
      </div>
    </div>
  );
}
