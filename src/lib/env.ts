function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `Please set ${name} in your .env.local file.`
    );
  }
  return value.trim();
}

function optionalEnv(name: string, defaultValue: string = ''): string {
  return process.env[name]?.trim() || defaultValue;
}

export const env = {
  MONGODB_URI: requireEnv('MONGODB_URI'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '7d'),
  CLOUDINARY_CLOUD_NAME: requireEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: requireEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: requireEnv('CLOUDINARY_API_SECRET'),
  GOOGLE_CLIENT_ID: optionalEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: optionalEnv('GOOGLE_CLIENT_SECRET'),
  NEXT_PUBLIC_API_URL: optionalEnv('NEXT_PUBLIC_API_URL', ''),
  CSRF_SECRET: optionalEnv('CSRF_SECRET', requireEnv('JWT_SECRET')),
  NEXTAUTH_URL: optionalEnv('NEXTAUTH_URL', 'http://localhost:3000'),
  NEXTAUTH_SECRET: requireEnv('NEXTAUTH_SECRET'),
  EMAIL_HOST: optionalEnv('EMAIL_HOST', 'smtp.gmail.com'),
  EMAIL_PORT: optionalEnv('EMAIL_PORT', '587'),
  EMAIL_SECURE: optionalEnv('EMAIL_SECURE', 'false'),
  EMAIL_USER: optionalEnv('EMAIL_USER'),
  EMAIL_PASS: optionalEnv('EMAIL_PASS'),
  EMAIL_FROM: optionalEnv('EMAIL_FROM'),
  EMAIL_FROM_NAME: optionalEnv('EMAIL_FROM_NAME', 'ZAAM Store'),
  STRIPE_SECRET_KEY: optionalEnv('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: optionalEnv('STRIPE_WEBHOOK_SECRET'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  PAYMENT_PROVIDER: optionalEnv('PAYMENT_PROVIDER', 'stripe'),
} as const;

export type Env = typeof env;
