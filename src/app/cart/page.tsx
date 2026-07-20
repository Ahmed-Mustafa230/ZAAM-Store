'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const SHIPPING_THRESHOLD = 200;
const SHIPPING_COST = 25;
const TAX_RATE = 0.08;

interface SavedItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
}

export default function CartPage() {
  const { items: cartItems, removeItem, updateQuantity, addItem } = useCart();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  const saveForLater = (item: typeof cartItems[0]) => {
    setSavedItems(prev => [...prev, { id: item.id, productId: item.productId, name: item.name, price: item.price, image: item.image, size: item.size, color: item.color }]);
    removeItem(item.id);
  };

  const removeSavedItem = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleMoveToCart = (item: SavedItem) => {
    setSavedItems(prev => prev.filter(i => i.id !== item.id));
    addItem({
      _id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
    }, 1, item.size, item.color);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    try {
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderTotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.message || 'Invalid coupon code');
        setCouponApplied(false);
        setPromoDiscount(0);
        return;
      }
      setCouponApplied(true);
      setPromoDiscount(data.discountAmount / (subtotal || 1));
      setCouponError('');
    } catch {
      setCouponError('Failed to validate coupon. Please try again.');
      setCouponApplied(false);
      setPromoDiscount(0);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = couponApplied ? promoDiscount * subtotal : 0;
  const shipping = subtotal > SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + shipping + tax;

  if (cartItems.length === 0 && savedItems.length === 0) {
    return (
      <div className='min-h-screen bg-[var(--color-white)] font-[family-name:var(--font-body)]'>
        <div className='container-luxury py-8'>
          <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl'>
            Shopping Cart
          </h1>
          <div className='luxury-divider' />
          <div className='flex flex-col items-center justify-center py-24'>
            <svg className='mb-6 h-24 w-24 text-[var(--color-light-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1' d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' />
            </svg>
            <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]'>
              Your cart is empty
            </h2>
            <p className='mt-2 text-[var(--color-mid-gray)]'>
              Discover luxury pieces that speak to you
            </p>
            <Link
              href='/products'
              className='gold-button mt-8 inline-flex items-center gap-2'
            >
              Continue Shopping
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
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl'>
              Shopping Cart
            </h1>
            <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Link
            href='/products'
            className='hidden items-center gap-2 text-sm text-[var(--color-accent)] hover:underline sm:flex'
          >
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M15 19l-7-7 7-7' />
            </svg>
            Continue Shopping
          </Link>
        </div>

        <div className='grid gap-8 lg:grid-cols-3'>
          {/* Cart Items */}
          <div className='lg:col-span-2 space-y-6'>
            {cartItems.map((item) => (
              <div key={item.id} className='flex gap-4 rounded-xl border border-[var(--color-light-gray)] p-4 sm:gap-6 sm:p-6'>
                <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--color-cream)] sm:h-28 sm:w-28'>
                  <Image src={item.image} alt={item.name} fill className='object-cover' sizes='112px' />
                </div>
                <div className='flex flex-1 flex-col justify-between'>
                  <div>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3 className='font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--color-primary)] sm:text-lg'>
                          {item.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className='rounded-full p-1.5 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] hover:text-[var(--color-error)] transition-colors'
                      >
                        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                      </button>
                    </div>
                    {(item.size || item.color) && (
                      <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && ' | '}
                        {item.color && `Color: ${item.color}`}
                      </p>
                    )}
                  </div>
                  <div className='mt-3 flex items-center justify-between sm:mt-0'>
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center rounded-lg border border-[var(--color-light-gray)]'>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className='px-3 py-1.5 text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'
                          disabled={item.quantity <= 1}
                        >
                          <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20 12H4' />
                          </svg>
                        </button>
                        <span className='w-8 text-center text-sm font-medium text-[var(--color-primary)]'>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className='px-3 py-1.5 text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'
                          disabled={item.quantity >= 10}
                        >
                          <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => saveForLater(item)}
                        className='text-xs text-[var(--color-mid-gray)] hover:text-[var(--color-accent)] transition-colors'
                      >
                        Save for later
                      </button>
                    </div>
                    <div className='text-right'>
                      <span className='font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-primary)]'>
                        Rs {(item.price * item.quantity).toLocaleString()}
                      </span>
                      {item.quantity > 1 && (
                        <p className='text-xs text-[var(--color-mid-gray)]'>
                          Rs {item.price.toLocaleString()} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Saved for Later */}
            {savedItems.length > 0 && (
              <div className='mt-10'>
                <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
                  Saved for Later ({savedItems.length})
                </h2>
                <div className='mt-4 space-y-4'>
                  {savedItems.map((item) => (
                    <div key={item.id} className='flex gap-4 rounded-xl border border-[var(--color-light-gray)] p-4 sm:gap-6 sm:p-6 opacity-75'>
                      <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--color-cream)]'>
                        <Image src={item.image} alt={item.name} fill className='object-cover' sizes='80px' />
                      </div>
                      <div className='flex flex-1 items-center justify-between'>
                        <div>
                          <h3 className='font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--color-primary)]'>
                            {item.name}
                          </h3>
                          <span className='font-[family-name:var(--font-heading)] text-base font-bold text-[var(--color-primary)]'>
                            Rs {item.price.toLocaleString()}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleMoveToCart(item)}
                            className='rounded-lg border border-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-deep-black)] transition-colors'
                          >
                            Move to Cart
                          </button>
                          <button
                            onClick={() => removeSavedItem(item.id)}
                            className='rounded-lg p-1.5 text-[var(--color-mid-gray)] hover:text-[var(--color-error)] transition-colors'
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
            )}

            {/* Mobile Continue Shopping */}
            <Link
              href='/products'
              className='flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline sm:hidden'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M15 19l-7-7 7-7' />
              </svg>
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className='lg:col-span-1'>
            <div className='sticky top-8 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-6'>
              <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
                Order Summary
              </h2>

              {/* Coupon Code */}
              <div className='mt-6'>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    placeholder='Coupon code'
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); setCouponApplied(false); setPromoDiscount(0); }}
                    className='flex-1 rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-3 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponApplied}
                    className='rounded-lg border border-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-deep-black)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className='mt-1 text-xs text-[var(--color-error)]'>{couponError}</p>
                )}
                {couponApplied && (
                  <p className='mt-1 text-xs text-[var(--color-success)]'>
                    Coupon applied! You saved Rs {discount.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className='mt-6 space-y-3 border-t border-[var(--color-light-gray)] pt-6'>
                <div className='flex justify-between text-sm'>
                  <span className='text-[var(--color-mid-gray)]'>Subtotal</span>
                  <span className='font-medium text-[var(--color-primary)]'>Rs {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-[var(--color-success)]'>Discount ({Math.round(promoDiscount * 100)}%)</span>
                    <span className='font-medium text-[var(--color-success)]'>-Rs {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className='flex justify-between text-sm'>
                  <span className='text-[var(--color-mid-gray)]'>Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-primary)]'}`}>
                    {shipping === 0 ? 'Free' : `Rs ${shipping.toLocaleString()}`}
                  </span>
                </div>
                {subtotal > 0 && subtotal <= SHIPPING_THRESHOLD && (
                  <p className='text-xs text-[var(--color-mid-gray)]'>
                    Add Rs {(SHIPPING_THRESHOLD - subtotal).toLocaleString()} more for free shipping
                  </p>
                )}
                <div className='flex justify-between text-sm'>
                  <span className='text-[var(--color-mid-gray)]'>Tax (8%)</span>
                  <span className='font-medium text-[var(--color-primary)]'>Rs {tax.toLocaleString()}</span>
                </div>
                <div className='flex justify-between border-t border-[var(--color-light-gray)] pt-3'>
                  <span className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>
                    Total
                  </span>
                  <span className='font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-primary)]'>
                    Rs {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                href='/checkout'
                className='gold-button mt-6 flex w-full items-center justify-center py-3.5 text-sm font-medium'
              >
                Proceed to Checkout
              </Link>

              <p className='mt-4 text-center text-xs text-[var(--color-mid-gray)]'>
                Secure checkout with SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
