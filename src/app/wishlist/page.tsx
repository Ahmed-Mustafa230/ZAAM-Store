'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  inStock: boolean;
}

const initialWishlist: WishlistItem[] = [
  { id: '1', name: 'Classic Fit Wool Blazer', brand: 'Zegna', price: 1295, originalPrice: 1595, rating: 4.8, image: 'D:\Websites Projects\ZAAM Store\zaam-store\src\app\Product Images\AZURA PERFUMES', inStock: true },
  { id: '2', name: 'Italian Leather Derby Shoes', brand: 'Gucci', price: 895, originalPrice: 1095, rating: 4.9, image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=300&q=80', inStock: true },
  { id: '3', name: 'Cashmere Turtleneck Sweater', brand: 'Loro Piana', price: 1450, rating: 4.7, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&q=80', inStock: false },
  { id: '4', name: 'Silk Evening Gown', brand: 'Valentino', price: 3200, originalPrice: 3800, rating: 4.9, image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300&q=80', inStock: true },
  { id: '5', name: 'Limited Edition Chronograph Watch', brand: 'Rolex', price: 18500, rating: 4.9, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80', inStock: false },
];

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist);
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});
  const [shareOpen, setShareOpen] = useState(false);
  const [showRemoved, setShowRemoved] = useState<string | null>(null);

  const removeItem = (id: string) => {
    setShowRemoved(id);
    setTimeout(() => {
      setWishlist(prev => prev.filter(item => item.id !== id));
      setShowRemoved(null);
    }, 300);
  };

  const handleAddToCart = (id: string) => {
    setAddedToCart(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'My ZAAM Store Wishlist',
      text: 'Check out my luxury wishlist from ZAAM Store!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareOpen(true);
        setTimeout(() => setShareOpen(false), 2000);
      }
    } catch {
      setShareOpen(true);
      setTimeout(() => setShareOpen(false), 2000);
    }
  };

  const renderStars = (rating: number) => (
    <div className='flex items-center gap-0.5'>
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-[var(--color-accent)]' : 'text-[var(--color-light-gray)]'}`}
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
        </svg>
      ))}
    </div>
  );

  if (wishlist.length === 0) {
    return (
      <div className='min-h-screen bg-[var(--color-white)] font-[family-name:var(--font-body)]'>
        <div className='container-luxury py-8'>
          <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl'>
            My Wishlist
          </h1>
          <div className='luxury-divider' />
          <div className='flex flex-col items-center justify-center py-24'>
            <svg className='mb-6 h-24 w-24 text-[var(--color-light-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1' d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
            </svg>
            <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]'>
              Your wishlist is empty
            </h2>
            <p className='mt-2 text-[var(--color-mid-gray)]'>
              Save your favorite luxury pieces for later
            </p>
            <Link
              href='/products'
              className='gold-button mt-8 inline-flex items-center gap-2'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M15 19l-7-7 7-7' />
              </svg>
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--color-white)] font-[family-name:var(--font-body)]'>
      <div className='container-luxury py-8'>
        {/* Header */}
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl'>
              My Wishlist
            </h1>
            <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={handleShare}
              className='flex items-center gap-2 rounded-lg border border-[var(--color-light-gray)] px-4 py-2.5 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' />
              </svg>
              Share
            </button>
            <Link
              href='/products'
              className='flex items-center gap-2 rounded-lg border border-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-deep-black)] transition-colors'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M12 4v16m8-8H4' />
              </svg>
              Add More
            </Link>
          </div>
        </div>

        {/* Share Toast */}
        {shareOpen && (
          <div className='fixed right-4 top-4 z-50 animate-slide-down rounded-lg bg-[var(--color-deep-black)] px-4 py-3 text-sm text-[var(--color-white)] shadow-lg'>
            Link copied to clipboard!
          </div>
        )}

        {/* Wishlist Grid */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {wishlist.map((item) => (
            <div
              key={item.id}
              className={`group rounded-xl bg-[var(--color-cream)] overflow-hidden border border-[var(--color-light-gray)] transition-all hover:shadow-lg hover:-translate-y-1 ${
                showRemoved === item.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
              style={{ transitionDuration: '300ms' }}
            >
              <Link href={`/products/${item.id}`} className='relative aspect-[3/4] overflow-hidden block'>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className='object-cover transition-transform duration-700 group-hover:scale-105'
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                />
                {item.originalPrice && (
                  <span className='absolute left-3 top-3 rounded-full bg-[var(--color-error)] px-3 py-1 text-xs font-semibold text-white'>
                    -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                  </span>
                )}
                {!item.inStock && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                    <span className='rounded-full bg-[var(--color-white)] px-4 py-2 text-sm font-semibold text-[var(--color-deep-black)]'>
                      Out of Stock
                    </span>
                  </div>
                )}
              </Link>
              <div className='p-4'>
                <p className='text-xs font-medium uppercase tracking-wider text-[var(--color-accent-dark)]'>
                  {item.brand}
                </p>
                <Link href={`/products/${item.id}`}>
                  <h3 className='mt-1 font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--color-primary)] line-clamp-1 hover:text-[var(--color-accent)] transition-colors'>
                    {item.name}
                  </h3>
                </Link>
                <div className='mt-2'>{renderStars(item.rating)}</div>
                <div className='mt-2 flex items-center gap-2'>
                  <span className='font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-primary)]'>
                    Rs {item.price.toLocaleString()}
                  </span>
                  {item.originalPrice && (
                    <span className='text-sm text-[var(--color-mid-gray)] line-through'>
                      Rs {item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className='mt-4 flex gap-2'>
                  <button
                    onClick={() => handleAddToCart(item.id)}
                    disabled={!item.inStock}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                      addedToCart[item.id]
                        ? 'bg-[var(--color-success)] text-white'
                        : 'bg-[var(--color-deep-black)] text-[var(--color-white)] hover:bg-[var(--color-charcoal)]'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {addedToCart[item.id] ? 'Added!' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className='rounded-lg border border-[var(--color-light-gray)] px-3 py-2.5 text-[var(--color-mid-gray)] hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors'
                  >
                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
