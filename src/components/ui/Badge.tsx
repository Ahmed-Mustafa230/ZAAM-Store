'use client';

import type { ReactNode } from 'react';

type BadgeVariant = 'gold' | 'black' | 'white' | 'red' | 'green';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  pulse?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  gold: 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white',
  black: 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900',
  white: 'bg-white text-zinc-900 border border-zinc-200',
  red: 'bg-red-500 text-white',
  green: 'bg-emerald-500 text-white',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export default function Badge({
  children,
  variant = 'gold',
  size = 'sm',
  pulse = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center font-semibold
        rounded-full tracking-wide shadow-sm
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
