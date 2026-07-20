import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { rateLimitByUser } from '@/lib/rate-limit';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { getPaymentProvider } from '@/lib/payment';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Transaction from '@/models/Transaction';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Please sign in to checkout.', 401);
    }

    const { allowed } = rateLimitByUser(session.user.id, {
      maxRequests: 5,
      windowMs: 60_000,
    });
    if (!allowed) {
      return errorResponse('Too many checkout attempts. Please try again later.', 429);
    }

    await connectDB();

    const body = await request.json();
    const { items, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse('Cart is empty.', 400);
    }

    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zip || !shippingAddress?.country) {
      return errorResponse('Complete shipping address is required.', 400);
    }

    const orderItems: any[] = [];
    let itemsPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).lean();
      if (!product) {
        return errorResponse(`Product not found: ${item.productId}`, 400);
      }

      const productAny = product as any;
      if (productAny.stock < item.quantity) {
        return errorResponse(`Insufficient stock for ${productAny.name}. Available: ${productAny.stock}`, 400);
      }

      const primaryImage = productAny.images?.find((i: any) => i.is_primary) || productAny.images?.[0];
      const imageUrl = primaryImage?.secure_url || primaryImage?.url || '';

      const unitPrice = productAny.discount
        ? productAny.price * (1 - productAny.discount / 100)
        : productAny.price;

      orderItems.push({
        product: productAny._id,
        name: productAny.name,
        quantity: item.quantity,
        price: Math.round(unitPrice * 100) / 100,
        image: imageUrl,
        size: item.size || '',
        color: item.color || '',
      });

      itemsPrice += unitPrice * item.quantity;
    }

    const taxPrice = Math.round(itemsPrice * 0.08 * 100) / 100;
    const shippingPrice = itemsPrice > 200 ? 0 : 15;
    const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

    const order = await Order.create({
      user: session.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'stripe',
      itemsPrice: Math.round(itemsPrice * 100) / 100,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'pending',
      isPaid: false,
    });

    const provider = getPaymentProvider('stripe');

    const paymentIntent = await provider.createPaymentIntent({
      orderId: order._id.toString(),
      amount: totalPrice,
      currency: 'PKR',
      metadata: {
        orderId: order._id.toString(),
        userId: session.user.id,
      },
    });

    await Transaction.create({
      order: order._id,
      user: session.user.id,
      provider: 'stripe',
      transactionId: paymentIntent.transactionId,
      amount: totalPrice,
      currency: 'PKR',
      status: 'pending',
      metadata: paymentIntent.metadata,
      responseBody: {},
    });

    await Product.updateMany(
      { _id: { $in: orderItems.map((i: any) => i.product) } },
      { $inc: { stock: -1 } }
    );

    return successResponse(
      {
        clientSecret: paymentIntent.clientSecret,
        orderId: order._id.toString(),
        totalPrice,
      },
      200
    );
  } catch (error) {
    return handleError(error, 'checkout');
  }
}
