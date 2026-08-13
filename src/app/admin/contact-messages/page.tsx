'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  InboxNavBadge,
  InboxHamburgerDot,
  refreshInboxUnreadCount,
} from '@/app/admin/inbox-unread';

interface Conversation {
  conversationId: string;
  name: string;
  email: string;
  subject: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  totalCount: number;
  isRead: boolean;
}

interface ThreadMessage {
  _id: string;
  user: string | null;
  name: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Thread {
  conversationId: string;
  name: string;
  email: string;
  messages: ThreadMessage[];
  todayCount?: number;
  dailyLimit?: number;
  allowed?: number;
  remaining?: number;
  limitReached?: boolean;
  resetToday?: boolean;
}

interface Pagination {
  page: number; limit: number; total: number; totalPages: number;
  hasNextPage: boolean; hasPrevPage: boolean;
}

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Profile', href: '/admin/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Inbox', href: '/admin/contact-messages', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { label: 'Users', href: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { label: 'Payment Settings', href: '/admin/payment-settings', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
];

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatTime(value: string): string {
  try {
    return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return value;
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminContactMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selected, setSelected] = useState<Thread | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchConversations = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (unreadOnly) params.set('unread', 'true');
    fetch(`/api/admin/contact-messages?${params}`)
      .then((res) => {
        if (!res.ok) return res.json().then((body) => { throw new Error(body.message || `Request failed (${res.status})`); });
        return res.json();
      })
      .then((json) => {
        setConversations(json.conversations ?? []);
        setPagination(json.pagination);
        setUnreadCount(json.unreadCount ?? 0);
        refreshInboxUnreadCount(json.unreadCount ?? 0);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load conversations.');
        setConversations([]);
      })
      .finally(() => setLoading(false));
  }, [page, unreadOnly]);

  useEffect(() => {
    const timer = setTimeout(() => fetchConversations(), 0);
    return () => clearTimeout(timer);
  }, [fetchConversations]);

  const openConversation = async (conversationId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/contact-messages/${conversationId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load conversation.');
      setSelected(json.conversation);
      fetchConversations();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation.');
    } finally {
      setDetailLoading(false);
    }
  };

  const setConversationUnread = async (conversationId: string, isRead: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/contact-messages/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Update failed.');
      if (selected && selected.conversationId === conversationId) setSelected(json.conversation);
      fetchConversations();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contact-messages/delete/${messageId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Delete failed.');
      setSelected((prev) => {
        if (!prev) return prev;
        const messages = prev.messages.filter((m) => m._id !== messageId);
        return messages.length === 0 ? null : { ...prev, messages };
      });
      setDeleteConfirmId(null);
      fetchConversations();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const resetDailyLimit = async (conversationId: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contact-messages/reset-limit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Reset failed.');
      setSelected((prev) => (prev ? { ...prev, ...json } : prev));
      fetchConversations();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderLimitInfo = () => {
    if (!selected) return null;
    const todayCount = selected.todayCount ?? 0;
    const allowed = selected.allowed ?? selected.dailyLimit ?? 0;
    return (
      <div className='flex flex-col gap-2 rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)]/40 p-3 text-xs text-[var(--color-dark-gray)]'>
        <div className='flex items-center justify-between gap-2'>
          <span>
            Today&apos;s Messages: {todayCount} / {allowed}
          </span>
          {selected.limitReached ? (
            <span className='font-semibold text-[var(--color-error)]'>Daily limit reached</span>
          ) : selected.resetToday ? (
            <span className='font-semibold text-[var(--color-success)]'>Daily limit reset</span>
          ) : (
            <span className='font-semibold text-[var(--color-success)]'>
              {todayCount}/{allowed} used
            </span>
          )}
        </div>
        <button
          onClick={() => resetDailyLimit(selected.conversationId)}
          disabled={actionLoading}
          className='rounded-lg border border-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-deep-black)] transition-colors disabled:opacity-50'
        >
          Reset Daily Message Limit
        </button>
      </div>
    );
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
                  link.href === '/admin/contact-messages' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium' : 'text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'
                }`}>
                <svg className='h-5 w-5 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d={link.icon} />
                </svg>
                {link.label}
                {link.label === 'Inbox' && <InboxNavBadge />}
              </Link>
            ))}
          </nav>
        </aside>

        {sidebarOpen && <div className='fixed inset-0 z-30 bg-black/50 lg:hidden' onClick={() => setSidebarOpen(false)} />}

        <div className='flex-1 p-6 lg:p-8'>
          <div className='mb-8 flex items-center justify-between lg:hidden'>
            <button onClick={() => setSidebarOpen(true)} className='relative rounded-lg p-2 text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)]'>
              <InboxHamburgerDot />
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
            <h1 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>Inbox</h1>
            <div className='w-10' />
          </div>

          <div className='mb-8 hidden lg:block'>
            <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>Inbox</h1>
            <p className='mt-1 text-[var(--color-mid-gray)]'>Conversations from the Contact Us form, grouped by customer</p>
          </div>

          {error && (
            <div className='mb-6 rounded-lg border border-[var(--color-error)]/20 bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)]'>
              {error}
              <button onClick={() => setError(null)} className='float-right font-bold'>&times;</button>
            </div>
          )}

          <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-[var(--color-dark-gray)]'>
              {unreadCount} unread message{unreadCount === 1 ? '' : 's'} across {pagination?.total ?? 0} conversation{pagination?.total === 1 ? '' : 's'}
            </p>
            <label className='flex items-center gap-2 text-sm text-[var(--color-dark-gray)] cursor-pointer'>
              <input
                type='checkbox'
                checked={unreadOnly}
                onChange={(e) => { setUnreadOnly(e.target.checked); setPage(1); }}
                className='h-4 w-4 rounded border-[var(--color-light-gray)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]'
              />
              Unread only
            </label>
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <div className='animate-spin h-10 w-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full' />
            </div>
          ) : (
            <>
              <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] divide-y divide-[var(--color-light-gray)]'>
                {conversations.length === 0 ? (
                  <p className='px-6 py-12 text-center text-sm text-[var(--color-mid-gray)]'>No conversations found.</p>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.conversationId}
                      type='button'
                      onClick={() => openConversation(conv.conversationId)}
                      className='flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-[var(--color-cream)] transition-colors'
                    >
                      <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-sm font-bold text-[var(--color-accent)]'>
                        {initials(conv.name)}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center justify-between gap-3'>
                          <p className={`truncate ${conv.isRead ? 'font-medium text-[var(--color-primary)]' : 'font-semibold text-[var(--color-primary)]'}`}>
                            {conv.name}
                          </p>
                          <span className='shrink-0 text-xs text-[var(--color-mid-gray)]'>{formatDate(conv.lastMessageAt)}</span>
                        </div>
                        <div className='flex items-center justify-between gap-3'>
                          <p className='min-w-0 truncate text-sm text-[var(--color-dark-gray)]'>
                            {conv.lastMessage || conv.subject || 'No message preview'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className='inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-error)] px-1.5 text-xs font-semibold text-white'>
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className='mt-0.5 truncate text-xs text-[var(--color-mid-gray)]'>
                          {conv.email} &middot; {conv.totalCount} message{conv.totalCount === 1 ? '' : 's'}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className='mt-6 flex items-center justify-center gap-4'>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage}
                    className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                  >
                    Previous
                  </button>
                  <span className='text-sm text-[var(--color-mid-gray)]'>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className='rounded-lg border border-[var(--color-light-gray)] px-4 py-2 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selected && (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4'>
          <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={() => setSelected(null)} />
          <div className='relative flex w-full max-w-xl flex-col rounded-2xl bg-[var(--color-white)] shadow-2xl border border-[var(--color-light-gray)] overflow-hidden max-h-[85vh]'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-[var(--color-light-gray)] shrink-0'>
              <div className='min-w-0'>
                <h2 className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>
                  {detailLoading ? 'Loading...' : selected.name}
                </h2>
                {!detailLoading && <p className='text-xs text-[var(--color-mid-gray)]'>{selected.email}</p>}
              </div>
              <div className='flex items-center gap-2 shrink-0'>
                <button
                  onClick={() => setConversationUnread(selected.conversationId, false)}
                  disabled={actionLoading}
                  className='rounded-lg border border-[var(--color-light-gray)] px-3 py-1.5 text-xs text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors disabled:opacity-50'
                >
                  Mark unread
                </button>
                <button onClick={() => setSelected(null)} className='rounded-lg p-1.5 text-[var(--color-mid-gray)] hover:text-[var(--color-primary)] hover:bg-[var(--color-cream)] transition-colors' aria-label='Close'>
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4'>
              {detailLoading ? (
                <div className='flex items-center justify-center py-16'>
                  <div className='animate-spin h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full' />
                </div>
              ) : (
                <>
                  {renderLimitInfo()}
                  {selected.messages.map((msg) => (
                    <div key={msg._id} className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)]/40 p-4'>
                      <div className='mb-2 flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-2'>
                          <p className='text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-dark)]'>Customer</p>
                          {msg.user && <span className='rounded-full bg-[var(--color-success)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-success)]'>Account</span>}
                        </div>
                        <div className='flex items-center gap-2 shrink-0'>
                          <span className='text-xs text-[var(--color-mid-gray)]'>{formatTime(msg.createdAt)}</span>
                          {deleteConfirmId === msg._id ? (
                            <span className='flex items-center gap-1.5'>
                              <button
                                onClick={() => deleteMessage(msg._id)}
                                disabled={actionLoading}
                                className='rounded-md border border-[var(--color-error)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white transition-colors disabled:opacity-50'
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                disabled={actionLoading}
                                className='rounded-md border border-[var(--color-light-gray)] px-2 py-0.5 text-[11px] text-[var(--color-mid-gray)] hover:bg-[var(--color-cream)] transition-colors disabled:opacity-50'
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(msg._id)}
                              className='rounded-md border border-[var(--color-error)]/40 px-2 py-0.5 text-[11px] font-medium text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white transition-colors'
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      <p className='text-xs uppercase tracking-wider text-[var(--color-mid-gray)]'>Subject: {msg.subject}</p>
                      <p className='mt-1.5 whitespace-pre-wrap break-words text-sm text-[var(--color-dark-gray)]'>{msg.message}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}