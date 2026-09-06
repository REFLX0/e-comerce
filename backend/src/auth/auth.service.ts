import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Redis } from 'ioredis';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private redis: Redis | null = null;
  private inMemoryTokens = new Map<string, { userId: string; expiresAt: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {
    try {
      const host = this.config.get('REDIS_HOST', 'redis');
      const port = this.config.get<number>('REDIS_PORT', 6379);
      this.redis = new Redis({
        host,
        port,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
      });
      this.redis.on('error', () => {
        // Silently ignore when running locally without Redis
      });
      this.redis.connect().catch(() => {
        this.redis = null;
      });
    } catch {
      this.redis = null;
    }
  }



  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: `${dto.firstName} ${dto.lastName}`,
        email: dto.email,
        passwordHash: hash,
        phone: dto.phone,
        role: 'CUSTOMER',
      },
    });

    // Send Welcome Email to User + New User Alert to Admin
    this.mailService.sendWelcomeEmails({
      email: user.email,
      name: user.name ?? 'Client',
      phone: user.phone,
    }).catch(() => {});

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    try {
      const email = (dto.email || '').toLowerCase().trim();
      const password = (dto.password || '').trim();

      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.passwordHash) {
        throw new UnauthorizedException('Identifiants invalides');
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        throw new UnauthorizedException('Identifiants invalides');
      }

      // Send security alert in background
      try {
        this.mailService
          .sendLoginAlerts({
            email: user.email,
            name: user.name ?? '',
            role: user.role,
          })
          .catch(() => {});
      } catch {}

      return await this.generateTokens(user as any);
    } catch (err: any) {
      if (err instanceof UnauthorizedException || err instanceof ConflictException) {
        throw err;
      }
      this.logger.error(`Login error for ${dto.email}: ${err.message}`, err.stack);
      throw new UnauthorizedException(err.message || 'Erreur de connexion. Veuillez vérifier vos identifiants.');
    }
  }

  async refresh(refreshToken: string) {
    let userId: string | null = null;
    try {
      if (this.redis) {
        userId = await this.redis.get(`refresh:${refreshToken}`);
        if (userId) await this.redis.del(`refresh:${refreshToken}`);
      }
    } catch {}

    if (!userId) {
      const mem = this.inMemoryTokens.get(`refresh:${refreshToken}`);
      if (mem && mem.expiresAt > Date.now()) {
        userId = mem.userId;
        this.inMemoryTokens.delete(`refresh:${refreshToken}`);
      }
    }

    if (!userId)
      throw new UnauthorizedException('Invalid or expired refresh token');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    return this.generateTokens(user);
  }

  async logout(refreshToken: string) {
    try {
      if (this.redis) await this.redis.del(`refresh:${refreshToken}`);
    } catch {}
    this.inMemoryTokens.delete(`refresh:${refreshToken}`);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: {
    id: string;
    email: string;
    name: string | null;
    image?: string | null;
    phone: string | null;
    role: string;
    createdAt: Date;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const jwtSecret = this.config.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured in the environment');
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: '7d',
    });

    const refreshToken = crypto.randomUUID();
    const refreshTtl = 60 * 60 * 24 * 7; // 7 days

    try {
      if (this.redis) {
        await this.redis.setex(`refresh:${refreshToken}`, refreshTtl, user.id);
      } else {
        this.inMemoryTokens.set(`refresh:${refreshToken}`, {
          userId: user.id,
          expiresAt: Date.now() + refreshTtl * 1000,
        });
      }
    } catch {
      this.inMemoryTokens.set(`refresh:${refreshToken}`, {
        userId: user.id,
        expiresAt: Date.now() + refreshTtl * 1000,
      });
    }

    const [firstName = '', ...lastNameParts] = (user.name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? '',
        firstName,
        lastName: lastNameParts.join(' '),
        phone: user.phone ?? undefined,
        image: user.image ?? undefined,
        role: user.role,
        addresses: [],
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600_000); // 1 hour
      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: token, resetPasswordExpires: expires },
      });
      await this.mailService.sendPasswordResetEmail(email, token);
    }
    return { message: 'If an account exists, a reset link was sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Invalid or expired reset token');
    const hash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
    return { message: 'Password reset successfully' };
  }

  async subscribeNewsletter(email: string) {
    // In a real app this would save to a Newsletter subscriber table or external API (like Resend/Mailchimp).
    // For now we just return success to resolve the fake API call in the frontend.
    return { success: true, email };
  }
}
