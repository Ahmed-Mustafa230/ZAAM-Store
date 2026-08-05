import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { paymentSettingsSchema } from '@/lib/validation';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { getOrCreatePaymentSettings } from '@/lib/payment-settings';
import PaymentSettings from '@/models/PaymentSettings';

export async function GET() {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }
    if (session.user.role !== 'admin') {
      return errorResponse('Access denied. Admin privileges required.', 403);
    }

    const settings = await getOrCreatePaymentSettings();

    return successResponse({ settings });
  } catch (error) {
    return handleError(error, 'fetching payment settings');
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }
    if (session.user.role !== 'admin') {
      return errorResponse('Access denied. Admin privileges required.', 403);
    }

    const body = await request.json();
    const parsed = paymentSettingsSchema.parse(body);

    const settings = await getOrCreatePaymentSettings();
    const current = settings.toObject();

    const updateData: Record<string, unknown> = {};

    if (parsed.easypaisa) {
      updateData.easypaisa = {
        ...current.easypaisa,
        ...parsed.easypaisa,
      };
    }
    if (parsed.jazzcash) {
      updateData.jazzcash = {
        ...current.jazzcash,
        ...parsed.jazzcash,
      };
    }
    if (parsed.bankTransfer) {
      updateData.bankTransfer = {
        ...current.bankTransfer,
        ...parsed.bankTransfer,
      };
    }

    const updated = await PaymentSettings.findByIdAndUpdate(settings._id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return errorResponse('Payment settings not found.', 404);
    }

    return successResponse({
      message: 'Payment settings updated successfully.',
      settings: updated,
    });
  } catch (error) {
    return handleError(error, 'updating payment settings');
  }
}
