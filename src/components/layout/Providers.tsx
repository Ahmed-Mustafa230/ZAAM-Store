'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            <main className='flex-1'>{children}</main>
            <Footer />
            <Toaster
              position='top-right'
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#18181b',
                  color: '#fff',
                  borderRadius: '12px',
                  fontSize: '14px',
                  border: '1px solid rgba(255,255,255,0.08)',
                },
                success: {
                  iconTheme: {
                    primary: '#d97706',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
