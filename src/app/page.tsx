'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { FiChevronUp } from 'react-icons/fi'
import { useState, useEffect } from 'react'

const HeroSection = dynamic(() => import('@/components/home/HeroSection'), { ssr: false })
const FeaturedCategories = dynamic(() => import('@/components/home/FeaturedCategories'), { ssr: false })
const ProductShowcase = dynamic(() => import('@/components/home/ProductShowcase'), { ssr: false })
const Testimonials = dynamic(() => import('@/components/home/Testimonials'), { ssr: false })
const Newsletter = dynamic(() => import('@/components/home/Newsletter'), { ssr: false })

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <motion.button
      onClick={scrollToTop}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className='fixed bottom-8 right-8 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-[#d4af37] text-[#0a0a0a] shadow-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-shadow'
      aria-label='Back to top'
    >
      <FiChevronUp size={22} />
    </motion.button>
  )
}

function SectionDivider() {
  return (
    <div className='relative h-24 md:h-32 overflow-hidden bg-[#0a0a0a]'>
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='w-px h-full bg-gradient-to-b from-transparent via-[#d4af37]/20 to-transparent' />
      </div>
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border border-[#d4af37]/30' />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-gradient-to-r from-transparent via-[#d4af37]/10 to-transparent -ml-10' />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-gradient-to-r from-transparent via-[#d4af37]/10 to-transparent ml-10' />
    </div>
  )
}

export default function HomePage() {
  return (
    <main className='min-h-screen bg-zinc-950 dark:bg-[#0a0a0a]'>
      <HeroSection />

      <SectionDivider />

      <FeaturedCategories />

      <SectionDivider />

      <ProductShowcase />

      <SectionDivider />

      <Testimonials />

      <SectionDivider />

      <Newsletter />

      <BackToTop />
    </main>
  )
}
