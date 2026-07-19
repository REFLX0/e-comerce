import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VariantDto {
  @ApiProperty() @IsString() @MinLength(1) volume: string;
  @ApiProperty() @IsNumber() @Min(0) price: number;
  @ApiProperty() @IsNumber() @Min(0) stockQty: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

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
  @ApiProperty({ required: false, type: [VariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];
}
