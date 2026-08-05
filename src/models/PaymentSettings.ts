import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletSettings {
  enabled: boolean;
  accountTitle: string;
  merchantNumber: string;
  qrCodeImage: string;
}

export interface IBankSettings {
  enabled: boolean;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  qrCodeImage: string;
}

export interface IPaymentSettings extends Document {
  key: string;
  easypaisa: IWalletSettings;
  jazzcash: IWalletSettings;
  bankTransfer: IBankSettings;
  createdAt: Date;
  updatedAt: Date;
}

const walletSettingsSchema = new Schema<IWalletSettings>(
  {
    enabled: { type: Boolean, default: true },
    accountTitle: { type: String, default: '', trim: true, maxlength: 200 },
    merchantNumber: { type: String, default: '', trim: true, maxlength: 50 },
    qrCodeImage: { type: String, default: '', maxlength: 500 },
  },
  { _id: false }
);

const bankSettingsSchema = new Schema<IBankSettings>(
  {
    enabled: { type: Boolean, default: true },
    bankName: { type: String, default: '', trim: true, maxlength: 100 },
    accountTitle: { type: String, default: '', trim: true, maxlength: 200 },
    accountNumber: { type: String, default: '', trim: true, maxlength: 100 },
    iban: { type: String, default: '', trim: true, maxlength: 100 },
    qrCodeImage: { type: String, default: '', maxlength: 500 },
  },
  { _id: false }
);

const paymentSettingsSchema = new Schema<IPaymentSettings>(
  {
    key: {
      type: String,
      default: 'default',
      unique: true,
    },
    easypaisa: { type: walletSettingsSchema, default: () => ({}) },
    jazzcash: { type: walletSettingsSchema, default: () => ({}) },
    bankTransfer: { type: bankSettingsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);

paymentSettingsSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const DEFAULT_PAYMENT_SETTINGS = {
  easypaisa: {
    enabled: true,
    merchantNumber: '03XX-XXXXXXX',
    accountTitle: 'ZAAM Store',
    qrCodeImage: '',
  },
  jazzcash: {
    enabled: true,
    merchantNumber: '03XX-XXXXXXX',
    accountTitle: 'ZAAM Store',
    qrCodeImage: '',
  },
  bankTransfer: {
    enabled: true,
    bankName: 'HBL',
    accountTitle: 'ZAAM Store',
    accountNumber: 'XXXX-XXXXXX-XXXX',
    iban: 'PKXX XXXX XXXX XXXX XXXX',
    qrCodeImage: '',
  },
} as const;

const PaymentSettings =
  mongoose.models.PaymentSettings ||
  mongoose.model<IPaymentSettings>('PaymentSettings', paymentSettingsSchema);

export default PaymentSettings;
