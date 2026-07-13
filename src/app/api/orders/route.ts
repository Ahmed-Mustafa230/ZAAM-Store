import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticateRequest, adminOnly } from '@/lib/middleware';
import { generateOrderNumber } from '@/lib/utils';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { payload, error } = authenticateRequest(request);
    if (error) {
      return error;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status');

    const query: any = {};

    if (payload.role === 'admin' && searchParams.get('all') === 'true') {
      if (status) {
        query.status = status;
      }
    } else {
      query.user = payload.userId;
      if (status) {
        query.status = status;
      }
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

    return NextResponse.json(
      {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching orders.' },
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

    const body = await request.json();
    const { items, shippingAddress, paymentMethod, couponApplied, discountAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: 'Please add at least one item to your order.' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.country) {
      return NextResponse.json(
        { message: 'Please provide a complete shipping address.' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { message: 'Please select a payment method.' },
        { status: 400 }
      );
    }

    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          { message: `Product with ID ${item.product} not found.` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for ${product.name}. Available: ${product.stock}` },
          { status: 400 }
        );
      }

      const price = product.discount > 0
        ? product.price - (product.price * product.discount) / 100
        : product.price;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price,
        image: product.images[0] || '',
        size: item.size || '',
        color: item.color || '',
      });

      itemsPrice += price * item.quantity;

      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    const taxPrice = parseFloat((itemsPrice * 0.08).toFixed(2));
    const shippingPrice = itemsPrice > 200 ? 0 : 15;
    const discAmount = discountAmount || 0;
    const totalPrice = parseFloat((itemsPrice + taxPrice + shippingPrice - discAmount).toFixed(2));

    const order = await Order.create({
      user: payload.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      couponApplied: couponApplied || '',
      discountAmount: discAmount,
      status: 'pending',
    });

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

    return NextResponse.json(
      { message: 'Order created successfully.', order: populatedOrder },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while creating the order.' },
      { status: 500 }
    );
  }
}
