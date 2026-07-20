import bcryptjs from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(12);
  const hash = await bcryptjs.hash(password, salt);
  console.log('[AUTH] hashPassword - input length:', password.length, '- output length:', hash.length);
  return hash;
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  console.log('[AUTH] comparePassword - input length:', password.length, '- hash length:', hashedPassword.length);
  const result = await bcryptjs.compare(password, hashedPassword);
  console.log('[AUTH] comparePassword - result:', result);
  return result;
}
