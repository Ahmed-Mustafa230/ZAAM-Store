'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  activeHref: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const sidebarLinks = [
  { label: 'Overview', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Orders', href: '/dashboard/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Profile', href: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Addresses', href: '/dashboard/addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  { label: 'Wishlist', href: '/wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardSidebar({ activeHref, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user } = useAuth();

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-white)] dark:bg-zinc-950 border-r border-[var(--color-light-gray)] dark:border-zinc-800 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className='p-6 border-b border-[var(--color-light-gray)] dark:border-zinc-800'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[var(--color-accent)] flex items-center justify-center'>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className='h-full w-full object-cover' />
              ) : (
                <span className='text-sm font-bold text-[var(--color-deep-black)]'>
                  {user?.name ? getInitials(user.name) : 'U'}
                </span>
              )}
            </div>
            <div className='min-w-0'>
              <h3 className='text-sm font-semibold text-[var(--color-primary)] dark:text-zinc-100 truncate'>
                {user?.name || 'User'}
              </h3>
              <p className='text-xs text-[var(--color-mid-gray)] dark:text-zinc-400 truncate'>
                {user?.email || ''}
              </p>
            </div>
          </div>
        </div>
        <nav className='px-3 py-4'>
          {sidebarLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                link.href === activeHref
                  ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium dark:text-amber-400'
                  : 'text-[var(--color-dark-gray)] dark:text-zinc-400 hover:bg-[var(--color-cream)] dark:hover:bg-zinc-800'
              }`}
            >
              <svg className='h-5 w-5 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d={link.icon} />
              </svg>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div className='fixed inset-0 z-30 bg-black/50 lg:hidden' onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
}
