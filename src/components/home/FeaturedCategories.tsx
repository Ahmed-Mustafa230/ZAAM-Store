'use client'

import { useRef, type MouseEvent } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { GiPerfumeBottle, GiTShirt, GiTrousers, GiWatch } from 'react-icons/gi'

const categories = [
  {
    id: 'perfumes',
    name: 'Perfumes',
    description: 'Discover captivating fragrances that leave a lasting impression.',
    icon: GiPerfumeBottle,
    color: 'from-amber-500/30 to-amber-700/10',
    gradient: 'from-amber-400 to-amber-600',
    image: '/images/categories/perfumes.jpg',
    slug: '/products?category=perfumes',
  },
  {
    id: 't-shirts',
    name: 'T-Shirts',
    description: 'Premium fabrics meet contemporary design for effortless style.',
    icon: GiTShirt,
    color: 'from-blue-500/30 to-blue-700/10',
    gradient: 'from-blue-400 to-blue-600',
    image: '/images/categories/tshirts.jpg',
    slug: '/products?category=t-shirts',
  },
  {
    id: 'pants',
    name: 'Pants',
    description: 'Sharp, tailored trousers and casual pants for every occasion.',
    icon: GiTrousers,
    color: 'from-rose-500/30 to-rose-700/10',
    gradient: 'from-rose-400 to-rose-600',
    image: '/images/categories/pants.jpg',
    slug: '/products?category=pants',
  },
  {
    id: 'watches',
    name: 'Watches',
    description: 'Timeless craftsmanship for those who value every second.',
    icon: GiWatch,
    color: 'from-emerald-500/30 to-emerald-700/10',
    gradient: 'from-emerald-400 to-emerald-600',
    image: '/images/categories/watches.jpg',
    slug: '/products?category=watches',
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

function CategoryCard({
  category,
  index,
}: {
  category: (typeof categories)[0]
  index: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -12
    const rotateY = ((x - centerX) / centerX) * 12
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform =
      'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }

  const Icon = category.icon

  return (
    <motion.div
      variants={cardVariants}
      className='group relative'
    >
      <a href={category.slug}>
        <div
          ref={cardRef}
          className='relative h-[280px] sm:h-[320px] md:h-[360px] lg:h-[380px] rounded-2xl overflow-hidden cursor-pointer transition-transform duration-200 ease-out'
          style={{ transformStyle: 'preserve-3d' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className='absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a]' />
          <div
            className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-60`}
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700' />

          <div
            className='relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center'
            style={{ transform: 'translateZ(30px)' }}
          >
            <div className='mb-3 sm:mb-4 md:mb-5 p-2 sm:p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-all duration-300'>
              <Icon className='text-2xl sm:text-3xl md:text-4xl text-[#d4af37]' />
            </div>

            <h3
              className='text-xl sm:text-2xl md:text-3xl font-bold text-zinc-100 mb-2 sm:mb-3'
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {category.name}
            </h3>

            <p className='text-zinc-400 text-xs sm:text-sm md:text-base max-w-[200px] sm:max-w-[220px] leading-relaxed mb-4 sm:mb-6'>
              {category.description}
            </p>

            <span className='inline-flex items-center gap-2 text-[#d4af37] text-sm font-medium group-hover:gap-3 transition-all'>
              Explore
              <FiArrowRight className='text-sm' />
            </span>
          </div>

          <div
            className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center'
          />
        </div>
      </a>
    </motion.div>
  )
}

export default function FeaturedCategories() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className='relative py-16 sm:py-20 md:py-24 lg:py-32 bg-zinc-950 dark:bg-[#0a0a0a] overflow-hidden'>
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.03)_0%,transparent_60%)]' />

      <div className='container-luxury relative z-10'>
        <div ref={ref} className='text-center mb-10 sm:mb-14 md:mb-20'>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className='text-[#d4af37] text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase mb-2 sm:mb-4'
          >
            Collections
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-100'
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Shop by Category
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className='luxury-divider luxury-divider-center'
          />
        </div>

        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6'
        >
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
