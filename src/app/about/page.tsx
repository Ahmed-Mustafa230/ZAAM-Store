'use client'

import { motion } from 'framer-motion'
import { FiShield, FiStar, FiTruck, FiRefreshCw } from 'react-icons/fi'

const features = [
  { icon: FiShield, title: 'Authentic Products', description: '100% genuine luxury items sourced directly from renowned brands and artisans.' },
  { icon: FiStar, title: 'Premium Quality', description: 'Every product undergoes rigorous quality checks to ensure excellence.' },
  { icon: FiTruck, title: 'White-Glove Delivery', description: 'Complimentary express shipping with premium packaging and tracking.' },
  { icon: FiRefreshCw, title: 'Hassle-Free Returns', description: '30-day return policy with free pickup and full refund guaranteed.' },
]

export default function AboutPage() {
  return (
    <main className='min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] pt-24'>
      <section className='relative py-24 overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05)_0%,transparent_60%)]' />
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='text-center max-w-3xl mx-auto mb-20'
          >
            <span className='text-amber-600 dark:text-amber-400 text-sm tracking-[0.3em] uppercase'>Our Story</span>
            <h1 className='text-5xl md:text-7xl font-bold text-zinc-900 dark:text-zinc-100 mt-6 mb-8' style={{ fontFamily: 'var(--font-heading)' }}>
              Curating Luxury for the Discerning
            </h1>
            <p className='text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed'>
              ZAAM was founded with a singular vision: to bring the world&apos;s finest luxury products together in one
              meticulously curated marketplace. We partner with heritage brands and emerging artisans who share our
              commitment to craftsmanship, quality, and timeless design.
            </p>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className='p-8 rounded-2xl bg-zinc-100/50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] hover:border-amber-500/20 dark:hover:border-[#d4af37]/20 transition-colors'
              >
                <feature.icon className='text-amber-600 dark:text-amber-400 text-3xl mb-5' />
                <h3 className='text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-3'>{feature.title}</h3>
                <p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed'>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
