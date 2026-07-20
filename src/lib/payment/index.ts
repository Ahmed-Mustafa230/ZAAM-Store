import type { PaymentProvider, PaymentProviderName } from './interfaces';
import { stripeProvider } from './stripe';

const providers: Partial<Record<PaymentProviderName, PaymentProvider>> = {
  stripe: stripeProvider,
};

export function getPaymentProvider(name?: PaymentProviderName): PaymentProvider {
  const providerName = name || (process.env.PAYMENT_PROVIDER as PaymentProviderName) || 'stripe';
  const provider = providers[providerName];
  if (!provider) {
    throw new Error(`Unknown payment provider: ${providerName}. Available: ${Object.keys(providers).join(', ')}`);
  }
  return provider;
}

export function getStripeProvider(): PaymentProvider {
  return getPaymentProvider('stripe');
}

export type { PaymentProvider, PaymentProviderName } from './interfaces';
export type {
  PaymentIntentParams,
  PaymentIntentResult,
  ConfirmPaymentParams,
  PaymentResult,
  RefundParams,
  RefundResult,
  WebhookEvent,
} from './interfaces';
