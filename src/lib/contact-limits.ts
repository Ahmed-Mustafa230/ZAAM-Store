export const CONTACT_DAILY_LIMIT = 2;

export function startOfToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export function dailyDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildConversationId(
  user: string | null,
  senderIp: string,
  email: string
): string {
  if (user) {
    return `user:${user}`;
  }
  return `guest:${senderIp || 'unknown'}:${email.trim().toLowerCase()}`;
}