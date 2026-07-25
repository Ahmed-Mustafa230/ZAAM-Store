import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { rateLimitByUser } from '@/lib/rate-limit';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { getPaymentProvider } from '@/lib/payment';
import { calculateOrderTotals } from '@/lib/coupon';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import Transaction from '@/models/Transaction';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = any;

const CARD_METHODS = ['credit-card', 'stripe'];

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
    const { items, shippingAddress, paymentMethod = 'cod', couponApplied = '', couponId = '', discountAmount = 0, transactionId = '', paymentScreenshot = '' } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse('Cart is empty.', 400);
    }

    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zip || !shippingAddress?.country) {
      return errorResponse('Complete shipping address is required.', 400);
    }

    if (!shippingAddress?.firstName || !shippingAddress?.lastName || !shippingAddress?.email || !shippingAddress?.phone) {
      return errorResponse('Contact information is required.', 400);
    }

    const orderItems: Array<Record<string, unknown>> = [];
    let itemsPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).lean();
      if (!product) {
        return errorResponse(`Product not found: ${item.productId}`, 400);
      }

      const productAny = product as AnyObj;
      if (productAny.stock < item.quantity) {
        return errorResponse(`Insufficient stock for ${productAny.name}. Available: ${productAny.stock}`, 400);
      }

      const primaryImage = productAny.images?.find((i: AnyObj) => i.is_primary) || productAny.images?.[0];
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

    const { itemsPrice: roundedItemsPrice, taxPrice, shippingPrice, totalPrice, discountAmount: calculatedDiscount } = calculateOrderTotals(itemsPrice, discountAmount);

    const order = await Order.create({
      user: session.user.id,
      items: orderItems,
      shippingAddress: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
        country: shippingAddress.country,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
      },
      paymentMethod,
      transactionId,
      paymentScreenshot,
      itemsPrice: roundedItemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      couponApplied: couponApplied || '',
      couponId: couponId || '',
      discountAmount: calculatedDiscount,
      status: 'pending',
      isPaid: false,
    });

    const bulkOps = orderItems.map((item: AnyObj) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOps);

    if (couponId) {
      await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
    }

    if (CARD_METHODS.includes(paymentMethod)) {
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

      return successResponse(
        {
          clientSecret: paymentIntent.clientSecret,
          orderId: order._id.toString(),
          totalPrice,
        },
        200
      );
    }

    return successResponse(
      {
        clientSecret: null,
        orderId: order._id.toString(),
        totalPrice,
      },
      200
    );
  } catch (error) {
    return handleError(error, 'checkout');
  }
}
