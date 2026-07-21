'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

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
}

const priceRanges = [
  { label: 'Under Rs 500', min: 0, max: 500 },
  { label: 'Rs 500 - Rs 1,000', min: 500, max: 1000 },
  { label: 'Rs 1,000 - Rs 2,000', min: 1000, max: 2000 },
  { label: 'Rs 2,000 - Rs 5,000', min: 2000, max: 5000 },
  { label: 'Over Rs 5,000', min: 5000, max: Infinity },
];

function toProduct(p: ApiProduct): Product {
  const primary = p.images?.find(i => i.is_primary) || p.images?.[0];
  return {
    id: p._id,
    name: p.name,
    brand: p.brand || '',
    category: p.category,
    price: p.price,
    originalPrice: p.comparePrice || undefined,
    rating: p.rating || 0,
    reviewCount: p.numReviews || 0,
    image: primary?.secure_url || primary?.url || '',
    colors: p.colors || [],
    sizes: p.sizes || [],
    inStock: p.stock > 0,
    isNew: p.isNewArrival || false,
  };
}

function ProductsContent({ initialCategory, initialSearch }: ProductsPageClientProps) {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch || searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || searchParams.get('category') || 'All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
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
      result = result.filter(p => p.brand === selectedBrand);
    }

    if (selectedPriceRange) {
      const range = priceRanges.find(r => r.label === selectedPriceRange);
      if (range) {
        result = result.filter(p => p.price >= range.min && p.price < range.max);
      }
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
  }, [searchQuery, selectedCategory, selectedBrand, selectedPriceRange, selectedColor, selectedSize, minRating, sortBy, allProducts]);

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
    return ['All', ...Array.from(brs)];
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
        <div className='sticky top-0 z-10 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-[var(--color-white)] py-2'>
          <div className='relative flex-1 max-w-md'>
            <svg className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-mid-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
            <input
              type='text'
              placeholder='Search products...'
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className='w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] py-3 pl-12 pr-4 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all'
            />
          </div>
          <div className='relative flex items-center gap-2'>
            {/* Categories Hover Dropdown */}
            <div
              className='relative'
              onMouseEnter={() => setShowCategoryDropdown(true)}
              onMouseLeave={() => setShowCategoryDropdown(false)}
            >
              <button
                className='rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-3 py-3 text-sm text-[var(--color-primary)] hover:border-[var(--color-accent)] transition-colors whitespace-nowrap'
              >
                {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
              </button>
              {showCategoryDropdown && (
                <div className='absolute right-0 mt-1 w-48 rounded-lg bg-[var(--color-white)] border border-[var(--color-light-gray)] shadow-lg z-20 py-1 max-h-60 overflow-y-auto'>
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setCurrentPage(1); setShowCategoryDropdown(false); }}
                      className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                        selectedCategory === cat
                          ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium'
                          : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className='rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'
            >
              <option value='newest'>Newest</option>
              <option value='price-asc'>Price: Low to High</option>
              <option value='price-desc'>Price: High to Low</option>
              <option value='rating'>Best Rating</option>
            </select>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-3 transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-accent)] text-[var(--color-deep-black)]' : 'bg-[var(--color-cream)] text-[var(--color-mid-gray)] hover:bg-[var(--color-light-gray)]'}`}
              aria-label='Grid view'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-3 transition-colors ${viewMode === 'list' ? 'bg-[var(--color-accent)] text-[var(--color-deep-black)]' : 'bg-[var(--color-cream)] text-[var(--color-mid-gray)] hover:bg-[var(--color-light-gray)]'}`}
              aria-label='List view'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className='rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-3 text-[var(--color-mid-gray)] hover:bg-[var(--color-light-gray)] lg:hidden'
              aria-label='Toggle filters'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' />
              </svg>
            </button>
          </div>
        </div>

        <div className='flex gap-6'>
          {/* Sidebar Filters - Desktop */}
          <aside className='hidden w-64 shrink-0 lg:block'>
            <div className='sticky top-8 space-y-6'>
              {/* Category Filter */}
              <div>
                <h3 className='mb-3 font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]'>
                  Category
                </h3>
                <div className='space-y-1'>
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                      className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        selectedCategory === cat
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
                <div className='space-y-1'>
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => { setSelectedPriceRange(selectedPriceRange === range.label ? null : range.label); setCurrentPage(1); }}
                      className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        selectedPriceRange === range.label
                          ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium'
                          : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h3 className='mb-3 font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]'>
                  Brand
                </h3>
                <div className='max-h-48 space-y-1 overflow-y-auto'>
                  {allBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => { setSelectedBrand(brand); setCurrentPage(1); }}
                      className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        selectedBrand === brand
                          ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium'
                          : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                      }`}
                    >
                      {brand}
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
                  {allColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => { setSelectedColor(selectedColor === color ? null : color); setCurrentPage(1); }}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'border-[var(--color-accent)] scale-110 shadow-[var(--shadow-gold)]'
                          : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
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
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(selectedSize === size ? null : size); setCurrentPage(1); }}
                      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedSize === size
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-deep-black)]'
                          : 'border-[var(--color-light-gray)] text-[var(--color-dark-gray)] hover:border-[var(--color-mid-gray)]'
                      }`}
                    >
                      {size}
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
                  {[0, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => { setMinRating(minRating === rating ? 0 : rating); setCurrentPage(1); }}
                      className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        minRating === rating
                          ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium'
                          : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                      }`}
                    >
                      {rating === 0 ? 'Any Rating' : `${rating}+ Stars`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                  setSelectedPriceRange(null);
                  setSelectedColor(null);
                  setSelectedSize(null);
                  setMinRating(0);
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className='w-full rounded-lg border border-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-deep-black)]'
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Mobile Filters Overlay */}
          {showMobileFilters && (
            <div className='fixed inset-0 z-50 lg:hidden'>
              <div className='absolute inset-0 bg-black/50' onClick={() => setShowMobileFilters(false)} />
              <div className='absolute right-0 top-0 h-full w-80 max-w-[90vw] overflow-y-auto bg-[var(--color-white)] p-6 shadow-xl animate-fade-in-right'>
                <div className='mb-6 flex items-center justify-between'>
                  <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>
                    Filters
                  </h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className='rounded-full p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)]'
                  >
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </button>
                </div>
                {/* Mobile filters - same content as sidebar */}
                <div className='space-y-6'>
                  <div>
                    <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]'>Category</h3>
                    <div className='space-y-1'>
                      {allCategories.map((cat) => (
                        <button key={cat} onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                          className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            selectedCategory === cat ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                          }`}>{cat}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]'>Price Range</h3>
                    <div className='space-y-1'>
                      {priceRanges.map((range) => (
                        <button key={range.label} onClick={() => { setSelectedPriceRange(selectedPriceRange === range.label ? null : range.label); setCurrentPage(1); }}
                          className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            selectedPriceRange === range.label ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                          }`}>{range.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]'>Brand</h3>
                    <div className='space-y-1'>
                      {allBrands.map((brand) => (
                        <button key={brand} onClick={() => { setSelectedBrand(brand); setCurrentPage(1); }}
                          className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            selectedBrand === brand ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                          }`}>{brand}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]'>Color</h3>
                    <div className='flex flex-wrap gap-2'>
                      {allColors.map((color) => (
                        <button key={color} onClick={() => { setSelectedColor(selectedColor === color ? null : color); setCurrentPage(1); }}
                          className={`h-8 w-8 rounded-full border-2 transition-all ${
                            selectedColor === color ? 'border-[var(--color-accent)] scale-110' : 'border-transparent hover:scale-110'
                          }`} style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]'>Size</h3>
                    <div className='flex flex-wrap gap-2'>
                      {allSizes.map((size) => (
                        <button key={size} onClick={() => { setSelectedSize(selectedSize === size ? null : size); setCurrentPage(1); }}
                          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                            selectedSize === size ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-deep-black)]' : 'border-[var(--color-light-gray)] text-[var(--color-dark-gray)]'
                          }`}>{size}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => {
                    setSelectedCategory('All'); setSelectedBrand('All'); setSelectedPriceRange(null);
                    setSelectedColor(null); setSelectedSize(null); setMinRating(0); setSearchQuery(''); setCurrentPage(1);
                    setShowMobileFilters(false);
                  }} className='w-full rounded-lg border border-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-deep-black)]'>
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}

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
                {paginatedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className='group rounded-lg bg-[var(--color-cream)] overflow-hidden border border-[var(--color-light-gray)] transition-all hover:shadow-md hover:-translate-y-0.5'
                  >
                    <div className='relative aspect-[4/5] overflow-hidden'>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                        sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
                      />
                      {product.isNew && (
                        <span className='absolute left-2 top-2 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-deep-black)]'>
                          New
                        </span>
                      )}
                      {product.originalPrice && (
                        <span className='absolute right-2 top-2 rounded-full bg-[var(--color-error)] px-2 py-0.5 text-[10px] font-semibold text-white'>
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </span>
                      )}
                      {!product.inStock && (
                        <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                          <span className='rounded-full bg-[var(--color-white)] px-3 py-1 text-xs font-semibold text-[var(--color-deep-black)]'>
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className='p-2.5'>
                      <p className='text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent-dark)] truncate'>
                        {product.brand}
                      </p>
                      <h3 className='mt-0.5 font-[family-name:var(--font-heading)] text-xs font-semibold text-[var(--color-primary)] line-clamp-1 leading-snug'>
                        {product.name}
                      </h3>
                      <div className='mt-1.5 flex items-center gap-1.5'>
                        <div className='flex items-center'>
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-2.5 w-2.5 ${i < Math.floor(product.rating) ? 'text-[var(--color-accent)]' : 'text-[var(--color-light-gray)]'}`}
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                            </svg>
                          ))}
                        </div>
                        <span className='text-[10px] text-[var(--color-mid-gray)]'>({product.reviewCount})</span>
                      </div>
                      <div className='mt-1.5 flex items-center gap-1'>
                        <span className='font-[family-name:var(--font-heading)] text-sm font-bold text-[var(--color-primary)]'>
                          Rs {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className='text-[10px] text-[var(--color-mid-gray)] line-through'>
                            Rs {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
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
