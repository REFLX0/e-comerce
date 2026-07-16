import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard') getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('products') getProducts(
    @Query('page') p?: string,
    @Query('limit') l?: string,
  ) {
    return this.adminService.getProducts(p ? +p : 1, l ? +l : 20);
  }
  @Get('products/:id') getProduct(@Param('id') id: string) {
    return this.adminService.getProduct(id);
  }
  @Post('products') async createProduct(@Body() dto: CreateProductDto) {
    try {
      return await this.adminService.createProduct(dto);
    } catch (err: any) {
      if (
        err?.code === 'P2002' ||
        err?.code === 'P2003' ||
        err?.code === 'P2025'
      ) {
        throw new BadRequestException(
          'Validation failed: the provided brand, category, or unique fields are invalid or already in use.',
        );
      }
      throw err;
    }
  }
  @Patch('products/:id') updateProduct(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateProduct(id, body);
  }
  @Delete('products/:id') @HttpCode(HttpStatus.OK) deleteProduct(
    @Param('id') id: string,
  ) {
    return this.adminService.deleteProduct(id);
  }
  @Post('products/bulk') bulkProducts(@Body() body: { ids: string[]; action: string }) {
    return this.adminService.bulkProducts(body.ids, body.action);
  }
  @Post('products/:id/duplicate') duplicateProduct(@Param('id') id: string) {
    return this.adminService.duplicateProduct(id);
  }
  @Patch('products/:id/publish') publishProduct(@Param('id') id: string, @Body('isPublished') isPublished: boolean) {
    return this.adminService.updateProduct(id, { isPublished });
  }
  @Get('products/export') exportProducts() {
    return this.adminService.exportProducts();
  }

  @Get('orders') getOrders(
    @Query('page') p?: string,
    @Query('status') s?: string,
  ) {
    return this.adminService.getOrders(p ? +p : 1, 20, s);
  }
  @Get('orders/export') exportOrders(@Query('status') s?: string) {
    return this.adminService.exportOrders(s);
  }
  @Patch('orders/:id/status') updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateOrderStatus(id, status);
  }

  @Get('users') getUsers(@Query('page') p?: string) {
    return this.adminService.getUsers(p ? +p : 1);
  }
  @Get('users/:id') getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }
  @Patch('users/:id/role') updateUserRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Get('reviews') getReviews(
    @Query('page') p?: string,
    @Query('limit') l?: string,
  ) {
    return this.adminService.getReviews(p ? +p : 1, l ? +l : 20);
  }
  @Patch('reviews/:id/status') updateReviewStatus(
    @Param('id') id: string,
    @Body('isApproved') isApproved: boolean,
  ) {
    return this.adminService.updateReviewStatus(id, isApproved);
  }
  @Delete('reviews/:id') deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(id);
  }

  @Get('payments') getPayments(
    @Query('page') p?: string,
    @Query('limit') l?: string,
  ) {
    return this.adminService.getPayments(p ? +p : 1, l ? +l : 20);
  }
  @Patch('payments/:id/status') updatePaymentStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updatePaymentStatus(id, status);
  }
}
