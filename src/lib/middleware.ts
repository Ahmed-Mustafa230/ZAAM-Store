import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

export function authenticateRequest(
  request: NextRequest
): { payload: TokenPayload; error: NextResponse | null } {
  const token = getTokenFromRequest(request);
  if (!token) {
    return {
      payload: {} as TokenPayload,
      error: NextResponse.json(
        { message: 'Authentication required. Please provide a valid token.' },
        { status: 401 }
      ),
    };
  }

  try {
    const payload = verifyToken(token);
    return { payload, error: null };
  } catch (error) {
    return {
      payload: {} as TokenPayload,
      error: NextResponse.json(
        { message: 'Invalid or expired token.' },
        { status: 401 }
      ),
    };
  }
}

export function adminOnly(
  payload: TokenPayload
): NextResponse | null {
  if (payload.role !== 'admin') {
    return NextResponse.json(
      { message: 'Access denied. Admin privileges required.' },
      { status: 403 }
    );
  }
  return null;
}
