'use client';

import { useEffect, useState } from 'react';

let cachedCount: number | null = null;
let loadPromise: Promise<void> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<(count: number) => void>();

function publish(count: number) {
  cachedCount = count;
  listeners.forEach((fn) => fn(count));
}

function load(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = fetch('/api/admin/contact-messages?limit=1')
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error('fetch failed'))))
    .then((json) => {
      publish(typeof json?.unreadCount === 'number' ? json.unreadCount : 0);
    })
    .catch(() => {
      publish(cachedCount ?? 0);
    })
    .finally(() => {
      loadPromise = null;
    });
  return loadPromise;
}

function ensurePolling() {
  if (!pollTimer) {
    pollTimer = setInterval(() => {
      void load();
    }, 60_000);
  }
}

function stopPollingIfIdle() {
  if (pollTimer && listeners.size === 0) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function useInboxUnreadCount(): number {
  const [count, setCount] = useState(cachedCount ?? 0);
  useEffect(() => {
    let mounted = true;
    const apply = (next: number) => {
      if (mounted) setCount(next);
    };
    listeners.add(apply);
    if (cachedCount === null) void load();
    ensurePolling();
    const onFocus = () => {
      void load();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      mounted = false;
      listeners.delete(apply);
      window.removeEventListener('focus', onFocus);
      stopPollingIfIdle();
    };
  }, []);
  return count;
}

export function refreshInboxUnreadCount(count?: number) {
  if (typeof count === 'number') publish(count);
  void load();
}

export function InboxHamburgerDot() {
  const count = useInboxUnreadCount();
  if (count <= 0) return null;
  return (
    <span className='absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[var(--color-error)]' />
  );
}

export function InboxNavBadge() {
  const count = useInboxUnreadCount();
  if (count <= 0) return null;
  return (
    <span className='ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-error)] px-1.5 text-xs font-semibold text-white'>
      {count}
    </span>
  );
}