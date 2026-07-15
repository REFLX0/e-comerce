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
  @HealthCheck()
  check() {
    return this.health.check([
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return { db: { status: 'up' } };
        } catch {
          return { db: { status: 'down' } };
        }
      },
    ]);
  }

  @Head()
  headCheck(@Res() res: Response) {
    res.status(200).end();
  }
}
