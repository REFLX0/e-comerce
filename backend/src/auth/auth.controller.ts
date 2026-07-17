import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.register(dto);
    res.cookie('access_token', data.accessToken, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production' &&
        process.env.FRONTEND_URL?.startsWith('https'),
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return data;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.login(dto);
    res.cookie('access_token', data.accessToken, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production' &&
        process.env.FRONTEND_URL?.startsWith('https'),
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return data;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body('refreshToken') token: string) {
    return this.authService.refresh(token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @Body('refreshToken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('access_token');
    if (token) {
      return this.authService.logout(token);
    }
    return { success: true };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Post('newsletter')
  @HttpCode(HttpStatus.OK)
  subscribeNewsletter(@Body('email') email: string) {
    return this.authService.subscribeNewsletter(email);
  }
}
