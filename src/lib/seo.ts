export const siteConfig = {
  name: 'ZAAM',
  fullName: 'ZAAM - Luxury Lifestyle Store',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zaamstore.com',
  description:
    'Curating the finest luxury lifestyle products from around the world. Experience elegance, craftsmanship, and timeless design with ZAAM.',
  tagline: 'Begin your luxury journey',
  locale: 'en_PK',
  defaultImage: '/og-default.jpg',
  twitterHandle: '@zaamstore',
  organization: {
    name: 'ZAAM Store',
    legalName: 'ZAAM Luxury Lifestyle Store',
    sameAs: ['https://facebook.com/zaamstore', 'https://instagram.com/zaamstore'],
    address: {
      streetAddress: '42 Liberty Boulevard',
      addressLocality: 'Lahore',
      addressRegion: 'Punjab',
      postalCode: '54000',
      addressCountry: 'PK',
    },
    contactPoint: {
      telephone: '+92-42-111-ZAAM',
      contactType: 'customer service',
      email: 'support@zaamstore.com',
    },
  },
} as const;

export function buildMetadata(title: string, description: string, path: string, image?: string) {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || siteConfig.defaultImage;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.fullName,
      type: 'website' as const,
      locale: siteConfig.locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [ogImage],
      site: siteConfig.twitterHandle,
    },
  };
}
