'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { sanitizeImages } from '@/lib/image';
import ImageUploader, { type ImageAsset } from '@/components/admin/ImageUploader';
import ImageGallery from '@/components/admin/ImageGallery';
import CategorySelect from '@/components/admin/CategorySelect';
import DynamicFields from '@/components/admin/DynamicFields';

interface ProductForm {
  name: string;
  description: string;
  category: string;
  price: string;
  comparePrice: string;
  brand: string;
  stock: string;
  sizes: string;
  colors: string;
  specifications: Record<string, string>;
  tags: string;
  discount: string;
  isFeatured: boolean;
  isNew: boolean;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  category: '',
  price: '',
  comparePrice: '',
  brand: '',
  stock: '0',
  sizes: '',
  colors: '',
  specifications: {},
  tags: '',
  discount: '0',
  isFeatured: false,
  isNew: true,
};

function isValidObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === 'new';
  const [step, setStep] = useState<'category' | 'form'>(isNew ? 'category' : 'form');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [images, setImages] = useState<ImageAsset[]>([]);

  useEffect(() => {
    if (isNew) return;
    if (!isValidObjectId(params.id as string)) {
      toast.error('Invalid product ID');
      router.push('/admin/products');
      return;
    }
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        const p = data.product;
        setForm({
          name: p.name || '',
          description: p.description || '',
          category: p.category || '',
          price: p.price?.toString() || '',
          comparePrice: p.comparePrice?.toString() || '',
          brand: p.brand || '',
          stock: p.stock?.toString() || '0',
          sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : '',
          colors: Array.isArray(p.colors) ? p.colors.join(', ') : '',
          specifications: p.specifications || {},
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
          discount: p.discount?.toString() || '0',
          isFeatured: p.isFeatured || false,
          isNew: p.isNewArrival ?? true,
        });
        setImages(sanitizeImages(p.images));
      } catch {
        toast.error('Failed to load product');
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [isNew, params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleDynamicChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (category: string) => {
    setForm(prev => ({ ...prev, category }));
    setStep('form');
  };

  const handleUploadComplete = useCallback((assets: ImageAsset[]) => {
    setImages(prev => {
      const updated = [...prev, ...assets];
      if (updated.length > 0 && !updated.some(i => i.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: parseFloat(form.price) || 0,
      comparePrice: parseFloat(form.comparePrice) || 0,
      brand: form.brand,
      stock: parseInt(form.stock) || 0,
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: form.colors.split(',').map(s => s.trim()).filter(Boolean),
      specifications: form.specifications,
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      discount: parseFloat(form.discount) || 0,
      isFeatured: form.isFeatured,
      isNew: form.isNew,
      images,
    };

    try {
      const token = localStorage.getItem('zaam_token');
      const url = isNew ? '/api/products' : `/api/products/${params.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        localStorage.removeItem('zaam_token');
        toast.error('Session expired, please login again');
        router.push('/auth/login');
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Save failed');
      }

      toast.success(isNew ? 'Product created' : 'Product updated');
      router.push('/admin/products');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-off-white)] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (step === 'category') {
    return (
      <div className="min-h-screen bg-[var(--color-off-white)] font-[family-name:var(--font-body)]">
        <div className="p-6 lg:p-8 max-w-3xl mx-auto">
          <div className="mb-8">
            <Link href="/admin/products" className="text-sm text-[var(--color-mid-gray)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Products
            </Link>
          </div>
          <CategorySelect onSelect={handleCategorySelect} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] font-[family-name:var(--font-body)]">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              {isNew && (
                <button
                  type="button"
                  onClick={() => setStep('category')}
                  className="text-sm text-[var(--color-mid-gray)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Change Category
                </button>
              )}
              {!isNew && (
                <Link href="/admin/products" className="text-sm text-[var(--color-mid-gray)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Products
                </Link>
              )}
            </div>
            <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]">
              {isNew ? 'New Product' : 'Edit Product'}
            </h1>
            <p className="text-sm text-[var(--color-mid-gray)] mt-1 capitalize">
              {form.category} &mdash; {isNew ? 'Fill in the details below' : 'Update product details and imagery'}
            </p>
          </div>

          <span className="rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 px-4 py-1.5 text-sm font-medium text-[var(--color-accent-dark)] capitalize">
            {form.category}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-2xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6 lg:p-8">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] mb-6">Basic Information</h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-primary)] mb-1.5">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                  placeholder="e.g. Classic Fit Wool Blazer"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-primary)] mb-1.5">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] resize-y"
                  placeholder="Product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-primary)] mb-1.5">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                  placeholder="e.g. Zegna"
                />
              </div>

              <div className="hidden">
                <input type="hidden" name="category" value={form.category} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-primary)] mb-1.5">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-primary)] mb-1.5">Compare Price ($)</label>
                <input
                  type="number"
                  name="comparePrice"
                  value={form.comparePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-primary)] mb-1.5">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-primary)] mb-1.5">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={form.discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6 lg:p-8">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] mb-6">
              Category Details
              <span className="ml-2 text-sm font-normal text-[var(--color-mid-gray)] capitalize">
                &mdash; {form.category}
              </span>
            </h2>

            <AnimatePresence mode="wait">
              <motion.div
                key={form.category}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <DynamicFields
                  category={form.category}
                  sizes={form.sizes}
                  colors={form.colors}
                  specifications={form.specifications}
                  onChange={handleDynamicChange}
                />
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--color-primary)] mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                  placeholder="luxury, new-arrival, limited"
                />
              </div>

              <div className="flex items-end gap-6 pb-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-[var(--color-light-gray)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  />
                  <span className="text-sm text-[var(--color-primary)]">Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={form.isNew}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-[var(--color-light-gray)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  />
                  <span className="text-sm text-[var(--color-primary)]">New Arrival</span>
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-6 lg:p-8">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] mb-6">Product Images</h2>
            <div className="space-y-6">
              <ImageUploader onUploadComplete={handleUploadComplete} />
              <ImageGallery images={images} onChange={setImages} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/products"
              className="rounded-lg border border-[var(--color-light-gray)] px-6 py-2.5 text-sm font-medium text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="gold-button flex items-center gap-2 px-8 py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {saving && <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />}
              {isNew ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
