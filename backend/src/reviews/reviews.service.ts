import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getByProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) return [];
    return this.prisma.review.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createReview(
    productId: string,
    data: {
      rating: number;
      comment: string;
      authorName?: string;
      userId?: string;
    },
  ) {
    return this.prisma.review.create({
      data: {
        productId,
        rating: data.rating,
        comment: data.comment,
        authorName: data.authorName || 'Anonyme',
        userId: data.userId,
        isApproved: true, // Auto approve for demo
      },
    });
  }
}
