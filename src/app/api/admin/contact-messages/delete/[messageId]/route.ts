import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth.config';
import { errorResponse, successResponse, handleError } from '@/lib/api-utils';
import ContactMessage from '@/models/ContactMessage';

async function getMessageId(params: Promise<{ messageId: string }>): Promise<string | null> {
  try {
    const { messageId } = await params;
    if (!messageId || messageId === 'undefined' || messageId === 'null') return null;
    return messageId;
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    await connectDB();

    const admin = await requireAdmin();
    if (!admin) {
      return errorResponse('Authentication required.', 401);
    }

    const messageId = await getMessageId(params);
    if (!messageId || !mongoose.isValidObjectId(messageId)) {
      return errorResponse('Message ID is required.', 400);
    }

    const deleted = await ContactMessage.findByIdAndDelete(messageId);
    if (!deleted) {
      return errorResponse('Message not found.', 404);
    }

    return successResponse({ message: 'Message deleted.', deleted: true });
  } catch (error) {
    return handleError(error, 'deleting contact message');
  }
}