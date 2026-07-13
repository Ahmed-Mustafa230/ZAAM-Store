'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (adminOnly && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, loading, router, pathname, adminOnly]);

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[var(--color-white)]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='relative h-16 w-16'>
            <div className='absolute inset-0 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent' />
            <div className='absolute inset-2 animate-spin rounded-full border-2 border-[var(--color-accent-dark)] border-t-transparent' style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <p className='font-[family-name:var(--font-heading)] text-lg text-[var(--color-mid-gray)]'>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (adminOnly && user.role !== 'admin') return null;

  return <>{children}</>;
}
