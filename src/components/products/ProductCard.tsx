'use client'

import { useRef, useState, useCallback, type MouseEvent } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform, type Variants } from 'framer-motion'
import { FiHeart, FiEye, FiShoppingBag, FiStar } from 'react-icons/fi'
import { GoHeartFill } from 'react-icons/go'

export interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  image: string
  badge?: 'new' | 'sale' | 'best-seller'
  discount?: number
  category: string
  colors?: string[]
  inStock: boolean
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'text-xs' : 'text-sm'
  return (
    <div className={`flex items-center gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(rating) ? 'text-[#d4af37]' : 'text-white/20'}>
          <FiStar className='fill-current' />
        </span>
      ))}
    </div>
  )
}

function Badge({ type }: { type: Product['badge'] }) {
  if (!type) return null

  const styles = {
    new: 'bg-emerald-500/90 text-white',
    sale: 'bg-rose-500/90 text-white',
    'best-seller': 'bg-[#d4af37] text-[#0a0a0a]',
  }

  const labels = {
    new: 'New',
    sale: 'Sale',
    'best-seller': 'Best Seller',
  }

  return (
    <span className={`absolute top-3 left-3 z-20 px-3 py-1 text-xs font-semibold rounded-full ${styles[type]}`}>
      {labels[type]}
    </span>
  )
}

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product
  index?: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 30,
  })

  const shadowX = useSpring(useTransform(x, [-0.5, 0.5], [-20, 20]), {
    stiffness: 200,
    damping: 30,
  })
  const shadowY = useSpring(useTransform(y, [-0.5, 0.5], [20, -20]), {
    stiffness: 200,
    damping: 30,
  })

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const xVal = (e.clientX - rect.left) / rect.width - 0.5
    const yVal = (e.clientY - rect.top) / rect.height - 0.5
    x.set(xVal)
    y.set(yVal)
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }, [x, y])

  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true)
    await new Promise((r) => setTimeout(r, 600))
    setIsAddingToCart(false)
  }, [])

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.2 }}
      className='group'
    >
      <Link href={`/products/${product.id}`} className='block'>
      <div
        ref={cardRef}
        className='relative rounded-xl overflow-hidden bg-[#111] border border-white/5 transition-colors duration-300 hover:border-white/10'
        style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.div
            className='relative aspect-[4/5] overflow-hidden bg-[#1a1a2e]'
            style={{
              boxShadow: useTransform(
                [shadowX, shadowY],
                ([sx, sy]) => `${sx}px ${sy}px 40px rgba(0,0,0,0.4)`
              ),
            }}
          >
            <Badge type={product.badge} />

            {discountPercentage > 0 && product.badge !== 'sale' && (
              <span className='absolute top-3 right-3 z-20 bg-rose-500/90 text-white px-2 py-1 text-xs font-semibold rounded-full'>
                -{discountPercentage}%
              </span>
            )}

            <motion.button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIsWishlisted(!isWishlisted); }}
              className='absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isWishlisted ? (
                <GoHeartFill className='text-rose-400 text-lg' />
              ) : (
                <FiHeart className='text-white/70 text-lg' />
              )}
            </motion.button>

            <motion.button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
              className='absolute top-14 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label='Quick view'
            >
              <FiEye className='text-white/70 text-base' />
            </motion.button>

            <motion.div
              className='absolute inset-0 bg-black/0 z-10'
              animate={{ backgroundColor: isHovered ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0)' }}
            />

            <motion.img
              src={product.image}
              alt={product.name}
              className='w-full h-full object-cover'
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  const fallback = document.createElement('div')
                  fallback.className = 'w-full h-full flex items-center justify-center text-white/20 text-sm bg-[#1a1a2e]'
                  fallback.textContent = 'Image not available'
                  parent.appendChild(fallback)
                }
              }}
            />

            <motion.div
              className='absolute inset-x-0 bottom-0 z-20 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent'
              animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleAddToCart(); }}
                disabled={!product.inStock || isAddingToCart}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  !product.inStock
                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                    : isAddingToCart
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#d4af37] text-[#0a0a0a] hover:bg-[#e0be40] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                }`}
                whileHover={product.inStock && !isAddingToCart ? { scale: 1.02 } : {}}
                whileTap={product.inStock && !isAddingToCart ? { scale: 0.98 } : {}}
              >
                {!product.inStock ? (
                  'Out of Stock'
                ) : isAddingToCart ? (
                  <>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className='text-lg'
                    >
                      ✓
                    </motion.span>
                    Added
                  </>
                ) : (
                  <>
                    <FiShoppingBag className='text-base' />
                    Add to Cart
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>

          <div className='p-2 sm:p-3 lg:p-4'>
            <p className='text-[8px] sm:text-[10px] lg:text-xs text-zinc-400 uppercase tracking-wider mb-0.5 sm:mb-1'>
              {product.brand}
            </p>

            <h3
              className='text-zinc-100 font-semibold text-[10px] sm:text-sm lg:text-base leading-tight mb-0.5 sm:mb-1 lg:mb-1.5 truncate'
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {product.name}
            </h3>

            <div className='flex items-center gap-0.5 sm:gap-1 lg:gap-2 mb-1 sm:mb-1.5 lg:mb-2'>
              <StarRating rating={product.rating} />
              <span className='text-[8px] sm:text-[10px] lg:text-xs text-zinc-500'>({product.reviewCount})</span>
            </div>

            <div className='flex items-center gap-1 sm:gap-1.5 lg:gap-2'>
              <span className='text-zinc-100 font-semibold text-[11px] sm:text-sm lg:text-base'>
                Rs {product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className='text-zinc-500 text-[9px] sm:text-xs lg:text-sm line-through'>
                  Rs {product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      </Link>
    </motion.div>
  )
}

export { StarRating }
