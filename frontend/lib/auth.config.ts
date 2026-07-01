import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  // pages config removed to prevent next-auth intercept loop
  providers: [], // Added in auth.ts to avoid Edge issues with Prisma/bcrypt
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
} satisfies NextAuthConfig
