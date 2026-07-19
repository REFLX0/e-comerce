import { IsString, IsEmail, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class SubmitContactDto {
  @IsString() @MinLength(2) name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() @MinLength(3) subject: string;
  @IsString() @MinLength(10) message: string;
  @IsOptional() @IsBoolean() isProfessional?: boolean;
}
