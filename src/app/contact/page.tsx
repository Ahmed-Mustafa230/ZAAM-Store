import type { Metadata } from 'next';
import { siteConfig } from '@/lib/seo';
import ContactContent from '@/components/contact/ContactContent';
import { BreadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with ZAAM. Whether you have a question about our products, a special request, or just want to say hello, we would love to hear from you.',
  alternates: { canonical: `${siteConfig.url}/contact` },
  openGraph: {
    title: 'Contact Us | ZAAM',
    description:
      'Get in touch with ZAAM. Whether you have a question about our products, a special request, or just want to say hello.',
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.fullName,
    type: 'website',
    images: [{ url: `${siteConfig.url}/og-default.jpg`, width: 1200, height: 630, alt: 'Contact ZAAM' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | ZAAM',
    description: 'Get in touch with ZAAM.',
    site: siteConfig.twitterHandle,
  },
};

export default function ContactPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: siteConfig.url },
          { name: 'Contact', url: `${siteConfig.url}/contact` },
        ]}
      />
      <ContactContent />
    </>
  );
}
