const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /on\w+\s*=\s*"[^"]*"/gi,
  /on\w+\s*=\s*'[^']*'/gi,
  /on\w+\s*=\s*[^\s>]+/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*onload/gi,
  /document\.cookie/gi,
  /document\.write/gi,
  /eval\s*\(/gi,
  /new\s+Function\s*\(/gi,
  /setTimeout\s*\(/gi,
  /setInterval\s*\(/gi,
];

export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  let sanitized = input;
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  return sanitized.trim();
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeHtml(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeHtml(item)
          : typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>)
          : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

export function sanitizeString(value: string): string {
  return sanitizeHtml(value);
}
