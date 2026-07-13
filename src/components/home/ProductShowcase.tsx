'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, useInView, type Variants } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import ProductCard, { type Product } from '../products/ProductCard'

interface ApiImage {
  public_id: string
  url: string
  secure_url: string
  is_primary: boolean
}

interface ApiProduct {
  _id: string
  name: string
  brand: string
  category: string
  price: number
  comparePrice?: number
  images: ApiImage[]
  stock: number
  rating: number
  numReviews: number
  colors: string[]
  isFeatured: boolean
  isNewArrival: boolean
  discount: number
}

const categoryMap: Record<string, string> = {
  shirts: 't-shirts',
  pant: 'pants',
  perfume: 'perfumes',
  watches: 'watches',
}

function toProduct(p: ApiProduct): Product {
  const primary = p.images?.find((i) => i.is_primary) || p.images?.[0]
  const mappedCategory = categoryMap[p.category] || p.category
  let badge: Product['badge'] = undefined
  if (p.discount > 0) badge = 'sale'
  else if (p.isNewArrival) badge = 'new'
  else if (p.isFeatured) badge = 'best-seller'

  return {
    id: p._id,
    name: p.name,
    brand: p.brand || '',
    price: p.price,
    originalPrice: p.comparePrice || undefined,
    rating: p.rating || 0,
    reviewCount: p.numReviews || 0,
    image: primary?.secure_url || primary?.url || '',
    badge,
    discount: p.discount || undefined,
    category: mappedCategory,
    colors: p.colors || [],
    inStock: p.stock > 0,
  }
}

type Category = 'all' | 'perfumes' | 't-shirts' | 'pants' | 'watches'

interface CategoryTab {
  key: Category
  label: string
  count: number
}

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

const categoryLabels: Record<Category, string> = {
  all: 'All Products',
  perfumes: 'Perfumes',
  't-shirts': 'T-Shirts',
  pants: 'Pants',
  watches: 'Watches',
}

export default function ProductShowcase() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=8')
        const data = await res.json()
        const items: ApiProduct[] = data.products || []
        setProducts(items.map(toProduct))
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const categories: CategoryTab[] = useMemo(() => {
    const counts = { all: products.length } as Record<Category, number>
    for (const cat of ['perfumes', 't-shirts', 'pants', 'watches'] as Category[]) {
      counts[cat] = products.filter((p) => p.category === cat).length
    }
    return (['all', 'perfumes', 't-shirts', 'pants', 'watches'] as Category[]).map((key) => ({
      key,
      label: categoryLabels[key],
      count: counts[key],
    }))
  }, [products])

  const filteredProducts = useMemo(
    () => (activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory)),
    [activeCategory, products]
  )

  return (
    <section className='relative py-16 sm:py-20 md:py-24 lg:py-32 bg-zinc-950 dark:bg-[#0a0a0a] overflow-hidden'>
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.03)_0%,transparent_60%)]' />

      <div className='container-luxury relative z-10'>
        <motion.div
          ref={ref}
          variants={titleVariants}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          className='flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 md:mb-16'
        >
          <div>
            <motion.p
              variants={titleItemVariants}
              className='text-[#d4af37] text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase mb-2 sm:mb-4'
            >
              Discover
            </motion.p>
            <motion.h2
              variants={titleItemVariants}
              className='text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white'
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              Shop the Collection
            </motion.h2>
            <motion.div
              variants={titleItemVariants}
              className='luxury-divider mt-6'
            />
          </div>

          <motion.a
            variants={titleItemVariants}
            href='/products'
            className='group inline-flex items-center gap-2 hover:text-[#d4af37] transition-colors shrink-0 mt-4 sm:mt-0'
            style={{ color: '#ffffff' }}
          >
            <span className='text-sm font-medium' style={{ color: '#ffffff' }}>View All</span>
            <FiArrowRight className='group-hover:translate-x-1 transition-transform' />
          </motion.a>
        </motion.div>

        <div className='flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-12'>
          {categories.map((cat) => (
            <motion.button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`relative px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.key
                  ? 'text-[#0a0a0a]'
                  : 'text-zinc-400 hover:text-zinc-200 bg-white/5 hover:bg-white/10'
              }`}
              whileHover={{ scale: activeCategory === cat.key ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {activeCategory === cat.key && (
                <motion.span
                  layoutId='activeCategory'
                  className='absolute inset-0 rounded-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#f0d060]'
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className='relative z-10'>{cat.label}</span>
            </motion.button>
          ))}
        </div>

        <div className='relative min-h-[400px]'>
          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <div className='w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin' />
            </div>
          ) : (
            <AnimatePresence mode='wait'>
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {filteredProducts.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-20 text-zinc-500'>
                    <p className='text-lg'>No products found</p>
                  </div>
                ) : (
                  <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6'>
                    {filteredProducts.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  )
}
