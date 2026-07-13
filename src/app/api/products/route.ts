import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { sanitizeImages } from '@/lib/image';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || '-createdAt';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const featured = searchParams.get('featured');
    const isNew = searchParams.get('new');

    const query: any = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (isNew === 'true') {
      query.isNewArrival = true;
    }

    const sortOptions: any = {};
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
      case '-createdAt':
        sortOptions.createdAt = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [rawProducts, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    const products = rawProducts.map((p: any) => ({
      ...p,
      images: sanitizeImages(p.images),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching products.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      name,
      description,
      category,
      price,
      comparePrice,
      images,
      brand,
      stock,
      sizes,
      colors,
      specifications,
      isFeatured,
      isNew,
      discount,
      tags,
    } = body;

    if (!name || !description || !category || price === undefined || stock === undefined) {
      return NextResponse.json(
        { message: 'Please provide all required fields: name, description, category, price, stock.' },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      description,
      category,
      price,
      comparePrice: comparePrice || 0,
      images: images || [],
      brand: brand || '',
      stock,
      sizes: sizes || [],
      colors: colors || [],
      specifications: specifications || {},
      isFeatured: isFeatured || false,
      isNewArrival: isNew !== undefined ? isNew : true,
      discount: discount || 0,
      tags: tags || [],
    });

    return NextResponse.json(
      { message: 'Product created successfully.', product },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while creating the product.' },
      { status: 500 }
    );
  }
}
