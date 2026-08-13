import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserCarDto } from './dto/create-user-car.dto';
import { UpdateUserCarDto } from './dto/update-user-car.dto';
import * as bcrypt from 'bcryptjs';

type UserWithPasswordHash = { passwordHash?: string | null };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { addresses: true, cars: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.toSafeUser(user);
  }

  async update(id: string, dto: UpdateProfileDto) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name:
          dto.firstName && dto.lastName
            ? `${dto.firstName} ${dto.lastName}`
            : undefined,
        phone: dto.phone,
      },
    });
    return this.toSafeUser(updated);
  }

  async getOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId } });
  }

  async addAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({
      data: { userId, ...dto },
    });
  }

  async removeAddress(userId: string, addressId: string) {
    const addr = await this.prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!addr) throw new NotFoundException('Address not found');
    if (addr.userId !== userId) throw new ForbiddenException();
    return this.prisma.address.delete({ where: { id: addressId } });
  }

  async getCars(userId: string) {
    return this.prisma.userCar.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async addCar(userId: string, dto: CreateUserCarDto) {
    if (dto.lastOilChangeMileage > dto.currentMileage) {
      throw new BadRequestException(
        'Last oil change mileage cannot exceed current mileage',
      );
    }

    return this.prisma.userCar.create({
      data: {
        userId,
        name: dto.name.trim(),
        make: this.optionalString(dto.make),
        model: this.optionalString(dto.model),
        year: dto.year,
        plateNumber: this.optionalString(dto.plateNumber),
        currentMileage: dto.currentMileage,
        lastOilChangeMileage: dto.lastOilChangeMileage,
        oilChangeIntervalKm: dto.oilChangeIntervalKm ?? 10000,
        oilFilterChanged: dto.oilFilterChanged ?? false,
        airFilterChanged: dto.airFilterChanged ?? false,
        cabinFilterChanged: dto.cabinFilterChanged ?? false,
      },
    });
  }

  async updateCar(userId: string, carId: string, dto: UpdateUserCarDto) {
    const car = await this.prisma.userCar.findUnique({ where: { id: carId } });
    if (!car) throw new NotFoundException('Car not found');
    if (car.userId !== userId) throw new ForbiddenException();

    const currentMileage = dto.currentMileage ?? car.currentMileage;
    // This is an action, not a persisted status: confirming it starts a new
    // oil-change cycle at the car's current mileage.
    const oilChangeDoneNow = dto.oilChangeDone === true;
    const lastOilChangeMileage = oilChangeDoneNow
      ? currentMileage
      : (dto.lastOilChangeMileage ?? car.lastOilChangeMileage);

    if (lastOilChangeMileage > currentMileage) {
      throw new BadRequestException(
        'Last oil change mileage cannot exceed current mileage',
      );
    }

    return this.prisma.userCar.update({
      where: { id: carId },
      data: {
        name: dto.name?.trim(),
        make:
          dto.make === undefined ? undefined : this.optionalString(dto.make),
        model:
          dto.model === undefined ? undefined : this.optionalString(dto.model),
        year: dto.year,
        plateNumber:
          dto.plateNumber === undefined
            ? undefined
            : this.optionalString(dto.plateNumber),
        currentMileage,
        lastOilChangeMileage,
        oilChangeIntervalKm: dto.oilChangeIntervalKm,
        oilChangeDone: false,
        oilFilterChanged: dto.oilFilterChanged,
        airFilterChanged: dto.airFilterChanged,
        cabinFilterChanged: dto.cabinFilterChanged,
      },
    });
  }

  async removeCar(userId: string, carId: string) {
    const car = await this.prisma.userCar.findUnique({ where: { id: carId } });
    if (!car) throw new NotFoundException('Car not found');
    if (car.userId !== userId) throw new ForbiddenException();
    return this.prisma.userCar.delete({ where: { id: carId } });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new ForbiddenException('Cannot change password for this user');
    }
    const valid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!valid) throw new ForbiddenException('Ancien mot de passe incorrect');

    const hash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });
    return { success: true };
  }

  private optionalString(value?: string) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private toSafeUser<T extends UserWithPasswordHash>(user: T) {
    const safe = { ...user };
    delete safe.passwordHash;
    return safe as Omit<T, 'passwordHash'>;
  }
}
