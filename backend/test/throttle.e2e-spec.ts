/**
 * E2E Throttle Regression Test
 *
 * Verifies that ThrottlerGuard wired as APP_GUARD respects @Throttle() overrides
 * on sensitive endpoints (e.g. POST /api/auth/login limit: 5/min) and returns 429.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('ThrottleGuard regression (e2e)', () => {
  let app: INestApplication;
  const mockAuthService = {
    login: jest.fn().mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: 'u1', email: 'test@specpart.tn' },
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: 'default',
            ttl: 60000,
            limit: 100,
          },
        ]),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('returns 429 after exceeding the login throttle limit (5/min)', async () => {
    const payload = { email: 'throttle-test@specpart.tn', password: 'Password123!' };

    let lastStatus = 0;
    for (let i = 0; i < 6; i++) {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(payload)
        .set('Content-Type', 'application/json');
      lastStatus = res.status;
    }

    expect(lastStatus).toBe(429);
  });
});
