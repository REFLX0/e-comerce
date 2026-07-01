import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '@prisma/client'

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

  async createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data, include: { brand: true, category: true, variants: true } })
  }

  async updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id }, data })
  }

  async deleteProduct(id: string) {
    return this.prisma.product.update({ where: { id }, data: { isPublished: false } })
  }

  // ─── Orders ───────────────────────────────────────────────────────────────
  async getOrders(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit
    const where: any = {}
    if (status) where.status = status
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
}
