import { connectDB } from '@/lib/db';
import PaymentSettings, { DEFAULT_PAYMENT_SETTINGS } from '@/models/PaymentSettings';

export async function getOrCreatePaymentSettings() {
  await connectDB();

  return PaymentSettings.findOneAndUpdate(
    { key: 'default' },
    {
      $setOnInsert: {
        key: 'default',
        easypaisa: DEFAULT_PAYMENT_SETTINGS.easypaisa,
        jazzcash: DEFAULT_PAYMENT_SETTINGS.jazzcash,
        bankTransfer: DEFAULT_PAYMENT_SETTINGS.bankTransfer,
      },
    },
    { new: true, upsert: true }
  );
}
