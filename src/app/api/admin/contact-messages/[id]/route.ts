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

const SELECT_FIELDS = 'user name email subject message isRead createdAt updatedAt';

async function getConversationId(params: Promise<{ id: string }>): Promise<string | null> {
  try {
    const { id } = await params;
    if (!id || id === 'undefined' || id === 'null') return null;
    return id;
  } catch {
    return null;
  }
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== 'admin') return null;
  return session.user;
}

async function conversationLimitInfo(conversationId: string) {
  const today = startOfToday();
  const todayKey = dailyDateKey(today);
  const [todayCount, resetsToday] = await Promise.all([
    ContactMessage.countDocuments({
      conversationId,
      createdAt: { $gte: today },
    }),
    DailyLimitReset.countDocuments({ key: conversationId, date: todayKey }),
  ]);
  const allowed = CONTACT_DAILY_LIMIT * (1 + resetsToday);
  return {
    todayCount,
    dailyLimit: CONTACT_DAILY_LIMIT,
    allowed,
    remaining: Math.max(0, allowed - todayCount),
    limitReached: todayCount >= allowed,
    resetToday: resetsToday > 0,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const admin = await requireAdmin();
    if (!admin) {
      return errorResponse('Authentication required.', 401);
    }

    const id = await getConversationId(params);
    if (!id) {
      return errorResponse('Conversation ID is required.', 400);
    }

    const messages = await ContactMessage.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .select(SELECT_FIELDS);

    if (messages.length === 0) {
      const legacy = await ContactMessage.findById(id).select(SELECT_FIELDS);
      if (!legacy) {
        return errorResponse('Conversation not found.', 404);
      }
      if (!legacy.isRead) {
        legacy.isRead = true;
        await legacy.save();
      }
      return successResponse({
        conversation: {
          conversationId: id,
          name: legacy.name,
          email: legacy.email,
          messages: [legacy],
          ...(await conversationLimitInfo(id)),
        },
      });
    }

    const unreadIds = messages.filter((m) => !m.isRead).map((m) => m._id);
    if (unreadIds.length > 0) {
      await ContactMessage.updateMany(
        { _id: { $in: unreadIds } },
        { $set: { isRead: true } }
      );
    }

    return successResponse({
      conversation: {
        conversationId: id,
        name: messages[0].name,
        email: messages[0].email,
        messages: messages.map((m) => ({
          ...m.toObject(),
          isRead: true,
        })),
        ...(await conversationLimitInfo(id)),
      },
    });
  } catch (error) {
    return handleError(error, 'fetching contact conversation');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const admin = await requireAdmin();
    if (!admin) {
      return errorResponse('Authentication required.', 401);
    }

    const id = await getConversationId(params);
    if (!id) {
      return errorResponse('Conversation ID is required.', 400);
    }

    const body = await request.json();
    const isRead =
      typeof body?.isRead === 'boolean' ? body.isRead : undefined;

    if (isRead === undefined) {
      return errorResponse('An isRead value is required.', 400);
    }

    const result = await ContactMessage.updateMany(
      { conversationId: id },
      { $set: { isRead } }
    );

    if (result.modifiedCount === 0 && result.matchedCount === 0) {
      const legacy = await ContactMessage.findByIdAndUpdate(
        id,
        { isRead },
        { new: true, runValidators: true }
      ).select(SELECT_FIELDS);
      if (!legacy) {
        return errorResponse('Conversation not found.', 404);
      }
      return successResponse({
        conversation: {
          conversationId: id,
          name: legacy.name,
          email: legacy.email,
          messages: [legacy],
          ...(await conversationLimitInfo(id)),
        },
      });
    }

    const messages = await ContactMessage.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .select(SELECT_FIELDS);

    return successResponse({
      conversation: {
        conversationId: id,
        name: messages[0].name,
        email: messages[0].email,
        messages,
        ...(await conversationLimitInfo(id)),
      },
    });
  } catch (error) {
    return handleError(error, 'updating contact conversation');
  }
}