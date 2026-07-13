import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { CreateProductDto } from './dto/create-product.dto'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Dashboard Stats ───────────────────────────────────────────────────────
  async getDashboardStats() {
    const [totalOrders, totalRevenue, totalUsers, totalProducts, recentOrders] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { totalAmount: true } }),
      this.prisma.user.count(),
      this.prisma.product.count({ where: { isPublished: true } }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
    ])
    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
      totalUsers,
      totalProducts,
      recentOrders,
    }
  }

  // ─── Products ──────────────────────────────────────────────────────────────
  async getProduct(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { brand: true, category: true, variants: true, images: { orderBy: { sortOrder: 'asc' } } },
    })
  }

  async getProducts(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        include: { brand: true, category: true, variants: true, images: { take: 1 } },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      this.prisma.product.count(),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async createProduct(dto: CreateProductDto) {
    const { price, brandId, categoryId, stock, ...rest } = dto
    const sku = dto.sku || `SKU-${dto.slug || dto.nameFr}-${Date.now()}`
    const data: Prisma.ProductCreateInput = {
      ...rest,
      sku,
      brand: { connect: { id: brandId } },
      category: { connect: { id: categoryId } },
      isPublished: dto.isPublished ?? true,
      isFeatured: dto.isFeatured ?? false,
    }
    // Create a default variant when price is provided
    if (price !== undefined) {
      data.variants = {
        create: {
          volume: 'default',
          price,
          stockQty: stock ?? 0,
          skuVariant: `${sku}-default`,
        },
      }
    }
    return this.prisma.product.create({ data, include: { brand: true, category: true, variants: true } })
  }

  async updateProduct(id: string, data: any) {
    const { price, stock, ...productData } = data
    const updateData: any = { ...productData }

    // If price or stock is provided, update the first variant
    const variantUpdate: any = {}
    if (price !== undefined) variantUpdate.price = price
    if (stock !== undefined) variantUpdate.stockQty = stock

    if (Object.keys(variantUpdate).length > 0) {
      const existing = await this.prisma.product.findUnique({
        where: { id },
        select: { variants: { take: 1, select: { id: true } } },
      })
      if (existing?.variants.length) {
        updateData.variants = {
          update: { where: { id: existing.variants[0].id }, data: variantUpdate },
        }
      }
    }

    return this.prisma.product.update({ where: { id }, data: updateData })
  }

  async deleteProduct(id: string) {
    return this.prisma.product.update({ where: { id }, data: { isPublished: false } })
  }

  // ─── Orders ───────────────────────────────────────────────────────────────
  async getOrders(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit
    const where: any = {}
    const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
      where.status = status.toUpperCase()
    }
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where, skip, take: limit,
        include: { items: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async updateOrderStatus(id: string, status: string) {
    return this.prisma.order.update({ where: { id }, data: { status: status as any } })
  }

  // ─── Users ────────────────────────────────────────────────────────────────
  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, phone: true, createdAt: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: { select: { nameFr: true, images: { take: 1, select: { url: true } } } },
                variant: { select: { volume: true } },
              },
            },
          },
        },
      },
    })
    if (!user) return null
    const ltv = user.orders.reduce((sum, o) => sum + o.totalAmount, 0)
    return { ...user, ordersCount: user.orders.length, ltv }
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true, name: true, email: true, role: true, createdAt: true, phone: true,
          orders: {
            where: { status: 'DELIVERED' },
            select: { totalAmount: true },
          },
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' }, skip, take: limit,
      }),
      this.prisma.user.count(),
    ])

    // Map to include LTV
    const users = data.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      phone: u.phone,
      ordersCount: u._count.orders,
      ltv: u.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    }))

    return { data: users, total, page, totalPages: Math.ceil(total / limit) }
  }

  async updateUserRole(id: string, role: string) {
    return this.prisma.user.update({ where: { id }, data: { role: role as any } })
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────
  async getReviews(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        include: { product: { select: { nameFr: true, images: { take: 1, select: { url: true } } } }, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }, skip, take: limit,
      }),
      this.prisma.review.count(),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async updateReviewStatus(id: string, isApproved: boolean) {
    return this.prisma.review.update({ where: { id }, data: { isApproved } })
  }

  async deleteReview(id: string) {
    return this.prisma.review.delete({ where: { id } })
  }

  // ─── Payments ─────────────────────────────────────────────────────────────
  async getPayments(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        include: {
          order: {
            include: {
              user: { select: { name: true, email: true } },
              items: { take: 1, include: { product: { select: { nameFr: true } } } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count(),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async updatePaymentStatus(id: string, status: string) {
    return this.prisma.payment.update({ where: { id }, data: { status: status as any } })
  }
}
