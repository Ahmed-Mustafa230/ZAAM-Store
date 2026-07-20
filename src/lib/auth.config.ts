import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword } from '@/lib/auth';
import connectDB from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
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

        console.log('[AUTHORIZE] Called with email:', email, '- password present:', !!password);
        if (!email || !password) {
          console.log('[AUTHORIZE] Missing credentials');
          return null;
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        if (!user) {
          console.log('[AUTHORIZE] User not found for:', email.toLowerCase().trim());
          return null;
        }

        if (user.isBlocked) {
          console.log('[AUTHORIZE] User is blocked:', email);
          throw new Error('Account is blocked. Contact support.');
        }

        if (user.isDeleted) {
          console.log('[AUTHORIZE] User is deleted:', email);
          throw new Error('Account has been deleted.');
        }

        console.log('[AUTHORIZE] User found:', user.email, '- password field:', !!user.password, '- password length:', user.password?.length);
        const isValid = await comparePassword(password, user.password);
        console.log('[AUTHORIZE] Password valid:', isValid);
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
      await connectDB();
      if (user) {
        token.id = user.id || '';
        token.role = (user as any).role || 'customer';
      }

      if (token.email) {
        const dbUser = await User.findOne({ email: token.email as string }).select('isBlocked isDeleted role avatar');
        if (!dbUser || dbUser.isBlocked || dbUser.isDeleted) {
          return { ...token, role: '' };
        }
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser._id.toString();
          token.picture = dbUser.avatar || token.picture;
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
          console.log('[SIGNIN] Blocked user tried Google sign in:', email);
          return false;
        }

        if (existing && existing.isDeleted) {
          console.log('[SIGNIN] Deleted user tried Google sign in:', email);
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
