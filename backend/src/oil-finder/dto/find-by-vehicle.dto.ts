import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindByVehicleDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'make must be a string' })
  @IsNotEmpty({ message: 'make is required' })
  @MaxLength(100, { message: 'make must not exceed 100 characters' })
  make: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'model must be a string' })
  @IsNotEmpty({ message: 'model is required' })
  @MaxLength(100, { message: 'model must not exceed 100 characters' })
  model: string;

  @Transform(({ obj, value }) => {
    const raw = value ?? obj?.engine;
    return typeof raw === 'string' ? raw.trim() || undefined : undefined;
  })
  @IsOptional()
  @IsString({ message: 'engineCode must be a string' })
  @MaxLength(100, { message: 'engineCode must not exceed 100 characters' })
  engineCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  engine?: string;
}
