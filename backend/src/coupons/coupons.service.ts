import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code },
    });
    if (existing) throw new BadRequestException('Coupon code already exists');

    return this.prisma.coupon.create({
      data: {
        code: dto.code,
        type: dto.type,
        value: dto.value,
        minAmount: dto.minAmount,
        maxUses: dto.maxUses,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.coupon.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coupon.count(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, data: Prisma.CouponUpdateInput) {
    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.coupon.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return this.prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });
  }

  // Used by clients at checkout
  async validateCode(code: string, cartTotal: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon) throw new NotFoundException('Invalid coupon code');

    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit reached');
    }
    if (coupon.minAmount && cartTotal < coupon.minAmount) {
      throw new BadRequestException(
        `Minimum cart amount is ${coupon.minAmount} TND`,
      );
    }

    let discount = 0;
    if (coupon.type === 'PERCENT') {
      discount = parseFloat((cartTotal * (coupon.value / 100)).toFixed(3));
    } else if (coupon.type === 'FIXED') {
      discount = coupon.value;
    } else if (coupon.type === 'SHIPPING') {
      discount = 0; // shipping handled separately
    }

    return {
      ...coupon,
      discount,
    };
  }

  async applyCoupon(code: string, cartTotal: number) {
    const result = await this.validateCode(code, cartTotal);
    await this.prisma.coupon.update({
      where: { id: result.id },
      data: { currentUses: { increment: 1 } },
    });
    return result;
  }
}
