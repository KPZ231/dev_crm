import type { NextAuthConfig } from 'next-auth';

// Edge-compatible configuration for NextAuth (No Prisma imports here)
export const authConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [], // Added in auth.ts
} satisfies NextAuthConfig;
