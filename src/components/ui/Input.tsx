'use client';

import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';

type InputVariant = 'default' | 'underlined' | 'filled';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  variant?: InputVariant;
}

const variantClasses: Record<InputVariant, string> = {
  default:
    'border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-amber-500 dark:focus:border-amber-400 rounded-lg',
  underlined:
    'border-b-2 border-zinc-300 dark:border-zinc-700 bg-transparent rounded-none focus:border-amber-500 dark:focus:border-amber-400 px-0',
  filled:
    'border-2 border-transparent bg-zinc-100 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:border-amber-500 dark:focus:border-amber-400 rounded-lg',
};

export default function Input({
  label,
  error,
  icon,
  variant = 'default',
  type = 'text',
  className = '',
  id,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <div className='w-full'>
      {label && (
        <label
          htmlFor={inputId}
          className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5'
        >
          {label}
        </label>
      )}
      <div className='relative'>
        {icon && (
          <div className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none'>
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={resolvedType}
          className={`
            w-full px-4 py-3 text-base text-zinc-900 dark:text-white
            placeholder:text-zinc-400 dark:placeholder:text-zinc-600
            outline-none transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-12' : ''}
            ${error ? 'border-red-500 focus:border-red-500 dark:border-red-500' : ''}
            ${variantClasses[variant]}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type='button'
            onClick={() => setShowPassword((prev) => !prev)}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors'
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p className='mt-1.5 text-sm text-red-500 dark:text-red-400'>
          {error}
        </p>
      )}
    </div>
  );
}
