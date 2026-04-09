import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getSessionPlanFields } from '@/server/services/user.service';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isCorrect) {
          throw new Error('Email or password is incorrect!');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      const userId = (user?.id ?? token.id) as string | undefined;
      if (!userId) return token;

      token.id = userId;

      const shouldRefreshPlan =
        user != null ||
        trigger === 'update' ||
        token.creditBalance === undefined;

      if (shouldRefreshPlan) {
        const plan = await getSessionPlanFields(userId);
        token.creditBalance = plan.creditBalance;
        token.planTier = plan.planTier;
        token.planExpiresAt = plan.planExpiresAt;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.creditBalance =
          typeof token.creditBalance === 'number' ? token.creditBalance : 0;
        session.user.planTier =
          typeof token.planTier === 'string' || token.planTier === null
            ? token.planTier
            : null;
        session.user.planExpiresAt =
          typeof token.planExpiresAt === 'string' || token.planExpiresAt === null
            ? token.planExpiresAt
            : null;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'credentials' && user?.email) {
        const credUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { emailVerified: true },
        });
        if (credUser && !credUser.emailVerified) {
          const base =
            process.env.NEXTAUTH_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
          return `${base}/verify-email?email=${encodeURIComponent(user.email)}&needsCode=1`;
        }
      }

      if (account?.provider && account.provider !== 'credentials' && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, emailVerified: true },
        });
        if (dbUser && user) {
          (user as { id?: string }).id = dbUser.id;
        }
        if (dbUser && !dbUser.emailVerified) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { emailVerified: new Date() },
          });
        }
      }
      return true;
    },
  },
};
