import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(
  message: string,
  status: number = 400,
  details?: unknown
) {
  return NextResponse.json(
    { message, ...(details ? { details } : {}) },
    { status }
  );
}

export function handleError(error: unknown, context: string): NextResponse {
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    return errorResponse(
      firstIssue.message,
      400,
      process.env.NODE_ENV === 'development' ? error.issues : undefined
    );
  }

  if (error instanceof SyntaxError) {
    return errorResponse('Invalid request body format.', 400);
  }

  const message =
    error instanceof Error ? error.message : `An error occurred while ${context}.`;

  console.error(`[${context}]`, error);
  return errorResponse(message, 500);
}

export function parseBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}
