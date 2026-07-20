import { NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payment';

export async function GET() {
  try {
    const provider = getPaymentProvider('stripe');
    const config = provider.getClientConfig();

    return NextResponse.json({
      provider: 'stripe',
      publishableKey: config.publishableKey,
    });
  } catch {
    return NextResponse.json(
      { message: 'Payment provider not configured' },
      { status: 500 }
    );
  }
}
