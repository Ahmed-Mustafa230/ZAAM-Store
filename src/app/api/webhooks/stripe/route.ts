import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getPaymentProvider } from '@/lib/payment';
import Order from '@/models/Order';
import Transaction from '@/models/Transaction';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ message: 'Missing stripe signature' }, { status: 400 });
    }

    const body = await request.text();

    await connectDB();

    const provider = getPaymentProvider('stripe');
    const event = await provider.handleWebhook(body, signature);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const orderId = event.orderId;
        if (!orderId) break;

        await Order.findByIdAndUpdate(orderId, {
          isPaid: true,
          paidAt: new Date(),
          status: 'confirmed',
          paymentResult: {
            id: event.transactionId,
            status: 'succeeded',
            updateTime: new Date().toISOString(),
          },
        });

        await Transaction.findOneAndUpdate(
          { transactionId: event.transactionId },
          { status: 'succeeded', responseBody: event.rawEvent }
        );
        break;
      }

      case 'payment_intent.payment_failed': {
        const orderId = event.orderId;
        if (!orderId) break;

        await Order.findByIdAndUpdate(orderId, {
          status: 'cancelled',
          paymentResult: {
            id: event.transactionId,
            status: 'failed',
            updateTime: new Date().toISOString(),
          },
        });

        await Transaction.findOneAndUpdate(
          { transactionId: event.transactionId },
          { status: 'failed', responseBody: event.rawEvent }
        );
        break;
      }

      case 'payment_intent.canceled': {
        const cancelOrderId = event.orderId;
        if (!cancelOrderId) break;

        await Order.findByIdAndUpdate(cancelOrderId, {
          status: 'cancelled',
        });

        await Transaction.findOneAndUpdate(
          { transactionId: event.transactionId },
          { status: 'failed', responseBody: event.rawEvent }
        );
        break;
      }

      case 'charge.refunded': {
        const refundOrderId = event.orderId;
        if (!refundOrderId) break;

        const transaction = await Transaction.findOne({
          transactionId: event.transactionId,
        });

        if (transaction) {
          const charge = (event.rawEvent as any).data?.object;
          const amountRefunded = charge?.amount_refunded
            ? charge.amount_refunded / 100
            : 0;

          const isFullyRefunded =
            transaction.amount <= amountRefunded;

          await Transaction.findByIdAndUpdate(transaction._id, {
            status: isFullyRefunded ? 'refunded' : 'partially_refunded',
            responseBody: event.rawEvent,
          });
        }

        await Order.findByIdAndUpdate(refundOrderId, {
          status: 'refunded',
          paymentResult: {
            id: event.transactionId,
            status: 'refunded',
            updateTime: new Date().toISOString(),
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook error';
    console.error('[Stripe Webhook]', error);
    return NextResponse.json({ message }, { status: 400 });
  }
}
