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

  private async resolveMakeAndModel(
    make?: string,
    makeSlug?: string,
    model?: string,
    modelSlug?: string,
  ) {
    let resolvedMake = make?.trim();
    let resolvedMakeSlug = makeSlug?.trim();
    let resolvedModel = model?.trim();
    let resolvedModelSlug = modelSlug?.trim();

    if (resolvedMake || resolvedMakeSlug) {
      const makeQuery = (resolvedMakeSlug || resolvedMake || '').toLowerCase();
      let matchedMake = await this.prisma.vehicleMake.findFirst({
        where: {
          OR: [
            { slug: makeQuery },
            { name: { equals: makeQuery, mode: 'insensitive' as const } },
            ...(makeQuery === 'volkswagen' || makeQuery === 'vw'
              ? [
                  { slug: 'vw' },
                  { name: { contains: 'vw', mode: 'insensitive' as const } },
                  { slug: 'volkswagen' },
                ]
              : []),
          ],
        },
      });

      if (matchedMake) {
        resolvedMake = matchedMake.name;
        resolvedMakeSlug = matchedMake.slug;

        if (resolvedModel || resolvedModelSlug) {
          const modelQuery = (resolvedModelSlug || resolvedModel || '').toLowerCase();
          let matchedModel = await this.prisma.vehicleModel.findFirst({
            where: {
              makeId: matchedMake.id,
              OR: [
                { slug: modelQuery },
                { name: { equals: modelQuery, mode: 'insensitive' as const } },
                { slug: { contains: modelQuery, mode: 'insensitive' as const } },
                { name: { contains: modelQuery, mode: 'insensitive' as const } },
              ],
            },
            orderBy: {
              compatibilities: { _count: 'desc' },
            },
          });

          if (matchedModel) {
            resolvedModel = matchedModel.name;
            resolvedModelSlug = matchedModel.slug;
          }
        }
      }
    }

    if (!resolvedMakeSlug && resolvedMake) {
      resolvedMakeSlug = resolvedMake.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (!resolvedModelSlug && resolvedModel) {
      resolvedModelSlug = resolvedModel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    return {
      make: this.optionalString(resolvedMake),
      makeSlug: this.optionalString(resolvedMakeSlug),
      model: this.optionalString(resolvedModel),
      modelSlug: this.optionalString(resolvedModelSlug),
    };
  }

  async addCar(userId: string, dto: CreateUserCarDto) {
    if (dto.lastOilChangeMileage > dto.currentMileage) {
      throw new BadRequestException(
        'Last oil change mileage cannot exceed current mileage',
      );
    }

    const { make, makeSlug, model, modelSlug } = await this.resolveMakeAndModel(
      dto.make,
      dto.makeSlug,
      dto.model,
      dto.modelSlug,
    );

    return this.prisma.userCar.create({
      data: {
        userId,
        name: dto.name.trim(),
        make,
        makeSlug,
        model,
        modelSlug,
        year: dto.year,
        vin: this.optionalString(dto.vin),
        engine: this.optionalString(dto.engine),
        displacement: dto.displacement,
        cylinders: dto.cylinders,
        fuel: this.optionalString(dto.fuel),
        power: dto.power,
        transmission: this.optionalString(dto.transmission),
        trim: this.optionalString(dto.trim),
        productionDate: this.optionalString(dto.productionDate),
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
    const oilChangeDoneNow = dto.oilChangeDone === true;
    const lastOilChangeMileage = oilChangeDoneNow
      ? currentMileage
      : (dto.lastOilChangeMileage ?? car.lastOilChangeMileage);

    if (lastOilChangeMileage > currentMileage) {
      throw new BadRequestException(
        'Last oil change mileage cannot exceed current mileage',
      );
    }

    const resolved =
      dto.make !== undefined ||
      dto.makeSlug !== undefined ||
      dto.model !== undefined ||
      dto.modelSlug !== undefined
        ? await this.resolveMakeAndModel(
            dto.make ?? car.make ?? undefined,
            dto.makeSlug ?? car.makeSlug ?? undefined,
            dto.model ?? car.model ?? undefined,
            dto.modelSlug ?? car.modelSlug ?? undefined,
          )
        : null;

    return this.prisma.userCar.update({
      where: { id: carId },
      data: {
        name: dto.name?.trim(),
        make: resolved ? resolved.make : (dto.make === undefined ? undefined : this.optionalString(dto.make)),
        makeSlug: resolved ? resolved.makeSlug : (dto.makeSlug === undefined ? undefined : this.optionalString(dto.makeSlug)),
        model: resolved ? resolved.model : (dto.model === undefined ? undefined : this.optionalString(dto.model)),
        modelSlug: resolved ? resolved.modelSlug : (dto.modelSlug === undefined ? undefined : this.optionalString(dto.modelSlug)),
        year: dto.year,
        vin: dto.vin === undefined ? undefined : this.optionalString(dto.vin),
        engine:
          dto.engine === undefined ? undefined : this.optionalString(dto.engine),
        displacement: dto.displacement,
        cylinders: dto.cylinders,
        fuel:
          dto.fuel === undefined ? undefined : this.optionalString(dto.fuel),
        power: dto.power,
        transmission:
          dto.transmission === undefined
            ? undefined
            : this.optionalString(dto.transmission),
        trim:
          dto.trim === undefined ? undefined : this.optionalString(dto.trim),
        productionDate:
          dto.productionDate === undefined
            ? undefined
            : this.optionalString(dto.productionDate),
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
