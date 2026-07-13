'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiStar } from 'react-icons/fi'
import type { Product } from './ProductCard'

interface ProductShowcaseProps {
  product: Product
  additionalImages?: string[]
}

const imageVariants: Variants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 200 : -200,
    scale: 0.95,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -200 : 200,
    scale: 0.95,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function ProductShowcase({
  product,
  additionalImages = [],
}: ProductShowcaseProps) {
  const allImages = [product.image, ...additionalImages].filter(Boolean)
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const imageRef = useRef<HTMLDivElement>(null)

  const goNext = useCallback(() => {
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % allImages.length)
  }, [allImages.length])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }, [allImages.length])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZoomed || !imageRef.current) return
      const rect = imageRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePos({ x, y })
    },
    [isZoomed]
  )

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
      <div className='space-y-4'>
        <div
          ref={imageRef}
          className='relative aspect-square rounded-2xl overflow-hidden bg-[#1a1a2e] border border-white/5 group cursor-crosshair'
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
        >
          <AnimatePresence mode='wait' custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={imageVariants}
              initial='enter'
              animate='center'
              exit='exit'
              className='w-full h-full'
            >
              <img
                src={allImages[activeIndex]}
                alt={`${product.name} - View ${activeIndex + 1}`}
                className={`w-full h-full object-cover transition-transform duration-200 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={
                  isZoomed
                    ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
                    : undefined
                }
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                }}
              />
            </motion.div>
          </AnimatePresence>

          <button
            onClick={goPrev}
            className='absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100'
            aria-label='Previous image'
          >
            <FiChevronLeft size={18} />
          </button>

          <button
            onClick={goNext}
            className='absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100'
            aria-label='Next image'
          >
            <FiChevronRight size={18} />
          </button>

          <div className='absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/40 opacity-0 group-hover:opacity-100 transition-all'>
            <FiZoomIn size={16} />
          </div>
        </div>

        <div className='flex gap-3 overflow-x-auto pb-2'>
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > activeIndex ? 1 : -1)
                setActiveIndex(index)
              }}
              className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                index === activeIndex
                  ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                  : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${product.name} thumbnail ${index + 1}`}
                className='w-full h-full object-cover'
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className='flex flex-col justify-center space-y-6'>
        <div>
          <p className='text-[#d4af37] text-sm uppercase tracking-[0.2em] mb-2'>
            {product.brand}
          </p>

          <h1
            className='text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight'
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {product.name}
          </h1>
        </div>

        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1'>
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                className={`text-lg ${
                  star <= Math.round(product.rating)
                    ? 'text-[#d4af37] fill-[#d4af37]'
                    : 'text-white/20'
                }`}
              />
            ))}
          </div>
          <span className='text-white/40 text-sm'>
            {product.rating} ({product.reviewCount} reviews)
          </span>
        </div>

        <div className='flex items-center gap-3'>
          <span className='text-3xl font-bold text-white'>
            Rs {product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <>
              <span className='text-xl text-white/30 line-through'>
                Rs {product.originalPrice.toFixed(2)}
              </span>
              <span className='px-3 py-1 bg-rose-500/20 text-rose-300 text-sm font-semibold rounded-full'>
                Save Rs {(product.originalPrice - product.price).toFixed(2)}
              </span>
            </>
          )}
        </div>

        <p className='text-white/50 leading-relaxed'>
          Experience unparalleled quality with this premium offering from {product.brand}.
          Crafted with the finest materials and meticulous attention to detail, this piece
          exemplifies the ZAAM standard of excellence.
        </p>

        <div className='flex flex-col sm:flex-row gap-3 pt-4'>
          <motion.button
            disabled={!product.inStock}
            className={`flex-1 py-4 px-8 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              product.inStock
                ? 'bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#f0d060] text-[#0a0a0a] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
            whileHover={product.inStock ? { scale: 1.02 } : {}}
            whileTap={product.inStock ? { scale: 0.98 } : {}}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </motion.button>

          <motion.button
            className='px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-all'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add to Wishlist
          </motion.button>
        </div>

        <div className='pt-4 border-t border-white/5'>
          <div className='flex items-center gap-6 text-sm text-white/40'>
            <span className='flex items-center gap-2'>
              <span className='w-2 h-2 rounded-full bg-emerald-500' />
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
            <span>Free shipping over Rs 200</span>
            <span>30-day returns</span>
          </div>
        </div>
      </div>
    </div>
  )
}
