import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
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
  plateNumber?: string;

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
