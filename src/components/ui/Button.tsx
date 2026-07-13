'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-500 hover:to-yellow-400 border-none',
  secondary:
    'bg-transparent text-amber-600 border-2 border-amber-600 hover:bg-amber-600 hover:text-white dark:text-amber-400 dark:border-amber-400 dark:hover:bg-amber-400 dark:hover:text-black',
  ghost:
    'bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 border-none',
  danger:
    'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:from-red-500 hover:to-rose-400 border-none',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-6 py-3 text-base gap-2',
  lg: 'px-8 py-4 text-lg gap-2.5',
};

const spinnerSizes: Record<ButtonSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      className={`
        inline-flex items-center justify-center rounded-lg font-semibold
        transition-all duration-300 ease-out cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading && (
        <svg
          className={`animate-spin ${spinnerSizes[size]}`}
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
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className='inline-flex shrink-0'>{icon}</span>
      )}
      {!loading && children}
      {!loading && icon && iconPosition === 'right' && (
        <span className='inline-flex shrink-0'>{icon}</span>
      )}
    </motion.button>
  );
}
