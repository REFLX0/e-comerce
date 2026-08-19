import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserCarDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  makeSlug?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  modelSlug?: string;

  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsString()
  @MinLength(17)
  @MaxLength(17)
  vin?: string;

  @IsOptional()
  @IsString()
  engine?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(10)
  displacement?: number;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(16)
  cylinders?: number;

  @IsOptional()
  @IsString()
  fuel?: string;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(2000)
  power?: number;

  @IsOptional()
  @IsString()
  transmission?: string;

  @IsOptional()
  @IsString()
  trim?: string;

  @IsOptional()
  @IsString()
  productionDate?: string;

  @IsInt()
  @Min(0)
  currentMileage: number;

  @IsInt()
  @Min(0)
  lastOilChangeMileage: number;

  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(50000)
  oilChangeIntervalKm?: number;

  @IsOptional()
  @IsBoolean()
  oilFilterChanged?: boolean;

  @IsOptional()
  @IsBoolean()
  airFilterChanged?: boolean;

  @IsOptional()
  @IsBoolean()
  cabinFilterChanged?: boolean;
}