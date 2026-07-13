'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
  discount: number
  isNewArrival: boolean
}

interface Product {
  id: string
  name: string
  brand: string
  category: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  image: string
  inStock: boolean
  isNew?: boolean
}

function toProduct(p: ApiProduct): Product {
  const primary = p.images?.find((i: ApiImage) => i.is_primary) || p.images?.[0]
  return {
    id: p._id,
    name: p.name,
    brand: p.brand || '',
    category: p.category,
    price: p.price,
    originalPrice: p.comparePrice || undefined,
    rating: p.rating || 0,
    reviewCount: p.numReviews || 0,
    image: primary?.secure_url || primary?.url || '',
    inStock: p.stock > 0,
    isNew: p.isNewArrival || false,
  }
}

export default function SuggestionPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/products?new=true&limit=50')
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`)
        }
        const data = await res.json()
        const items: ApiProduct[] = data.products || []
        setProducts(items.map(toProduct))
      } catch (err) {
        console.error('Suggestion fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load products')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filtered = products
    .filter(p => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price
        case 'price-desc': return b.price - a.price
        case 'rating': return b.rating - a.rating
        default: return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
      }
    })

  return (
    <div className='min-h-screen bg-[var(--color-white)] font-[family-name:var(--font-body)]'>
      <div className='container-luxury pt-4 pb-8'>
        <div className='mb-6'>
          <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[#d4af37] sm:text-4xl'>
            Suggestion
          </h1>
          <div className='luxury-divider' />
          <p className='text-lg text-[var(--color-mid-gray)] font-[family-name:var(--font-great-vibes)] tracking-wide'>
            Fresh arrivals curated just for you
          </p>
        </div>

        <div className='sticky top-0 z-10 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-[var(--color-white)] py-2'>
          <div className='relative flex-1 max-w-md'>
            <svg className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-mid-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
            <input
              type='text'
              placeholder='Search suggestions...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] py-3 pl-12 pr-4 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all'
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className='rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]'
          >
            <option value='newest'>Newest</option>
            <option value='price-asc'>Price: Low to High</option>
            <option value='price-desc'>Price: High to Low</option>
            <option value='rating'>Best Rating</option>
          </select>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='h-8 w-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin' />
          </div>
        ) : error ? (
          <div className='flex flex-col items-center justify-center py-20'>
            <svg className='mb-4 h-16 w-16 text-[var(--color-light-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1' d='M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <h3 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
              Something went wrong
            </h3>
            <p className='mt-2 text-[var(--color-mid-gray)]'>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20'>
            <svg className='mb-4 h-16 w-16 text-[var(--color-light-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1' d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <h3 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
              No suggestions yet
            </h3>
            <p className='mt-2 text-[var(--color-mid-gray)]'>
              {products.length > 0 ? 'Try adjusting your search' : 'No new products available yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className='mb-4 flex items-center justify-between'>
              <p className='text-sm text-[var(--color-mid-gray)]'>
                Showing <span className='font-medium text-[var(--color-primary)]'>{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className='group rounded-lg bg-[var(--color-cream)] overflow-hidden border border-[var(--color-light-gray)] transition-all hover:shadow-md hover:-translate-y-0.5'
                >
                  <div className='relative aspect-[4/5] overflow-hidden'>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className='object-cover transition-transform duration-500 group-hover:scale-105'
                      sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
                    />
                    {product.isNew && (
                      <span className='absolute left-2 top-2 rounded-full bg-[#d4af37] px-2 py-0.5 text-[10px] font-semibold text-black'>
                        New
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className='absolute right-2 top-2 rounded-full bg-[var(--color-error)] px-2 py-0.5 text-[10px] font-semibold text-white'>
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </span>
                    )}
                    {!product.inStock && (
                      <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                        <span className='rounded-full bg-[var(--color-white)] px-3 py-1 text-xs font-semibold text-[var(--color-deep-black)]'>
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  <div className='p-2.5'>
                    <p className='text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent-dark)] truncate'>
                      {product.brand}
                    </p>
                    <h3 className='mt-0.5 font-[family-name:var(--font-heading)] text-xs font-semibold text-[var(--color-primary)] line-clamp-1 leading-snug'>
                      {product.name}
                    </h3>
                    <div className='mt-1.5 flex items-center gap-1.5'>
                      <div className='flex items-center'>
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-2.5 w-2.5 ${i < Math.floor(product.rating) ? 'text-[#d4af37]' : 'text-[var(--color-light-gray)]'}`}
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                          </svg>
                        ))}
                      </div>
                      <span className='text-[10px] text-[var(--color-mid-gray)]'>({product.reviewCount})</span>
                    </div>
                    <div className='mt-1.5 flex items-center gap-1'>
                      <span className='font-[family-name:var(--font-heading)] text-sm font-bold text-[var(--color-primary)]'>
                        Rs {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className='text-[10px] text-[var(--color-mid-gray)] line-through'>
                        Rs {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
