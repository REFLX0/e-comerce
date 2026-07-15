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

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
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

    return coupon;
  }
}
