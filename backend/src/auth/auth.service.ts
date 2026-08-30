import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
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
  private redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {
    this.redis = new Redis({
      host: this.config.get('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
    });
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
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // Send security login notification
    this.mailService.sendLoginAlerts({
      email: user.email,
      name: user.name ?? '',
      role: user.role,
    }).catch(() => {});

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    const userId = await this.redis.get(`refresh:${refreshToken}`);
    if (!userId)
      throw new UnauthorizedException('Invalid or expired refresh token');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    // Rotate: delete old, issue new
    await this.redis.del(`refresh:${refreshToken}`);
    return this.generateTokens(user);
  }

  async logout(refreshToken: string) {
    await this.redis.del(`refresh:${refreshToken}`);
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

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '7d',
    });

    const refreshToken = crypto.randomUUID();
    const refreshTtl = 60 * 60 * 24 * 7; // 7 days
    await this.redis.setex(`refresh:${refreshToken}`, refreshTtl, user.id);

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
        createdAt: user.createdAt.toISOString(),
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
