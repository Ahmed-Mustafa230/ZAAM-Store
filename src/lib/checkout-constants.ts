export const FREE_SHIPPING_THRESHOLD = 200
export const SHIPPING_COST = 25
export const TAX_RATE = 0.08

export const PAYMENT_CONFIG = {
  easypaisa: {
    merchantNumber: '03XX-XXXXXXX',
    accountTitle: 'ZAAM Store',
  },
  jazzcash: {
    merchantNumber: '03XX-XXXXXXX',
    accountTitle: 'ZAAM Store',
  },
  bankTransfer: {
    bankName: 'HBL',
    accountTitle: 'ZAAM Store',
    accountNumber: 'XXXX-XXXXXX-XXXX',
    iban: 'PKXX XXXX XXXX XXXX XXXX',
  },
} as const
