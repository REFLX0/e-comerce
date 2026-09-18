// IMPORTANT: instrument.ts must be imported first so Sentry is initialized
// before any other modules are loaded.
import './instrument';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve local uploads (fallback when Cloudinary is not configured)
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Trust the reverse proxy (nginx) so req.ip is the real client IP rather than
  // the nginx container's docker-bridge address. Without this every request
  // shares a single ThrottlerGuard bucket and the @Throttle limits on login,
  // orders, reviews, etc. apply site-wide instead of per user.
  app.set('trust proxy', 1);

  // Security
  app.use(helmet());
  app.use(cookieParser());

  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  // Localhost origins are only trusted outside production - in production they
  // would let any app running on a visitor's machine make credentialed calls.
  const corsOrigins = isProduction
    ? [frontendUrl]
    : [frontendUrl, 'http://127.0.0.1:3000', 'http://localhost:3000'];
  app.enableCors({
    origin: Array.from(new Set(corsOrigins)),
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe - strips unknown fields, validates all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger (dev only)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('specpart API')
      .setDescription('E-commerce REST API for specpart auto parts')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Let Nest run onModuleDestroy/onApplicationShutdown on SIGTERM so in-flight
  // requests finish and the Prisma pool closes cleanly on `docker compose down`.
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  logger.log(`🚀 Backend running on http://localhost:${port}/api`);
}

void bootstrap();
