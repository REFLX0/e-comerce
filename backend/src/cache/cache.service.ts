import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Industry-standard Redis cache service.
 * - TTL-based caching with typed get/set
 * - Pattern-based key invalidation (e.g. delete all "product:*" keys)
 * - Graceful degradation: if Redis is down, the method acts as a cache-miss
 *   and the application falls back to PostgreSQL without crashing.
 */
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis;
  private isConnected = false;

  // ── TTL constants (seconds) ────────────────────────────────────────────────
  static readonly TTL = {
    PRODUCT_SLUG:   60 * 60 * 2,   // 2 hours  — product detail page
    PRODUCT_LIST:   60 * 5,        // 5 minutes — catalogue/list queries
    FACETS:         60 * 10,       // 10 minutes — filter facet counts
    BEST_SELLERS:   60 * 15,       // 15 minutes — homepage best-sellers
    NEW_ARRIVALS:   60 * 15,       // 15 minutes — homepage new arrivals
    CATEGORIES:     60 * 60 * 6,   // 6 hours  — static category tree
    BRANDS:         60 * 60 * 6,   // 6 hours  — brand list
    SEARCH:         60 * 3,        // 3 minutes — search suggestions
  } as const;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const host = this.config.get<string>('REDIS_HOST');
    const port = this.config.get<number>('REDIS_PORT') || 6379;

    if (!host || process.env.NODE_ENV === 'test') {
      this.logger.log('Redis host not configured or test environment — running without cache');
      return;
    }

    this.client = new Redis({
      host,
      port,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log(`Redis connected (${host}:${port})`);
    });
    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.warn(`Redis error (graceful degradation active): ${err.message}`);
    });

    this.client.connect().catch(() => {
      this.logger.warn('Redis not reachable at startup — running without cache');
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        this.client.disconnect();
      } catch {
        // ignore
      }
    }
  }

  // ── Core helpers ──────────────────────────────────────────────────────────

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    try {
      const raw = await this.client.get(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {}
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch {}
  }

  /**
   * Delete all keys matching a glob pattern.
   * Use for bulk invalidation (e.g. all pages of a product listing after a brand update).
   * Uses SCAN to avoid blocking Redis on large keyspaces.
   */
  async delPattern(pattern: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch {}
  }

  // ── Convenience wrapper: get-or-set ─────────────────────────────────────

  /**
   * Cache-aside pattern. Returns cached value or calls `fn()` to populate.
   * Usage: return this.cache.wrap('product:slug:abc', () => db.find(...), ttl)
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttlSeconds: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fn();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}
