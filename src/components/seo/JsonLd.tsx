import { siteConfig } from '@/lib/seo';

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  currency = 'PKR',
  url,
  brand,
  sku,
  availability = 'https://schema.org/InStock',
  ratingValue,
  reviewCount,
  category,
}: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  url: string;
  brand?: string;
  sku?: string;
  availability?: string;
  ratingValue?: number;
  reviewCount?: number;
  category?: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    url,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability,
      url,
    },
  };

  if (brand) schema.brand = { '@type': 'Brand', name: brand };
  if (sku) schema.sku = sku;
  if (category) schema.category = category;

  if (ratingValue !== undefined && reviewCount !== undefined) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue,
      reviewCount,
    };
  }

  return <JsonLd data={schema} />;
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={schema} />;
}

export function OrganizationSchema() {
  const { organization, url } = siteConfig;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organization.name,
    legalName: organization.legalName,
    url,
    logo: `${url}/logo.png`,
    sameAs: organization.sameAs,
    address: {
      '@type': 'PostalAddress',
      ...organization.address,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      ...organization.contactPoint,
      availableLanguage: ['English', 'Urdu'],
    },
  };

  return <JsonLd data={schema} />;
}

export function WebSiteSchema() {
  const { url, fullName, description } = siteConfig;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: fullName,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={schema} />;
}

export function LocalBusinessSchema() {
  const { organization, url } = siteConfig;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: organization.name,
    legalName: organization.legalName,
    url,
    logo: `${url}/logo.png`,
    image: `${url}/og-default.jpg`,
    sameAs: organization.sameAs,
    address: {
      '@type': 'PostalAddress',
      ...organization.address,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      ...organization.contactPoint,
    },
    priceRange: '$$$$',
    currenciesAccepted: 'PKR',
  };

  return <JsonLd data={schema} />;
}
