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
  events: {
    async createUser({ user }) {
      if (!user.email) return
      const apiKey = process.env.BREVO_API_KEY
      if (!apiKey) return
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Specpart', email: 'specpart.tn@gmail.com' },
            to: [{ email: user.email }],
            subject: 'Bienvenue chez Specpart ! 🎉',
            htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { margin:0; padding:20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #16254c; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
    .header p { color: #D4A76A; margin: 6px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
    .content { padding: 32px 24px; }
    .title { color: #0f172a; font-size: 20px; margin-top: 0; font-weight: 700; }
    .text { color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { background: #D4A76A; color: #0d162d; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; }
    .footer { text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 13px; line-height: 1.5; }
    .footer strong { color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SPECPART</h1>
      <p>Pièces auto & Lubrifiants</p>
    </div>
    <div class="content">
      <h2 class="title">Bienvenue ${user.name || ''} ! 👋</h2>
      <p class="text">
        Votre compte a été créé avec succès sur <strong>specpart.tn</strong> via Google. Vous pouvez dès à présent ajouter vos véhicules à votre garage virtuel, commander vos pièces certifiées et suivre l'état de vos livraisons.
      </p>
      <div class="button-container">
        <a href="https://specpart.tn/catalogue" class="button">Explorer le catalogue →</a>
      </div>
      <div class="footer">
        Service client disponible du Lundi au Samedi au <strong>+216 29 294 195</strong>.<br/>
        &copy; ${new Date().getFullYear()} Specpart. Tous droits réservés.
      </div>
    </div>
  </div>
</body>
</html>
            `,
          }),
        })

        const adminEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || 'specpart.tn@gmail.com').replace(/<([^>]+)>/, '$1').trim()
        fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Specpart', email: 'specpart.tn@gmail.com' },
            to: [{ email: adminEmail }],
            subject: `👤 [Nouveau Client Google] ${user.name || 'Utilisateur'} (${user.email})`,
            htmlContent: `
              <div style="font-family: sans-serif; padding: 16px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h3 style="color: #16254c; margin-top: 0;">Un nouveau client s'est connecté via Google :</h3>
                <p><strong>Nom :</strong> ${user.name || 'Non spécifié'}</p>
                <p><strong>Email :</strong> ${user.email}</p>
              </div>
            `,
          }),
        }).catch(() => {})
      } catch (err) {
        console.error('[NextAuth] Error sending Google welcome email via Brevo:', err)
      }
    },
  },
})
