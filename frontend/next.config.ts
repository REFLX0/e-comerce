import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.kiosquetn.tn',
      },
      {
        protocol: 'https',
        hostname: 'www.KiosqueTN.tn',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Cloudinary — required for product images
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        // Google profile pictures (OAuth)
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
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
      // NextAuth routes (handled by app/api/auth/[...nextauth]/route.ts)
      // Must come BEFORE the catch-all /api/ rewrite to prevent proxy loop.
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      // Everything else under /api/ proxies to the backend
      {
        source: '/api/:path*',
        destination: 'http://localhost:8082/api/:path*',
      },
    ]
  },
}

export default withNextIntl(nextConfig)
