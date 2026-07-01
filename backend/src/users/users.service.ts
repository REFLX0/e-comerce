import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { CreateAddressDto } from './dto/create-address.dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { addresses: true },
    })
    if (!user) throw new NotFoundException('User not found')
    const { passwordHash, ...safe } = user
    return safe
  }

  async update(id: string, dto: UpdateProfileDto) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.firstName && dto.lastName ? `${dto.firstName} ${dto.lastName}` : undefined,
        phone: dto.phone,
      },
    })
    const { passwordHash, ...safe } = updated
    return safe
  }

  async getOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId } })
  }

  async addAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }
    return this.prisma.address.create({
      data: { userId, ...dto },
    })
  }

  async removeAddress(userId: string, addressId: string) {
    const addr = await this.prisma.address.findUnique({ where: { id: addressId } })
    if (!addr) throw new NotFoundException('Address not found')
    if (addr.userId !== userId) throw new ForbiddenException()
    return this.prisma.address.delete({ where: { id: addressId } })
  }
}
