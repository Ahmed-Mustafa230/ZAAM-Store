'use client'

import { useRef, useState, useCallback, useEffect, type MouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { computeDiscountDetails } from '@/lib/pricing'
import { motion, useMotionValue, useSpring, useTransform, type Variants } from 'framer-motion'
import { FiShoppingBag, FiStar, FiCheck } from 'react-icons/fi'

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
  isNew?: boolean
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
  const sizeClass = size === 'sm' ? 'text-[9px] sm:text-[10px]' : 'text-sm'
  return (
    <div className={`flex items-center gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(rating) ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-300 dark:text-zinc-700'}>
          <FiStar className='fill-current' />
        </span>
      ))}
    </div>
  )
}

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product
  index?: number
  compactCta?: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [imgError, setImgError] = useState(false)
  const { addItem } = useCart()
  const addToCartTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  useEffect(() => {
    return () => {
      if (addToCartTimer.current) clearTimeout(addToCartTimer.current)
    }
  }, [])

  const handleAddToCart = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.inStock || isAddingToCart) return
    const { discountPercent } = computeDiscountDetails(product.price, product.originalPrice)
    addItem(
      {
        _id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: discountPercent,
        image: product.image,
      },
      1,
      undefined,
      undefined
    )
    setIsAddingToCart(true)
    if (addToCartTimer.current) clearTimeout(addToCartTimer.current)
    addToCartTimer.current = setTimeout(() => setIsAddingToCart(false), 1500)
  }, [product, addItem, isAddingToCart])

  const { discountPercent: discountPercentage, discountAmount: saveAmount } = computeDiscountDetails(product.price, product.originalPrice)

  const showDiscountBadge = discountPercentage > 0

  const statusLabel = showDiscountBadge
    ? 'Sale'
    : product.badge === 'new' || product.isNew
      ? 'New'
      : product.badge === 'best-seller'
        ? 'Best Seller'
        : null

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.2 }}
      className='group min-w-0'
    >
      <Link href={`/products/${product.id}`} className='block h-full'>
        <div
          ref={cardRef}
          className='relative flex h-full flex-col overflow-hidden rounded-[20px] border border-zinc-200 bg-white transition-colors duration-300 hover:border-zinc-300 dark:border-white/[0.08] dark:bg-[#0d0d10] dark:hover:border-white/20'
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
            className='flex h-full flex-col'
          >
            <motion.div
              className='relative aspect-[4/5] w-full overflow-hidden bg-[#16161c]'
              style={{
                boxShadow: useTransform(
                  [shadowX, shadowY],
                  ([sx, sy]) => `${sx}px ${sy}px 40px rgba(0,0,0,0.4)`
                ),
              }}
            >
              {statusLabel && (
                <span className='absolute left-2 top-2 z-20 rounded-full bg-[#d4af37] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0a0a0a] sm:left-2.5 sm:top-2.5 sm:px-2 sm:py-1 sm:text-[10px] lg:text-[11px]'>
                  {statusLabel}
                </span>
              )}

              {showDiscountBadge && (
                <span className='absolute right-2 top-2 z-20 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white sm:right-2.5 sm:top-2.5 sm:px-2 sm:py-1 sm:text-[10px] lg:text-[11px]'>
                  -{discountPercentage}%
                </span>
              )}

              {imgError ? (
                <div className='absolute inset-0 flex items-center justify-center bg-[#16161c] text-sm text-white/20'>
                  Image not available
                </div>
              ) : (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className='object-cover transition-transform duration-500 group-hover:scale-105'
                  sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
                  onError={() => setImgError(true)}
                />
              )}

              <motion.div
                className='absolute inset-0 z-10 bg-black/0'
                animate={{ backgroundColor: isHovered ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0)' }}
              />
            </motion.div>

            <div className='flex min-w-0 flex-1 flex-col p-2 sm:p-2.5'>
              <p className='truncate text-[10px] font-medium uppercase tracking-[0.12em] text-[#d4af37] sm:text-[11px] lg:text-xs'>
                {product.brand}
              </p>

              <h3
                className='mt-1 line-clamp-2 min-w-0 break-words text-[16px] font-semibold leading-snug text-black dark:text-zinc-100 sm:text-base lg:text-lg'
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {product.name}
              </h3>

              <div className='mt-1.5 flex min-w-0 items-center justify-between gap-1.5'>
                <div className='flex min-w-0 items-center gap-1'>
                  <StarRating rating={product.rating} />
                  <span className='shrink-0 text-[9px] text-zinc-500 dark:text-zinc-400 sm:text-[10px]'>({product.reviewCount})</span>
                </div>
                <motion.button
                  type='button'
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  aria-label={isAddingToCart ? `Added ${product.name} to cart` : `Add ${product.name} to cart`}
                  className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-colors sm:h-9 sm:w-9 ${
                    isAddingToCart
                      ? 'border-zinc-300 bg-zinc-100 dark:border-white/30 dark:bg-white/20'
                      : product.inStock
                        ? 'border-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/20'
                        : 'cursor-not-allowed border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/5'
                  }`}
                  whileHover={product.inStock ? { scale: 1.1 } : {}}
                  whileTap={product.inStock ? { scale: 0.9 } : {}}
                >
                  {isAddingToCart ? (
                    <FiCheck className='text-sm text-[#d4af37] sm:text-base' />
                  ) : (
                    <FiShoppingBag
                      className={`text-sm sm:text-base ${product.inStock ? 'text-zinc-700 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}`}
                    />
                  )}
                </motion.button>
              </div>

              <div className='mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5'>
                <span className='whitespace-nowrap text-xs font-bold text-black dark:text-zinc-100 sm:text-sm lg:text-base'>
                  Rs {product.price.toLocaleString()}
                </span>
                {saveAmount > 0 && (
                  <span className='whitespace-nowrap text-[9px] text-zinc-500 dark:text-zinc-400 line-through sm:text-[10px] lg:text-xs'>
                    Rs {product.originalPrice!.toLocaleString()}
                  </span>
                )}
              </div>
              {saveAmount > 0 && (
                <p className='mt-0.5 text-[9px] font-medium text-rose-500 sm:text-[10px]'>
                  Save Rs {saveAmount.toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  )
}

export { StarRating }
