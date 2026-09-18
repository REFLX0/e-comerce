import { Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsEmail,
  IsInt,
  IsNumber,
  Max,
  Min,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @IsString() variantId: string;
  @IsInt() @Min(1) @Max(1000) quantity: number;
}

export class ShippingDto {
  @IsString() fullName: string;
  @IsString() phone: string;
  @IsString() wilaya: string;
  @IsString() city: string;
  // Stored on the order so guest checkouts can still be emailed later.
  @IsOptional() @IsEmail() email?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingDto)
  shipping: ShippingDto;

  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() vehicleVin?: string;
  @IsOptional() @IsString() idempotencyKey?: string;
  @IsOptional() @IsString() paymentMethod?: string;
  @IsOptional() @IsNumber() @Min(0) shippingCost?: number;
  @IsOptional() @IsString() promoCode?: string;
}
