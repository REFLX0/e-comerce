/**
 * lib/env.ts — Typed, validated environment variables
 *
 * Validates ALL required env vars at module load time (startup), not at
 * request time. If a required var is missing, the app throws a descriptive
 * error BEFORE the first request arrives — fail fast, not silently.
 *
 * Usage:
 *   import { env } from '@/lib/env'
 *   const url = env.DATABASE_URL  // typed string, guaranteed non-empty
 *
 * Never use process.env.X directly in application code — always import from here.
 */

import { z } from 'zod'

// ── Schema ────────────────────────────────────────────────────────────────

const envSchema = z.object({
  // ── Node ────────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // ── Database (REQUIRED) ──────────────────────────────────────────────
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .url('DATABASE_URL must be a valid PostgreSQL connection string')
    .refine(
      (val) => val.startsWith('postgresql://') || val.startsWith('postgres://'),
      'DATABASE_URL must start with postgresql:// or postgres://'
    ),

  // ── NextAuth (REQUIRED) ──────────────────────────────────────────────
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters. Generate with: openssl rand -base64 32')
    .refine(
      (val) => val !== 'CHANGE_ME_TO_A_RANDOM_SECRET',
      'NEXTAUTH_SECRET must be changed from the placeholder. Run: openssl rand -base64 32'
    ),

  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_URL must be a valid URL'),

  // ── Google OAuth (REQUIRED if using Google sign-in) ──────────────────
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // ── Public site config ───────────────────────────────────────────────
  API_URL: z
    .string()
    .min(1)
    .optional()
    .default('http://nginx:8082/api'),

  NEXT_PUBLIC_API_URL: z
    .string()
    .min(1)
    .optional()
    .default('/api'),

  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url('NEXT_PUBLIC_SITE_URL must be a valid URL')
    .optional()
    .default('http://localhost:3000'),

  NEXT_PUBLIC_SITE_NAME: z
    .string()
    .min(1)
    .optional()
    .default('KiosqueTN'),

  // ── Cloudinary (optional — features degrade gracefully without it) ────
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // ── Resend (email — optional) ────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),

  // ── Twilio (SMS — optional) ──────────────────────────────────────────
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // ── hCaptcha (optional) ──────────────────────────────────────────────
  NEXT_PUBLIC_HCAPTCHA_SITE_KEY: z.string().optional(),
  HCAPTCHA_SECRET_KEY: z.string().optional(),

  // ── Upstash Redis (rate limiting — optional, falls back to no-op) ────
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ── Google Cloud Vision (OCR — optional) ────────────────────────────
  GOOGLE_CLOUD_API_KEY: z.string().optional(),
})

// ── Validate ──────────────────────────────────────────────────────────────

function validateEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const errors = result.error.issues
      .map((e: any) => `  • ${e.path.join('.')}: ${e.message}`)
      .join('\n')

    // This throws at STARTUP so the problem is immediately visible
    throw new Error(
      `\n\n❌ Invalid environment variables:\n${errors}\n\n` +
      `Fix these in your .env file and restart the server.\n`
    )
  }

  return result.data
}

// Export typed, validated env — safe to use everywhere
export const env = validateEnv()

// ── Capability flags ─────────────────────────────────────────────────────
// Use these to guard optional features rather than checking env vars directly

export const capabilities = {
  email:      !!env.RESEND_API_KEY,
  sms:        !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN),
  storage:    !!(env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_SECRET),
  rateLimit:  !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  captcha:    !!(env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && env.HCAPTCHA_SECRET_KEY),
  googleAuth: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  ocr:        !!env.GOOGLE_CLOUD_API_KEY,
}

export type Env = z.infer<typeof envSchema>

