import * as Sentry from '@sentry/nestjs';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve local uploads (fallback when Cloudinary is not configured)
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Security
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
    ],
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

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}/api`);
}

void bootstrap();
