import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';

/**
 * PrismaReadService
 * 
 * Connects to the PostgreSQL Read Replica.
 * If the replica is unavailable or not configured, it gracefully falls back
 * to the primary database connection to ensure zero downtime.
 */
@Injectable()
export class PrismaReadService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaReadService.name);
  private replicaClient: PrismaClient | null = null;
  
  constructor(private readonly primary: PrismaService) {}

  async onModuleInit() {
    const replicaUrl = process.env.DATABASE_REPLICA_URL;
    
    if (!replicaUrl) {
      this.logger.warn('DATABASE_REPLICA_URL not set. Falling back to primary database for reads.');
      return;
    }

    try {
      this.replicaClient = new PrismaClient({
        datasources: { db: { url: replicaUrl } },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
      });
      await this.replicaClient.$connect();
      this.logger.log('Connected to PostgreSQL Read Replica');
    } catch (err) {
      this.logger.error(`Failed to connect to replica: ${(err as Error).message}. Falling back to primary database for reads.`);
      this.replicaClient = null;
    }
  }

  async onModuleDestroy() {
    if (this.replicaClient) {
      await this.replicaClient.$disconnect();
    }
  }

  /**
   * Returns the replica client if available and healthy,
   * otherwise returns the primary client.
   * 
   * Provides the full Prisma client interface.
   */
  get db(): PrismaClient {
    return this.replicaClient ?? this.primary;
  }
}
