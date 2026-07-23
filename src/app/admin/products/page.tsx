'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ProductImage {
  public_id: string;
  url: string;
  secure_url: string;
  is_primary: boolean;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: ProductImage[];
  brand: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Profile', href: '/admin/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Users', href: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

function getStatus(stock: number): 'Active' | 'Out of Stock' {
  return stock > 0 ? 'Active' : 'Out of Stock';
}

function getPrimaryImage(product: Product): string {
  if (!product.images || product.images.length === 0) return '';
  const primary = product.images.find(i => i.is_primary);
  if (primary) return primary.secure_url || primary.url;
  return product.images[0].secure_url || product.images[0].url;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('limit', String(itemsPerPage));
        if (search) params.set('search', search);

        const res = await fetch(`/api/products?${params.toString()}`);

        if (res.status === 401) {
          toast.error('Session expired, please login again');
          router.push('/auth/login');
          return;
        }

        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data.products || []);
        setPagination(data.pagination || null);
      } catch {
        setProducts([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, search]);

  const filtered = products;
  const totalPages = pagination?.totalPages || 1;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p._id)));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (res.status === 401) {
        toast.error('Session expired, please login again');
        router.push('/auth/login');
        return;
      }

      if (!res.ok) throw new Error('Delete failed');
      setProducts(prev => prev.filter(p => p._id !== id));
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    } catch {
      toast.error('Failed to delete product.');
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    let successCount = 0;
    await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
          });
          if (res.ok) successCount++;
        } catch {
          // Individual failure handled below
        }
      })
    );
    setProducts(prev => prev.filter(p => !selectedIds.has(p._id)));
    setSelectedIds(new Set());
    if (successCount === ids.length) {
      toast.success(`${ids.length} product(s) deleted successfully.`);
    } else if (successCount > 0) {
      toast.error(`Deleted ${successCount} of ${ids.length} product(s). Some deletions failed.`);
    } else {
      toast.error('Failed to delete products.');
    }
  };

  return (
    <div className='min-h-screen bg-[var(--color-off-white)] font-[family-name:var(--font-body)]'>
      <div className='flex'>
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-white)] border-r border-[var(--color-light-gray)] transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className='p-6 border-b border-[var(--color-light-gray)]'>
            <Link href='/admin' className='font-[family-name:var(--font-heading)] text-xl font-bold gold-gradient'>ZAAM Admin</Link>
          </div>
          <nav className='px-3 py-4'>
            {sidebarLinks.map((link) => (
              <Link key={link.label} href={link.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors mb-0.5 ${
                  link.href === '/admin/products' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                }`}>
                <svg className='h-5 w-5 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d={link.icon} />
                </svg>
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {sidebarOpen && <div className='fixed inset-0 z-30 bg-black/50 lg:hidden' onClick={() => setSidebarOpen(false)} />}

        <div className='flex-1 p-6 lg:p-8'>
          <div className='mb-8 flex items-center justify-between lg:hidden'>
            <button onClick={() => setSidebarOpen(true)} className='rounded-lg p-2 text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'>
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>Products</h1>
            <div className='w-10' />
          </div>

          <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='hidden lg:block font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>Products</h1>
              <p className='text-[var(--color-mid-gray)] text-sm mt-1'>{pagination ? `${pagination.total} total products` : 'Loading...'}</p>
            </div>
            <div className='flex items-center gap-3'>
              <Link href='/admin/products/new' className='gold-button flex items-center gap-2 px-4 py-2.5 text-sm font-medium'>
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
                </svg>
                Add Product
              </Link>
            </div>
          </div>

          {/* Search & Filters */}
          <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='relative flex-1 max-w-md'>
              <svg className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-mid-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
              <input type='text' placeholder='Search products...' value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className='w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] pl-10 pr-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className='mb-4 flex items-center gap-3 rounded-lg bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 p-3'>
              <span className='text-sm text-[var(--color-dark-gray)]'>{selectedIds.size} selected</span>
              <button onClick={handleBulkDelete} className='rounded-lg bg-[var(--color-error)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-error)]/90 transition-colors'>
                Delete Selected
              </button>
            </div>
          )}

          {/* Table */}
          <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)]'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='hidden md:table-header-group'>
                  <tr className='border-b border-[var(--color-light-gray)] bg-[var(--color-cream)]'>
                    <th className='px-4 py-4 text-left'>
                      <input type='checkbox' checked={selectedIds.size === products.length && products.length > 0} onChange={toggleSelectAll}
                        className='h-4 w-4 rounded border-[var(--color-light-gray)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]' />
                    </th>
                    <th className='px-4 py-4 text-left font-medium text-[var(--color-primary)]'>Product</th>
                    <th className='px-4 py-4 text-left font-medium text-[var(--color-primary)]'>Category</th>
                    <th className='px-4 py-4 text-left font-medium text-[var(--color-primary)]'>Price</th>
                    <th className='px-4 py-4 text-left font-medium text-[var(--color-primary)]'>Stock</th>
                    <th className='px-4 py-4 text-left font-medium text-[var(--color-primary)]'>Status</th>
                    <th className='px-4 py-4 text-right font-medium text-[var(--color-primary)]'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className='px-4 py-12 text-center text-sm text-[var(--color-mid-gray)]'>Loading products...</td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className='px-4 py-12 text-center text-sm text-[var(--color-mid-gray)]'>No products found.</td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} className='hidden md:table-row border-b border-[var(--color-light-gray)] last:border-b-0 hover:bg-[var(--color-cream)] transition-colors'>
                      <td className='px-4 py-4'>
                        <input type='checkbox' checked={selectedIds.has(product._id)} onChange={() => toggleSelect(product._id)}
                          className='h-4 w-4 rounded border-[var(--color-light-gray)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]' />
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--color-cream)]'>
                            {getPrimaryImage(product) && (
                              <Image src={getPrimaryImage(product)} alt={product.name} fill className='object-cover' sizes='40px' />
                            )}
                          </div>
                          <div>
                            <p className='font-medium text-[var(--color-primary)]'>{product.name}</p>
                            <p className='text-xs text-[var(--color-mid-gray)]'>{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-4 text-[var(--color-dark-gray)]'>{product.category}</td>
                      <td className='px-4 py-4 font-medium text-[var(--color-primary)]'>Rs {product.price.toLocaleString()}</td>
                      <td className='px-4 py-4'>
                        <span className={product.stock === 0 ? 'text-[var(--color-error)]' : 'text-[var(--color-dark-gray)]'}>
                          {product.stock}
                        </span>
                      </td>
                      <td className='px-4 py-4'>
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          getStatus(product.stock) === 'Active' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' :
                          'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                        }`}>{getStatus(product.stock)}</span>
                      </td>
                      <td className='px-4 py-4 text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <Link href={`/admin/products/${product._id}`} className='rounded-lg p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] hover:text-[var(--color-accent)] transition-colors'>
                            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                            </svg>
                          </Link>
                          <button onClick={() => handleDelete(product._id)} className='rounded-lg p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] hover:text-[var(--color-error)] transition-colors'>
                            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
            {/* Mobile Cards */}
            {!loading && products.length > 0 && (
              <div className='block md:hidden divide-y divide-[var(--color-light-gray)]'>
                {products.map((product) => (
                  <div key={product._id} className='p-4 space-y-3'>
                    <div className='flex items-start gap-3'>
                      <div className='pt-0.5'>
                        <input type='checkbox' checked={selectedIds.has(product._id)} onChange={() => toggleSelect(product._id)}
                          className='h-4 w-4 rounded border-[var(--color-light-gray)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]' />
                      </div>
                      <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--color-cream)]'>
                        {getPrimaryImage(product) && (
                          <Image src={getPrimaryImage(product)} alt={product.name} fill className='object-cover' sizes='48px' />
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-[var(--color-primary)] truncate'>{product.name}</p>
                        <p className='text-xs text-[var(--color-mid-gray)]'>{product.brand}</p>
                      </div>
                      <div className='flex gap-1 shrink-0'>
                        <Link href={`/admin/products/${product._id}`} className='rounded-lg p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] hover:text-[var(--color-accent)] transition-colors'>
                          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                          </svg>
                        </Link>
                        <button onClick={() => handleDelete(product._id)} className='rounded-lg p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] hover:text-[var(--color-error)] transition-colors'>
                          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm'>
                      <div className='text-[var(--color-mid-gray)]'>Category:</div>
                      <div className='text-[var(--color-dark-gray)]'>{product.category}</div>
                      <div className='text-[var(--color-mid-gray)]'>Price:</div>
                      <div className='font-medium text-[var(--color-primary)]'>Rs {product.price.toLocaleString()}</div>
                      <div className='text-[var(--color-mid-gray)]'>Stock:</div>
                      <div className={product.stock === 0 ? 'text-[var(--color-error)]' : 'text-[var(--color-dark-gray)]'}>{product.stock}</div>
                      <div className='text-[var(--color-mid-gray)]'>Status:</div>
                      <div>
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          getStatus(product.stock) === 'Active' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' :
                          'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                        }`}>{getStatus(product.stock)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='mt-6 flex items-center justify-center gap-2'>
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors'>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page ? 'bg-[var(--color-accent)] text-[var(--color-deep-black)]' : 'border border-[var(--color-light-gray)] text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                  }`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors'>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
