'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface CardProps {
  children: ReactNode;
  className?: string;
  image?: string;
  imageAlt?: string;
  badge?: ReactNode;
  hover?: boolean;
}

export default function Card({
  children,
  className = '',
  image,
  imageAlt = '',
  badge,
  hover = true,
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -6 } : {}}
      className={`
        relative bg-white/80 dark:bg-zinc-900/80
        backdrop-blur-xl
        border border-zinc-200/50 dark:border-zinc-800/50
        rounded-2xl overflow-hidden
        shadow-lg shadow-zinc-200/20 dark:shadow-black/20
        transition-shadow duration-300
        ${hover ? 'hover:shadow-xl hover:shadow-zinc-300/30 dark:hover:shadow-black/40' : ''}
        ${className}
      `}
    >
      {badge && (
        <div className='absolute top-3 left-3 z-10'>{badge}</div>
      )}
      {image && (
        <div className='relative w-full h-48 overflow-hidden'>
          <Image
            src={image}
            alt={imageAlt}
            fill
            className='object-cover transition-transform duration-500 group-hover:scale-110'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
        </div>
      )}
      <div className='p-5'>{children}</div>
    </motion.div>
  );
}
