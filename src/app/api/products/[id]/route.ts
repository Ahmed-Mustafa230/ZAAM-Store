import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { productUpdateSchema } from '@/lib/validation';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { sanitizeImages } from '@/lib/image';
import Product from '@/models/Product';

async function getProductId(params: Promise<{ id: string }>): Promise<string | null> {
  try {
    const { id } = await params;
    if (!id || id === 'undefined' || id === 'null') return null;
    return id;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const id = await getProductId(params);
    if (!id) {
      return errorResponse('Product ID is required.', 400);
    }

    const raw = await Product.findById(id).lean();

    if (!raw) {
      return errorResponse('Product not found.', 404);
    }

    const product = {
      ...raw,
      shippingFee: Number(raw.shippingFee) || 0,
      taxAmount: Number(raw.taxAmount) || 0,
      images: sanitizeImages(raw.images),
    };

    return successResponse({ product });
  } catch (error) {
    return handleError(error, 'fetching product');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }
    if (session.user.role !== 'admin') {
      return errorResponse('Access denied. Admin privileges required.', 403);
    }

    const id = await getProductId(params);
    if (!id) {
      return errorResponse('Product ID is required.', 400);
    }

    const body = await request.json();
    const parsed = productUpdateSchema.parse(body);

    const updateData = {
      ...parsed,
      shippingFee: parsed.shippingFee !== undefined ? Math.max(0, Number(parsed.shippingFee) || 0) : 0,
      taxAmount: parsed.taxAmount !== undefined ? Math.max(0, Number(parsed.taxAmount) || 0) : 0,
    };

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return errorResponse('Product not found.', 404);
    }

    return successResponse(
      { message: 'Product updated successfully.', product }
    );
  } catch (error) {
    return handleError(error, 'updating product');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }
    if (session.user.role !== 'admin') {
      return errorResponse('Access denied. Admin privileges required.', 403);
    }

    const id = await getProductId(params);
    if (!id) {
      return errorResponse('Product ID is required.', 400);
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return errorResponse('Product not found.', 404);
    }

    return successResponse(
      { message: 'Product deleted successfully.' }
    );
  } catch (error) {
    return handleError(error, 'deleting product');
  }
}
