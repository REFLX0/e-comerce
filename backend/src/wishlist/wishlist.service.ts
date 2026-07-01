import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: string, productId: string) {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    })

    if (existing) {
      await this.prisma.wishlistItem.delete({ where: { id: existing.id } })
      return { added: false }
    } else {
      await this.prisma.wishlistItem.create({ data: { userId, productId } })
      return { added: true }
    }
  }

  async findAll(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            nameFr: true,
            slug: true,
            description: true,
            brand: { select: { name: true } },
            images: { take: 1, select: { url: true } },
            variants: { select: { price: true, stockQty: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
