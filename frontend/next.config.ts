import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { withSentryConfig } from '@sentry/nextjs'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

const nextConfig: NextConfig = {
  // ── Output ──────────────────────────────────────────────────────────────
  output: 'standalone',

  // ── Security ────────────────────────────────────────────────────────────
  // Remove "X-Powered-By: Next.js" fingerprinting header
  poweredByHeader: false,

  // ── Compression ─────────────────────────────────────────────────────────
  compress: true,

  // ── Images ──────────────────────────────────────────────────────────────
  images: {
    // Product images are served by Nginx from the local catalogue volume.
    // Bypass Next's optimizer, which runs in a separate container and cannot
    // resolve the /product-images route from its own filesystem.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'www.specpart.tn' },
      // autopart.tn — original source of product images (fallback for un-migrated URLs)
      { protocol: 'https', hostname: 'autopart.tn' },
      // Unsplash (fallback product photos)
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Cloudinary — uploaded product images
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Cloudflare Images — current product image CDN
      { protocol: 'https', hostname: 'imagedelivery.net' },
      // Google OAuth profile pictures
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Wikimedia Commons — brand logos
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      // Amazon product images
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      // Generic product stock photos
      { protocol: 'https', hostname: 'cdn.shopify.com' },
    ],
    // Optimize image quality vs size tradeoff
    formats: ['image/avif', 'image/webp'],
    // Minimum cache TTL for images (1 week)
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },


  // ── Performance ─────────────────────────────────────────────────────────
  // Prevent Prisma from being bundled into the client/edge bundle
  serverExternalPackages: ['@prisma/client', 'bcryptjs', '@prisma/adapter-pg', 'pg'],

  // ── Security Headers ────────────────────────────────────────────────────
  // Belt-and-suspenders: these are also set in middleware, but setting here
  // ensures they're present even if middleware matcher doesn't run.
  async headers() {
    const headers: Array<{
      source: string
      headers: Array<{ key: string; value: string }>
    }> = [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // {
          //   key: 'Strict-Transport-Security',
          //   value: 'max-age=63072000; includeSubDomains; preload',
          // },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
          },
        ],
      },
      // ── Health check — no cache ──────────────────────────────────────────
      {
        source: '/api/health',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ]

    if (process.env.NODE_ENV === 'production') {
      headers.splice(1, 0, {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      })
    }

    return headers
  },

  // ── Redirects ────────────────────────────────────────────────────────────
  async redirects() {
    return []
  },

  // ── Rewrites (Proxy backend API calls to nginx) ──────────────────────────
  async rewrites() {
    return [
      // Backend auth endpoints that should NOT go to NextAuth
      {
        source: '/api/auth/login',
        destination: `${process.env.API_PROXY_ORIGIN || 'http://localhost:8082'}/api/auth/login`,
      },
      {
        source: '/api/auth/register',
        destination: `${process.env.API_PROXY_ORIGIN || 'http://localhost:8082'}/api/auth/register`,
      },
      {
        source: '/api/auth/logout',
        destination: `${process.env.API_PROXY_ORIGIN || 'http://localhost:8082'}/api/auth/logout`,
      },
      {
        source: '/api/auth/refresh',
        destination: `${process.env.API_PROXY_ORIGIN || 'http://localhost:8082'}/api/auth/refresh`,
      },
      {
        source: '/api/auth/forgot-password',
        destination: `${process.env.API_PROXY_ORIGIN || 'http://localhost:8082'}/api/auth/forgot-password`,
      },
      {
        source: '/api/auth/reset-password',
        destination: `${process.env.API_PROXY_ORIGIN || 'http://localhost:8082'}/api/auth/reset-password`,
      },
      {
        source: '/api/auth/newsletter',
        destination: `${process.env.API_PROXY_ORIGIN || 'http://localhost:8082'}/api/auth/newsletter`,
      },
      // NextAuth routes (handled by app/api/auth/[...nextauth]/route.ts)
      // Must come BEFORE the catch-all /api/ rewrite to prevent proxy loop.
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      // Everything else under /api/ proxies to the backend.
      // Override with API_PROXY_ORIGIN (e.g. http://nginx:8082 inside Docker).
      {
        source: '/api/:path*',
        destination: `${process.env.API_PROXY_ORIGIN || 'http://localhost:8082'}/api/:path*`,
      },
    ]
  },
}

export default withSentryConfig(withNextIntl(nextConfig))
