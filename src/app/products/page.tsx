import type { Metadata } from 'next';
import { siteConfig } from '@/lib/seo';
import ProductsPageClient from '@/components/products/ProductsPageClient';
import { BreadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Our Collection',
  description:
    'Discover our curated collection of luxury products. From premium fragrances to designer apparel, explore timeless craftsmanship and elegance.',
  alternates: { canonical: `${siteConfig.url}/products` },
  openGraph: {
    title: 'Our Collection | ZAAM',
    description:
      'Discover our curated collection of luxury products. From premium fragrances to designer apparel, explore timeless craftsmanship and elegance.',
    url: `${siteConfig.url}/products`,
    siteName: siteConfig.fullName,
    type: 'website',
    images: [{ url: `${siteConfig.url}/og-default.jpg`, width: 1200, height: 630, alt: 'ZAAM Collection' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Collection | ZAAM',
    description: 'Discover our curated collection of luxury products.',
    site: siteConfig.twitterHandle,
  },
};

export default function ProductsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: siteConfig.url },
          { name: 'Products', url: `${siteConfig.url}/products` },
        ]}
      />
      <ProductsPageClient />
    </>
  );
}
