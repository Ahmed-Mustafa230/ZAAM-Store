import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { contactMessageSchema } from '@/lib/validation';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import { sanitizeString } from '@/lib/sanitize';
import { rateLimitByIp } from '@/lib/rate-limit';
import ContactMessage from '@/models/ContactMessage';
import DailyLimitReset from '@/models/DailyLimitReset';
import { sendContactMessageNotification } from '@/lib/email';
import {
  CONTACT_DAILY_LIMIT,
  startOfToday,
  dailyDateKey,
  buildConversationId,
} from '@/lib/contact-limits';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const burst = rateLimitByIp(request, { maxRequests: 10, windowMs: 60_000 });
    if (!burst.allowed) {
      return errorResponse('Too many requests. Please try again later.', 429);
    }

    const body = await request.json();
    const parsed = contactMessageSchema.parse(body);

    const session = await auth();
    const today = startOfToday();
    const todayKey = dailyDateKey(today);
    let user: string | null = null;
    let senderIp = '';
    let email = parsed.email;

    if (session?.user?.id) {
      user = session.user.id;
      if (session.user.email) email = session.user.email;
    } else {
      const forwarded = request.headers.get('x-forwarded-for');
      senderIp = forwarded?.split(',')[0]?.trim() || 'unknown';
    }

    const conversationId = buildConversationId(user, senderIp, email);

    const [todayCount, resetsToday] = await Promise.all([
      ContactMessage.countDocuments({
        conversationId,
        createdAt: { $gte: today },
      }),
      DailyLimitReset.countDocuments({ key: conversationId, date: todayKey }),
    ]);

    const allowed = CONTACT_DAILY_LIMIT * (1 + resetsToday);
    if (todayCount >= allowed) {
      return errorResponse(
        'You can send up to 2 messages per day. Please try again tomorrow.',
        429
      );
    }

    const name = sanitizeString(parsed.name);
    const subject = sanitizeString(parsed.subject);
    const message = sanitizeString(parsed.message);

    if (!name || !subject || !message) {
      return errorResponse('Please fill in all fields.', 400);
    }

    const contactMessage = await ContactMessage.create({
      ...(user ? { user } : {}),
      ...(senderIp ? { senderIp } : {}),
      conversationId,
      name,
      email,
      subject,
      message,
      isRead: false,
    });

    sendContactMessageNotification({
      name,
      email,
      subject,
      message,
    }).catch(() => {
      // The database / Admin Inbox is the source of truth.
      // A failed email notification must never fail the customer submission.
    });

    return successResponse(
      { message: 'Message sent successfully! We will get back to you soon.', messageId: String(contactMessage._id) },
      201
    );
  } catch (error) {
    return handleError(error, 'sending contact message');
  }
}