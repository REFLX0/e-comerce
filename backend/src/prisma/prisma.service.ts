import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * `connection_limit` / `pool_timeout` in the DATABASE_URL are Prisma-engine
 * options and are ignored when a driver adapter is used - the pg Pool below is
 * what actually governs the pool, so the cap is set here explicitly.
 */
const DEFAULT_POOL_SIZE = 10;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private static readonly poolLogger = new Logger('PrismaPool');
  private readonly pool: Pool;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DATABASE_POOL_SIZE ?? DEFAULT_POOL_SIZE),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

    // node-postgres emits 'error' on *idle* clients (a Postgres restart, a
    // dropped connection). With no listener Node treats it as an uncaught
    // exception and the API process dies.
    pool.on('error', (err) => {
      PrismaService.poolLogger.error(
        `Idle Postgres client error: ${err.message}`,
        err.stack,
      );
    });

    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'warn', 'error']
          : ['error'],
    });

    this.pool = pool;
  }

  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err: any) {
      this.logger.warn(
        `Could not connect to database on startup: ${err.message}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end().catch(() => {});
  }
}
