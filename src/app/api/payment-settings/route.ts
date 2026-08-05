import { NextResponse } from 'next/server';
import { getOrCreatePaymentSettings } from '@/lib/payment-settings';
import { handleError } from '@/lib/api-utils';

export async function GET() {
  try {
    const settings = await getOrCreatePaymentSettings();
    const data = settings.toObject();

    return NextResponse.json(
      {
        settings: {
          easypaisa: data.easypaisa,
          jazzcash: data.jazzcash,
          bankTransfer: data.bankTransfer,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return handleError(error, 'fetching payment settings');
  }
}
