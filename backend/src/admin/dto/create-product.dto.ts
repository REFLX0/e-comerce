import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty() @IsString() @MinLength(1) nameFr: string;
  @ApiProperty() @IsString() @MinLength(1) slug: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  sku?: string;
  @ApiProperty() @IsString() @MinLength(1) description: string;
  @ApiProperty() @IsString() @MinLength(1) brandId: string;
  @ApiProperty() @IsString() @MinLength(1) categoryId: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  images?: string[];
  @ApiProperty({ required: false }) @IsOptional() variants?: Array<{
    volume: string;
    price: number;
    stockQty: number;
  }>;
}
