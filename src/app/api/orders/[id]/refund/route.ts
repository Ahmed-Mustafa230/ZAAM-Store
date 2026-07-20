import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { getPaymentProvider } from '@/lib/payment';
import Order from '@/models/Order';
import Transaction from '@/models/Transaction';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return errorResponse('Admin access required.', 403);
    }

    await connectDB();

    const { id } = await params;
    const body = await _request.json();
    const { amount, reason } = body;

    const order = await Order.findById(id);
    if (!order) {
      return errorResponse('Order not found.', 404);
    }

    if (order.status === 'refunded') {
      return errorResponse('Order has already been refunded.', 400);
    }

    const transaction = await Transaction.findOne({
      order: id,
      provider: 'stripe',
      status: { $in: ['succeeded', 'partially_refunded'] },
    });

    if (!transaction) {
      return errorResponse('No successful payment found for this order.', 400);
    }

    const provider = getPaymentProvider('stripe');

    const refundAmount = amount || order.totalPrice;

    const refund = await provider.processRefund({
      transactionId: transaction.transactionId,
      amount: refundAmount,
      reason: reason || 'requested_by_customer',
    });

    await Transaction.findByIdAndUpdate(transaction._id, {
      $push: {
        refunds: {
          amount: refundAmount,
          reason: reason || '',
          status: refund.status,
          transactionId: refund.refundTransactionId,
          createdAt: new Date(),
        },
      },
    });

    const totalRefunded =
      (transaction.refunds || []).reduce((sum: number, r: any) => sum + r.amount, 0) +
      refundAmount;

    const isFullyRefunded = totalRefunded >= transaction.amount;

    await Transaction.findByIdAndUpdate(transaction._id, {
      status: isFullyRefunded ? 'refunded' : 'partially_refunded',
    });

    await Order.findByIdAndUpdate(id, {
      status: isFullyRefunded ? 'refunded' : 'refunded',
      isPaid: false,
    });

    return successResponse(
      {
        message: isFullyRefunded
          ? 'Order fully refunded.'
          : `Partial refund of Rs ${refundAmount.toLocaleString()} processed.`,
        refund,
        isFullyRefunded,
      },
      200
    );
  } catch (error) {
    return handleError(error, 'refund');
  }
}
