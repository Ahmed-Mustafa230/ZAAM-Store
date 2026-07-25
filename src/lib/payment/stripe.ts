import Stripe from 'stripe';
import type {
  PaymentProvider,
  PaymentIntentParams,
  PaymentIntentResult,
  RefundParams,
  RefundResult,
  WebhookEvent,
} from './interfaces';

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  return new Stripe(key, { apiVersion: '2025-03-31' as unknown as Stripe.LatestApiVersion });
}

export const stripeProvider: PaymentProvider = {
  name: 'stripe',

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100),
      currency: params.currency.toLowerCase(),
      metadata: {
        orderId: params.orderId,
        ...params.metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      provider: 'stripe',
      transactionId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: params.amount,
      currency: params.currency,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata as Record<string, string>,
    };
  },

  async processRefund(params: RefundParams): Promise<RefundResult> {
    const stripe = getStripe();

    const refund = await stripe.refunds.create({
      payment_intent: params.transactionId,
      amount: params.amount ? Math.round(params.amount * 100) : undefined,
      reason: (params.reason as 'duplicate' | 'fraudulent' | 'requested_by_customer') || undefined,
    });

    return {
      provider: 'stripe',
      refundTransactionId: refund.id,
      amount: refund.amount / 100,
      status: refund.status || 'pending',
    };
  },

  async handleWebhook(payload: unknown, signature: string): Promise<WebhookEvent> {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');

    const event = stripe.webhooks.constructEvent(
      payload as Buffer | string,
      signature,
      webhookSecret
    );

    const data = event.data.object as unknown as Record<string, unknown>;
    const metadata = (data.metadata as Record<string, unknown>) || {};
    const base: Pick<WebhookEvent, 'provider' | 'rawEvent'> = {
      provider: 'stripe',
      rawEvent: event,
    };

    switch (event.type) {
      case 'payment_intent.succeeded': {
        return {
          ...base,
          type: event.type,
          transactionId: data.id as string,
          orderId: (metadata.orderId as string) || null,
          status: 'succeeded',
          metadata,
        };
      }

      case 'payment_intent.payment_failed': {
        return {
          ...base,
          type: event.type,
          transactionId: data.id as string,
          orderId: (metadata.orderId as string) || null,
          status: 'failed',
          metadata,
        };
      }

      case 'payment_intent.canceled': {
        return {
          ...base,
          type: event.type,
          transactionId: data.id as string,
          orderId: (metadata.orderId as string) || null,
          status: 'failed',
          metadata,
        };
      }

      case 'charge.refunded': {
        return {
          ...base,
          type: event.type,
          transactionId: data.payment_intent as string,
          orderId: (metadata.orderId as string) || null,
          status: 'refunded',
          metadata,
        };
      }

      default:
        return {
          ...base,
          type: event.type,
          transactionId: null,
          orderId: null,
          status: 'processing',
          metadata: {},
        };
    }
  },

  getClientConfig(): Record<string, unknown> {
    return {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    };
  },
};
