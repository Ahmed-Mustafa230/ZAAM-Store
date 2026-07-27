import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword } from '@/lib/auth';
import connectDB from '@/lib/db';

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: AUTH_SECRET,
  trustHost: true,
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB();
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        if (!user) {
          return null;
        }

        if (user.isBlocked) {
          throw new Error('Account is blocked. Contact support.');
        }

        if (user.isDeleted) {
          throw new Error('Account has been deleted.');
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar || null,
          role: user.role,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || '';
        token.role = (user as unknown as Record<string, unknown>).role as string || 'customer';
      }

      if (token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email as string }).select('isBlocked isDeleted role avatar').maxTimeMS(3000);
          if (!dbUser || dbUser.isBlocked || dbUser.isDeleted) {
            return { ...token, role: '' };
          }
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser._id.toString();
            token.picture = dbUser.avatar || token.picture;
          }
        } catch (error) {
          console.error('[Auth] JWT DB lookup failed:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as Record<string, unknown>).id = token.id as string;
        (session.user as unknown as Record<string, unknown>).role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (existing && (existing.isBlocked || existing.isDeleted)) {
          return false;
        }
      }

      return true;
    },
  },
});
