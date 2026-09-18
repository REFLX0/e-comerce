import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          const token = request?.cookies?.access_token;
          if (token) return token;
          return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        },
      ]),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    iat?: number;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException();

    // Tokens minted before the last password change are dead, so resetting a
    // password actually signs out whoever else was holding a token.
    if (user.passwordChangedAt && payload.iat) {
      const issuedAtMs = payload.iat * 1000;
      // 1s of slack: `iat` is second-resolution, so a token minted in the same
      // second as the change would otherwise be rejected.
      if (issuedAtMs < user.passwordChangedAt.getTime() - 1000) {
        throw new UnauthorizedException(
          'Session expired, please sign in again',
        );
      }
    }

    return { id: user.id, email: user.email, role: user.role };
  }
}
