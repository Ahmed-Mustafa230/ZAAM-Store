import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'zaam-store-jwt-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  role: string;
}

export function generateToken(userId: string, role: string = 'customer'): string {
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string & jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(12);
  return bcryptjs.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword);
}
