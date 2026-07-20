'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.replace('/auth/login?redirect=/admin');
      return;
    }

    if (session.user.role !== 'admin') {
      router.replace('/');
      return;
    }

    setAuthorized(true);
  }, [session, status, router]);

  if (status === 'loading' || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-off-white)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
