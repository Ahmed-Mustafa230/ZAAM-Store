import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticateRequest, adminOnly } from '@/lib/middleware';
import { slugify } from '@/lib/utils';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find().sort({ name: 1 });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching categories.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { payload, error } = authenticateRequest(request);
    if (error) {
      return error;
    }

    const adminError = adminOnly(payload);
    if (adminError) {
      return adminError;
    }

    const body = await request.json();
    const { name, image, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: 'Please provide a category name.' },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { message: 'A category with this name already exists.' },
        { status: 409 }
      );
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      image: image || '',
      description: description || '',
    });

    return NextResponse.json(
      { message: 'Category created successfully.', category },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while creating the category.' },
      { status: 500 }
    );
  }
}
