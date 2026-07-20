import type { Metadata } from 'next';
import { Inter, Playfair_Display, Great_Vibes } from 'next/font/google';
import './globals.css';
import Providers from '@/components/layout/Providers';
import { OrganizationSchema, WebSiteSchema, LocalBusinessSchema } from '@/components/seo/JsonLd';
import { siteConfig } from '@/lib/seo';

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
  title: {
    default: siteConfig.fullName,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'luxury',
    'lifestyle',
    'store',
    'ecommerce',
    'premium',
    'fashion',
    'Pakistan luxury store',
    'designer brands',
    'luxury shopping',
  ],
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteConfig.fullName,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.fullName,
    type: 'website',
    locale: siteConfig.locale,
    images: [
      {
        url: `${siteConfig.url}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: siteConfig.fullName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.fullName,
    description: siteConfig.description,
    site: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        <OrganizationSchema />
        <WebSiteSchema />
        <LocalBusinessSchema />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
