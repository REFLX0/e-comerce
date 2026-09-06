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
import type { Response } from 'express';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
  ) {}

  @Get()
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

  @Head()
  headCheck(@Res() res: Response) {
    res.status(200).end();
  }
}
