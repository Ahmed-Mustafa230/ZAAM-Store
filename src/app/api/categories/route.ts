import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { categorySchema } from '@/lib/validation';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { slugify } from '@/lib/utils';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find().sort({ name: 1 });

    return successResponse({ categories });
  } catch (error) {
    return handleError(error, 'fetching categories');
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
    const parsed = categorySchema.parse(body);

    const slug = slugify(parsed.name);

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return errorResponse('A category with this name already exists.', 409);
    }

    const category = await Category.create({
      name: parsed.name,
      slug,
      image: parsed.image || '',
      description: parsed.description || '',
    });

    return successResponse(
      { message: 'Category created successfully.', category },
      201
    );
  } catch (error) {
    return handleError(error, 'creating category');
  }
}
