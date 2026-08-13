import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import ContactMessage from '@/models/ContactMessage';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required.', 401);
    }
    if (session.user.role !== 'admin') {
      return errorResponse('Access denied. Admin privileges required.', 403);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const unreadOnly = searchParams.get('unread') === 'true';
    const skip = (page - 1) * limit;

    const groups = await ContactMessage.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$conversationId', '$_id'] },
          msgs: {
            $push: {
              createdAt: '$createdAt',
              isRead: '$isRead',
              name: '$name',
              email: '$email',
              subject: '$subject',
              message: '$message',
            },
          },
        },
      },
      {
        $addFields: {
          unreadCount: {
            $size: {
              $filter: {
                input: '$msgs',
                as: 'm',
                cond: { $eq: ['$$m.isRead', false] },
              },
            },
          },
          totalCount: { $size: '$msgs' },
          lastMessageAt: { $max: '$msgs.createdAt' },
          latestMessage: {
            $reduce: {
              input: '$msgs',
              initialValue: { createdAt: null },
              in: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$$value.createdAt', null] },
                      { $gte: ['$$value.createdAt', '$$this.createdAt'] },
                    ],
                  },
                  '$$value',
                  '$$this',
                ],
              },
            },
          },
        },
      },
    ]);

    const [unreadCount] = await Promise.all([
      ContactMessage.countDocuments({ isRead: false }),
    ]);

    const sorted = groups.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

    const filtered = unreadOnly ? sorted.filter((g) => g.unreadCount > 0) : sorted;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const conversations = filtered.slice(skip, skip + limit).map((g) => ({
      conversationId: String(g._id),
      name: g.latestMessage?.name ?? '',
      email: g.latestMessage?.email ?? '',
      subject: g.latestMessage?.subject ?? '',
      lastMessage: (g.latestMessage?.message ?? '').slice(0, 120),
      lastMessageAt: g.lastMessageAt,
      unreadCount: g.unreadCount ?? 0,
      totalCount: g.totalCount ?? 0,
      isRead: (g.unreadCount ?? 0) === 0,
    }));

    return successResponse({
      conversations,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return handleError(error, 'fetching contact conversations');
  }
}