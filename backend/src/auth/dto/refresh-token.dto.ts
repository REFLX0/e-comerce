import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * The refresh token normally travels in the HttpOnly `refresh_token` cookie;
 * the body field stays supported for non-browser clients.
 */
export class RefreshTokenDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
