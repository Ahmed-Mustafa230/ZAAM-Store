import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticateRequest, adminOnly } from '@/lib/middleware';
import Order from '@/models/Order';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { payload, error } = authenticateRequest(request);
    if (error) {
      return error;
    }

    const { id } = await params;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { message: 'Order ID is required.' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id).populate('user', 'name email').populate({
      path: 'items.product',
      select: 'name images price',
    });

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found.' },
        { status: 404 }
      );
    }

    if (order.user._id.toString() !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json(
        { message: 'You are not authorized to view this order.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching the order.' },
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
        { message: 'Order ID is required.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, trackingNumber, isPaid, isDelivered } = body;

    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    if (isPaid) {
      updateData.isPaid = true;
      updateData.paidAt = new Date();
    }

    if (isDelivered) {
      updateData.isDelivered = true;
      updateData.deliveredAt = new Date();
    }

    if (body.paymentResult) {
      updateData.paymentResult = body.paymentResult;
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Order updated successfully.', order },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while updating the order.' },
      { status: 500 }
    );
  }
}
