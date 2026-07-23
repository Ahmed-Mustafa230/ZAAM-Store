'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('zaam_splash_seen');
    if (hasSeen) {
      setShowSplash(false);
      setInitialized(true);
      return;
    }

    setInitialized(true);

    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('zaam_splash_seen', 'true');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!initialized) return null;

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key='splash'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className='fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000000]'
        >
          <div className='relative flex flex-col items-center'>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='h-40 w-80 rounded-full bg-[#D4AF37] opacity-20 blur-[100px]' />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className='relative z-10'
            >
              <Image
                src='/logo/ZAAMlogo.png'
                alt='ZAAM'
                width={280}
                height={120}
                priority
                className='h-auto w-[200px] sm:w-[260px] md:w-[300px] lg:w-[340px]'
                style={{ objectFit: 'contain' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className='relative z-10 mt-8 text-center'
            >
              <p className='text-xs sm:text-sm md:text-base font-medium tracking-[0.25em] text-[#D4AF37]/90 uppercase'>
                ZAAM STORE
              </p>
              <p className='mt-3 text-[10px] sm:text-xs md:text-sm tracking-[0.35em] text-[#D4AF37]/50 uppercase'>
                Luxury Collection
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
