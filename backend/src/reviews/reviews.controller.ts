import { Controller, Get, Param, Post, Body } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ReviewsService } from './reviews.service'

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('products/:id/reviews')
  getByProduct(@Param('id') id: string) {
    return this.reviewsService.getByProduct(id)
  }

  @Post('products/:id/reviews')
  createReview(@Param('id') id: string, @Body() body: { rating: number; comment: string; authorName?: string; userId?: string }) {
    return this.reviewsService.createReview(id, body)
  }
}
