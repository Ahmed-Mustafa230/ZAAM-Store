const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

/** A single cart / order line item that carries a shipping fee and quantity. */
export interface ShippingLineItem {
  shippingFee?: number | null;
  quantity?: number | null;
}

/**
 * Central order-level shipping calculation — single source of truth.
 *
 * Rule: shipping is charged PER CART ITEM, per unit quantity:
 *
 *   item shipping  = product.shippingFee x item.quantity
 *   order shipping = SUM over all items of (shippingFee x quantity)
 *
 * - Missing/null/0 shippingFee contributes Rs. 0.
 * - Missing/null/0 quantity defaults to 1 (a single item).
 *
 * This intentionally does NOT use a highest/max fee, a per-order flat fee,
 * or any free-shipping threshold.
 */
export function computeOrderShippingFee(
  items: ShippingLineItem[] | undefined
): number {
  let total = 0;
  for (const item of items || []) {
    const rawFee = Number(item?.shippingFee);
    const fee = Number.isFinite(rawFee) && rawFee > 0 ? rawFee : 0;
    const rawQty = Number(item?.quantity);
    const quantity = Number.isFinite(rawQty) && rawQty > 0 ? rawQty : 1;
    total += fee * quantity;
  }
  return round2(total);
}

/** Per-item shipping contribution for a single cart / order line item. */
export function computeItemShippingFee(
  item: ShippingLineItem | undefined
): number {
  const rawFee = Number(item?.shippingFee);
  const fee = Number.isFinite(rawFee) && rawFee > 0 ? rawFee : 0;
  const rawQty = Number(item?.quantity);
  const quantity = Number.isFinite(rawQty) && rawQty > 0 ? rawQty : 1;
  return round2(fee * quantity);
}

/** Uniform display for a shipping amount across cart, checkout and orders. */
export function formatShippingFee(fee: number): string {
  const numeric = round2(Number(fee) || 0);
  return numeric > 0 ? `Rs ${numeric.toLocaleString()}` : 'Free';
}