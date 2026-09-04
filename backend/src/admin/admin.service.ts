import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KafkaService } from '../kafka/kafka.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { generateDeliveryNotePDF } from './invoice-pdf';
import { CacheService } from '../cache/cache.service';
import { MailService, OrderEmailPayload } from '../mail/mail.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
    private readonly cache: CacheService,
    private readonly mail: MailService,
  ) {}

  // ─── Dashboard Stats ───────────────────────────────────────────────────────
  async getDashboardStats() {
    const [totalOrders, totalRevenue, totalUsers, totalProducts, recentOrders, revenueLivraison, revenueHanout] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.aggregate({ _sum: { totalAmount: true } }),
        this.prisma.user.count(),
        this.prisma.product.count({ where: { isPublished: true } }),
        this.prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        }),
        this.prisma.order.aggregate({
          where: { orderType: 'DELIVERY' },
          _sum: { totalAmount: true },
        }),
        this.prisma.order.aggregate({
          where: { orderType: 'STORE_PICKUP' },
          _sum: { totalAmount: true },
        }),
      ]);
    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
      revenueLivraison: revenueLivraison._sum.totalAmount ?? 0,
      revenueHanout: revenueHanout._sum.totalAmount ?? 0,
      totalUsers,
      totalProducts,
      recentOrders,
    };
  }

  // ─── Products ──────────────────────────────────────────────────────────────
  async getProduct(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        variants: { orderBy: { price: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
        specs: true,
      },
    });
  }

  async getProducts(page = 1, limit = 20, search?: string, status?: string) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (safePage - 1) * safeLimit;
    const where: Prisma.ProductWhereInput = {};

    if (search?.trim() && search.trim() !== 'undefined') {
      const query = search.trim();
      where.OR = [
        { nameFr: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
        { brand: { name: { contains: query, mode: 'insensitive' } } },
        { category: { nameFr: { contains: query, mode: 'insensitive' } } },
      ];
    }

    if (status === 'published') where.isPublished = true;
    if (status === 'unpublished') where.isPublished = false;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          variants: true,
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.product.count({ where }),
    ]);
    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async getCatalogBrands() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async getCatalogCategories() {
    return this.prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { nameFr: 'asc' }],
      include: {
        parent: { select: { id: true, nameFr: true, slug: true } },
        _count: { select: { products: true } },
      },
    });
  }

  async createProduct(dto: CreateProductDto) {
    const { price, brandId, categoryId, stock, images, variants, specs, packageUnit, ...rest } =
      dto;
    const sku = dto.sku || `SKU-${dto.slug || dto.nameFr}-${Date.now()}`;
    const data: Prisma.ProductCreateInput = {
      ...rest,
      sku,
      brand: { connect: { id: brandId } },
      category: { connect: { id: categoryId } },
      isPublished: dto.isPublished ?? false,
      isFeatured: dto.isFeatured ?? false,
    };

    if (images && images.length > 0) {
      data.images = {
        create: images.map((url, idx) => ({
          url,
          isPrimary: idx === 0,
          sortOrder: idx,
        })),
      };
    }

    if (variants && variants.length > 0) {
      data.variants = {
        create: variants.map((v, idx) => ({
          volume: String(v.volume || '1 Pièce').trim(),
          price: Number(v.price) || 0,
          stockQty: Number(v.stockQty) || 0,
          imageUrl: v.imageUrl ?? null,
          skuVariant: `${sku}-${String(v.volume || '1P').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${idx}`,
        })),
      };
    } else if (price !== undefined) {
      const unit = packageUnit || '1 Pièce';
      data.variants = {
        create: {
          volume: unit,
          price: Number(price) || 0,
          stockQty: Number(stock) || 0,
          skuVariant: `${sku}-1P`,
        },
      };
    }

    if (specs) {
      data.specs = {
        create: {
          viscosity: specs.viscosity || null,
          apiStandard: specs.apiStandard || null,
          aeceaStandard: specs.aeceaStandard || null,
          jasoStandard: specs.jasoStandard || null,
          OEMApprovals: specs.OEMApprovals || null,
          isFullySynth: Boolean(specs.isFullySynth),
          isSemiSynth: Boolean(specs.isSemiSynth),
          isMinerale: Boolean(specs.isMinerale),
          DPFCompatible: specs.DPFCompatible !== undefined ? Boolean(specs.DPFCompatible) : null,
          TurboCompatible: specs.TurboCompatible !== undefined ? Boolean(specs.TurboCompatible) : null,
          HybridCompatible: specs.HybridCompatible !== undefined ? Boolean(specs.HybridCompatible) : null,
        },
      };
    }

    return this.prisma.product.create({
      data,
      include: { brand: true, category: true, variants: true, images: true, specs: true },
    });
  }

  async updateProduct(id: string, data: any) {
    const { price, stock, variants, images, specs, packageUnit, ...productData } = data;
    const updateData: Prisma.ProductUncheckedUpdateInput = {};

    for (const key of [
      'sku',
      'nameFr',
      'slug',
      'description',
      'shortDescription',
      'brandId',
      'categoryId',
      'isPublished',
      'isFeatured',
    ] as const) {
      if (productData[key] !== undefined) {
        (updateData as any)[key] = productData[key];
      }
    }

    if (Object.keys(updateData).length > 0) {
      try {
        await this.prisma.product.update({
          where: { id },
          data: updateData,
        });
      } catch (err: any) {
        if (err?.code === 'P2002') {
          const conflictField = err?.meta?.target?.[0] ?? 'sku';
          const conflictValue = updateData[conflictField as keyof typeof updateData] ?? '';
          throw new ConflictException(
            `SKU '${conflictValue}' is already in use by another product. Please choose a unique SKU.`,
          );
        }
        if (err?.code === 'P2025') throw new NotFoundException(`Product ${id} not found.`);
        if (err?.code === 'P2003') throw new BadRequestException('Invalid brandId or categoryId reference.');
        throw err;
      }
    }

    if (Array.isArray(images)) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await this.prisma.productImage.createMany({
          data: images.map((url: string, idx: number) => ({
            productId: id,
            url,
            isPrimary: idx === 0,
            sortOrder: idx,
          })),
        });
      }
    }

    // If a variants array is provided, synchronize variants
    if (Array.isArray(variants)) {
      const existing = await this.prisma.product.findUnique({
        where: { id },
        select: {
          sku: true,
          variants: { select: { id: true, volume: true, skuVariant: true } },
        },
      });

      const currentVariantIds = existing?.variants.map((v) => v.id) || [];
      const incomingVariantIds = variants
        .map((v: any) => v.id)
        .filter(Boolean) as string[];

      // Delete variants removed in form
      const toDelete = currentVariantIds.filter(
        (vid) => !incomingVariantIds.includes(vid),
      );
      if (toDelete.length > 0) {
        for (const vid of toDelete) {
          try {
            await this.prisma.productVariant.delete({
              where: { id: vid },
            });
          } catch (err: any) {
            if (err?.code === 'P2003') {
              // Instead of failing the update, gracefully set stock to 0
              // and archive it so it doesn't show up in the UI.
              const existingVariant = await this.prisma.productVariant.findUnique({ where: { id: vid } });
              const currentVol = existingVariant?.volume || '';
              const newVolume = currentVol.startsWith('[ARCHIVED]') ? currentVol : `[ARCHIVED] ${currentVol}`;
              
              await this.prisma.productVariant.update({
                where: { id: vid },
                data: { stockQty: 0, volume: newVolume },
              });
            } else {
              throw err;
            }
          }
        }
      }

      for (let idx = 0; idx < variants.length; idx++) {
        const v = variants[idx];
        if (!v.volume || v.price === undefined) continue;
        const vol = String(v.volume || '1 Pièce').trim();
        const priceVal = Number(v.price) || 0;
        const stockVal = Number(v.stockQty ?? stock ?? 0);
        const imgVal = v.imageUrl || null;

        if (v.id && currentVariantIds.includes(v.id)) {
          await this.prisma.productVariant.update({
            where: { id: v.id },
            data: {
              volume: vol,
              price: priceVal,
              stockQty: stockVal,
              imageUrl: imgVal,
            },
          });
        } else {
          const skuBase = existing?.sku ?? productData.sku ?? id;
          const skuVariant = `${skuBase}-${vol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'VAR'}-${Date.now()}-${idx}`;
          await this.prisma.productVariant.create({
            data: {
              productId: id,
              volume: vol,
              price: priceVal,
              stockQty: stockVal,
              imageUrl: imgVal,
              skuVariant,
            },
          });
        }
      }
    } else if (price !== undefined || stock !== undefined) {
      const existing = await this.prisma.product.findUnique({
        where: { id },
        select: { variants: { take: 1, select: { id: true } } },
      });
      if (existing?.variants.length) {
        await this.prisma.productVariant.update({
          where: { id: existing.variants[0].id },
          data: {
            ...(price !== undefined ? { price: Number(price) } : {}),
            ...(stock !== undefined ? { stockQty: Number(stock) } : {}),
          },
        });
      } else if (price !== undefined) {
        const product = await this.prisma.product.findUnique({
          where: { id },
          select: { sku: true },
        });
        await this.prisma.productVariant.create({
          data: {
            productId: id,
            volume: packageUnit || '1 Pièce',
            price: Number(price || 0),
            stockQty: Number(stock || 0),
            skuVariant: `${product?.sku || id}-1P-${Date.now()}`,
          },
        });
      }
    }

    if (specs) {
      const specsData = {
        viscosity: specs.viscosity || null,
        apiStandard: specs.apiStandard || null,
        aeceaStandard: specs.aeceaStandard || null,
        jasoStandard: specs.jasoStandard || null,
        OEMApprovals: specs.OEMApprovals || null,
        isFullySynth: Boolean(specs.isFullySynth),
        isSemiSynth: Boolean(specs.isSemiSynth),
        isMinerale: Boolean(specs.isMinerale),
        DPFCompatible: specs.DPFCompatible !== undefined ? Boolean(specs.DPFCompatible) : null,
        TurboCompatible: specs.TurboCompatible !== undefined ? Boolean(specs.TurboCompatible) : null,
        HybridCompatible: specs.HybridCompatible !== undefined ? Boolean(specs.HybridCompatible) : null,
      };

      await this.prisma.productSpecs.upsert({
        where: { productId: id },
        create: {
          productId: id,
          ...specsData,
        },
        update: specsData,
      });
    }

    const updatedProduct = await this.prisma.product.findUnique({
      where: { id },
      include: { brand: true, category: true, variants: true, images: true, specs: true },
    });

    if (updatedProduct) {
      try {
        await Promise.allSettled([
          this.cache.del(`products:slug:${updatedProduct.slug}`),
          this.cache.delPattern('products:list:*'),
          this.cache.delPattern('products:best-sellers:*'),
          this.cache.delPattern('products:new:*'),
          this.cache.delPattern('products:facets:*'),
        ]);
      } catch {}

      await this.kafka.produce('product.updated', updatedProduct.id, {
        productId: updatedProduct.id,
        slug: updatedProduct.slug,
      });
    }

    return updatedProduct;
  }

  async deleteProduct(id: string) {
    await this.prisma.review.deleteMany({ where: { productId: id } });
    await this.prisma.wishlistItem.deleteMany({ where: { productId: id } });
    await this.prisma.vehicleCompatibility.deleteMany({
      where: { productId: id },
    });
    try {
      return await this.prisma.product.delete({ where: { id } });
    } catch (err: any) {
      if (err?.code === 'P2003') {
        await this.prisma.product.update({
          where: { id },
          data: { isPublished: false },
        });
        return { message: 'Produit masqué (des commandes y sont liées)' };
      }
      throw err;
    }
  }

  async duplicateProduct(id: string) {
    const original = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    });
    if (!original) throw new NotFoundException('Product not found');
    const slug = `${original.slug}-copie-${Date.now()}`;
    const sku = `${original.sku}-COPY`;
    return this.prisma.product.create({
      data: {
        nameFr: `${original.nameFr} (copie)`,
        slug,
        sku,
        description: original.description,
        isPublished: false,
        brandId: original.brandId,
        categoryId: original.categoryId,
        images: {
          create: original.images.map((img, i) => ({
            url: img.url,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        },
        variants: {
          create: original.variants.map((v) => ({
            volume: v.volume,
            price: v.price,
            stockQty: v.stockQty,
            skuVariant: `${v.skuVariant}-COPY`,
            imageUrl: v.imageUrl,
          })),
        },
      },
    });
  }

  async exportOrders(status?: string) {
    const where: any = {};
    const VALID_STATUSES = [
      'PENDING',
      'CONFIRMED',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ];
    if (status && VALID_STATUSES.includes(status.toUpperCase()))
      where.status = status.toUpperCase();
    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: { include: { product: { select: { nameFr: true } } } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const header =
      'ID,Date,Client,Email,Téléphone,Wilaya,Ville,Total TND,Frais Livraison,Statut,Articles\n';
    const rows = orders
      .map((o) => {
        const items = o.items
          .map((i) => `${i.quantity}x ${i.product.nameFr}`)
          .join('; ');
        return [
          o.id,
          new Date(o.createdAt).toISOString().split('T')[0],
          `"${o.shipFullName || o.user?.name || ''}"`,
          o.user?.email || '',
          o.shipPhone || '',
          o.shipWilaya || '',
          o.shipCity || '',
          (o.totalAmount ?? 0).toFixed(2),
          o.shippingCost?.toFixed(2) || '0.00',
          o.status,
          `"${items}"`,
        ].join(',');
      })
      .join('\n');
    return { csv: header + rows };
  }

  async exportOrderPdf(id: string, docType: 'invoice' | 'delivery_slip' = 'invoice') {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { nameFr: true } },
            variant: { select: { volume: true } },
          },
        },
        user: { select: { name: true, email: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    const settingsRows = await this.prisma.setting.findMany();
    const settings = Object.fromEntries(
      settingsRows.map((r) => {
        try {
          return [r.key, JSON.parse(r.value)];
        } catch {
          return [r.key, r.value];
        }
      }),
    );
    return generateDeliveryNotePDF(order, settings, docType);
  }

  async bulkProducts(ids: string[], action: string) {
    switch (action) {
      case 'publish':
        await this.prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { isPublished: true },
        });
        break;
      case 'unpublish':
        await this.prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { isPublished: false },
        });
        break;
      case 'delete':
        for (const id of ids) await this.deleteProduct(id);
        break;
      case 'duplicate':
        for (const id of ids) await this.duplicateProduct(id);
        break;
    }
    return { ok: true, count: ids.length };
  }

  async exportProducts() {
    const products = await this.prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        variants: true,
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const header =
      'Nom du produit *,Unité de mesure,description,Code produit,Taux de vente,Taux d\'achat,Stock d\'ouverture,Taux d\'ouverture,Niveau d\'alerte minimum,Nom de la catégorie,Unité de catégorie,Est-ce un service (Oui / Non),Code à barres\n';

    const grouped = new Map<string, any[]>();
    for (const p of products) {
      const cat = p.category?.nameFr || 'Sans Categorie';
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(p);
    }

    const files = Array.from(grouped.entries()).map(([category, prods]) => {
      const rows = prods
        .map((p) => {
          const firstVariant = p.variants[0];
          const totalStock = p.variants.reduce((sum: number, v: any) => sum + v.stockQty, 0);
          return [
            `"${p.nameFr}"`, // Nom du produit *
            `"${firstVariant?.volume || ''}"`, // Unité de mesure
            `"${(p.description || '').replace(/"/g, '""')}"`, // description
            `"${p.sku}"`, // Code produit
            firstVariant?.price ? firstVariant.price.toFixed(2) : '0.00', // Taux de vente
            '', // Taux d'achat
            totalStock, // Stock d'ouverture
            '', // Taux d'ouverture
            '', // Niveau d'alerte minimum
            `"${p.category?.nameFr || ''}"`, // Nom de la catégorie
            '', // Unité de catégorie
            '"Non"', // Est-ce un service
            '', // Code à barres
          ].join(',');
        })
        .join('\n');
      return { category, csv: header + rows };
    });

    return { files };
  }

  // ─── Orders ───────────────────────────────────────────────────────────────
  async getOrders(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    const VALID_STATUSES = [
      'PENDING',
      'CONFIRMED',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ];
    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: { include: { product: { select: { nameFr: true } } } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                nameFr: true,
                sku: true,
                images: { take: 1, select: { url: true } },
              },
            },
            variant: { select: { volume: true, skuVariant: true } },
          },
        },
        user: { select: { name: true, email: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(id: string, status: string) {
    const valid = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
    if (!valid.includes(status))
      throw new BadRequestException(`Invalid order status: ${status}`);

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          }
        }
      }
    });

    if (status === 'SHIPPED') {
      const orderPayload: OrderEmailPayload = {
        id: updated.id,
        totalAmount: updated.totalAmount,
        shippingCost: updated.shippingCost,
        customerName: updated.shipFullName,
        customerEmail: (await this.prisma.user.findUnique({ where: { id: updated.userId || '' } }))?.email || null,
        phone: updated.shipPhone,
        wilaya: updated.shipWilaya,
        city: updated.shipCity,
        paymentMethod: 'COD', // Defaulting for now
        items: updated.items.map(i => ({
          name: i.product.nameFr,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          volume: i.variant?.volume || undefined
        }))
      };
      this.mail.sendDeliveryNotice(orderPayload).catch(err => this.logger.error(err));
    }

    // Auto-sync payment status when order status changes
    if (status === 'DELIVERED') {
      await this.prisma.payment.updateMany({
        where: { orderId: id, status: 'PENDING' },
        data: { status: 'COMPLETED' },
      });
    } else if (status === 'CANCELLED') {
      await this.prisma.payment.updateMany({
        where: { orderId: id, status: 'PENDING' },
        data: { status: 'FAILED' },
      });
    } else if (status === 'RETURNED') {
      await this.prisma.payment.updateMany({
        where: { orderId: id },
        data: { status: 'REFUNDED' },
      });
    }

    return updated;
  }

  // ─── Users ────────────────────────────────────────────────────────────────
  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    nameFr: true,
                    images: { take: 1, select: { url: true } },
                  },
                },
                variant: { select: { volume: true } },
              },
            },
          },
        },
      },
    });
    if (!user) return null;
    const ltv = user.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { ...user, ordersCount: user.orders.length, ltv };
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          phone: true,
          orders: {
            where: { status: 'DELIVERED' },
            select: { totalAmount: true },
          },
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

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
    }));

    return { data: users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateUserRole(id: string, role: string) {
    const valid = ['CUSTOMER', 'ADMIN', 'PRO'];
    if (!valid.includes(role))
      throw new BadRequestException(`Invalid role: ${role}`);
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN')
      throw new BadRequestException("Cannot change an admin user's role");
    return this.prisma.user.update({
      where: { id },
      data: { role: role as any },
    });
  }

  async toggleBlockUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true, previousRole: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN')
      throw new BadRequestException('Cannot block an admin user');
    const isBlocked = user.role === 'BLOCKED';
    return this.prisma.user.update({
      where: { id },
      data: {
        role: isBlocked ? (user.previousRole ?? 'CUSTOMER') : 'BLOCKED',
        previousRole: isBlocked ? null : user.role,
      },
    });
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────
  async getReviews(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        include: {
          product: {
            select: {
              nameFr: true,
              images: { take: 1, select: { url: true } },
            },
          },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateReviewStatus(id: string, isApproved: boolean) {
    return this.prisma.review.update({ where: { id }, data: { isApproved } });
  }

  async deleteReview(id: string) {
    return this.prisma.review.delete({ where: { id } });
  }

  // ─── Payments & Point of Sale (POS) ───────────────────────────────────────
  async getPayments(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.PaymentWhereInput = {};

    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { id: { contains: q, mode: 'insensitive' } },
        { orderId: { contains: q, mode: 'insensitive' } },
        { order: { shipFullName: { contains: q, mode: 'insensitive' } } },
        { order: { user: { name: { contains: q, mode: 'insensitive' } } } },
        { order: { user: { email: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const [data, total, pendingAgg, completedAgg, totalAgg] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          order: {
            include: {
              user: { select: { name: true, email: true } },
              items: {
                take: 1,
                include: { product: { select: { nameFr: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
      this.prisma.payment.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
      }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalPending: pendingAgg._sum.amount ?? 0,
        totalCompleted: completedAgg._sum.amount ?? 0,
        totalVolume: totalAgg._sum.amount ?? 0,
      },
    };
  }

  async updatePaymentStatus(id: string, status: string) {
    const valid = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
    if (!valid.includes(status))
      throw new BadRequestException(`Invalid payment status: ${status}`);
    return this.prisma.payment.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async searchProductsForPos(query?: string) {
    const where: Prisma.ProductWhereInput = { isPublished: true };
    if (query?.trim()) {
      const q = query.trim();
      where.OR = [
        { nameFr: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { variants: { some: { skuVariant: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      select: {
        id: true,
        nameFr: true,
        sku: true,
        images: { select: { url: true }, take: 1, orderBy: { sortOrder: 'asc' } },
        brand: { select: { name: true } },
        category: { select: { nameFr: true } },
        variants: {
          select: {
            id: true,
            volume: true,
            price: true,
            stockQty: true,
            skuVariant: true,
          },
        },
      },
      take: 25,
      orderBy: { nameFr: 'asc' },
    });
  }

  async createDirectSale(dto: {
    customerName?: string;
    customerPhone?: string;
    paymentMethod: string;
    notes?: string;
    items: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      unitPrice?: number;
    }>;
  }) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Au moins un produit est requis pour enregistrer une vente.');
    }

    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (variants.length !== variantIds.length) {
      throw new BadRequestException('Un ou plusieurs produits sélectionnés sont introuvables.');
    }

    // Check stock
    for (const item of dto.items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) continue;
      if (variant.stockQty < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${variant.product.nameFr} (${variant.volume}). Disponible: ${variant.stockQty}, Demandé: ${item.quantity}`,
        );
      }
    }

    // Calculate total
    let totalAmount = 0;
    const orderItemsData = dto.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      const unitPrice =
        typeof item.unitPrice === 'number' && item.unitPrice >= 0
          ? item.unitPrice
          : variant.price;
      totalAmount += unitPrice * item.quantity;
      return {
        productId: variant.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
      };
    });

    totalAmount = Math.round(totalAmount * 100) / 100;
    const validMethod = ['CASH', 'CARD', 'CHECK', 'COD'].includes(
      dto.paymentMethod?.toUpperCase(),
    )
      ? dto.paymentMethod.toUpperCase()
      : 'CASH';

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Order as STORE_PICKUP & DELIVERED
      const order = await tx.order.create({
        data: {
          orderType: 'STORE_PICKUP',
          status: 'DELIVERED',
          totalAmount,
          shippingCost: 0,
          shipFullName: dto.customerName?.trim() || 'Client Comptoir (Magasin)',
          shipPhone: dto.customerPhone?.trim() || '',
          shipWilaya: 'Tunis',
          shipCity: 'Magasin / Boutique',
          notes: dto.notes
            ? `[Vente Comptoir] ${dto.notes}`
            : '[Vente Comptoir Magasin]',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: { select: { nameFr: true } },
              variant: { select: { volume: true } },
            },
          },
        },
      });

      // 2. Decrement stock
      for (const item of dto.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQty: { decrement: item.quantity } },
        });
      }

      // 3. Create Payment as COMPLETED
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          method: validMethod,
          amount: totalAmount,
          status: 'COMPLETED',
          notes: `Encaissement immédiat caisse (${validMethod})`,
        },
      });

      return {
        order,
        payment,
        success: true,
      };
    });
  }

  // ─── Top Buyers ────────────────────────────────────────────────────────────
  async getTopBuyers(limit = 20) {
    const users = await this.prisma.user.findMany({
      where: { role: { not: 'BLOCKED' } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        orders: {
          where: { status: { not: 'CANCELLED' } },
          select: {
            totalAmount: true,
            createdAt: true,
            shippingCost: true,
          },
        },
      },
    });

    const scored = users
      .filter((u) => u.orders.length > 0)
      .map((u) => {
        const totalSpent = u.orders.reduce((s, o) => s + o.totalAmount, 0);
        const orderCount = u.orders.length;
        const avgOrderValue = totalSpent / orderCount;
        const lastOrderAt = u.orders.reduce(
          (latest, o) => (o.createdAt > latest ? o.createdAt : latest),
          u.orders[0].createdAt,
        );
        const firstOrderAt = u.orders.reduce(
          (earliest, o) => (o.createdAt < earliest ? o.createdAt : earliest),
          u.orders[0].createdAt,
        );
        const repeatRate = orderCount > 1 ? 1 : 0;

        // Composite score: 50% LTV + 30% frequency + 20% avg order value
        const score =
          totalSpent * 0.5 +
          orderCount * avgOrderValue * 0.3 +
          avgOrderValue * 0.2;

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          createdAt: u.createdAt,
          totalSpent: Math.round(totalSpent * 100) / 100,
          orderCount,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          lastOrderAt,
          firstOrderAt,
          repeatBuyer: repeatRate === 1,
          score: Math.round(score * 100) / 100,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  // ─── Contact Messages ──────────────────────────────────────────────────────
  async getContactMessages(
    page = 1,
    limit = 20,
    sort?: 'recent' | 'oldest' | 'unread',
    filter?: 'all' | 'unread' | 'withPhone',
  ) {
    const skip = (page - 1) * limit;

    const orderBy =
      sort === 'oldest'
        ? { createdAt: 'asc' as const }
        : sort === 'unread'
          ? [{ isRead: 'asc' as const }, { createdAt: 'desc' as const }]
          : { createdAt: 'desc' as const };

    const where =
      filter === 'unread'
        ? { isRead: false }
        : filter === 'withPhone'
          ? { phone: { not: null } }
          : {};

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({ where: { isRead: false } }),
    ]);
    return {
      data,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markContactMessageRead(id: string) {
    return this.prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async deleteContactMessage(id: string) {
    return this.prisma.contactMessage.delete({ where: { id } });
  }

  async importProducts(file: Express.Multer.File) {
    const csvParser = require('csv-parser');
    const { Readable } = require('stream');

    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(file.buffer);

      stream
        .pipe(csvParser({ separator: ',' }))
        .on('data', (data: any) => results.push(data))
        .on('end', async () => {
          let created = 0;
          let updated = 0;
          let errors = 0;

          for (const row of results) {
            try {
              const sku = row.SKU || row.sku || row[Object.keys(row)[0]];
              const nameFr = row.Nom || row.nameFr || row[Object.keys(row)[1]];
              
              if (!sku || !nameFr) {
                errors++;
                continue;
              }

              const slug = row.Slug || row.slug || nameFr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const description = row.Description || row.description || nameFr;
              const brandName = row.Marque || row.brand;
              const catName = row['Catégorie'] || row.Categorie || row.category || row.Categorie;
              const price = parseFloat(row['Prix TND'] || row.Prix || row.price || '0') || 0;
              const stock = parseInt(row['Stock Total'] || row.Stock || row.stock || '0') || 0;
              const isPublishedStr = (row['Publié'] || row.Publie || row.isPublished || '').toLowerCase();
              const isPublished = isPublishedStr.startsWith('oui') || isPublishedStr === 'true' || isPublishedStr === '1';
              const image = row.Image || row.image || row.images;

              let brandId: string | null = null;
              if (brandName) {
                let b = await this.prisma.brand.findFirst({
                  where: { name: { contains: brandName, mode: 'insensitive' } },
                });
                if (!b) {
                  b = await this.prisma.brand.create({
                    data: { name: brandName, slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                  });
                }
                brandId = b.id;
              }

              let categoryId: string | null = null;
              if (catName) {
                let c = await this.prisma.category.findFirst({
                  where: { nameFr: { contains: catName, mode: 'insensitive' } },
                });
                if (!c) {
                  c = await this.prisma.category.create({
                    data: { nameFr: catName, slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                  });
                }
                categoryId = c.id;
              }

              const existing = await this.prisma.product.findUnique({ where: { sku }, include: { variants: true } });
              
              if (existing) {
                const updateData: any = {
                  nameFr,
                  slug,
                  description,
                  isPublished,
                };
                if (brandId) updateData.brandId = brandId;
                if (categoryId) updateData.categoryId = categoryId;

                await this.prisma.product.update({
                  where: { id: existing.id },
                  data: updateData
                });
                
                // Upsert default variant for price/stock
                if (existing.variants.length > 0) {
                  await this.prisma.productVariant.update({
                    where: { id: existing.variants[0].id },
                    data: { price, stockQty: stock }
                  });
                } else {
                  await this.prisma.productVariant.create({
                    data: {
                      productId: existing.id,
                      volume: 'default',
                      price,
                      stockQty: stock,
                      skuVariant: `${sku}-default`,
                    }
                  });
                }

                if (image) {
                   const existingImages = await this.prisma.productImage.findMany({ where: { productId: existing.id }});
                   if (existingImages.length === 0) {
                      await this.prisma.productImage.create({ data: { productId: existing.id, url: image, isPrimary: true, sortOrder: 0 }});
                   }
                }
                updated++;
              } else {
                const createData: any = {
                  sku,
                  nameFr,
                  slug,
                  description,
                  isPublished,
                  variants: {
                    create: {
                      volume: 'default',
                      price,
                      stockQty: stock,
                      skuVariant: `${sku}-default`,
                    }
                  }
                };
                if (brandId) createData.brandId = brandId;
                if (categoryId) createData.categoryId = categoryId;

                const prod = await this.prisma.product.create({
                  data: createData
                });
                if (image) {
                  await this.prisma.productImage.create({ data: { productId: prod.id, url: image, isPrimary: true, sortOrder: 0 }});
                }
                created++;
              }
            } catch (err) {
              this.logger.error('Import row error', err);
              errors++;
            }
          }
          
          resolve({ ok: true, created, updated, errors, message: `Import terminé : ${created} créés, ${updated} mis à jour, ${errors} erreurs` });
        })
        .on('error', (err: any) => {
          this.logger.error('CSV parse error', err);
          reject(err);
        });
    });
  }

  // ─── POS Invoice ─────────────────────────────────────────────────────────
  async generatePOSInvoice(body: {
    clientName: string;
    items: Array<{
      productId?: string;
      name: string;
      volume?: string;
      quantity: number;
      unitPriceHT: number;
    }>;
  }): Promise<Buffer> {
    const { generatePOSInvoicePDF } = require('./invoice-pdf');

    const invoiceNumber = `FAC-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '')}-${Math.floor(Math.random() * 9000) + 1000}`;

    return generatePOSInvoicePDF({
      invoiceNumber,
      date: new Date(),
      clientName: body.clientName?.trim() || 'Client comptoir',
      items: body.items.map((item) => ({
        name: item.name,
        volume: item.volume,
        quantity: item.quantity,
        unitPriceHT: item.unitPriceHT,
      })),
    });
  }
}
