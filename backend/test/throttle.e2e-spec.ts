/**
 * E2E Throttle Regression Test
 *
 * This test verifies that ThrottlerGuard is correctly wired as APP_GUARD,
 * meaning the @Throttle() decorator on POST /auth/login actually fires.
 *
 * REQUIREMENTS:
 *   - DATABASE_URL must be set in the environment (or .env file).
 *   - The app bootstraps in-process; no running server needed.
 *
 * If DATABASE_URL is not available (e.g. in CI without a DB), this test
 * file will be skipped automatically via the conditional describe.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

const HAS_DB = !!process.env.DATABASE_URL;

// eslint-disable-next-line jest/valid-describe-callback
describe('ThrottleGuard regression (e2e)', () => {
  let app: INestApplication;

  // Skip entire suite if no DB is available
  if (!HAS_DB) {
    it.skip('skipped — DATABASE_URL not set', () => {});
    return;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  }, 30_000);

  afterAll(async () => {
    await app?.close();
  });

  it('returns 429 after exceeding the login throttle limit (5/min)', async () => {
    // The login route has @Throttle({ default: { limit: 5, ttl: 60000 } })
    // The ThrottlerGuard is registered as APP_GUARD in app.module.ts.
    // We fire 6 requests with a deliberately wrong password so none succeed.

    const payload = { email: 'throttle-test@specpart.invalid', password: 'wrong' };

    let lastStatus = 0;
    for (let i = 0; i < 6; i++) {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(payload)
        .set('Content-Type', 'application/json');
      lastStatus = res.status;
    }

    // At least the 6th request (index 5) must be throttled
    expect(lastStatus).toBe(429);
  }, 15_000);
});
