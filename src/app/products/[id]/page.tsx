'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
  description: string;
  specifications: Record<string, string>;
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
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  description: string;
  specifications: { label: string; value: string }[];
  reviews: { id: string; user: string; rating: number; date: string; comment: string }[];
  inStock: boolean;
  isNew?: boolean;
}

const categoryMap: Record<string, string> = {
  shirts: 't-shirts',
  pant: 'pants',
  perfume: 'perfumes',
  watches: 'watches',
};

function toProduct(p: ApiProduct): Product {
  const primary = p.images?.find((i) => i.is_primary) || p.images?.[0];
  const primaryUrl = primary?.secure_url || primary?.url || '';
  const allImages = p.images?.map((i) => i.secure_url || i.url).filter(Boolean) || [];
  const specEntries = p.specifications
    ? Object.entries(p.specifications).map(([label, value]) => ({ label, value }))
    : [];

  return {
    id: p._id,
    name: p.name,
    brand: p.brand || '',
    category: categoryMap[p.category] || p.category,
    price: p.price,
    originalPrice: p.comparePrice || undefined,
    rating: p.rating || 0,
    reviewCount: p.numReviews || 0,
    image: primaryUrl,
    images: allImages.length > 0 ? allImages : [primaryUrl],
    colors: (p.colors || []).map((c) => ({ name: c, hex: c })),
    sizes: p.sizes || [],
    description: p.description || '',
    specifications: specEntries,
    reviews: [],
    inStock: p.stock > 0,
    isNew: p.isNewArrival || false,
  };
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80',
  'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80&fit=facearea',
  'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80&fit=clip',
];

