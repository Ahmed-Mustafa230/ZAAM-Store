'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, type PanInfo } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import type { Product } from './ProductCard'

interface ProductCarouselProps {
  products: Product[]
  autoPlay?: boolean
  autoPlayInterval?: number
}

export default function ProductCarousel({
  products: allProducts,
  autoPlay = true,
  autoPlayInterval = 4000,
}: ProductCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })

  const totalSlides = allProducts.length

  const getIndex = useCallback(
    (offset: number) => {
      return ((current + offset) % totalSlides + totalSlides) % totalSlides
    },
    [current, totalSlides]
  )

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1)
      setCurrent(index)
      x.set(0)
    },
    [current, x]
  )

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % totalSlides)
    x.set(0)
  }, [totalSlides, x])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides)
    x.set(0)
  }, [totalSlides, x])

  useEffect(() => {
    if (!autoPlay || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      goNext()
    }, autoPlayInterval)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoPlay, isPaused, goNext, autoPlayInterval])

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 80
    if (info.offset.x < -threshold) {
      goNext()
    } else if (info.offset.x > threshold) {
      goPrev()
    } else {
      x.set(0)
    }
  }

  const products = [
    allProducts[getIndex(-1)],
    allProducts[getIndex(0)],
    allProducts[getIndex(1)],
  ]

  return (
    <div
      ref={containerRef}
      className='relative w-full overflow-hidden py-12 px-4'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className='max-w-6xl mx-auto'>
        <motion.div
          className='flex items-center justify-center gap-4 md:gap-8'
          drag='x'
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
          style={{ x: springX }}
        >
          <AnimatePresence mode='popLayout' custom={direction}>
            {products.map((product, i) => {
              const isCenter = i === 1
              const slideIndex = getIndex(i - 1)

              return (
                <motion.div
                  key={product.id + '-' + slideIndex}
                  layout
                  custom={direction}
                  initial={{
                    opacity: 0,
                    scale: isCenter ? 0.8 : 0.6,
                    x: isCenter ? 0 : direction > 0 ? 200 : -200,
                  }}
                  animate={{
                    opacity: 1,
                    scale: isCenter ? 1 : 0.75,
                    x: isCenter ? 0 : (i === 0 ? -1 : 1) * (isCenter ? 0 : -60),
                    zIndex: isCenter ? 10 : 5,
                  }}
                  exit={{
                    opacity: 0,
                    scale: isCenter ? 0.8 : 0.6,
                    transition: { duration: 0.3 },
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    duration: 0.5,
                  }}
                  className={`relative cursor-pointer ${
                    isCenter
                      ? 'w-[280px] sm:w-[340px] md:w-[400px]'
                      : 'w-[200px] sm:w-[240px] md:w-[280px] hidden md:block'
                  }`}
                  onClick={() => {
                    if (!isCenter) {
                      goTo(slideIndex)
                    }
                  }}
                  style={{
                    perspective: 1000,
                  }}
                >
                  <div
                    className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
                      isCenter
                        ? 'shadow-[0_20px_60px_rgba(212,175,55,0.15)] ring-1 ring-[#d4af37]/20'
                        : 'shadow-lg opacity-60 hover:opacity-80'
                    }`}
                    style={{
                      transform: isCenter
                        ? 'perspective(1000px) rotateY(0deg) translateZ(40px)'
                        : i === 0
                          ? 'perspective(1000px) rotateY(12deg) translateZ(-20px)'
                          : 'perspective(1000px) rotateY(-12deg) translateZ(-20px)',
                    }}
                  >
                    <div className='aspect-[3/4] bg-[#1a1a2e] overflow-hidden'>
                      <img
                        src={product.image}
                        alt={product.name}
                        className='w-full h-full object-cover'
                        draggable={false}
                        onError={(e) => {
                          const target = e.currentTarget
                          target.style.display = 'none'
                        }}
                      />
                    </div>

                    <div
                      className={`absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent ${
                        isCenter ? 'opacity-100' : 'opacity-0'
                      } transition-opacity duration-300`}
                    >
                      <p className='text-white/50 text-xs uppercase tracking-wider mb-1'>
                        {product.brand}
                      </p>
                      <h3
                        className='text-white font-semibold text-base md:text-lg truncate'
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {product.name}
                      </h3>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='text-[#d4af37] font-semibold'>
                          Rs {product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className='text-white/30 text-sm line-through'>
                            Rs {product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {product.badge && (
                      <span
                        className={`absolute top-3 left-3 z-10 px-3 py-1 text-xs font-semibold rounded-full ${
                          product.badge === 'new'
                            ? 'bg-emerald-500/90 text-white'
                            : product.badge === 'sale'
                              ? 'bg-rose-500/90 text-white'
                              : 'bg-[#d4af37] text-[#0a0a0a]'
                        }`}
                      >
                        {product.badge === 'new'
                          ? 'New'
                          : product.badge === 'sale'
                            ? 'Sale'
                            : 'Best Seller'}
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        <div className='flex items-center justify-center gap-4 mt-8'>
          <button
            onClick={goPrev}
            className='w-11 h-11 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all'
            aria-label='Previous'
          >
            <FiChevronLeft size={20} />
          </button>

          <div className='flex items-center gap-2'>
            {allProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === current
                    ? 'w-8 bg-[#d4af37]'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className='w-11 h-11 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all'
            aria-label='Next'
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
