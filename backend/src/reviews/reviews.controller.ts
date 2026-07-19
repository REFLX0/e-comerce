import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('products/:id/reviews')
  getByProduct(@Param('id') id: string) {
    return this.reviewsService.getByProduct(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('products/:id/reviews')
  createReview(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      rating: number;
      comment: string;
      authorName?: string;
    },
  ) {
    return this.reviewsService.createReview(id, { ...body, userId });
  }
}
