import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import Google from 'next-auth/providers/google'
import { CredentialsSignin } from 'next-auth'
import { db } from '@/lib/db'
import { authConfig } from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt', maxAge: 86400 }, // 24h — shorter than default 30d
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new CredentialsSignin("Email and password are required")
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) {
          throw new CredentialsSignin("Invalid email or password")
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash)

        if (!isValid) {
          throw new CredentialsSignin("Invalid email or password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    // Override jwt callback here (Node.js context) so we can access DB for OAuth logins.
    // auth.config.ts runs on the Edge runtime (middleware) where Prisma is unavailable.
    async jwt({ token, user, account }) {
      // On credentials sign-in, 'user' is returned from authorize() and includes role
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      // On OAuth sign-in (e.g. Google), the Prisma Adapter user object does NOT include
      // the 'role' field from our schema. Fetch it explicitly from the DB.
      if (account && token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          })
          if (dbUser) token.role = dbUser.role
        } catch {
          // Silently fall back — treated as CUSTOMER by default
        }
      }
      return token
    },
    // Keep the session callback from authConfig
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
})
