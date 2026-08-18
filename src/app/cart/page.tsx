'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { computeOrderShippingFee, computeItemShippingFee, formatShippingFee } from '@/lib/shipping';
import { computeDiscountDetails, computeTaxInfo, formatTaxRate } from '@/lib/pricing';

interface SavedItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  shippingFee?: number;
  taxAmount?: number;
}

export default function CartPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { items: cartItems, removeItem, updateQuantity, addItem, markCartNotificationsSeen } = useCart();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);
  const [couponDiscountType, setCouponDiscountType] = useState<'percentage' | 'flat'>('flat');
  const [couponDiscountValue, setCouponDiscountValue] = useState(0);
  const [couponMaxDiscount, setCouponMaxDiscount] = useState(0);

  const [remoteShippingFees, setRemoteShippingFees] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?redirect=/cart');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      markCartNotificationsSeen();
    }
  }, [user, loading, markCartNotificationsSeen]);

  useEffect(() => {
    if (!user || cartItems.length === 0) return;
    let cancelled = false;
    const refreshShippingFees = async () => {
      const results = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const res = await fetch(`/api/products/${encodeURIComponent(item.productId)}`);
            if (!res.ok) return null;
            const data = await res.json();
            const fee = Number(data?.product?.shippingFee);
            return { id: item.id, fee: Number.isFinite(fee) ? fee : 0 };
          } catch {
            return null;
          }
        })
      );
      if (cancelled) return;
      const map: Record<string, number> = {};
      for (const result of results) {
        if (result) map[result.id] = result.fee;
      }
      setRemoteShippingFees(map);
    };
    refreshShippingFees();
    return () => { cancelled = true; };
  }, [user, cartItems]);

  if (loading || !user) return null;

  const saveForLater = (item: typeof cartItems[0]) => {
    setSavedItems(prev => [...prev, { id: item.id, productId: item.productId, name: item.name, price: item.price, image: item.image, size: item.size, color: item.color, shippingFee: item.shippingFee, taxAmount: item.taxAmount }]);
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
      shippingFee: remoteShippingFees[item.id] ?? item.shippingFee,
      taxAmount: item.taxAmount,
    }, 1, item.size, item.color);
  };

  const cartShippingLines = cartItems.map((item) => ({
    ...item,
    shippingFee: remoteShippingFees[item.id] !== undefined ? remoteShippingFees[item.id] : (Number(item.shippingFee) || 0),
  }));

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    try {
      const rawSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const rawShipping = computeOrderShippingFee(cartShippingLines);
      const rawGrandTotal = rawSubtotal + rawShipping;
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderTotal: rawGrandTotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.message || 'Invalid coupon code');
        setCouponApplied(false);
        setCouponDiscountAmount(0);
        return;
      }
      setCouponApplied(true);
      setCouponDiscountAmount(data.discountAmount);
      setCouponDiscountType(data.coupon.discountType);
      setCouponDiscountValue(data.coupon.discountValue);
      setCouponMaxDiscount(data.coupon.maxDiscount);
      setCouponError('');
      sessionStorage.setItem('zaam_coupon_id', data.coupon.id || '');
      sessionStorage.setItem('zaam_coupon_code', data.coupon.code || '');
      sessionStorage.setItem('zaam_coupon_type', data.coupon.discountType || '');
      sessionStorage.setItem('zaam_coupon_value', String(data.coupon.discountValue || ''));
      sessionStorage.setItem('zaam_coupon_max_discount', String(data.coupon.maxDiscount || '0'));
      sessionStorage.setItem('zaam_coupon_min_purchase', String(data.coupon.minPurchase || '0'));
    } catch {
      setCouponError('Failed to validate coupon. Please try again.');
      setCouponApplied(false);
      setCouponDiscountAmount(0);
    }
  };

  const subtotal = Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
  const shipping = computeOrderShippingFee(cartShippingLines);
  const grandTotal = Math.round((subtotal + shipping) * 100) / 100;
  const discount = couponApplied
    ? Math.round(
        Math.min(
          couponDiscountType === 'percentage'
            ? Math.min(grandTotal * couponDiscountValue / 100, couponMaxDiscount > 0 ? couponMaxDiscount : grandTotal)
            : couponDiscountAmount,
          grandTotal
        ) * 100
      ) / 100
    : 0;
  const total = Math.round((grandTotal - discount) * 100) / 100;

  const originalTotal = Math.round(cartItems.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0) * 100) / 100;
  const productDiscount = Math.round(cartItems.reduce((sum, item) => sum + computeDiscountDetails(item.price, item.originalPrice).discountAmount * item.quantity, 0) * 100) / 100;
  const productDiscountPctSet = Array.from(new Set(cartItems.map((i) => i.discount || 0).filter((d) => d > 0)));
  const productDiscountPercent = productDiscountPctSet.length === 1 ? productDiscountPctSet[0] : 0;
  const productTaxTotal = Math.round(cartItems.reduce((sum, item) => sum + (Number(item.taxAmount) || 0) * item.quantity, 0) * 100) / 100;
  const distinctTaxRates = Array.from(new Set(cartItems.map((item) => computeTaxInfo(item.price, Number(item.taxAmount) || 0).taxRate)));
  const singleTaxRate = distinctTaxRates.length === 1 ? distinctTaxRates[0] : null;

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
                        className='rounded-full p-3 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] hover:text-[var(--color-error)] transition-colors'
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
                    {(() => {
                      const unitPrice = Number(item.price) || 0;
                      const unitOriginal = Number(item.originalPrice) || 0;
                      const unitDetails = computeDiscountDetails(unitPrice, unitOriginal > unitPrice ? unitOriginal : null);
                      const unitFee = remoteShippingFees[item.id] !== undefined ? remoteShippingFees[item.id] : (Number(item.shippingFee) || 0);
                      const itemShipping = computeItemShippingFee({ shippingFee: unitFee, quantity: item.quantity });
                      const unitTax = Number(item.taxAmount) || 0;
                      const itemTax = Math.round(unitTax * item.quantity * 100) / 100;
                      const itemTaxRate = unitTax === 0 ? '0%' : formatTaxRate(computeTaxInfo(unitPrice, unitTax).taxRate);
                      const hasItemDiscount = unitDetails.discountPercent > 0;
                      return (
                        <div className='mt-2 space-y-1 text-xs text-[var(--color-mid-gray)]'>
                          {hasItemDiscount && (
                            <p className='flex flex-wrap items-center gap-x-1.5 gap-y-0.5'>
                              <span className='line-through'>
                                Rs {unitDetails.comparePrice.toLocaleString()} each
                              </span>
                              <span className='text-[var(--color-success)]'>-{unitDetails.discountPercent}%</span>
                              <span className='text-[var(--color-success)]'>
                                Save Rs {(unitDetails.discountAmount * item.quantity).toLocaleString()}
                              </span>
                            </p>
                          )}
                          <p>
                            Shipping:{' '}
                            {unitFee > 0 ? (
                              <span className='font-medium text-[var(--color-primary)]'>
                                Rs {itemShipping.toLocaleString()}
                                {item.quantity > 1 && (
                                  <span className='font-normal text-[var(--color-mid-gray)]'>
                                    {' '}(Rs {unitFee.toLocaleString()} each)
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className='font-medium text-[var(--color-success)]'>Free</span>
                            )}
                          </p>
                          <p>
                            Tax Included:{' '}
                            <span className='font-medium text-[var(--color-primary)]'>
                              Rs {itemTax.toLocaleString()}
                            </span>
                            {item.quantity > 1 && unitTax > 0 && (
                              <span className='text-[var(--color-mid-gray)]'>
                                {' '}(Rs {unitTax.toLocaleString()} each)
                              </span>
                            )}
                            <span className='text-[var(--color-mid-gray)]'> ({itemTaxRate})</span>
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                  <div className='mt-3 flex items-center justify-between sm:mt-0'>
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center rounded-lg border border-[var(--color-light-gray)]'>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className='px-4 py-2 text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'
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
                          className='px-4 py-2 text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'
                          disabled={item.quantity >= 10}
                        >
                          <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => saveForLater(item)}
                        className='px-3 py-2 text-xs text-[var(--color-mid-gray)] hover:text-[var(--color-accent)] transition-colors'
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
                            className='rounded-lg border border-[var(--color-accent)] px-4 py-2 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-deep-black)] transition-colors'
                          >
                            Move to Cart
                          </button>
                          <button
                            onClick={() => removeSavedItem(item.id)}
                            className='rounded-lg p-2.5 text-[var(--color-mid-gray)] hover:text-[var(--color-error)] transition-colors'
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
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); setCouponApplied(false); setCouponDiscountAmount(0); setCouponDiscountType('flat'); setCouponDiscountValue(0); setCouponMaxDiscount(0); sessionStorage.removeItem('zaam_coupon_id'); sessionStorage.removeItem('zaam_coupon_code'); sessionStorage.removeItem('zaam_coupon_type'); sessionStorage.removeItem('zaam_coupon_value'); sessionStorage.removeItem('zaam_coupon_max_discount'); sessionStorage.removeItem('zaam_coupon_min_purchase'); }}
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
                <div className='flex items-center justify-between gap-2 text-sm'>
                  <span className='min-w-0 break-words text-[var(--color-mid-gray)]'>Subtotal</span>
                  <span className='shrink-0 whitespace-nowrap font-medium text-[var(--color-primary)]'>Rs {originalTotal.toLocaleString()}</span>
                </div>
                {productDiscount > 0 && (
                  <div className='flex items-center justify-between gap-2 text-sm'>
                    <span className='min-w-0 break-words text-[var(--color-success)]'>
                      Discount{productDiscountPercent > 0 ? ` (${productDiscountPercent}%)` : ''}
                    </span>
                    <span className='shrink-0 whitespace-nowrap font-medium text-[var(--color-success)]'>-Rs {productDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className='flex items-center justify-between gap-2 text-sm'>
                  <span className='min-w-0 break-words text-[var(--color-mid-gray)]'>Sale Price</span>
                  <span className='shrink-0 whitespace-nowrap font-medium text-[var(--color-primary)]'>Rs {subtotal.toLocaleString()}</span>
                </div>
                <div className='flex items-center justify-between gap-2 text-sm'>
                  <span className='min-w-0 break-words text-[var(--color-mid-gray)]'>Shipping</span>
                  <span className={`shrink-0 whitespace-nowrap font-medium ${shipping === 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-primary)]'}`}>
                    {formatShippingFee(shipping)}
                  </span>
                </div>
                <div className='flex items-center justify-between gap-2 text-sm'>
                  <span
                    className='min-w-0 break-words text-[var(--color-accent)]'
                    title='Informational only - not added to the payable total'
                  >
                    Tax Included{singleTaxRate !== null ? ` (${formatTaxRate(singleTaxRate)})` : ''}
                  </span>
                  <span className='shrink-0 whitespace-nowrap font-medium text-[var(--color-accent)]'>Rs {productTaxTotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className='flex items-center justify-between gap-2 text-sm'>
                    <span className='min-w-0 break-words text-[var(--color-success)]'>
                      Coupon Discount{couponDiscountType === 'percentage' ? ` (${couponDiscountValue}%)` : ''}
                    </span>
                    <span className='shrink-0 whitespace-nowrap font-medium text-[var(--color-success)]'>-Rs {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className='flex items-center justify-between gap-2 border-t border-[var(--color-light-gray)] pt-3'>
                  <span className='min-w-0 break-words font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>
                    Total Payable
                  </span>
                  <span className='shrink-0 whitespace-nowrap font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-primary)]'>
                    Rs {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                href='/checkout'
                onClick={() => {
                  sessionStorage.removeItem('zaam_buy_now');
                  if (couponApplied && couponCode) {
                    sessionStorage.setItem('zaam_checkout_coupon', couponCode);
                    sessionStorage.setItem('zaam_checkout_discount', String(discount));
                    sessionStorage.setItem('zaam_checkout_coupon_id', sessionStorage.getItem('zaam_coupon_id') || '');
                    sessionStorage.setItem('zaam_checkout_coupon_type', sessionStorage.getItem('zaam_coupon_type') || '');
                    sessionStorage.setItem('zaam_checkout_coupon_value', sessionStorage.getItem('zaam_coupon_value') || '');
                    sessionStorage.setItem('zaam_checkout_coupon_max_discount', sessionStorage.getItem('zaam_coupon_max_discount') || '0');
                    sessionStorage.setItem('zaam_checkout_coupon_min_purchase', sessionStorage.getItem('zaam_coupon_min_purchase') || '0');
                  } else {
                    sessionStorage.removeItem('zaam_checkout_coupon');
                    sessionStorage.removeItem('zaam_checkout_discount');
                    sessionStorage.removeItem('zaam_checkout_coupon_id');
                    sessionStorage.removeItem('zaam_checkout_coupon_type');
                    sessionStorage.removeItem('zaam_checkout_coupon_value');
                    sessionStorage.removeItem('zaam_checkout_coupon_max_discount');
                    sessionStorage.removeItem('zaam_checkout_coupon_min_purchase');
                  }
                }}
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
