'use client'

import { useRef } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import ProductCard, { type Product } from '../products/ProductCard'

const products: Product[] = [
  {
    id: '1',
    name: 'Oud Royale',
    brand: 'Maison de Luxe',
    price: 285.00,
    originalPrice: 350.00,
    rating: 4.8,
    reviewCount: 124,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80',
    badge: 'best-seller',
    discount: 19,
    category: 'perfumes',
    inStock: true,
  },
  {
    id: '2',
    name: 'Merino Silk Tee',
    brand: 'Artisan Threads',
    price: 189.00,
    rating: 4.6,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    category: 'shirts',
    inStock: true,
  },
  {
    id: '3',
    name: 'Sapphire Chronograph',
    brand: 'Horology Labs',
    price: 2950.00,
    originalPrice: 3500.00,
    rating: 4.9,
    reviewCount: 56,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
    badge: 'best-seller',
    discount: 16,
    category: 'watches',
    inStock: true,
  },
  {
    id: '4',
    name: 'Velvet Noir',
    brand: 'Pigment & Co',
    price: 45.00,
    rating: 4.5,
    reviewCount: 203,
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80',
    category: 'pants',
    inStock: true,
  },
  {
    id: '5',
    name: 'Amber Mystique',
    brand: 'Maison de Luxe',
    price: 320.00,
    rating: 4.7,
    reviewCount: 98,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80',
    badge: 'best-seller',
    category: 'perfumes',
    inStock: true,
  },
  {
    id: '6',
    name: 'Cashmere Blend Tee',
    brand: 'Artisan Threads',
    price: 245.00,
    originalPrice: 295.00,
    rating: 4.4,
    reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
    badge: 'sale',
    discount: 17,
    category: 'shirts',
    inStock: false,
  },
  {
    id: '7',
    name: 'Midnight Sun',
    brand: 'Pigment & Co',
    price: 55.00,
    rating: 4.3,
    reviewCount: 145,
    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2eab?w=600&q=80',
    category: 'pants',
    inStock: true,
  },
  {
    id: '8',
    name: 'Celestial Moonphase',
    brand: 'Horology Labs',
    price: 5200.00,
    rating: 5.0,
    reviewCount: 23,
    image: 'https://images.unsplash.com/photo-1548171915-e3cb2c212a5a?w=600&q=80',
    badge: 'best-seller',
    category: 'watches',
    inStock: true,
  },
]

const titleVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const titleItemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function BestSellers() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section className='relative py-16 sm:py-20 md:py-24 lg:py-32 bg-zinc-950 dark:bg-[#0a0a0a] overflow-hidden'>
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.03)_0%,transparent_60%)]' />

      <div className='container-luxury relative z-10'>
        <motion.div
          ref={ref}
          variants={titleVariants}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          className='flex flex-row items-end justify-between mb-8 sm:mb-12 md:mb-16'
        >
          <div>
            <motion.p
              variants={titleItemVariants}
              className='text-[#d4af37] text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase mb-2 sm:mb-4'
            >
              Top Picks
            </motion.p>
            <motion.h2
              variants={titleItemVariants}
              className='text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white'
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              Best Sellers
            </motion.h2>
            <motion.div
              variants={titleItemVariants}
              className='luxury-divider mt-6'
            />
          </div>

          <motion.a
            variants={titleItemVariants}
            href='/products'
            className='group inline-flex items-center gap-2 hover:text-[#d4af37] transition-colors shrink-0'
            style={{ color: '#ffffff' }}
          >
            <span className='text-sm font-medium' style={{ color: '#ffffff' }}>View All</span>
            <FiArrowRight className='group-hover:translate-x-1 transition-transform' />
          </motion.a>
        </motion.div>

        <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6'>
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
