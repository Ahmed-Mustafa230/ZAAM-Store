import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { couponSchema } from '@/lib/validation';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import Coupon from '@/models/Coupon';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }
    if (session.user.role !== 'admin') {
      return errorResponse('Access denied. Admin privileges required.', 403);
    }

    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return successResponse({ coupons });
  } catch (error) {
    return handleError(error, 'fetching coupons');
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
    const parsed = couponSchema.parse(body);

    const existingCoupon = await Coupon.findOne({ code: parsed.code });
    if (existingCoupon) {
      return errorResponse('A coupon with this code already exists.', 409);
    }

    const coupon = await Coupon.create({
      code: parsed.code,
      discountType: parsed.discountType,
      discountValue: parsed.discountValue,
      minPurchase: parsed.minPurchase || 0,
      maxDiscount: parsed.maxDiscount || 0,
      validFrom: parsed.validFrom ? new Date(parsed.validFrom) : new Date(),
      validUntil: parsed.validUntil
        ? new Date(parsed.validUntil)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: parsed.usageLimit || 0,
      isActive: parsed.isActive !== undefined ? parsed.isActive : true,
    });

    return successResponse(
      { message: 'Coupon created successfully.', coupon },
      201
    );
  } catch (error) {
    return handleError(error, 'creating coupon');
  }
}
