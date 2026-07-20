const store = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000,
};

export function rateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup();

  const { maxRequests, windowMs } = { ...defaultConfig, ...config };
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export function rateLimitByIp(
  request: Request,
  config?: Partial<RateLimitConfig>
) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return rateLimit(`ip:${ip}`, config);
}

export function rateLimitByUser(
  userId: string,
  config?: Partial<RateLimitConfig>
) {
  return rateLimit(`user:${userId}`, config);
}
