import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { productSchema } from '@/lib/validation';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { sanitizeImages } from '@/lib/image';
import { sanitizeString } from '@/lib/sanitize';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || '-createdAt';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const featured = searchParams.get('featured');
    const isNew = searchParams.get('new');

    const query: Record<string, unknown> = {};

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    }

    if (search) {
      const sanitized = sanitizeString(search);
      query.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } },
        { tags: { $regex: sanitized, $options: 'i' } },
      ];
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (isNew === 'true') {
      query.isNewArrival = true;
    }

    const sortOptions: Record<string, 1 | -1> = {};
    switch (sort) {
      case 'price-asc':
        sortOptions.price = 1;
        break;
      case 'price-desc':
        sortOptions.price = -1;
        break;
      case 'rating':
        sortOptions.rating = -1;
        break;
      case 'name':
        sortOptions.name = 1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [rawProducts, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    const products = rawProducts.map((p: Record<string, unknown>) => ({
      ...p,
      images: sanitizeImages(p.images),
    }));

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return handleError(error, 'fetching products');
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }
    if (session.user.role !== 'admin') {
      return errorResponse('Access denied. Admin privileges required.', 403);
    }

    const body = await request.json();
    const parsed = productSchema.parse(body);

    const product = await Product.create({
      name: parsed.name,
      description: parsed.description,
      category: parsed.category,
      price: parsed.price,
      comparePrice: parsed.comparePrice || 0,
      images: parsed.images || [],
      brand: parsed.brand || '',
      stock: parsed.stock,
      sizes: parsed.sizes || [],
      colors: parsed.colors || [],
      specifications: parsed.specifications || {},
      isFeatured: parsed.isFeatured || false,
      isNewArrival: parsed.isNew !== undefined ? parsed.isNew : true,
      discount: parsed.discount || 0,
      tags: parsed.tags || [],
    });

    return successResponse(
      { message: 'Product created successfully.', product },
      201
    );
  } catch (error) {
    return handleError(error, 'creating product');
  }
}
