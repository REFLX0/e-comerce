import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('admin / notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  findAll(@Query('page') p?: string, @Query('limit') l?: string) {
    return this.service.findAll(p ? +p : 1, l ? +l : 20);
  }

  @Get('unread-count')
  unreadCount() {
    return this.service.unreadCount();
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }

  @Patch('mark-all-read')
  @HttpCode(HttpStatus.OK)
  markAllRead() {
    return this.service.markAllRead();
  }
}
