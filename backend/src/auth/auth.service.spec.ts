import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';

// ── helpers ──────────────────────────────────────────────────────────────────

function makePrisma() {
  return {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
}

function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: bcrypt.hashSync('correctpassword', 1),
    phone: null,
    image: null,
    role: 'CUSTOMER',
    createdAt: new Date(),
    resetPasswordToken: null,
    resetPasswordExpires: null,
    ...overrides,
  };
}

function makeJwt() {
  return { sign: jest.fn().mockReturnValue('mock-access-token') } as unknown as JwtService;
}

function makeConfig() {
  return { get: jest.fn().mockReturnValue('super-secret-jwt-at-least-16ch') } as unknown as ConfigService;
}

function makeMail() {
  return {
    sendWelcomeEmails: jest.fn().mockResolvedValue(undefined),
    sendLoginAlerts: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  } as unknown as MailService;
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof makePrisma>;
  let jwtService: JwtService;
  let mailService: MailService;

  beforeEach(async () => {
    prisma = makePrisma();
    jwtService = makeJwt();
    mailService = makeMail();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: makeConfig() },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── register ─────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('creates a new user and returns tokens', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.user.create as jest.Mock).mockResolvedValueOnce(makeUser());

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: null,
      } as any);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException when email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(makeUser());

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          phone: null,
        } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('returns tokens on valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(makeUser());

      const result = await service.login({
        email: 'test@example.com',
        password: 'correctpassword',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('throws UnauthorizedException for wrong password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(makeUser());

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.login({ email: 'noone@example.com', password: 'anypassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user has no passwordHash (OAuth user)', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(
        makeUser({ passwordHash: null }),
      );

      await expect(
        service.login({ email: 'test@example.com', password: 'correctpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── refresh ───────────────────────────────────────────────────────────────

  describe('refresh()', () => {
    it('throws UnauthorizedException on missing/unknown refresh token', async () => {
      // No Redis in unit test context — falls through to inMemoryTokens which is empty
      await expect(service.refresh('unknown-token-xyz')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── forgotPassword ────────────────────────────────────────────────────────

  describe('forgotPassword()', () => {
    it('returns the same message regardless of whether the email exists (no enumeration)', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const result = await service.forgotPassword('ghost@example.com');
      expect(result.message).toMatch(/If an account exists/);
    });

    it('creates a reset token when the email exists', async () => {
      const user = makeUser();
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
      (prisma.user.update as jest.Mock).mockResolvedValueOnce(user);

      await service.forgotPassword('test@example.com');

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ resetPasswordToken: expect.any(String) }),
        }),
      );
    });
  });

  // ── resetPassword ─────────────────────────────────────────────────────────

  describe('resetPassword()', () => {
    it('updates passwordHash on a valid token', async () => {
      const user = makeUser();
      (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(user);
      (prisma.user.update as jest.Mock).mockResolvedValueOnce(user);

      const result = await service.resetPassword('valid-token', 'newpassword123');

      expect(result.message).toContain('success');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: expect.any(String),
            resetPasswordToken: null,
          }),
        }),
      );
    });

    it('throws BadRequestException on invalid or expired token', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.resetPassword('bad-token', 'newpassword123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
