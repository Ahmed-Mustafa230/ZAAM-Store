export interface UnitPriceProduct {
  category?: string;
  price?: number;
  comparePrice?: number;
  discount?: number;
  volumePricing?: Array<{ volume?: string; price?: number; comparePrice?: number }>;
}

export interface UnitPriceDetails {
  unitPrice: number;
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
}

export interface TaxInfo {
  taxAmount: number;
  taxRate: number | null;
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export function computeTaxInfo(
  price: number | null | undefined,
  taxAmount?: number | null
): TaxInfo {
  const p = round2(Number(price) || 0);
  const tax = round2(Number(taxAmount) || 0);

  if (p <= 0) return { taxAmount: tax, taxRate: null };

  return { taxAmount: tax, taxRate: tax === 0 ? 0 : round2((tax / p) * 100) };
}

export function formatTaxRate(taxRate: number | null): string {
  if (taxRate === null) return 'N/A';
  const str = String(taxRate);
  return /\.\d$/.test(str) ? `${str}0%` : `${str}%`;
}

export interface DiscountDetails {
  sellingPrice: number;
  comparePrice: number;
  discountAmount: number;
  discountPercent: number;
}

export function computeDiscountDetails(
  price: number,
  comparePrice?: number | null
): DiscountDetails {
  const sellingPrice = round2(Number(price) || 0);
  const original = round2(Number(comparePrice) || 0);
  const discountAmount = original > sellingPrice ? round2(original - sellingPrice) : 0;
  const discountPercent =
    original > sellingPrice
      ? Math.min(100, Math.round((discountAmount / original) * 100))
      : 0;

  return { sellingPrice, comparePrice: original, discountAmount, discountPercent };
}

export function computeUnitPrice(
  product: UnitPriceProduct,
  size?: string | null
): number {
  const raw = Number(product.price) || 0;

  if (
    product.category === 'perfumes' &&
    Array.isArray(product.volumePricing) &&
    product.volumePricing.length > 0 &&
    size
  ) {
    const vp = product.volumePricing.find((v) => v.volume === size);
    const unit = vp ? Number(vp.price) || 0 : raw;
    return round2(unit);
  }

  return round2(raw);
}

export function computeUnitPriceDetails(
  product: UnitPriceProduct,
  size?: string | null
): UnitPriceDetails {
  const raw = Number(product.price) || 0;

  if (
    product.category === 'perfumes' &&
    Array.isArray(product.volumePricing) &&
    product.volumePricing.length > 0 &&
    size
  ) {
    const vp = product.volumePricing.find((v) => v.volume === size);
    if (vp) {
      const { sellingPrice, comparePrice, discountAmount, discountPercent } =
        computeDiscountDetails(Number(vp.price) || raw, vp.comparePrice);

      return { unitPrice: sellingPrice, originalPrice: comparePrice, discountPercent, discountAmount };
    }
  }

  const { sellingPrice, comparePrice, discountAmount, discountPercent } =
    computeDiscountDetails(raw, product.comparePrice);

  return { unitPrice: sellingPrice, originalPrice: comparePrice, discountPercent, discountAmount };
}