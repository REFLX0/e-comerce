import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsString() fullName: string;
  @IsString() phone: string;
  @IsOptional() @IsString() address?: string;
  @IsString() city: string;
  @IsString() wilaya: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
