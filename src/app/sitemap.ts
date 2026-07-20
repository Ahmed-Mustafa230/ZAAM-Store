import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { siteConfig } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteConfig.url}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    await connectDB();
    const products = await Product.find(
      {},
      { _id: 1, updatedAt: 1 }
    ).lean();

    const productPages: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${siteConfig.url}/products/${p._id}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...productPages];
  } catch {
    return staticPages;
  }
}
