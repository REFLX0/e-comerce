import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShippingZoneDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsNumber() price: number;
  @ApiProperty() @IsString() eta: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() sortOrder?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
}
