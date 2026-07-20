import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { siteConfig } from '@/lib/seo';
import Product from '@/models/Product';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { JsonLd, BreadcrumbSchema, ProductSchema } from '@/components/seo/JsonLd';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectDB();
    const product = await Product.findById(id).lean();
    if (!product) return { title: 'Product Not Found' };

    const name = (product as any).name || '';
    const description = (product as any).description || '';
    const images: any[] = (product as any).images || [];
    const primary = images.find((i: any) => i.is_primary) || images[0];
    const imageUrl = primary?.secure_url || primary?.url || '';

    return {
      title: name,
      description: description.slice(0, 160),
      alternates: { canonical: `${siteConfig.url}/products/${id}` },
      openGraph: {
        title: name,
        description: description.slice(0, 160),
        url: `${siteConfig.url}/products/${id}`,
        siteName: siteConfig.fullName,
        type: 'website',
        images: imageUrl
          ? [{ url: imageUrl, width: 800, height: 1000, alt: name }]
          : [{ url: `${siteConfig.url}/og-default.jpg`, width: 1200, height: 630, alt: name }],
      },
      twitter: {
        card: 'summary_large_image',
        title: name,
        description: description.slice(0, 160),
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  await connectDB();

  const rawProduct = await Product.findById(id).lean();
  if (!rawProduct) notFound();

  const product = JSON.parse(JSON.stringify(rawProduct));

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: id },
  })
    .limit(4)
    .lean();

  const related = JSON.parse(JSON.stringify(relatedProducts));

  const images: any[] = product.images || [];
  const primary = images.find((i: any) => i.is_primary) || images[0];
  const imageUrl = primary?.secure_url || primary?.url || '';
  const rating = product.rating || 0;
  const numReviews = product.numReviews || 0;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: siteConfig.url },
          { name: 'Products', url: `${siteConfig.url}/products` },
          { name: product.category || '', url: `${siteConfig.url}/products?category=${product.category}` },
          { name: product.name || '', url: `${siteConfig.url}/products/${id}` },
        ].filter((i) => i.name)}
      />
      <ProductSchema
        name={product.name || ''}
        description={(product.description || '').slice(0, 200)}
        image={imageUrl}
        price={product.price || 0}
        url={`${siteConfig.url}/products/${id}`}
        brand={product.brand}
        sku={id}
        availability={product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}
        ratingValue={rating}
        reviewCount={numReviews}
        category={product.category}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
            { '@type': 'ListItem', position: 2, name: 'Products', item: `${siteConfig.url}/products` },
            { '@type': 'ListItem', position: 3, name: product.category, item: `${siteConfig.url}/products?category=${product.category}` },
            { '@type': 'ListItem', position: 4, name: product.name, item: `${siteConfig.url}/products/${id}` },
          ],
        }}
      />
      <ProductDetailClient initialProduct={product} initialRelated={related} />
    </>
  );
}
