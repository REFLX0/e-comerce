import { Controller, Post, Get, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // COD order — can be placed by guests (no auth required)
  // OptionalJwtAuthGuard extracts userId from cookie/header if present
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateOrderDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.ordersService.create(dto, userId)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.ordersService.findAll(userId)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.ordersService.findOne(id, userId)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.ordersService.cancel(id, userId)
  }
}
