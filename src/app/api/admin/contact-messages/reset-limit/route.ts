import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import ContactMessage from '@/models/ContactMessage';
import DailyLimitReset from '@/models/DailyLimitReset';
import {
  CONTACT_DAILY_LIMIT,
  startOfToday,
  dailyDateKey,
} from '@/lib/contact-limits';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== 'admin') return null;
  return session.user;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const admin = await requireAdmin();
    if (!admin) {
      return errorResponse('Authentication required.', 401);
    }

    const body = await request.json();
    const conversationId =
      typeof body?.conversationId === 'string' && body.conversationId.trim()
        ? body.conversationId.trim()
        : '';

    if (!conversationId) {
      return errorResponse('A conversationId is required.', 400);
    }

    const today = startOfToday();
    const todayKey = dailyDateKey(today);

    await DailyLimitReset.findOneAndUpdate(
      { key: conversationId, date: todayKey },
      { $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true }
    );

    const [todayCount, resetsToday] = await Promise.all([
      ContactMessage.countDocuments({
        conversationId,
        createdAt: { $gte: today },
      }),
      DailyLimitReset.countDocuments({ key: conversationId, date: todayKey }),
    ]);

    const allowed = CONTACT_DAILY_LIMIT * (1 + resetsToday);

    return successResponse({
      message: 'Daily message limit reset for this conversation.',
      todayCount,
      dailyLimit: CONTACT_DAILY_LIMIT,
      allowed,
      remaining: Math.max(0, allowed - todayCount),
      limitReached: todayCount >= allowed,
      resetToday: true,
    });
  } catch (error) {
    return handleError(error, 'resetting contact message daily limit');
  }
}