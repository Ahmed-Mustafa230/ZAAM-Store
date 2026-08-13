import mongoose from 'mongoose';

export function generateOrderNumber(orderId: mongoose.Types.ObjectId): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const suffix = orderId.toString().slice(-6).toUpperCase();
  return `ZAAM-${yyyy}${mm}${dd}-${suffix}`;
}
