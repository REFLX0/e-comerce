import { Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  IsInt,
  IsNumber,
  Min,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @IsString() variantId: string;
  @IsInt() @Min(1) quantity: number;
}

export class ShippingDto {
  @IsString() fullName: string;
  @IsString() phone: string;
  @IsString() wilaya: string;
  @IsString() city: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingDto)
  shipping: ShippingDto;

  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() idempotencyKey?: string;
  @IsOptional() @IsString() paymentMethod?: string;
  @IsOptional() @IsNumber() @Min(0) shippingCost?: number;
}
