import type { Metadata } from 'next';
import { Inter, Playfair_Display, Great_Vibes } from 'next/font/google';
import './globals.css';
import Providers from '@/components/layout/Providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
});

const greatVibes = Great_Vibes({
  variable: '--font-great-vibes',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'ZAAM - Luxury Lifestyle Store',
  description:
    'Curating the finest luxury lifestyle products from around the world. Experience elegance, craftsmanship, and timeless design with ZAAM.',
  keywords: ['luxury', 'lifestyle', 'store', 'ecommerce', 'premium', 'fashion'],
  openGraph: {
    title: 'ZAAM - Luxury Lifestyle Store',
    description:
      'Curating the finest luxury lifestyle products from around the world.',
    type: 'website',
    locale: 'en_PK',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${inter.variable} ${playfair.variable} ${greatVibes.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className='min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
