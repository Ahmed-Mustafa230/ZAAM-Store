import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { couponSchema } from '@/lib/validation';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import Coupon from '@/models/Coupon';

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

    const { id } = await params;

    if (!id || id === 'undefined') {
      return errorResponse('Coupon ID is required.', 400);
    }

    const body = await request.json();
    const parsed = couponSchema.partial().parse(body);

    const updateData: Record<string, unknown> = {};

    if (parsed.code) updateData.code = parsed.code;
    if (parsed.discountType) updateData.discountType = parsed.discountType;
    if (parsed.discountValue !== undefined) updateData.discountValue = parsed.discountValue;
    if (parsed.minPurchase !== undefined) updateData.minPurchase = parsed.minPurchase;
    if (parsed.maxDiscount !== undefined) updateData.maxDiscount = parsed.maxDiscount;
    if (parsed.validFrom) updateData.validFrom = new Date(parsed.validFrom);
    if (parsed.validUntil) updateData.validUntil = new Date(parsed.validUntil);
    if (parsed.usageLimit !== undefined) updateData.usageLimit = parsed.usageLimit;
    if (parsed.isActive !== undefined) updateData.isActive = parsed.isActive;

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return errorResponse('Coupon not found.', 404);
    }

    return successResponse({ message: 'Coupon updated successfully.', coupon });
  } catch (error) {
    return handleError(error, 'updating coupon');
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

    const { id } = await params;

    if (!id || id === 'undefined') {
      return errorResponse('Coupon ID is required.', 400);
    }

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return errorResponse('Coupon not found.', 404);
    }

    return successResponse({ message: 'Coupon deleted successfully.' });
  } catch (error) {
    return handleError(error, 'deleting coupon');
  }
}
