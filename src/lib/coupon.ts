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

export function calculateOrderTotals(itemsPrice: number, discountAmount: number, shippingFee: number) {
  const roundedItems = Math.round(itemsPrice * 100) / 100;
  const roundedShipping = Math.round((Number(shippingFee) || 0) * 100) / 100;
  const taxPrice = 0;
  const grandTotal = Math.round((roundedItems + roundedShipping + taxPrice) * 100) / 100;
  const discount = Math.min(discountAmount, grandTotal);
  const totalPrice = Math.round((grandTotal - discount) * 100) / 100;

  return {
    itemsPrice: roundedItems,
    taxPrice,
    shippingPrice: roundedShipping,
    grandTotal,
    totalPrice,
    discountAmount: discount,
  };
}
