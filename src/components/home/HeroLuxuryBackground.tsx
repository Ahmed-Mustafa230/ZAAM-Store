'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

interface HeroLuxuryBackgroundProps {
  sectionRef: React.RefObject<HTMLElement | null>
}

export default function HeroLuxuryBackground({ sectionRef }: HeroLuxuryBackgroundProps) {
  const prefersReducedMotion = useReducedMotion()
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const rafRef = useRef<number>(0)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const [isDesktop, setIsDesktop] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.06])

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
      x: (x - 0.5) * 24,
      y: (y - 0.5) * 16,
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
    <div className='absolute inset-0 z-[1] overflow-hidden' aria-hidden='true'>
      {/* Background image with subtle parallax */}
      <motion.div
        className='absolute inset-0 will-change-transform'
        style={{ y: bgY, scale: bgScale }}
      >
        <div
          className='absolute inset-[-4%] transition-transform duration-700 ease-out will-change-transform'
          style={{
            transform: `translate(${mouseOffset.x * 0.2}px, ${mouseOffset.y * 0.2}px)`,
          }}
        >
          <Image
            src='/Herosection/HeroBackground.jpeg'
            alt=''
            fill
            priority
            sizes='100vw'
            className='object-cover object-center'
            quality={85}
          />
        </div>
      </motion.div>

      {/* Luxury black gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-r from-black/88 via-black/72 to-black/55' />
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/45' />
      <div className='absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-[#1a1208]/50' />

      {/* Warm cinematic lighting */}
      <div
        className='absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_75%_65%,rgba(212,175,55,0.18)_0%,transparent_60%)] pointer-events-none transition-transform duration-700 ease-out will-change-transform'
        style={{
          transform: `translate(${mouseOffset.x * -0.3}px, ${mouseOffset.y * -0.3}px)`,
        }}
      />
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_50%,rgba(212,175,55,0.08)_0%,transparent_55%)] pointer-events-none' />

      {/* Gold ambient glow */}
      <div
        className='absolute bottom-[10%] right-[8%] w-[min(50vw,32rem)] h-[min(50vh,28rem)] rounded-full bg-[#D4AF37]/[0.09] blur-[100px] pointer-events-none transition-transform duration-700 ease-out will-change-transform'
        style={{
          transform: `translate(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px)`,
        }}
      />

      {/* Moving smoke layers */}
      {!prefersReducedMotion && (
        <>
          <div className='hero-smoke hero-smoke-1 absolute bottom-[-10%] right-[-5%] w-[70%] h-[60%] rounded-full bg-white/[0.04] blur-[80px]' />
          <div className='hero-smoke hero-smoke-2 absolute bottom-[5%] right-[10%] w-[50%] h-[45%] rounded-full bg-[#D4AF37]/[0.05] blur-[70px]' />
          <div className='hero-smoke hero-smoke-3 absolute top-[20%] left-[-10%] w-[45%] h-[40%] rounded-full bg-white/[0.03] blur-[90px]' />
        </>
      )}

      {/* Luxury vignette */}
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_65%,rgba(0,0,0,0.82)_100%)] pointer-events-none' />

      {/* Edge fades */}
      <div className='absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/70 to-transparent pointer-events-none' />
      <div className='absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/75 to-transparent pointer-events-none' />
    </div>
  )
}
