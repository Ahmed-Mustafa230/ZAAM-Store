export type PaymentProviderName = 'stripe' | 'easypaisa' | 'jazzcash' | 'payfast';

export interface PaymentIntentParams {
  orderId: string;
  amount: number;
  currency: string;
  metadata: Record<string, string>;
}

export interface PaymentIntentResult {
  provider: PaymentProviderName;
  transactionId: string;
  clientSecret: string | null;
  amount: number;
  currency: string;
  status: string;
  metadata: Record<string, string>;
}

export interface ConfirmPaymentParams {
  transactionId: string;
  paymentIntentId: string;
}

export interface PaymentResult {
  provider: PaymentProviderName;
  transactionId: string;
  status: 'succeeded' | 'failed' | 'processing' | 'canceled';
  metadata: Record<string, unknown>;
}

export interface RefundParams {
  transactionId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResult {
  provider: PaymentProviderName;
  refundTransactionId: string;
  amount: number;
  status: string;
}

export interface WebhookEvent {
  type: string;
  provider: PaymentProviderName;
  transactionId: string | null;
  orderId: string | null;
  status: 'succeeded' | 'failed' | 'processing' | 'refunded';
  metadata: Record<string, unknown>;
  rawEvent: unknown;
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;

  createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult>;

  processRefund(params: RefundParams): Promise<RefundResult>;

  handleWebhook(payload: unknown, signature: string): Promise<WebhookEvent>;

  getClientConfig(): Record<string, unknown>;
}
