import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  // Kept in step with RegisterDto - a reset must not be a way to set a weaker
  // password than registration allows.
  @IsString()
  @MinLength(8)
  password: string;
}
