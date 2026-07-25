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
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      
      // On OAuth sign-in (e.g. Google), account is present.
      // We need to fetch the DB user to get the role AND mint a NestJS access_token.
      if (account && token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { id: true, email: true, role: true },
          })
          if (dbUser) {
            token.role = dbUser.role
            // Only generate NestJS token for OAuth sign-ins
            if (account.provider !== 'credentials') {
              token.accessToken = await generateNestToken(dbUser as any)
            }
          }
        } catch (err) {
          console.error('[NextAuth] Error syncing OAuth user with DB:', err)
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
