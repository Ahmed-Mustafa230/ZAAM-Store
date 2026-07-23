'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface UserType {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  avatar: string;
  isBlocked: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  addresses: { street: string; city: string; state: string; zip: string; country: string; isDefault: boolean }[];
}

interface Pagination {
  page: number; limit: number; total: number; totalPages: number;
  hasNextPage: boolean; hasPrevPage: boolean;
}

type ConfirmAction = 'block' | 'unblock' | 'softDelete' | 'hardDelete' | 'restore' | null;

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Profile', href: '/admin/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Users', href: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ user: UserType; action: ConfirmAction } | null>(null);
  const [roleChange, setRoleChange] = useState<{ user: UserType; show: boolean } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search.trim()) params.set('search', search.trim());
    if (showDeleted) params.set('showDeleted', 'true');
    fetch(`/api/admin/users?${params}`)
      .then((res) => {
        if (!res.ok) return res.json().then((body) => { throw new Error(body.message || `Request failed (${res.status})`); });
        return res.json();
      })
      .then((json) => {
        setUsers(json.users);
        setPagination(json.pagination);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load users.');
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, [page, search, showDeleted]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const performAction = async (userId: string, action: string, extra?: Record<string, string>) => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      });
      const json = await res.json();
      if (!res.ok || (json.message && !json.user)) throw new Error(json.message || `Request failed (${res.status})`);
      setActionMessage({ type: 'success', text: json.message });
      fetchUsers();
    } catch (err: unknown) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Action failed.' });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
      setRoleChange(null);
    }
  };

  const handleHardDelete = async (userId: string) => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}?permanent=true`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || (json.message && !json.user)) throw new Error(json.message || `Request failed (${res.status})`);
      setActionMessage({ type: 'success', text: json.message });
      fetchUsers();
    } catch (err: unknown) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Delete failed.' });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const getStatusBadge = (user: UserType) => {
    if (user.isDeleted) {
      return <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--color-error)]/10 text-[var(--color-error)]">Deleted</span>;
    }
    if (user.isBlocked) {
      return <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--color-warning)]/10 text-[var(--color-warning)]">Blocked</span>;
    }
    return <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--color-success)]/10 text-[var(--color-success)]">Active</span>;
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
                  link.href === '/admin/customers' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
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
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>Users</h1>
            <div className='w-10' />
          </div>

          <div className='mb-8 hidden lg:block'>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>Users</h1>
            <p className='mt-1 text-[var(--color-mid-gray)]'>Manage user accounts, roles, and status</p>
          </div>

          {actionMessage && (
            <div className={`mb-6 rounded-lg p-4 text-sm ${
              actionMessage.type === 'success' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20' : 'bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20'
            }`}>
              {actionMessage.text}
              <button onClick={() => setActionMessage(null)} className='float-right font-bold'>&times;</button>
            </div>
          )}

          <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <form onSubmit={handleSearch} className='relative max-w-md w-full'>
              <svg className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-mid-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
              <input type='text' placeholder='Search by name or email...' value={search} onChange={(e) => setSearch(e.target.value)}
                className='w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] pl-10 pr-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]' />
            </form>
            <label className='flex items-center gap-2 text-sm text-[var(--color-dark-gray)] cursor-pointer'>
              <input type='checkbox' checked={showDeleted} onChange={(e) => { setShowDeleted(e.target.checked); setPage(1); }}
                className='h-4 w-4 rounded border-[var(--color-light-gray)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]' />
              Show deleted users
            </label>
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <div className='animate-spin h-10 w-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full' />
            </div>
          ) : error ? (
            <div className='text-center py-20'>
              <p className='text-[var(--color-error)] font-medium'>{error}</p>
              <button onClick={fetchUsers} className='mt-4 gold-button px-4 py-2 text-sm'>Retry</button>
            </div>
          ) : (
            <>
              <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)]'>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead className='hidden md:table-header-group'>
                      <tr className='border-b border-[var(--color-light-gray)] bg-[var(--color-cream)]'>
                        <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>ID</th>
                        <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>User</th>
                        <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Email</th>
                        <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Role</th>
                        <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Status</th>
                        <th className='px-6 py-4 text-left font-medium text-[var(--color-primary)]'>Joined</th>
                        <th className='px-6 py-4 text-right font-medium text-[var(--color-primary)]'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr><td colSpan={7} className='px-6 py-12 text-center text-[var(--color-mid-gray)]'>No users found.</td></tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user._id} className='hidden md:table-row border-b border-[var(--color-light-gray)] last:border-b-0 hover:bg-[var(--color-cream)] transition-colors'>
                          <td className='px-6 py-4'>
                            <code className='text-xs text-[var(--color-mid-gray)] font-mono'>
                              {String(user._id).slice(-8).toUpperCase()}
                            </code>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-3'>
                              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-xs font-bold text-[var(--color-accent)]'>
                                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className='font-medium text-[var(--color-primary)]'>{user.name}</span>
                            </div>
                          </td>
                          <td className='px-6 py-4 text-[var(--color-dark-gray)]'>{user.email}</td>
                          <td className='px-6 py-4'>
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                                : 'bg-[var(--color-info)]/10 text-[var(--color-info)]'
                            }`}>{user.role}</span>
                          </td>
                          <td className='px-6 py-4'>{getStatusBadge(user)}</td>
                          <td className='px-6 py-4 text-[var(--color-dark-gray)]'>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className='px-6 py-4 text-right'>
                            <div className='flex items-center justify-end gap-1'>
                              <button onClick={() => setSelectedUser(user)}
                                className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors'>
                                View
                              </button>
                              {!user.isDeleted && !user.isBlocked && (
                                <button onClick={() => setConfirmAction({ user, action: 'block' })}
                                  className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10 transition-colors'>
                                  Block
                                </button>
                              )}
                              {!user.isDeleted && user.isBlocked && (
                                <button onClick={() => performAction(user._id, 'unblock')}
                                  className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-success)] hover:bg-[var(--color-success)]/10 transition-colors'>
                                  Unblock
                                </button>
                              )}
                              {!user.isDeleted && (
                                <button onClick={() => setConfirmAction({ user, action: 'softDelete' })}
                                  className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors'>
                                  Delete
                                </button>
                              )}
                              {user.isDeleted && (
                                <button onClick={() => performAction(user._id, 'restore')}
                                  className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-success)] hover:bg-[var(--color-success)]/10 transition-colors'>
                                  Restore
                                </button>
                              )}
                              {user.isDeleted && (
                                <button onClick={() => setConfirmAction({ user, action: 'hardDelete' })}
                                  className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors'>
                                  Purge
                                </button>
                              )}
                              {!user.isDeleted && (
                                <button onClick={() => setRoleChange({ user, show: true })}
                                  className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                                  Role
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                </div>
                {/* Mobile Cards */}
                {users.length > 0 && (
                  <div className='block md:hidden divide-y divide-[var(--color-light-gray)]'>
                    {users.map((user) => (
                      <div key={user._id} className='p-4 space-y-3'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-xs font-bold text-[var(--color-accent)]'>
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='font-medium text-[var(--color-primary)] truncate'>{user.name}</p>
                            <code className='text-xs text-[var(--color-mid-gray)] font-mono'>{String(user._id).slice(-8).toUpperCase()}</code>
                          </div>
                        </div>
                        <div className='grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm'>
                          <div className='text-[var(--color-mid-gray)]'>Email:</div>
                          <div className='text-[var(--color-dark-gray)] truncate'>{user.email}</div>
                          <div className='text-[var(--color-mid-gray)]'>Role:</div>
                          <div>
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              user.role === 'admin' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'bg-[var(--color-info)]/10 text-[var(--color-info)]'
                            }`}>{user.role}</span>
                          </div>
                          <div className='text-[var(--color-mid-gray)]'>Status:</div>
                          <div>{getStatusBadge(user)}</div>
                          <div className='text-[var(--color-mid-gray)]'>Joined:</div>
                          <div className='text-[var(--color-dark-gray)]'>{new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className='flex flex-wrap gap-1.5 pt-2 border-t border-[var(--color-light-gray)]'>
                          <button onClick={() => setSelectedUser(user)}
                            className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors'>
                            View
                          </button>
                          {!user.isDeleted && !user.isBlocked && (
                            <button onClick={() => setConfirmAction({ user, action: 'block' })}
                              className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10 transition-colors'>
                              Block
                            </button>
                          )}
                          {!user.isDeleted && user.isBlocked && (
                            <button onClick={() => performAction(user._id, 'unblock')}
                              className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-success)] hover:bg-[var(--color-success)]/10 transition-colors'>
                              Unblock
                            </button>
                          )}
                          {!user.isDeleted && (
                            <button onClick={() => setConfirmAction({ user, action: 'softDelete' })}
                              className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors'>
                              Delete
                            </button>
                          )}
                          {user.isDeleted && (
                            <button onClick={() => performAction(user._id, 'restore')}
                              className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-success)] hover:bg-[var(--color-success)]/10 transition-colors'>
                              Restore
                            </button>
                          )}
                          {user.isDeleted && (
                            <button onClick={() => setConfirmAction({ user, action: 'hardDelete' })}
                              className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors'>
                              Purge
                            </button>
                          )}
                          {!user.isDeleted && (
                            <button onClick={() => setRoleChange({ user, show: true })}
                              className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                              Role
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className='mt-6 flex items-center justify-between'>
                  <p className='text-sm text-[var(--color-mid-gray)]'>
                    Showing {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </p>
                  <div className='flex gap-2'>
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage}
                      className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed'>
                      Previous
                    </button>
                    <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage}
                      className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed'>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setSelectedUser(null)} />
          <div className='relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-[var(--color-white)] p-8 shadow-xl animate-scale-in'>
            <button onClick={() => setSelectedUser(null)}
              className='absolute right-4 top-4 rounded-full p-2 text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] transition-colors'>
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
            <div className='flex flex-col items-center'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-2xl font-bold text-[var(--color-accent)]'>
                {selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h2 className='mt-4 font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>{selectedUser.name}</h2>
              <div className='mt-2 flex gap-2'>
                {getStatusBadge(selectedUser)}
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  selectedUser.role === 'admin'
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'bg-[var(--color-info)]/10 text-[var(--color-info)]'
                }`}>{selectedUser.role}</span>
              </div>
            </div>
            <div className='mt-6 space-y-4'>
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Email</span>
                <span className='text-sm font-medium text-[var(--color-primary)]'>{selectedUser.email}</span>
              </div>
              {selectedUser.phone && (
                <div className='flex justify-between'>
                  <span className='text-sm text-[var(--color-mid-gray)]'>Phone</span>
                  <span className='text-sm font-medium text-[var(--color-primary)]'>{selectedUser.phone}</span>
                </div>
              )}
              <div className='flex justify-between'>
                <span className='text-sm text-[var(--color-mid-gray)]'>Member Since</span>
                <span className='text-sm font-medium text-[var(--color-primary)]'>
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </span>
              </div>
              {selectedUser.deletedAt && (
                <div className='flex justify-between'>
                  <span className='text-sm text-[var(--color-mid-gray)]'>Deleted At</span>
                  <span className='text-sm font-medium text-[var(--color-error)]'>
                    {new Date(selectedUser.deletedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                <div className='border-t border-[var(--color-light-gray)] pt-4'>
                  <span className='text-sm text-[var(--color-mid-gray)] block mb-2'>Addresses</span>
                  {selectedUser.addresses.map((addr, i) => (
                    <p key={i} className='text-sm text-[var(--color-primary)]'>
                      {addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                      {addr.isDefault && <span className='text-[var(--color-accent)] ml-1'>(Default)</span>}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className='mt-6 flex flex-wrap gap-2 border-t border-[var(--color-light-gray)] pt-6'>
              {!selectedUser.isDeleted && !selectedUser.isBlocked && (
                <button onClick={() => { setSelectedUser(null); setConfirmAction({ user: selectedUser, action: 'block' }); }}
                  className='gold-button px-4 py-2 text-xs font-medium'>Block User</button>
              )}
              {!selectedUser.isDeleted && selectedUser.isBlocked && (
                <button onClick={() => { setSelectedUser(null); performAction(selectedUser._id, 'unblock'); }}
                  className='rounded-lg border border-[var(--color-success)] px-4 py-2 text-xs font-medium text-[var(--color-success)] hover:bg-[var(--color-success)]/10'>Unblock</button>
              )}
              {!selectedUser.isDeleted && (
                <button onClick={() => { setSelectedUser(null); setConfirmAction({ user: selectedUser, action: 'softDelete' }); }}
                  className='rounded-lg border border-[var(--color-error)] px-4 py-2 text-xs font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10'>Delete</button>
              )}
              <button onClick={() => { setSelectedUser(null); setRoleChange({ user: selectedUser, show: true }); }}
                className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-xs font-medium text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'>Change Role</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setConfirmAction(null)} />
          <div className='relative w-full max-w-sm rounded-2xl bg-[var(--color-white)] p-8 shadow-xl animate-scale-in'>
            <h3 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>
              {confirmAction.action === 'block' && 'Block User'}
              {confirmAction.action === 'unblock' && 'Unblock User'}
              {confirmAction.action === 'softDelete' && 'Delete User'}
              {confirmAction.action === 'hardDelete' && 'Permanently Delete User'}
              {confirmAction.action === 'restore' && 'Restore User'}
            </h3>
            <p className='mt-2 text-sm text-[var(--color-dark-gray)]'>
              {confirmAction.action === 'block' && `Are you sure you want to block ${confirmAction.user.name}? They will not be able to sign in.`}
              {confirmAction.action === 'softDelete' && `Are you sure you want to delete ${confirmAction.user.name}? They can be restored later.`}
              {confirmAction.action === 'hardDelete' && `Are you sure you want to permanently delete ${confirmAction.user.name}? This cannot be undone.`}
            </p>
            <div className='mt-6 flex gap-3 justify-end'>
              <button onClick={() => setConfirmAction(null)} disabled={actionLoading}
                className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-sm font-medium text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] disabled:opacity-50'>Cancel</button>
              <button onClick={() => {
                if (confirmAction.action === 'block') performAction(confirmAction.user._id, 'block');
                else if (confirmAction.action === 'softDelete') performAction(confirmAction.user._id, 'softDelete');
                else if (confirmAction.action === 'hardDelete') handleHardDelete(confirmAction.user._id);
              }} disabled={actionLoading}
                className={`gold-button px-4 py-2 text-sm font-medium disabled:opacity-50 ${confirmAction.action === 'hardDelete' ? 'bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90' : ''}`}>
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleChange && roleChange.show && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setRoleChange(null)} />
          <div className='relative w-full max-w-sm rounded-2xl bg-[var(--color-white)] p-8 shadow-xl animate-scale-in'>
            <h3 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Change User Role</h3>
            <p className='mt-2 text-sm text-[var(--color-dark-gray)]'>Select a new role for <strong>{roleChange.user.name}</strong>.</p>
            <div className='mt-4 flex gap-3'>
              <button onClick={() => performAction(roleChange.user._id, 'role', { role: 'customer' })} disabled={actionLoading || roleChange.user.role === 'customer'}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                  roleChange.user.role === 'customer'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'border-[var(--color-light-gray)] text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                }`}>Customer</button>
              <button onClick={() => performAction(roleChange.user._id, 'role', { role: 'admin' })} disabled={actionLoading || roleChange.user.role === 'admin'}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                  roleChange.user.role === 'admin'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'border-[var(--color-light-gray)] text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                }`}>Admin</button>
            </div>
            <div className='mt-4 flex justify-end'>
              <button onClick={() => setRoleChange(null)}
                className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-sm font-medium text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
