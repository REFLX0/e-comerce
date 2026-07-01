import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTicketDto } from './dto/create-ticket.dto'

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTicketDto) {
    // Validate order exists and belongs to user if orderId is provided
    if (dto.orderId) {
      const order = await this.prisma.order.findFirst({
        where: { id: dto.orderId, userId },
      })
      if (!order) throw new NotFoundException('Order not found or does not belong to user')
    }

    return this.prisma.supportTicket.create({
      data: {
        userId,
        type: dto.type,
        reason: dto.reason,
        message: dto.message,
        orderId: dto.orderId,
      },
    })
  }

  async findAllForUser(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      include: {
        order: { select: { id: true, items: { include: { product: { select: { nameFr: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findAllForAdmin(status?: string) {
    const where = status ? { status: status as any } : {}
    return this.prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async resolveTicket(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } })
    if (!ticket) throw new NotFoundException('Ticket not found')
    
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status: 'RESOLVED' },
    })
  }
}
