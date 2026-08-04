'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import ParticlesBackground from './ParticlesBackground'
import HeroLuxuryBackground from './HeroLuxuryBackground'
import MagneticButton from './MagneticButton'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
}

function HeroBottle() {
  const prefersReducedMotion = useReducedMotion()
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const [isDesktop, setIsDesktop] = useState(false)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const applyMouseOffset = useCallback(() => {
    if (prefersReducedMotion || !isDesktop) return
    const { x, y } = mouseRef.current
    setMouseOffset({
      x: (x - 0.5) * 18,
      y: (y - 0.5) * 12,
    })
  }, [prefersReducedMotion, isDesktop])

  useEffect(() => {
    if (prefersReducedMotion || !isDesktop) return

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(applyMouseOffset)
    }

    window.addEventListener('mousemove', handleMouse, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouse)
      cancelAnimationFrame(rafRef.current)
    }
  }, [prefersReducedMotion, isDesktop, applyMouseOffset])

  return (
    <motion.div
      variants={itemVariants}
      className='relative flex items-end justify-end w-full h-full'
    >
      {/* Warm rim light behind bottle */}
      <div
        className='absolute bottom-[8%] right-[5%] w-[70%] h-[75%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.22)_0%,transparent_70%)] blur-2xl pointer-events-none'
        aria-hidden='true'
      />

      <div className='lg:absolute lg:left-[38%] lg:top-[54.5%] lg:-translate-x-1/2 lg:-translate-y-1/2'>
        <div
          className='relative w-[min(72vw,22rem)] sm:w-[min(65vw,26rem)] lg:w-[min(42vw,32rem)] xl:w-[min(38vw,36rem)] aspect-[3/5] transition-transform duration-700 ease-out will-change-transform'
          style={{
            transform: prefersReducedMotion
              ? undefined
              : `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
          }}
        >
        <div className={`relative w-full h-full ${prefersReducedMotion ? '' : 'hero-bottle-float'}`}>
          <Image
            src='/Herosection/HeroBottle.png'
            alt='ZAAM luxury fragrance bottle'
            fill
            priority
            sizes='(max-width: 640px) 72vw, (max-width: 1024px) 65vw, 38vw'
            className='object-contain object-bottom drop-shadow-[0_20px_60px_rgba(0,0,0,0.55)]'
          />
        </div>
        </div>
      </div>
    </motion.div>
  )
}

function ScrollIndicator({
  onClick,
  reducedMotion,
}: {
  onClick: () => void
  reducedMotion: boolean | null
}) {
  return (
    <button
      onClick={onClick}
      className='group absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 sm:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 rounded-full'
      aria-label='Scroll to next section'
    >
      <span className='text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-white/25 group-hover:text-[#D4AF37]/70 transition-colors duration-500 font-medium'>
        Scroll
      </span>
      <span className='relative flex h-10 sm:h-12 w-5 sm:w-6 items-start justify-center rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm group-hover:border-[#D4AF37]/30 transition-colors duration-500'>
        <motion.span
          className='mt-1.5 sm:mt-2 block h-1.5 sm:h-2 w-[2px] sm:w-[3px] rounded-full bg-[#D4AF37]/60 group-hover:bg-[#D4AF37]'
          animate={reducedMotion ? undefined : { y: [0, 12, 0], opacity: [1, 0.3, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </span>
    </button>
  )
}

function CTAButtons() {
  const buttonLayout =
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap gap-1 min-[360px]:gap-1.5 min-[390px]:gap-2 sm:gap-2 px-2.5 min-[360px]:px-3 min-[390px]:px-3.5 sm:px-7 py-1.5 sm:py-2.5 min-h-[2.35rem] min-[360px]:min-h-[2.5rem] min-[390px]:min-h-[2.65rem] sm:min-h-[3rem] rounded-full text-[11px] min-[360px]:text-xs min-[390px]:text-xs sm:text-sm'

  return (
    <>
      <MagneticButton
        href='/products'
        className={`group relative ${buttonLayout} overflow-hidden font-semibold text-[#050505] shadow-[0_4px_24px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_40px_rgba(212,175,55,0.5)] transition-shadow duration-500`}
        strength={0.18}
      >
        <span
          className='absolute inset-0 bg-gradient-to-r from-[#8b6914] via-[#D4AF37] to-[#f0d060]'
          aria-hidden='true'
        />
        <span
          className='absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#f0d060] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500'
          aria-hidden='true'
        />
        <span
          className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 hero-shimmer pointer-events-none'
          aria-hidden='true'
        />
        <span className='relative z-10'>Shop Now</span>
        <FiArrowRight className='relative z-10 w-3 h-3 min-[390px]:w-3.5 min-[390px]:h-3.5 sm:w-4 sm:h-4 shrink-0 group-hover:translate-x-0.5 transition-transform duration-300' />
      </MagneticButton>

      <MagneticButton
        href='/products'
        className={`group ${buttonLayout} font-medium text-white border border-white/20 bg-transparent hover:border-white/40 hover:bg-white/[0.04] transition-all duration-400`}
        strength={0.15}
      >
        <span className='relative z-10'>Explore Collection</span>
        <FiArrowRight className='relative z-10 w-3 h-3 min-[390px]:w-3.5 min-[390px]:h-3.5 sm:w-4 sm:h-4 shrink-0 group-hover:translate-x-0.5 transition-transform duration-300' />
      </MagneticButton>
    </>
  )
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const scrollToNext = () => {
    const next = sectionRef.current?.nextElementSibling
    if (next) {
      next.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      ref={sectionRef}
      className='hero-section relative min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#050505] flex flex-col lg:grid lg:grid-cols-[45fr_55fr]'
    >
      <HeroLuxuryBackground sectionRef={sectionRef} />
      <ParticlesBackground />

      {/* Left column — editorial content */}
      <motion.div
        className='relative z-10 flex flex-col justify-center flex-1 min-h-0 px-5 sm:px-8 lg:px-12 xl:px-16 pt-[5.5rem] sm:pt-24 lg:pt-0 pb-6 sm:pb-8 lg:pb-14'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {/* Label */}
        <motion.p
          variants={itemVariants}
          className='text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-amber-600 dark:text-amber-400 font-medium mb-4 sm:mb-5 lg:mb-6'
        >
          ZAAM FRANGRANCE
        </motion.p>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className='text-[2.9rem] leading-[0.95] sm:text-[3rem] md:text-[3.95rem] lg:text-[4rem] xl:text-[4.5rem] font-extrabold text-white tracking-[-0.03em] mb-5 sm:mb-6 lg:mb-7 max-w-[16ch]'
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <span className='block whitespace-nowrap'>Discover Your</span>
          <span className='block whitespace-nowrap mt-3 sm:mt-4 text-amber-600 dark:text-amber-400'>Signature Style</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className='font-[family-name:var(--font-great-vibes)] text-2xl sm:text-3xl lg:text-4xl text-white/[0.92] leading-relaxed max-w-[460px] mb-6 sm:mb-7 lg:mb-9'
        >
          Crafted for elegance and confidence.
        </motion.p>

        {/* CTAs — desktop/tablet, hidden on mobile */}
        <motion.div
          variants={itemVariants}
          className='hidden sm:flex flex-row flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4'
        >
          <CTAButtons />
        </motion.div>
      </motion.div>

      {/* Right column — bottle */}
      <div className='relative z-10 flex-shrink-0 h-[30vh] sm:h-[34vh] lg:h-auto lg:min-h-[100dvh] flex items-end justify-end lg:justify-center pr-3 sm:pr-6 lg:pr-0 xl:pr-0 pb-14 sm:pb-16 lg:pb-8'>
        <HeroBottle />
      </div>

      {/* CTAs — mobile only, positioned at the bottle's bottom */}
      <motion.div
        variants={itemVariants}
        className='absolute inset-x-0 bottom-[16%] z-20 flex justify-center px-3 min-[360px]:px-4 min-[390px]:px-5 sm:hidden'
      >
        <div className='flex flex-row flex-nowrap items-center justify-center gap-1.5 min-[360px]:gap-2 min-[390px]:gap-2.5 max-w-full'>
          <CTAButtons />
        </div>
      </motion.div>

      {/* Bottom fade — seamless blend into the next section */}
      <div
        className='absolute inset-x-0 bottom-0 h-24 sm:h-32 lg:h-40 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/55 to-transparent pointer-events-none z-[5]'
        aria-hidden='true'
      />

      <ScrollIndicator onClick={scrollToNext} reducedMotion={prefersReducedMotion} />
    </section>
  )
}
