import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import Google from 'next-auth/providers/google'
import { CredentialsSignin } from 'next-auth'
import { db } from '@/lib/db'
import { authConfig } from './auth.config'
import { SignJWT } from 'jose'

async function generateNestToken(user: { id: string; email: string; role: string }) {
  const secretString = process.env.JWT_SECRET || 'fallback-dev-secret'
  const secret = new TextEncoder().encode(secretString)
  return new SignJWT({ sub: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt', maxAge: 86400 }, // 24h
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
    async jwt({ token, user, account }) {
      // On initial sign-in, `user` is set by the adapter/provider
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }

      // ALWAYS re-read the role from the DB to prevent stale elevated permissions.
      // This runs on every token refresh (every ~30s by default when the user is active).
      // Cost: one lightweight DB query per refresh, but guarantees role changes take effect immediately.
      if (token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { id: true, email: true, role: true },
          })
          if (dbUser) {
            token.role = dbUser.role

            // For OAuth providers (Google etc.), mint a NestJS access token so the
            // backend API can authenticate this user via cookie.
            // For credentials, the NestJS token is minted by the backend login endpoint.
            if (account && account.provider !== 'credentials') {
              token.accessToken = await generateNestToken(dbUser as any)
            }

            // Refresh the NestJS token if it doesn't exist yet (e.g., first load after
            // an OAuth sign-in where the token was never minted)
            if (!token.accessToken && !account) {
              // Re-mint only for non-credentials users (Google etc.)
              // We detect this by checking if the user has no passwordHash — but we
              // can't do that from this select. Instead, we always mint for safety.
              // The backend will ignore it if the user is credentials-based.
              token.accessToken = await generateNestToken(dbUser as any)
            }
          }
        } catch (err) {
          console.error('[NextAuth] Error re-validating user role from DB:', err)
          // On error, keep the existing token values — don't wipe the role.
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        if (token.accessToken) {
          ;(session as any).accessToken = token.accessToken
        }
      }
      return session
    },
  },
})
