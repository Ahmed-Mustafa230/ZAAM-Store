import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { orderSchema } from '@/lib/validation';
import { calculateOrderTotals } from '@/lib/coupon';
import { computeUnitPriceDetails } from '@/lib/pricing';
import { generateOrderNumber } from '@/lib/order-number';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { rateLimitByUser } from '@/lib/rate-limit';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const status = searchParams.get('status');

    const search = searchParams.get('search');

    const query: Record<string, unknown> = {};

    if (session.user.role === 'admin' && searchParams.get('all') === 'true') {
      if (status) query.status = status;
    } else {
      query.user = session.user.id;
      if (status) query.status = status;
    }

    if (search && session.user.role === 'admin') {
      const matchingUserIds = await mongoose.model('User').find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const isObjectId = mongoose.Types.ObjectId.isValid(search);

      const searchConditions: Record<string, unknown>[] = [
        { user: { $in: matchingUserIds.map(u => u._id) } },
      ];

      if (isObjectId) {
        searchConditions.push({ _id: new mongoose.Types.ObjectId(search) });
      }

      query.$or = searchConditions;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return handleError(error, 'fetching orders');
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }

    const { allowed } = rateLimitByUser(session.user.id, {
      maxRequests: 5,
      windowMs: 60_000,
    });
    if (!allowed) {
      return errorResponse('Too many orders. Please try again later.', 429);
    }

    const body = await request.json();
    const parsed = orderSchema.parse(body);

    let itemsPrice = 0;
    const orderItems = [];

    for (const item of parsed.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return errorResponse(`Product with ID ${item.product} not found.`, 404);
      }

      if (product.stock < item.quantity) {
        return errorResponse(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`
        );
      }

      const { unitPrice, originalPrice, discountPercent, discountAmount: unitDiscount } =
        computeUnitPriceDetails(product as Parameters<typeof computeUnitPriceDetails>[0], item.size || null);

      const firstImage = Array.isArray(product.images) && product.images.length > 0
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].secure_url || product.images[0].url || '')
        : '';

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: Math.round(unitPrice * 100) / 100,
        originalPrice: Math.round(originalPrice * 100) / 100,
        discount: discountPercent,
        discountAmount: Math.round(unitDiscount * 100) / 100,
        image: firstImage,
        size: item.size || '',
        color: item.color || '',
      });

      itemsPrice += unitPrice * item.quantity;

      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    const { itemsPrice: roundedItemsPrice, taxPrice, shippingPrice, totalPrice, discountAmount: discAmount } = calculateOrderTotals(itemsPrice, parsed.discountAmount || 0);

    const orderId = new mongoose.Types.ObjectId();
    const orderNumber = generateOrderNumber(orderId);

    const order = await Order.create({
      _id: orderId,
      user: session.user.id,
      items: orderItems,
      shippingAddress: parsed.shippingAddress,
      paymentMethod: parsed.paymentMethod,
      itemsPrice: roundedItemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      couponApplied: parsed.couponApplied || '',
      couponId: parsed.couponId || '',
      discountAmount: discAmount,
      orderNumber,
      status: 'pending',
    });

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

    return successResponse(
      { message: 'Order created successfully.', order: populatedOrder },
      201
    );
  } catch (error) {
    return handleError(error, 'creating order');
  }
}
