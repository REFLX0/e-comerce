import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if Upstash Redis credentials are provided
const hasRedisCredentials = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

// Fallback to a mock redis client if env vars are missing (prevents crashes during local dev without redis)
const redisClient = hasRedisCredentials 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : ({
      sadd: async () => 1,
      eval: async () => [1, 1],
    } as unknown as Redis) // Basic mock

// Rate limit for login (5 requests per 1 minute)
export const loginRateLimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/login',
})

// Rate limit for register (3 requests per 1 minute)
export const registerRateLimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/register',
})

// Rate limit for checkout (2 requests per 1 minute)
export const checkoutRateLimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(2, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/checkout',
})

// Rate limit for forgot password (3 requests per 15 minutes)
export const forgotPasswordRateLimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(3, '15 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/forgot-password',
})
