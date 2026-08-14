import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getByProduct(productId: string, page = 1, limit = 10) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const where = { productId, isApproved: true };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return { data, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  async createReview(productId: string, data: { rating: number; comment: string; userId?: string }) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (!data.userId) throw new BadRequestException('Authentication is required to submit a review');
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const comment = data.comment?.trim();
    if (!comment || comment.length < 10 || comment.length > 500) {
      throw new BadRequestException('Review comment must contain between 10 and 500 characters');
    }

    const deliveredPurchase = await this.prisma.orderItem.findFirst({
      where: { productId, order: { userId: data.userId, status: 'DELIVERED' } },
      select: { id: true },
    });
    if (!deliveredPurchase) {
      throw new BadRequestException('Only customers with a delivered purchase can review this product');
    }

    const existingReview = await this.prisma.review.findFirst({
      where: { productId, userId: data.userId },
      select: { id: true },
    });
    if (existingReview) throw new BadRequestException('You have already reviewed this product');

    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
      select: { name: true },
    });
    const authorName = user?.name?.trim() || 'Client vérifié';

    const review = await this.prisma.review.create({
      data: { productId, rating: data.rating, comment, authorName, userId: data.userId, isApproved: false },
    });
    await this.prisma.notification.create({
      data: {
        type: 'new_review',
        title: 'Nouvel avis à modérer',
        message: `${authorName} a laissé un avis sur ${product.nameFr}`,
        link: '/admin/reviews',
      },
    });
    return review;
  }
}
