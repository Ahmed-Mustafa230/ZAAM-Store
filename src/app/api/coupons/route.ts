import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticateRequest, adminOnly } from '@/lib/middleware';
import Coupon from '@/models/Coupon';

export async function GET(request: NextRequest) {
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

    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return NextResponse.json({ coupons }, { status: 200 });
  } catch (error: any) {
    console.error('Get coupons error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching coupons.' },
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
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit,
      isActive,
    } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { message: 'Please provide a coupon code.' },
        { status: 400 }
      );
    }

    if (!discountType || !['percentage', 'flat'].includes(discountType)) {
      return NextResponse.json(
        { message: 'Please provide a valid discount type (percentage or flat).' },
        { status: 400 }
      );
    }

    if (discountValue === undefined || discountValue <= 0) {
      return NextResponse.json(
        { message: 'Please provide a positive discount value.' },
        { status: 400 }
      );
    }

    if (discountType === 'percentage' && discountValue > 100) {
      return NextResponse.json(
        { message: 'Percentage discount cannot exceed 100%.' },
        { status: 400 }
      );
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
      return NextResponse.json(
        { message: 'A coupon with this code already exists.' },
        { status: 409 }
      );
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      maxDiscount: maxDiscount || 0,
      validFrom: validFrom || new Date(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: usageLimit || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(
      { message: 'Coupon created successfully.', coupon },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create coupon error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while creating the coupon.' },
      { status: 500 }
    );
  }
}
