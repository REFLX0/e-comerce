import {
  Controller,
  Get,
  Head,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import type { Response } from 'express';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  // Liveness: "is the process alive". Deliberately does NOT check the DB — this is
  // what the Docker healthcheck and depends_on: service_healthy gate on, and a
  // transient DB blip must not make Docker treat the whole container as down.
  @Get('health')
  async check(@Res() res: Response) {
    let dbStatus = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'degraded';
    }
    return res.status(HttpStatus.OK).json({
      status: 'ok',
      info: { db: { status: dbStatus } },
      details: { db: { status: dbStatus } },
    });
  }

  @Head('health')
  headCheck(@Res() res: Response) {
    res.status(200).end();
  }

  // Liveness alias for load balancers/orchestrators that probe /liveness specifically.
  @Get('liveness')
  liveness(@Res() res: Response) {
    res.status(HttpStatus.OK).json({ status: 'ok' });
  }

  // Readiness: "can this instance actually serve traffic". Postgres is the only
  // dependency that gates this — Redis/Kafka/OpenSearch all have documented
  // graceful-degradation paths elsewhere in the app, so their outage is reported
  // for visibility but must not flip readiness to unhealthy.
  @Get('readiness')
  async readiness(@Res() res: Response) {
    let dbStatus: 'up' | 'down' = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'down';
    }
    const redisStatus = this.cache.isReady() ? 'up' : 'down';
    const ready = dbStatus === 'up';

    return res.status(ready ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json({
      status: ready ? 'ready' : 'not_ready',
      details: {
        db: { status: dbStatus, required: true },
        redis: { status: redisStatus, required: false },
      },
    });
  }
}
