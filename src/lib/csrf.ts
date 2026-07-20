import crypto from 'crypto';

const TOKEN_LENGTH = 32;
const HEADER_NAME = 'x-csrf-token';

function getCsrfSecret(): string {
  const secret = process.env.CSRF_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'CSRF secret is not configured. Set CSRF_SECRET or JWT_SECRET in your .env.local file.'
    );
  }
  return secret;
}

export function generateCsrfToken(): string {
  const secret = getCsrfSecret();
  const random = crypto.randomBytes(TOKEN_LENGTH).toString('hex');
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(random)
    .digest('hex');
  return `${random}.${hmac}`;
}

export function validateCsrfToken(token: string): boolean {
  try {
    const secret = getCsrfSecret();
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [random, hmac] = parts;
    const expectedHmac = crypto
      .createHmac('sha256', secret)
      .update(random)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}

export function csrfProtection(
  request: Request
): { valid: boolean; error: string | null } {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return { valid: true, error: null };
  }

  const token = request.headers.get(HEADER_NAME);

  if (!token) {
    return { valid: false, error: 'Missing CSRF token. Include x-csrf-token header.' };
  }

  if (!validateCsrfToken(token)) {
    return { valid: false, error: 'Invalid or expired CSRF token.' };
  }

  return { valid: true, error: null };
}

export { HEADER_NAME as CSRF_HEADER };
