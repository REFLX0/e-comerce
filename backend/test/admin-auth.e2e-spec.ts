/**
 * E2E Admin Route Authorization Regression Tests
 *
 * Verifies that AdminController enforces:
 *  1. HTTP 401 Unauthorized for unauthenticated requests.
 *  2. HTTP 403 Forbidden for authenticated users with role !== 'ADMIN'.
 *  3. HTTP 200/201 Success for authenticated users with role === 'ADMIN'.
 *
 * Specifically tests:
 *  - updateUserRole (PATCH /api/admin/users/:id/role)
 *  - updatePaymentStatus (PATCH /api/admin/payments/:id/status)
 *  - createDirectSale (POST /api/admin/pos/sale)
 *  - deleteReview (DELETE /api/admin/reviews/:id)
 *  - deleteContactMessage (DELETE /api/admin/contact-messages/:id)
 *  - bulkProducts (POST /api/admin/products/bulk)
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AdminController } from '../src/admin/admin.controller';
import { AdminService } from '../src/admin/admin.service';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { PrismaService } from '../src/prisma/prisma.service';

const JWT_SECRET = 'test_secret_for_admin_auth_e2e_tests';

describe('AdminController Authorization (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;

  const mockAdminService = {
    updateUserRole: jest.fn().mockResolvedValue({ id: 'u1', role: 'ADMIN' }),
    updatePaymentStatus: jest.fn().mockResolvedValue({ id: 'p1', status: 'PAID' }),
    createDirectSale: jest.fn().mockResolvedValue({ id: 'sale-1', success: true }),
    deleteReview: jest.fn().mockResolvedValue({ success: true }),
    deleteContactMessage: jest.fn().mockResolvedValue({ success: true }),
    bulkProducts: jest.fn().mockResolvedValue({ count: 1 }),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockImplementation(({ where }: { where: { id: string } }) => {
        if (where.id === 'admin-id') {
          return Promise.resolve({ id: 'admin-id', email: 'admin@specpart.tn', role: 'ADMIN' });
        }
        if (where.id === 'user-id') {
          return Promise.resolve({ id: 'user-id', email: 'user@specpart.tn', role: 'USER' });
        }
        return Promise.resolve(null);
      }),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue(JWT_SECRET),
            get: jest.fn().mockReturnValue(JWT_SECRET),
          },
        },
        JwtStrategy,
        JwtAuthGuard,
        RolesGuard,
        Reflector,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    adminToken = jwtService.sign({ sub: 'admin-id', email: 'admin@specpart.tn', role: 'ADMIN' });
    userToken = jwtService.sign({ sub: 'user-id', email: 'user@specpart.tn', role: 'USER' });
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('PATCH /api/admin/users/:id/role (updateUserRole)', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/admin/users/u1/role')
        .send({ role: 'ADMIN' });
      expect(res.status).toBe(401);
    });

    it('returns 403 for authenticated non-admin user (role: USER)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/admin/users/u1/role')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'ADMIN' });
      expect(res.status).toBe(403);
    });

    it('returns 200 for authenticated admin user (role: ADMIN)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/admin/users/u1/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'ADMIN' });
      expect(res.status).toBe(200);
      expect(mockAdminService.updateUserRole).toHaveBeenCalledWith('u1', 'ADMIN');
    });
  });

  describe('PATCH /api/admin/payments/:id/status (updatePaymentStatus)', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/admin/payments/p1/status')
        .send({ status: 'PAID' });
      expect(res.status).toBe(401);
    });

    it('returns 403 for authenticated non-admin user (role: USER)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/admin/payments/p1/status')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'PAID' });
      expect(res.status).toBe(403);
    });

    it('returns 200 for authenticated admin user (role: ADMIN)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/admin/payments/p1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PAID' });
      expect(res.status).toBe(200);
      expect(mockAdminService.updatePaymentStatus).toHaveBeenCalledWith('p1', 'PAID');
    });
  });

  describe('POST /api/admin/pos/sale (createDirectSale)', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/pos/sale')
        .send({ items: [], total: 100 });
      expect(res.status).toBe(401);
    });

    it('returns 403 for authenticated non-admin user (role: USER)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/pos/sale')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [], total: 100 });
      expect(res.status).toBe(403);
    });

    it('returns 201 for authenticated admin user (role: ADMIN)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/pos/sale')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ items: [], total: 100 });
      expect(res.status).toBe(201);
      expect(mockAdminService.createDirectSale).toHaveBeenCalled();
    });
  });

  describe('Additional Audited Admin Routes', () => {
    it('returns 403 when non-admin attempts DELETE /api/admin/reviews/:id', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/admin/reviews/rev-1')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('returns 403 when non-admin attempts DELETE /api/admin/contact-messages/:id', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/admin/contact-messages/msg-1')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('returns 403 when non-admin attempts POST /api/admin/products/bulk', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/products/bulk')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ids: ['p1'], action: 'publish' });
      expect(res.status).toBe(403);
    });
  });
});
