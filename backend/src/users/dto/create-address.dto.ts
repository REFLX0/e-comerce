import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsString() fullName: string;
  @IsString() phone: string;
  @IsString() city: string;
  @IsString() wilaya: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
