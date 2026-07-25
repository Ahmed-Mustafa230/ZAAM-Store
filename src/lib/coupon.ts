import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, TAX_RATE } from '@/lib/checkout-constants';

export interface CouponData {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount: number;
  minPurchase: number;
}

export function calculateCouponDiscount(grandTotal: number, coupon: CouponData): number {
  if (grandTotal < coupon.minPurchase) return 0;

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (grandTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  return Math.min(discount, grandTotal);
}

export function calculateOrderTotals(itemsPrice: number, discountAmount: number) {
  const roundedItems = Math.round(itemsPrice * 100) / 100;
  const shippingPrice = roundedItems >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const taxPrice = Math.round(roundedItems * TAX_RATE * 100) / 100;
  const grandTotal = Math.round((roundedItems + shippingPrice + taxPrice) * 100) / 100;
  const discount = Math.min(discountAmount, grandTotal);
  const totalPrice = Math.round((grandTotal - discount) * 100) / 100;

  return {
    itemsPrice: roundedItems,
    taxPrice,
    shippingPrice,
    grandTotal,
    totalPrice,
    discountAmount: discount,
  };
}
