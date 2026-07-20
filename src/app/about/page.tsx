import type { Metadata } from 'next';
import { siteConfig } from '@/lib/seo';
import AboutContent from '@/components/about/AboutContent';
import { BreadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Discover the story behind ZAAM. We curate the finest luxury lifestyle products from around the world, partnering with heritage brands and emerging artisans.',
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title: 'About Us | ZAAM',
    description:
      'Discover the story behind ZAAM. We curate the finest luxury lifestyle products from around the world.',
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.fullName,
    type: 'website',
    images: [{ url: `${siteConfig.url}/og-default.jpg`, width: 1200, height: 630, alt: 'About ZAAM' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | ZAAM',
    description: 'Discover the story behind ZAAM.',
    site: siteConfig.twitterHandle,
  },
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: siteConfig.url },
          { name: 'About', url: `${siteConfig.url}/about` },
        ]}
      />
      <AboutContent />
    </>
  );
}
