'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem('zaam_token');
      if (!token) {
        router.replace('/auth');
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data.user || res.data;
        if (user.role !== 'admin') {
          router.replace('/');
          return;
        }
        setAuthorized(true);
      } catch {
        localStorage.removeItem('zaam_token');
        router.replace('/auth');
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-off-white)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
