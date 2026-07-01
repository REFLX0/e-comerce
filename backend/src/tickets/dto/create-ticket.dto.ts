import { IsString, IsEnum, IsOptional } from 'class-validator'
import { TicketType } from '@prisma/client'

export class CreateTicketDto {
  @IsEnum(TicketType)
  type: TicketType

  @IsString()
  reason: string

  @IsOptional()
  @IsString()
  message?: string

  @IsOptional()
  @IsString()
  orderId?: string
}
