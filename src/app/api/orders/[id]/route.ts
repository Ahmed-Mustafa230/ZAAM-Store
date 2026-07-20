import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { orderUpdateSchema } from '@/lib/validation';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import Order from '@/models/Order';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }

    const { id } = await params;

    if (!id || id === 'undefined') {
      return errorResponse('Order ID is required.', 400);
    }

    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name images price',
      });

    if (!order) {
      return errorResponse('Order not found.', 404);
    }

    if (order.user._id.toString() !== session.user.id && session.user.role !== 'admin') {
      return errorResponse('You are not authorized to view this order.', 403);
    }

    return successResponse({ order });
  } catch (error) {
    return handleError(error, 'fetching order');
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

    const { id } = await params;

    if (!id || id === 'undefined') {
      return errorResponse('Order ID is required.', 400);
    }

    const body = await request.json();
    const parsed = orderUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};

    if (parsed.status) updateData.status = parsed.status;
    if (parsed.trackingNumber !== undefined) updateData.trackingNumber = parsed.trackingNumber;
    if (parsed.isPaid) {
      updateData.isPaid = true;
      updateData.paidAt = new Date();
    }
    if (parsed.isDelivered) {
      updateData.isDelivered = true;
      updateData.deliveredAt = new Date();
    }
    if (parsed.paymentResult) {
      updateData.paymentResult = parsed.paymentResult;
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return errorResponse('Order not found.', 404);
    }

    return successResponse(
      { message: 'Order updated successfully.', order }
    );
  } catch (error) {
    return handleError(error, 'updating order');
  }
}
