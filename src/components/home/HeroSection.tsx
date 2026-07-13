'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, type Variants } from 'framer-motion'
import { FiArrowRight, FiChevronDown } from 'react-icons/fi'
import ParticlesBackground from './ParticlesBackground'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.03,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

function TextReveal({ text }: { text: string }) {
  return (
    <span className='inline-block overflow-visible'>
      {text.split(' ').map((word, wi) => (
        <span key={wi} className='inline-block mr-[0.25em]'>
          {word.split('').map((char, ci) => (
            <motion.span
              key={`${wi}-${ci}`}
              className='inline-block'
              custom={wi * 5 + ci}
              variants={letterVariants}
              style={{ transformStyle: 'preserve-3d', perspective: 800 }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  )
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY
      const bg = document.getElementById('hero-background')
      if (bg) {
        bg.style.transform = `translateY(${scrollPos * 0.3}px)`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToNext = () => {
    const next = sectionRef.current?.nextElementSibling
    if (next) {
      next.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      ref={sectionRef}
      className='relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 dark:bg-[#0a0a0a]'
    >
      <ParticlesBackground />

      <div
        id='hero-background'
        className='absolute inset-0 z-[1]'
      >
        <div className='absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e]/80 to-[#0a0a0a]' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)]' />
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-[120px]' />
        <div className='absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#f0d060]/5 rounded-full blur-[100px]' />
      </div>

      <motion.div
        style={{ y, opacity, scale }}
        className='absolute inset-0 z-[1]'
      >
        <div className='absolute top-[15%] left-[8%] w-px h-32 bg-gradient-to-b from-transparent via-[#d4af37]/40 to-transparent' />
        <div className='absolute top-[30%] right-[12%] w-px h-48 bg-gradient-to-b from-transparent via-[#d4af37]/20 to-transparent' />
        <div className='absolute bottom-[25%] left-[15%] w-4 h-4 border border-[#d4af37]/30 rotate-45' />
        <div className='absolute top-[20%] right-[20%] w-3 h-3 border border-[#d4af37]/20 rotate-12' />
        <div className='absolute bottom-[35%] right-[25%] w-6 h-6 border border-[#d4af37]/10 rounded-full' />
        <div className='absolute top-[45%] left-[5%] w-2 h-2 bg-[#d4af37]/20 rounded-full' />
        <div className='absolute top-[60%] right-[8%] w-1.5 h-1.5 bg-[#d4af37]/15 rounded-full' />
      </motion.div>

      <div className='absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0a0a] to-transparent z-[2]' />
      <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-[2]' />

      <motion.div
        className='relative z-10 text-center px-6 max-w-5xl mx-auto'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        <motion.div variants={itemVariants} className='mb-6'>
          <span className='inline-block text-amber-400 text-sm md:text-base tracking-[0.3em] uppercase font-medium'>
            Luxury Redefined
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight mb-4 sm:mb-5 max-w-4xl mx-auto'
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          <span className='block'><TextReveal text='Discover Your' /></span>
          <span className='block'><TextReveal text='Signature Style' /></span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
           className='text-lg sm:text-xl md:text-2xl text-[#D4AF37] font-[family-name:var(--font-great-vibes)] mx-auto mb-6 sm:mb-8 leading-relaxed whitespace-nowrap text-center'
        >
           Curated luxury for the discerning
        </motion.p>

        <motion.div
          variants={itemVariants}
          className='flex flex-row items-center justify-center gap-2 sm:gap-4 w-full'
        >
          <motion.a
            href='/products'
            className='group relative inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-8 md:px-10 py-1.5 sm:py-4 bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#f0d060] text-[#0a0a0a] font-semibold text-xs sm:text-base md:text-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:translate-y-[-2px] active:translate-y-0 shrink-0'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className='relative z-10'>Shop Now</span>
            <FiArrowRight className='relative z-10 group-hover:translate-x-1 transition-transform' />
            <div className='absolute inset-0 bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
          </motion.a>

          <motion.a
            href='/products'
            className='group inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-8 md:px-10 py-1.5 sm:py-4 border border-[#d4af37]/40 text-[#d4af37] font-semibold text-xs sm:text-base md:text-lg rounded-lg transition-all duration-300 hover:bg-[#d4af37] hover:text-[#0a0a0a] hover:border-[#d4af37] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] shrink-0'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Explore Collection</span>
            <FiArrowRight className='group-hover:translate-x-1 transition-transform' />
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.button
        onClick={scrollToNext}
        className='absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/30 hover:text-[#d4af37] transition-colors'
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-label='Scroll to next section'
      >
        <FiChevronDown size={28} />
      </motion.button>
    </section>
  )
}
