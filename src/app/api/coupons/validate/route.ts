import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { couponValidateSchema } from '@/lib/validation';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { rateLimitByIp } from '@/lib/rate-limit';
import Coupon from '@/models/Coupon';

export async function POST(request: NextRequest) {
  try {
    const { allowed } = rateLimitByIp(request, {
      maxRequests: 30,
      windowMs: 60_000,
    });
    if (!allowed) {
      return errorResponse('Too many requests. Please try again later.', 429);
    }

    await connectDB();

    const body = await request.json();
    const parsed = couponValidateSchema.parse(body);

    const coupon = await Coupon.findOne({ code: parsed.code });

    if (!coupon) {
      return errorResponse('Invalid coupon code.', 404);
    }

    if (!coupon.isActive) {
      return errorResponse('This coupon is no longer active.', 400);
    }

    const now = new Date();
    if (now < coupon.validFrom) {
      return errorResponse('This coupon is not yet valid.', 400);
    }

    if (now > coupon.validUntil) {
      return errorResponse('This coupon has expired.', 400);
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return errorResponse('This coupon has reached its usage limit.', 400);
    }

    if (parsed.orderTotal < coupon.minPurchase) {
      return errorResponse(
        `Minimum purchase amount of Rs ${coupon.minPurchase.toFixed(2)} is required for this coupon.`
      );
    }

    let discountAmount = 0;

    if (coupon.discountType === 'percentage') {
      discountAmount = (parsed.orderTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = parseFloat(discountAmount.toFixed(2));

    return successResponse({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        maxDiscount: coupon.maxDiscount,
        minPurchase: coupon.minPurchase,
      },
      discountAmount,
    });
  } catch (error) {
    return handleError(error, 'validating coupon');
  }
}
