import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticateRequest, adminOnly } from '@/lib/middleware';
import { sanitizeImages } from '@/lib/image';
import Product from '@/models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { message: 'Product ID is required.' },
        { status: 400 }
      );
    }

    const raw = await Product.findById(id).lean();

    if (!raw) {
      return NextResponse.json(
        { message: 'Product not found.' },
        { status: 404 }
      );
    }

    const product = {
      ...raw,
      images: sanitizeImages(raw.images),
    };

    return NextResponse.json({ product }, { status: 200 });
  } catch (error: any) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching the product.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { message: 'Product ID is required.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Product updated successfully.', product },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while updating the product.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { message: 'Product ID is required.' },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Product deleted successfully.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while deleting the product.' },
      { status: 500 }
    );
  }
}
