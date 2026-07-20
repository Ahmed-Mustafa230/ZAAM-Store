import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/products', '/about', '/contact'],
        disallow: [
          '/admin',
          '/dashboard',
          '/auth',
          '/cart',
          '/checkout',
          '/wishlist',
          '/api',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
