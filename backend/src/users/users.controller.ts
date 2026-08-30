import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UploadsService } from '../uploads/uploads.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserCarDto } from './dto/create-user-car.dto';
import { UpdateUserCarDto } from './dto/update-user-car.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Patch('me')
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.update(userId, dto);
  }

  @Post('me/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.uploadsService.uploadImage(file);
    return this.usersService.update(userId, { image: url });
  }

  @Delete('me/avatar')
  @HttpCode(HttpStatus.OK)
  deleteAvatar(@CurrentUser('id') userId: string) {
    return this.usersService.update(userId, { image: null });
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

  @Get('me/cars')
  getCars(@CurrentUser('id') userId: string) {
    return this.usersService.getCars(userId);
  }

  @Post('me/cars')
  addCar(@CurrentUser('id') userId: string, @Body() dto: CreateUserCarDto) {
    return this.usersService.addCar(userId, dto);
  }

  @Patch('me/cars/:id')
  updateCar(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserCarDto,
  ) {
    return this.usersService.updateCar(userId, id, dto);
  }

  @Delete('me/cars/:id')
  removeCar(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.usersService.removeCar(userId, id);
  }

  @Post('me/change-password')
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }
}
