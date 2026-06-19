import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config — no Prisma, no Node.js-only imports.
 * Used by middleware.ts which runs in the Edge Runtime.
 * Providers and Prisma adapter are added in auth.ts (Node.js only).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" as const },
  callbacks: {
    // Runs in edge: only read from token, never query the database
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
