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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id || '';
        token.role = (user as any).role || 'customer';
      }

      if (token.email) {
        try {
          const dbUser = await User.findOne({ email: token.email as string }).select('isBlocked isDeleted role avatar').maxTimeMS(3000);
          if (!dbUser || dbUser.isBlocked || dbUser.isDeleted) {
            return { ...token, role: '' };
          }
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser._id.toString();
            token.picture = dbUser.avatar || token.picture;
          }
        } catch {
          // DB lookup failed (cold start / timeout). Use existing token data.
          // The token already has role/id from the initial sign-in.
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      await connectDB();
      if (account?.provider === 'google') {
        const email = user.email!;
        const existing = await User.findOne({ email });

        if (existing && existing.isBlocked) {
          return false;
        }

        if (existing && existing.isDeleted) {
          return false;
        }

        if (!existing) {
          await User.create({
            name: user.name,
            email,
            avatar: user.image || '',
            role: 'customer',
          });
        } else {
          const updates: Record<string, string> = {};
          if (user.name && existing.name !== user.name) updates.name = user.name;
          if (user.image && existing.avatar !== user.image) updates.avatar = user.image;
          if (Object.keys(updates).length > 0) {
            await User.findOneAndUpdate({ email }, { $set: updates });
          }
        }

        const dbUser = await User.findOne({ email });
        if (dbUser) {
          user.id = dbUser._id.toString();
          (user as any).role = dbUser.role;
        }
      }

      return true;
    },
  },
});