const categoryFeatures = (cat: string) => {
  const features: Record<string, { icon: string; title: string; text: string }[]> = {
    perfumes: [
      {
        icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
        title: 'Premium Ingredients',
        text: 'Sourced from the finest perfume houses in Grasse, France.',
      },
      {
        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
        title: 'Master Perfumers',
        text: 'Crafted by renowned noses with decades of olfactory expertise.',
      },
    ],
    't-shirts': [
      {
        icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
        title: 'Premium Fabrics',
        text: 'Only the finest cotton and blends sourced from renowned Italian mills.',
      },
      {
        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
        title: 'Artisan Craftsmanship',
        text: 'Hand-finished by master tailors with decades of experience.',
      },
    ],
    pants: [
      {
        icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
        title: 'Premium Materials',
        text: 'Finest wools and cottons selected from the best textile mills.',
      },
      {
        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
        title: 'Expert Tailoring',
        text: 'Precision-cut and assembled by skilled artisans for the perfect fit.',
      },
    ],
    watches: [
      {
        icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
        title: 'Swiss Movements',
        text: 'Precision-engineered automatic movements tested for reliability.',
      },
      {
        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
        title: 'Master Horologists',
        text: 'Assembled and regulated by master watchmakers with generations of skill.',
      },
    ],
  };
  return features[cat] || features['t-shirts'];
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const productRes = await fetch(`/api/products/${id}`);

        if (!productRes.ok) {
          if (productRes.status === 404) setError('Product not found');
          else setError('Failed to load product');
          return;
        }

        const productData = await productRes.json();
        const rawProduct: ApiProduct = productData.product;
        const product = toProduct(rawProduct);
        setProduct(product);

        const relatedRes = await fetch(`/api/products?category=${rawProduct.category}&limit=5`);
        const relatedData = await relatedRes.json();
        const items: ApiProduct[] = relatedData.products || [];
        setRelatedProducts(
          items
            .map(toProduct)
            .filter((p) => p.id !== product.id)
            .slice(0, 4)
        );
      } catch {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const displayImages = product?.images?.length ? product.images : fallbackImages;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const renderStars = (rating: number) => (
    <div className='flex items-center gap-0.5'>
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-[var(--color-accent)]' : i < rating ? 'text-[var(--color-accent)]' : 'text-[var(--color-light-gray)]'}`}
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
        </svg>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className='min-h-screen bg-[var(--color-white)] flex items-center justify-center'>
        <div className='w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className='min-h-screen bg-[var(--color-white)] flex flex-col items-center justify-center gap-4'>
        <p className='text-lg text-[var(--color-mid-gray)]'>{error || 'Product not found'}</p>
        <Link href='/products' className='text-sm text-[var(--color-accent)] hover:underline'>
          Back to Products
        </Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleColorSelect = (hex: string) => {
    setSelectedColor(hex);
  };

  return (
    <div className='min-h-screen bg-[var(--color-white)] font-[family-name:var(--font-body)]'>
      <div className='container-luxury py-8'>
        {/* Breadcrumb */}
        <nav className='mb-8 flex items-center gap-2 text-sm text-[var(--color-mid-gray)]'>
          <Link href='/' className='hover:text-[var(--color-accent)] transition-colors'>Home</Link>
          <span>/</span>
          <Link href='/products' className='hover:text-[var(--color-accent)] transition-colors'>Products</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className='hover:text-[var(--color-accent)] transition-colors'>{product.category}</Link>
          <span>/</span>
          <span className='text-[var(--color-dark-gray)]'>{product.name}</span>
        </nav>

        {/* Product Main Section */}
        <div className='grid gap-8 lg:grid-cols-2'>
          {/* Image Gallery */}
          <div>
            <div className='flex flex-row gap-3'>
              <div
                className='relative flex-1 aspect-[4/5] max-h-[70vh] sm:max-h-none overflow-hidden rounded-xl bg-[var(--color-cream)] cursor-crosshair'
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <Image
                  src={displayImages[selectedImage]}
                  alt={product.name}
                  fill
                  className={`object-cover transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                  style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
                  sizes='(max-width: 1024px) 100vw, 50vw'
                  priority
                />
                {product.isNew && (
                  <span className='absolute left-4 top-4 rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-semibold text-[var(--color-deep-black)] z-10'>
                    New
                  </span>
                )}
                {discount > 0 && (
                  <span className='absolute right-4 top-4 rounded-full bg-[var(--color-error)] px-3 py-1 text-xs font-semibold text-white z-10'>
                    -{discount}%
                  </span>
                )}
              </div>
              <div className='flex flex-col gap-2 shrink-0'>
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-14 h-14 sm:w-20 sm:h-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === i
                        ? 'border-[var(--color-accent)] shadow-[var(--shadow-gold)]'
                        : 'border-transparent hover:border-[var(--color-light-gray)]'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className='object-cover'
                      sizes='80px'
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className='flex flex-col'>
            <p className='text-sm font-medium uppercase tracking-widest text-[var(--color-accent-dark)]'>
              {product.brand}
            </p>
            <h1 className='mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)] lg:text-4xl'>
              {product.name}
            </h1>

            {/* Rating */}
            <div className='mt-4 flex items-center gap-3'>
              {renderStars(product.rating)}
              <span className='text-sm font-medium text-[var(--color-primary)]'>{product.rating}</span>
              <span className='text-sm text-[var(--color-mid-gray)]'>({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className='mt-6 flex items-end gap-3'>
              <span className='font-[family-name:var(--font-heading)] text-3xl font-bold text-[var(--color-primary)]'>
                Rs {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className='text-lg text-[var(--color-mid-gray)] line-through'>
                    Rs {product.originalPrice.toLocaleString()}
                  </span>
                  <span className='rounded-full bg-[var(--color-error)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-error)]'>
                    Save Rs {(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Color Selector */}
            {product.colors.length > 0 && (
              <div className='mt-8'>
                <h3 className='text-sm font-medium text-[var(--color-primary)]'>
                  Color: <span className='text-[var(--color-mid-gray)]'>{selectedColor ? product.colors.find(c => c.hex === selectedColor)?.name : 'Select'}</span>
                </h3>
                <div className='mt-3 flex gap-3'>
                  {product.colors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => handleColorSelect(color.hex)}
                      className={`h-10 w-10 rounded-full border-2 transition-all ${
                        selectedColor === color.hex
                          ? 'border-[var(--color-accent)] scale-110 shadow-[var(--shadow-gold)]'
                          : 'border-[var(--color-light-gray)] hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div className='mt-6'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-medium text-[var(--color-primary)]'>
                    Size: <span className='text-[var(--color-mid-gray)]'>{selectedSize || 'Select'}</span>
                  </h3>
                  <button className='text-xs text-[var(--color-accent)] hover:underline'>Size Guide</button>
                </div>
                <div className='mt-3 flex flex-wrap gap-2'>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
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
            )}

            {/* Quantity */}
            <div className='mt-8'>
              <h3 className='text-sm font-medium text-[var(--color-primary)]'>Quantity</h3>
              <div className='mt-3 flex items-center gap-4'>
                <div className='flex items-center rounded-lg border border-[var(--color-light-gray)]'>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className='px-4 py-2.5 text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'
                    disabled={quantity <= 1}
                  >
                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20 12H4' />
                    </svg>
                  </button>
                  <span className='w-12 text-center text-sm font-medium text-[var(--color-primary)]'>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className='px-4 py-2.5 text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'
                    disabled={quantity >= 10}
                  >
                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
                    </svg>
                  </button>
                </div>
                <span className='text-sm text-[var(--color-mid-gray)]'>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 rounded-lg px-8 py-4 font-medium text-sm transition-all ${
                  addedToCart
                    ? 'bg-[var(--color-success)] text-white'
                    : 'bg-[var(--color-deep-black)] text-[var(--color-white)] hover:bg-[var(--color-charcoal)]'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {addedToCart ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                    </svg>
                    Added to Cart
                  </span>
                ) : (
                  'Add to Cart'
                )}
              </button>
              <button
                disabled={!product.inStock}
                className='gold-button flex-1 px-8 py-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50'
              >
                Buy Now
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`rounded-lg border px-4 py-4 transition-all ${
                  isWishlisted
                    ? 'border-[var(--color-error)] text-[var(--color-error)] bg-[var(--color-error)]/5'
                    : 'border-[var(--color-light-gray)] text-[var(--color-dark-gray)] hover:border-[var(--color-mid-gray)]'
                }`}
              >
                <svg
                  className='h-5 w-5'
                  fill={isWishlisted ? 'currentColor' : 'none'}
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
                </svg>
              </button>
            </div>

            {/* Trust Badges */}
            <div className='mt-8 border-t border-[var(--color-light-gray)] pt-6'>
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <svg className='mx-auto h-5 w-5 text-[var(--color-accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
                  </svg>
                  <p className='mt-1 text-xs text-[var(--color-dark-gray)]'>Free Shipping</p>
                </div>
                <div>
                  <svg className='mx-auto h-5 w-5 text-[var(--color-accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                  </svg>
                  <p className='mt-1 text-xs text-[var(--color-dark-gray)]'>30-Day Returns</p>
                </div>
                <div>
                  <svg className='mx-auto h-5 w-5 text-[var(--color-accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                  </svg>
                  <p className='mt-1 text-xs text-[var(--color-dark-gray)]'>Authentic Guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className='mt-16'>
          <div className='flex border-b border-[var(--color-light-gray)]'>
            {[
              { key: 'description', label: 'Description' },
              { key: 'specifications', label: 'Specifications' },
              { key: 'reviews', label: `Reviews (${product.reviewCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-mid-gray)] hover:text-[var(--color-dark-gray)]'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className='absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]' />
                )}
              </button>
            ))}
          </div>

          <div className='py-8'>
            {activeTab === 'description' && (
              <div className='animate-fade-in'>
                <p className='leading-relaxed text-[var(--color-dark-gray)] max-w-3xl'>
                  {product.description}
                </p>
                <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2'>
                  {categoryFeatures(product.category).map((f, i) => (
                    <div key={i} className='rounded-xl bg-[var(--color-cream)] p-6'>
                      <svg className='h-8 w-8 text-[var(--color-accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d={f.icon} />
                      </svg>
                      <h4 className='mt-3 font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--color-primary)]'>{f.title}</h4>
                      <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>{f.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className='animate-fade-in max-w-3xl'>
                {product.specifications.length > 0 ? (
                  <table className='w-full'>
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-[var(--color-cream)]' : ''}>
                          <td className='px-6 py-4 text-sm font-medium text-[var(--color-primary)] w-1/3'>{spec.label}</td>
                          <td className='px-6 py-4 text-sm text-[var(--color-dark-gray)]'>{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className='text-[var(--color-mid-gray)]'>No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className='animate-fade-in'>
                <p className='text-[var(--color-mid-gray)]'>Reviews coming soon.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className='mt-16'>
            <h2 className='font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]'>
              You May Also Like
            </h2>
            <div className='luxury-divider' />
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/products/${rp.id}`}
                  className='group rounded-xl bg-[var(--color-cream)] overflow-hidden border border-[var(--color-light-gray)] transition-all hover:shadow-md hover:-translate-y-1'
                >
                  <div className='relative aspect-square overflow-hidden'>
                    <Image
                      src={rp.image}
                      alt={rp.name}
                      fill
                      className='object-cover transition-transform duration-500 group-hover:scale-105'
                      sizes='(max-width: 640px) 50vw, 25vw'
                    />
                  </div>
                  <div className='p-3'>
                    <p className='text-xs font-medium uppercase tracking-wider text-[var(--color-accent-dark)]'>
                      {rp.brand}
                    </p>
                    <h3 className='mt-1 text-sm font-medium text-[var(--color-primary)] line-clamp-1'>
                      {rp.name}
                    </h3>
                    <div className='mt-1 flex items-center gap-1'>
                      {renderStars(rp.rating)}
                    </div>
                    <span className='mt-1 block font-[family-name:var(--font-heading)] text-base font-bold text-[var(--color-primary)]'>
                      Rs {rp.price.toLocaleString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
