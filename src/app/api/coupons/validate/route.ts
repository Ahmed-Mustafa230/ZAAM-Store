import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Coupon from '@/models/Coupon';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { code, orderTotal } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { message: 'Please provide a coupon code.' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });

    if (!coupon) {
      return NextResponse.json(
        { message: 'Invalid coupon code.' },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { message: 'This coupon is no longer active.' },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now < coupon.validFrom) {
      return NextResponse.json(
        { message: 'This coupon is not yet valid.' },
        { status: 400 }
      );
    }

    if (now > coupon.validUntil) {
      return NextResponse.json(
        { message: 'This coupon has expired.' },
        { status: 400 }
      );
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { message: 'This coupon has reached its usage limit.' },
        { status: 400 }
      );
    }

    if (orderTotal && orderTotal < coupon.minPurchase) {
      return NextResponse.json(
        {
          message: `Minimum purchase amount of Rs ${coupon.minPurchase.toFixed(2)} is required for this coupon.`,
          minPurchase: coupon.minPurchase,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;

    if (coupon.discountType === 'percentage') {
      discountAmount = (orderTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = parseFloat(discountAmount.toFixed(2));

    return NextResponse.json(
      {
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
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Validate coupon error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while validating the coupon.' },
      { status: 500 }
    );
  }
}
