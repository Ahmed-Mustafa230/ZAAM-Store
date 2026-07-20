import type { Metadata } from 'next';
import { siteConfig } from '@/lib/seo';
import HomeContent from '@/components/home/HomeContent';

export const metadata: Metadata = {
  title: siteConfig.fullName,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: siteConfig.fullName,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.fullName,
    type: 'website',
    locale: siteConfig.locale,
    images: [{ url: `${siteConfig.url}/og-default.jpg`, width: 1200, height: 630, alt: siteConfig.fullName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.fullName,
    description: siteConfig.description,
    site: siteConfig.twitterHandle,
  },
};

export default function HomePage() {
  return <HomeContent />;
}
