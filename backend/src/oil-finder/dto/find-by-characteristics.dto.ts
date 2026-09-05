import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FindByCharacteristicsDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'displacementCc must be a valid number' })
  @IsPositive({ message: 'displacementCc must be a positive number' })
  displacementCc: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'powerHp must be a valid number' })
  @IsPositive({ message: 'powerHp must be a positive number' })
  powerHp: number;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'fuelType must be a string' })
  @IsNotEmpty({ message: 'fuelType is required' })
  @MaxLength(100, { message: 'fuelType must not exceed 100 characters' })
  fuelType: string;
}
