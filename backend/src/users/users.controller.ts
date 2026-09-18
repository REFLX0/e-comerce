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
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
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
import { IMAGE_UPLOAD_LIMITS, imageFileFilter } from '../uploads/image-upload';
import { setAccessTokenCookie } from '../common/utils/auth-cookies';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadsService: UploadsService,
    private readonly jwtService: JwtService,
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
    // Without a fileFilter any signed-in customer could upload an arbitrary
    // file type; the stored name keeps its extension and nginx serves
    // /uploads/ straight off disk, so an .html/.svg upload became script
    // execution on our own origin.
    FileInterceptor('file', {
      limits: { fileSize: IMAGE_UPLOAD_LIMITS.avatarBytes },
      fileFilter: imageFileFilter,
    }),
  )
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No image file received');
    }
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
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.usersService.changePassword(userId, dto);
    // The change invalidates every token minted before it, including the one
    // that authenticated this request - hand this session a fresh cookie so
    // only the *other* sessions get signed out.
    const accessToken = this.jwtService.sign({
      sub: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });
    setAccessTokenCookie(res, accessToken);
    return { success: true };
  }
}
