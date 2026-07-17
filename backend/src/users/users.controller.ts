import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Post,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Patch('me')
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.update(userId, dto);
  }

  @Get('me/orders')
  getMyOrders(@CurrentUser('id') userId: string) {
    return this.usersService.getOrders(userId);
  }

  @Get('me/addresses')
  getAddresses(@CurrentUser('id') userId: string) {
    return this.usersService.getAddresses(userId);
  }

  @Post('me/addresses')
  addAddress(@CurrentUser('id') userId: string, @Body() dto: CreateAddressDto) {
    return this.usersService.addAddress(userId, dto);
  }

  @Delete('me/addresses/:id')
  removeAddress(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.usersService.removeAddress(userId, id);
  }

  @Post('me/change-password')
  changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(userId, dto);
  }

  @Public()
  @Post('newsletter')
  subscribeNewsletter(@Body('email') email: string) {
    return this.usersService.subscribeNewsletter(email);
  }
}
