'use client';

import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modal = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-[9999] flex items-center justify-center p-4'
          initial='hidden'
          animate='visible'
          exit='hidden'
        >
          <motion.div
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            variants={backdrop}
            onClick={onClose}
          />
          <motion.div
            className={`
              relative w-full ${sizeClasses[size]}
              bg-white dark:bg-zinc-900
              rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800
              overflow-hidden
            `}
            variants={modal}
          >
            {title && (
              <div className='flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800'>
                <h2 className='text-xl font-semibold text-zinc-900 dark:text-white'>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className='p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors'
                  aria-label='Close'
                >
                  <IoClose size={20} />
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                className='absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors z-10'
                aria-label='Close'
              >
                <IoClose size={20} />
              </button>
            )}
            <div className='px-6 py-4 max-h-[70vh] overflow-y-auto'>
              {children}
            </div>
            {footer && (
              <div className='px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50'>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
