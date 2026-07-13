export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const prefix = 'ZAAM';
  return `${prefix}-${timestamp}-${random}`;
}

export function calculateDiscount(price: number, discount: number): number {
  if (discount < 0 || discount > 100) {
    return price;
  }
  return price - (price * discount) / 100;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) {
    return text;
  }
  const truncated = text.substring(0, length);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace === -1) {
    return truncated + '...';
  }
  return truncated.substring(0, lastSpace) + '...';
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
