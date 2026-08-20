'use client';

import { Suspense, useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import { computeUnitPrice } from '@/lib/pricing';
import { HiOutlineSearch } from 'react-icons/hi';

export interface ProductsPageClientProps {
  initialCategory?: string;
  initialSearch?: string;
}

interface ApiImage {
  public_id: string;
  url: string;
  secure_url: string;
  is_primary: boolean;
}

interface ApiVolumePricing {
  volume: string;
  price: number;
  comparePrice?: number;
}

interface ApiProduct {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  comparePrice?: number;
  images: ApiImage[];
  stock: number;
  rating: number;
  numReviews: number;
  colors: string[];
  sizes: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  discount: number;
  tags: string[];
  volumePricing?: ApiVolumePricing[];
  shippingFee?: number;
  taxAmount?: number;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  colors: string[];
  sizes: string[];
  inStock: boolean;
  isNew?: boolean;
  shippingFee?: number;
  taxAmount?: number;
}

function normalizeBrand(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function brandDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

function brandsMatch(a: string, b: string): boolean {
  const na = normalizeBrand(a);
  const nb = normalizeBrand(b);
  if (na === nb) return true;
  if (na.length < 4 || nb.length < 4) return false;
  return na.charAt(0) === nb.charAt(0) && brandDistance(na, nb) <= 2;
}

function toProduct(p: ApiProduct): Product {
  const primary = p.images?.find(i => i.is_primary) || p.images?.[0];
  const pricedVolumes = p.volumePricing?.filter(v => v.price > 0) || [];
  const firstVolume = pricedVolumes.length > 0 ? pricedVolumes[0] : null;

  const isPerfumeWithVolumePricing = p.category === 'perfumes' && firstVolume;

  const computedPrice = computeUnitPrice(p, isPerfumeWithVolumePricing ? firstVolume!.volume : null);
  const referencePrice = isPerfumeWithVolumePricing ? firstVolume!.comparePrice : p.comparePrice;

  return {
    id: p._id,
    name: p.name,
    brand: p.brand || '',
    category: p.category,
    price: computedPrice,
    originalPrice: referencePrice && referencePrice > computedPrice ? referencePrice : undefined,
    rating: p.rating || 0,
    reviewCount: p.numReviews || 0,
    image: primary?.secure_url || primary?.url || '',
    colors: p.colors || [],
    sizes: isPerfumeWithVolumePricing ? pricedVolumes.map(v => v.volume) : (p.sizes || []),
    inStock: p.stock > 0,
    isNew: p.isNewArrival || false,
    shippingFee: Number(p.shippingFee) || 0,
    taxAmount: Number(p.taxAmount) || 0,
  };
}

interface FilterPanelProps {
  categories: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
  category: string;
  brand: string;
  color: string | null;
  size: string | null;
  rating: number;
  minPrice: string;
  maxPrice: string;
  onCategory: (value: string) => void;
  onBrand: (value: string) => void;
  onColor: (value: string | null) => void;
  onSize: (value: string | null) => void;
  onRating: (value: number) => void;
  onMinPrice: (value: string) => void;
  onMaxPrice: (value: string) => void;
  onClear: () => void;
  onApply: () => void;
}

function FilterPanel({
  categories,
  brands,
  colors,
  sizes,
  category,
  brand,
  color,
  size,
  rating,
  minPrice,
  maxPrice,
  onCategory,
  onBrand,
  onColor,
  onSize,
  onRating,
  onMinPrice,
  onMaxPrice,
  onClear,
  onApply,
}: FilterPanelProps) {
  return (
    <div className='space-y-6'>
      {/* Category Filter */}
      <div>
        <h3 className='mb-3 font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]'>
          Category
        </h3>
        <div className='space-y-1'>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategory(cat)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                category === cat
                  ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium'
                  : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className='mb-3 font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]'>
          Price Range
        </h3>
        <div className='grid grid-cols-2 gap-2'>
          <input
            type='number'
            min='0'
            inputMode='numeric'
            placeholder='Min Price'
            value={minPrice}
            onChange={(e) => onMinPrice(e.target.value)}
            className='w-full rounded-md border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-3 py-2 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all'
          />
          <input
            type='number'
            min='0'
            inputMode='numeric'
            placeholder='Max Price'
            value={maxPrice}
            onChange={(e) => onMaxPrice(e.target.value)}
            className='w-full rounded-md border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-3 py-2 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all'
          />
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h3 className='mb-3 font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]'>
          Brand
        </h3>
        <div className='max-h-48 space-y-1 overflow-y-auto'>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => onBrand(b)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                brand === b
                  ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium'
                  : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h3 className='mb-3 font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]'>
          Color
        </h3>
        <div className='flex flex-wrap gap-2'>
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => onColor(color === c ? null : c)}
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                color === c
                  ? 'border-[var(--color-accent)] scale-110 shadow-[var(--shadow-gold)]'
                  : 'border-transparent hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
              title={c}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h3 className='mb-3 font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]'>
          Size
        </h3>
        <div className='flex flex-wrap gap-2'>
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => onSize(size === s ? null : s)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                size === s
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-deep-black)]'
                  : 'border-[var(--color-light-gray)] text-[var(--color-dark-gray)] hover:border-[var(--color-mid-gray)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className='mb-3 font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]'>
          Minimum Rating
        </h3>
        <div className='space-y-1'>
          {[0, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => onRating(rating === r ? 0 : r)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                rating === r
                  ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium'
                  : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
              }`}
            >
              {r === 0 ? 'Any Rating' : `${r}+ Stars`}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Actions */}
      <div className='grid grid-cols-2 gap-3 border-t border-[var(--color-light-gray)] pt-6'>
        <button
          onClick={onClear}
          className='w-full rounded-lg border border-[var(--color-accent)] px-4 py-3 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-deep-black)]'
        >
          Clear
        </button>
        <button
          onClick={onApply}
          className='w-full rounded-lg bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-[var(--color-deep-black)] transition-colors hover:bg-[var(--color-accent-dark)]'
        >
          Apply
        </button>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Low-High' },
  { value: 'price-desc', label: 'High-Low' },
  { value: 'rating', label: 'Top Rated' },
];

function SortDropdown({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectOption = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className='relative shrink-0'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-label='Sort products'
        title='Sort products'
        className='flex items-center gap-1.5 sm:gap-2 rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] py-2.5 sm:py-3 pl-2.5 sm:pl-4 pr-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-light-gray)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'
      >
        <svg className='hidden sm:block h-4 w-4 text-[var(--color-mid-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 9l6-6 6 6M6 15l6 6 6-6' />
        </svg>
        <span className='truncate'>{selected.label}</span>
        <svg className={`h-4 w-4 text-[var(--color-mid-gray)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
        </svg>
      </button>
      {open && (
        <ul
          role='listbox'
          aria-label='Sort products'
          className='absolute right-0 z-30 mt-2 min-w-full overflow-hidden rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)]/95 backdrop-blur-md shadow-lg py-1'
        >
          {SORT_OPTIONS.map((o) => (
            <li key={o.value} role='option' aria-selected={o.value === value}>
              <button
                type='button'
                onClick={() => selectOption(o.value)}
                className={`flex w-full items-center justify-between gap-3 whitespace-nowrap px-3 py-2 text-left text-sm transition-colors ${
                  o.value === value
                    ? 'bg-[var(--color-accent)]/10 font-medium text-[var(--color-accent-dark)]'
                    : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                }`}
              >
                {o.label}
                {o.value === value && (
                  <svg className='h-4 w-4 text-[var(--color-accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductsContent({ initialCategory, initialSearch }: ProductsPageClientProps) {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch || searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || searchParams.get('category') || 'All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [draftCategory, setDraftCategory] = useState(selectedCategory);
  const [draftBrand, setDraftBrand] = useState('All');
  const [draftMinPrice, setDraftMinPrice] = useState('');
  const [draftMaxPrice, setDraftMaxPrice] = useState('');
  const [draftColor, setDraftColor] = useState<string | null>(null);
  const [draftSize, setDraftSize] = useState<string | null>(null);
  const [draftRating, setDraftRating] = useState<number>(0);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      setApiLoading(true);
      setApiError(null);
      try {
        const params = new URLSearchParams();
        params.set('limit', '100');
        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to load products (${res.status})`);
        }
        const data = await res.json();
        const items: ApiProduct[] = data.products || [];
        setAllProducts(items.map(toProduct));
      } catch (err) {
        setAllProducts([]);
        setApiError(err instanceof Error ? err.message : 'An error occurred while loading products');
      } finally {
        setApiLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!showFilters) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowFilters(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showFilters]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'All') {
      const cat = selectedCategory.toLowerCase();
      result = result.filter(p => p.category.toLowerCase() === cat);
    }

    if (selectedBrand !== 'All') {
      result = result.filter(p => p.brand && brandsMatch(p.brand, selectedBrand));
    }

    const minPriceNum = minPrice !== '' ? Number(minPrice) : NaN;
    const maxPriceNum = maxPrice !== '' ? Number(maxPrice) : NaN;
    if (!Number.isNaN(minPriceNum)) {
      result = result.filter(p => p.price >= minPriceNum);
    }
    if (!Number.isNaN(maxPriceNum)) {
      result = result.filter(p => p.price <= maxPriceNum);
    }

    if (selectedColor) {
      result = result.filter(p => p.colors.includes(selectedColor));
    }

    if (selectedSize) {
      result = result.filter(p => p.sizes.includes(selectedSize));
    }

    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return result;
  }, [searchQuery, selectedCategory, selectedBrand, minPrice, maxPrice, selectedColor, selectedSize, minRating, sortBy, allProducts]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    allProducts.forEach(p => cats.add(p.category));
    return ['All', ...Array.from(cats)];
  }, [allProducts]);

  const allBrands = useMemo(() => {
    const brs = new Set<string>();
    allProducts.forEach(p => { if (p.brand) brs.add(p.brand); });
    const raw = Array.from(brs);
    const groups: string[][] = [];
    for (const value of raw) {
      const group = groups.find(g => brandsMatch(g[0], value));
      if (group) {
        if (!group.includes(value)) group.push(value);
      } else {
        groups.push([value]);
      }
    }
    const canonical = groups.map(group => {
      const counts = new Map<string, number>();
      allProducts.forEach(p => {
        if (group.includes(p.brand)) {
          counts.set(p.brand, (counts.get(p.brand) || 0) + 1);
        }
      });
      let best = group[0];
      let bestCount = counts.get(group[0]) || 0;
      group.forEach(value => {
        const c = counts.get(value) || 0;
        if (c > bestCount) {
          best = value;
          bestCount = c;
        }
      });
      return best;
    });
    return ['All', ...canonical.sort((a, b) => a.localeCompare(b))];
  }, [allProducts]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    allProducts.forEach(p => p.colors.forEach(c => colors.add(c)));
    return Array.from(colors);
  }, [allProducts]);

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    allProducts.forEach(p => p.sizes.forEach(s => sizes.add(s)));
    return Array.from(sizes);
  }, [allProducts]);

  const openFilters = () => {
    setDraftCategory(selectedCategory);
    setDraftBrand(selectedBrand);
    setDraftMinPrice(minPrice);
    setDraftMaxPrice(maxPrice);
    setDraftColor(selectedColor);
    setDraftSize(selectedSize);
    setDraftRating(minRating);
    setShowFilters(true);
  };

  const applyFilters = () => {
    setSelectedCategory(draftCategory);
    setSelectedBrand(draftBrand);
    setMinPrice(draftMinPrice);
    setMaxPrice(draftMaxPrice);
    setSelectedColor(draftColor);
    setSelectedSize(draftSize);
    setMinRating(draftRating);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColor(null);
    setSelectedSize(null);
    setMinRating(0);
    setSearchQuery('');
    setDraftCategory('All');
    setDraftBrand('All');
    setDraftMinPrice('');
    setDraftMaxPrice('');
    setDraftColor(null);
    setDraftSize(null);
    setDraftRating(0);
    setCurrentPage(1);
    setShowFilters(false);
  };

  return (
    <div className='min-h-screen bg-[var(--color-white)] font-[family-name:var(--font-body)]'>
      <div className='container-luxury pt-4 pb-8'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl'>
            Our Collection
          </h1>
          <div className='luxury-divider' />
          <p className='text-lg text-[var(--color-mid-gray)] font-[family-name:var(--font-great-vibes)] tracking-wide'>
            Discover luxury craftsmanship and timeless elegance
          </p>
        </div>

        {/* Search and Controls */}
        <div className='sticky top-0 z-10 mb-4 flex items-center gap-1.5 sm:gap-3 sm:justify-between bg-[var(--color-white)] py-2'>
          <div className='relative min-w-0 flex-1 sm:max-w-md'>
            <HiOutlineSearch className='absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[var(--color-mid-gray)]' size={18} />
            <input
              type='text'
              placeholder='Search products...'
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className='w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] py-2.5 sm:py-3 pl-9 sm:pl-11 pr-2 sm:pr-4 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all'
            />
          </div>
          <div className='relative flex shrink-0 items-center gap-1.5 sm:gap-3'>
            <SortDropdown value={sortBy} onChange={setSortBy} />
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className='rounded-lg bg-[var(--color-cream)] p-2.5 sm:p-3 text-[var(--color-mid-gray)] transition-colors hover:bg-[var(--color-light-gray)] hover:text-[var(--color-primary)]'
              aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
              title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
            >
              {viewMode === 'grid' ? (
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 6h16M4 12h16M4 18h16' />
                </svg>
              ) : (
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' />
                </svg>
              )}
            </button>
            <button
              onClick={openFilters}
              className='rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-2.5 sm:p-3 text-[var(--color-mid-gray)] hover:border-[var(--color-accent)] hover:bg-[var(--color-light-gray)] transition-colors'
              aria-label='Open filters'
              aria-haspopup='dialog'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters Drawer */}
        {showFilters && (
          <div className='fixed inset-0 z-50'>
            <div className='absolute inset-0 bg-black/50' onClick={() => setShowFilters(false)} />
            <div className='absolute right-0 top-0 h-full w-80 max-w-[90vw] overflow-y-auto bg-[var(--color-white)] p-6 shadow-xl animate-fade-in-right'>
              <div className='mb-6 flex items-center justify-between'>
                <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className='rounded-full p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)]'
                  aria-label='Close filters'
                >
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
              <FilterPanel
                categories={allCategories}
                brands={allBrands}
                colors={allColors}
                sizes={allSizes}
                category={draftCategory}
                brand={draftBrand}
                color={draftColor}
                size={draftSize}
                rating={draftRating}
                minPrice={draftMinPrice}
                maxPrice={draftMaxPrice}
                onCategory={setDraftCategory}
                onBrand={setDraftBrand}
                onColor={setDraftColor}
                onSize={setDraftSize}
                onRating={setDraftRating}
                onMinPrice={setDraftMinPrice}
                onMaxPrice={setDraftMaxPrice}
                onClear={clearAllFilters}
                onApply={applyFilters}
              />
            </div>
          </div>
        )}

        <div className='flex gap-6'>
          {/* Main Content */}
          <div className='flex-1'>
            {/* Product Count */}
            <div className='mb-4 flex items-center justify-between'>
              <p className='text-sm text-[var(--color-mid-gray)]'>
                {apiLoading ? 'Loading products...' : apiError ? 'Could not load products' : (
                  <>Showing <span className='font-medium text-[var(--color-primary)]'>{paginatedProducts.length}</span> of{' '}
                  <span className='font-medium text-[var(--color-primary)]'>{filteredProducts.length}</span> products</>
                )}
              </p>
            </div>

            {/* Products Grid/List */}
            {apiLoading ? (
              <div className='flex items-center justify-center py-20'>
                <div className='h-8 w-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin' />
              </div>
            ) : apiError ? (
              <div className='flex flex-col items-center justify-center py-20'>
                <svg className='mb-4 h-16 w-16 text-[var(--color-error)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1' d='M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <h3 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
                  Unable to load products
                </h3>
                <p className='mt-2 text-[var(--color-mid-gray)]'>
                  {apiError}
                </p>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-20'>
                <svg className='mb-4 h-16 w-16 text-[var(--color-light-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1' d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <h3 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
                  No products found
                </h3>
                <p className='mt-2 text-[var(--color-mid-gray)]'>
                  Try adjusting your filters
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                {paginatedProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    index={idx}
                    product={{
                      id: product.id,
                      name: product.name,
                      brand: product.brand,
                      category: product.category,
                      price: product.price,
                      originalPrice: product.originalPrice,
                      rating: product.rating,
                      reviewCount: product.reviewCount,
                      image: product.image,
                      colors: product.colors,
                      inStock: product.inStock,
                      isNew: product.isNew,
                      shippingFee: product.shippingFee,
                      taxAmount: product.taxAmount,
                    }}
                  />
                ))}
              </div>
            ) : (
              /* List View */
              <div className='space-y-3'>
                {paginatedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className='flex gap-4 rounded-lg bg-[var(--color-cream)] border border-[var(--color-light-gray)] overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5'
                  >
                    <div className='relative h-28 w-28 shrink-0 overflow-hidden'>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className='object-cover transition-transform duration-500 hover:scale-105'
                        sizes='112px'
                      />
                      {product.isNew && (
                        <span className='absolute left-1.5 top-1.5 rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-deep-black)]'>
                          New
                        </span>
                      )}
                    </div>
                    <div className='flex flex-1 flex-col justify-center py-2 pr-3'>
                      <p className='text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent-dark)]'>
                        {product.brand}
                      </p>
                      <h3 className='mt-0.5 font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--color-primary)] leading-snug'>
                        {product.name}
                      </h3>
                      <div className='mt-1 flex items-center gap-1.5'>
                        <div className='flex items-center'>
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`h-2.5 w-2.5 ${i < Math.floor(product.rating) ? 'text-[var(--color-accent)]' : 'text-[var(--color-light-gray)]'}`} fill='currentColor' viewBox='0 0 20 20'>
                              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                            </svg>
                          ))}
                        </div>
                        <span className='text-[10px] text-[var(--color-mid-gray)]'>({product.reviewCount})</span>
                      </div>
                      <div className='mt-1.5 flex items-center gap-2'>
                        <span className='font-[family-name:var(--font-heading)] text-base font-bold text-[var(--color-primary)]'>
                          Rs {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className='text-xs text-[var(--color-mid-gray)] line-through'>
                            Rs {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {product.originalPrice && (
                        <p className='mt-0.5 text-[10px] font-medium text-[var(--color-error)]'>
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% Save Rs {(product.originalPrice - product.price).toLocaleString()}
                        </p>
                      )}
                      {!product.inStock && (
                        <span className='mt-1 text-[10px] font-medium text-[var(--color-error)]'>Out of Stock</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='mt-8 flex items-center justify-center gap-2'>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-sm text-[var(--color-dark-gray)] transition-colors hover:bg-[var(--color-cream)] disabled:cursor-not-allowed disabled:opacity-40'
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[var(--color-accent)] text-[var(--color-deep-black)]'
                        : 'border border-[var(--color-light-gray)] text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-sm text-[var(--color-dark-gray)] transition-colors hover:bg-[var(--color-cream)] disabled:cursor-not-allowed disabled:opacity-40'
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage({ initialCategory }: ProductsPageClientProps) {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center'><div className='h-8 w-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin' /></div>}>
      <ProductsContent initialCategory={initialCategory} />
    </Suspense>
  );
}
