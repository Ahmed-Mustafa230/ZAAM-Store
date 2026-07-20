import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth.config';
import { errorResponse } from './api-utils';

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
}

export async function authenticateRequest(): Promise<{
  session: AuthSession;
  error: NextResponse | null;
}> {
  const session = await auth();

  if (!session?.user) {
    return {
      session: {} as AuthSession,
      error: errorResponse('Authentication required. Please sign in.', 401),
    };
  }

  return {
    session: session as unknown as AuthSession,
    error: null,
  };
}

export function requireRole(
  session: AuthSession,
  allowedRoles: string[]
): NextResponse | null {
  if (!allowedRoles.includes(session.user.role)) {
    return errorResponse(
      `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
      403
    );
  }
  return null;
}

export function adminOnly(session: AuthSession): NextResponse | null {
  return requireRole(session, ['admin']);
}

export function customerOrAdmin(session: AuthSession): NextResponse | null {
  return requireRole(session, ['customer', 'admin']);
}
