'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export default function WishlistPage() {
  const { items: wishlist, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: typeof wishlist[0]) => {
    addItem({
      _id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

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
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl'>
              My Wishlist
            </h1>
            <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
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

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {wishlist.map((item) => (
            <div
              key={item.id}
              className='group rounded-xl bg-[var(--color-cream)] overflow-hidden border border-[var(--color-light-gray)] transition-all hover:shadow-lg hover:-translate-y-1'
            >
              <Link href={`/products/${item.productId}`} className='relative aspect-[3/4] overflow-hidden block'>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className='object-cover transition-transform duration-700 group-hover:scale-105'
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                />
              </Link>
              <div className='p-4'>
                <Link href={`/products/${item.productId}`}>
                  <h3 className='font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--color-primary)] line-clamp-1 hover:text-[var(--color-accent)] transition-colors'>
                    {item.name}
                  </h3>
                </Link>
                <div className='mt-2 flex items-center gap-2'>
                  <span className='font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-primary)]'>
                    Rs {item.price.toLocaleString()}
                  </span>
                </div>
                <div className='mt-4 flex gap-2'>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className='flex-1 rounded-lg bg-[var(--color-deep-black)] py-2.5 text-sm font-medium text-[var(--color-white)] hover:bg-[var(--color-charcoal)] transition-all'
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
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
