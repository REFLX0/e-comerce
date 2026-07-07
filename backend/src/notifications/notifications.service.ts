import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count(),
    ])
    return { data, total, page, limit }
  }

  async unreadCount() {
    return this.prisma.notification.count({ where: { read: false } })
  }

  async markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { read: true } })
  }

  async markAllRead() {
    await this.prisma.notification.updateMany({ where: { read: false }, data: { read: true } })
    return { ok: true }
  }

  async create(data: { type: string; title: string; message?: string; link?: string }) {
    return this.prisma.notification.create({ data })
  }
}
