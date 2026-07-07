import { IsOptional, IsString, IsInt, IsNumber, Min, IsEnum } from 'class-validator'
import { Type, Transform } from 'class-transformer'
import { VehicleType, FuelType } from '@prisma/client'

export class OilRecommendationsDto {
  @Transform(({ value }) => (value as string)?.toUpperCase())
  @IsEnum(VehicleType)
  type: VehicleType

  @IsOptional()
  @IsString()
  make?: string

  @Type(() => Number)
  @IsInt()
  @Min(0)
  cylinders: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  power: number

  @Transform(({ value }) => (value as string)?.toUpperCase())
  @IsEnum(FuelType)
  fuelType: FuelType
}
