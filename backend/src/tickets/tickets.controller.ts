import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { TicketsService } from './tickets.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // ─── CLIENT ENDPOINTS ────────────────────────────────────────────────────────

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTicketDto) {
    return this.ticketsService.create(userId, dto)
  }

  @Get('my-tickets')
  findMyTickets(@CurrentUser('id') userId: string) {
    return this.ticketsService.findAllForUser(userId)
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll(@Query('status') status?: string) {
    return this.ticketsService.findAllForAdmin(status)
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/resolve')
  @HttpCode(HttpStatus.OK)
  resolve(@Param('id') id: string) {
    return this.ticketsService.resolveTicket(id)
  }
}
