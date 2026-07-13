'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

export default function LoadingSpinner({
  size = 'md',
  color = 'text-amber-500',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${sizeMap[size]}`}>
        <svg
          className={`animate-spin ${sizeMap[size]} ${color}`}
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
          />
        </svg>
        <div
          className={`absolute inset-0 flex items-center justify-center ${size === 'lg' ? 'scale-150' : ''}`}
        >
          <span className='text-xs font-bold tracking-widest text-amber-500/60'>
            Z
          </span>
        </div>
      </div>
    </div>
  );
}
