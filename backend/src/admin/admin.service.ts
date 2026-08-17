import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { generateDeliveryNotePDF } from './invoice-pdf';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
        variants: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async getProducts(page = 1, limit = 20, search?: string, status?: string) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (safePage - 1) * safeLimit;
    const where: Prisma.ProductWhereInput = {};

    if (search?.trim()) {
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
    const { price, brandId, categoryId, stock, images, variants, ...rest } =
      dto;
    const sku = dto.sku || `SKU-${dto.slug || dto.nameFr}-${Date.now()}`;
    const data: Prisma.ProductCreateInput = {
      ...rest,
      sku,
      brand: { connect: { id: brandId } },
      category: { connect: { id: categoryId } },
      isPublished: dto.isPublished ?? true,
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
          volume: v.volume,
          price: v.price,
          stockQty: v.stockQty,
          imageUrl: v.imageUrl ?? null,
          skuVariant: `${sku}-${v.volume.replace(/\s+/g, '').toUpperCase()}`,
        })),
      };
    } else if (price !== undefined) {
      // Create a default variant when price is provided but no explicit variants array
      data.variants = {
        create: {
          volume: 'default',
          price,
          stockQty: stock ?? 0,
          skuVariant: `${sku}-default`,
        },
      };
    }

    return this.prisma.product.create({
      data,
      include: { brand: true, category: true, variants: true },
    });
  }

  async updateProduct(id: string, data: any) {
    const { price, stock, variants, images, ...productData } = data;
    const updateData: Prisma.ProductUncheckedUpdateInput = {};

    for (const key of [
      'sku',
      'nameFr',
      'slug',
      'description',
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
      await this.prisma.product.update({
        where: { id },
        data: updateData,
      });
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

    // If a full variants array is provided, update all variants
    if (variants && variants.length > 0) {
      const existing = await this.prisma.product.findUnique({
        where: { id },
        select: {
          sku: true,
          variants: { select: { id: true, volume: true, skuVariant: true } },
        },
      });

      const updates = variants
        .map((v: any) => {
          const match = v.id
            ? existing?.variants.find((ev: any) => ev.id === v.id)
            : existing?.variants.find(
                (ev: any) => ev.volume === v.volume && ev.id,
              );
          if (match) {
            const variantData: Prisma.ProductVariantUpdateInput = {};
            if (v.volume !== undefined) variantData.volume = v.volume;
            if (v.price !== undefined) variantData.price = v.price;
            if (v.stockQty !== undefined) variantData.stockQty = v.stockQty;
            if (v.imageUrl !== undefined) variantData.imageUrl = v.imageUrl;

            return this.prisma.productVariant.update({
              where: { id: match.id },
              data: variantData,
            });
          }

          if (!v.volume || v.price === undefined) return Promise.resolve(null);

          const skuBase = existing?.sku ?? productData.sku ?? id;
          return this.prisma.productVariant.create({
            data: {
              productId: id,
              volume: v.volume,
              price: v.price,
              stockQty: v.stockQty ?? 0,
              imageUrl: v.imageUrl ?? null,
              skuVariant: `${skuBase}-${v.volume.replace(/\s+/g, '').toUpperCase()}-${Date.now()}`,
            },
          });
        })
        .filter(Boolean);

      if (updates.length > 0) {
        await this.prisma.$transaction(updates);
      }
    } else {
      // Fallback: update first variant price/stock
      const variantUpdate: any = {};
      if (price !== undefined) variantUpdate.price = price;
      if (stock !== undefined) variantUpdate.stockQty = stock;

      if (Object.keys(variantUpdate).length > 0) {
        const existing = await this.prisma.product.findUnique({
          where: { id },
          select: { variants: { take: 1, select: { id: true } } },
        });
        if (existing?.variants.length) {
          await this.prisma.productVariant.update({
            where: { id: existing.variants[0].id },
            data: variantUpdate,
          });
        } else if (price !== undefined) {
          const product = await this.prisma.product.findUnique({
            where: { id },
            select: { sku: true },
          });
          await this.prisma.productVariant.create({
            data: {
              productId: id,
              volume: 'default',
              price,
              stockQty: stock ?? 0,
              skuVariant: `${product?.sku ?? id}-default-${Date.now()}`,
            },
          });
        }
      }
    }

    return this.prisma.product.findUnique({
      where: { id },
      include: { brand: true, category: true, variants: true, images: true },
    });
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

  async exportOrderPdf(id: string) {
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
    return generateDeliveryNotePDF(order);
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
      'SKU,Nom,Slug,Description,Marque,Catégorie,Prix TND,Stock Total,Publié,Image\n';
    const rows = products
      .map((p) => {
        const firstVariant = p.variants[0];
        const totalStock = p.variants.reduce((sum, v) => sum + v.stockQty, 0);
        return [
          p.sku,
          `"${p.nameFr}"`,
          p.slug,
          `"${(p.description || '').replace(/"/g, '""')}"`,
          p.brand?.name || '',
          p.category?.nameFr || '',
          firstVariant?.price ? firstVariant.price.toFixed(2) : '0.00',
          totalStock,
          p.isPublished ? 'Oui' : 'Non',
          p.images[0]?.url || '',
        ].join(',');
      })
      .join('\n');
    return { csv: header + rows };
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
                images: { take: 1, select: { url: true } },
              },
            },
            variant: { select: { volume: true } },
          },
        },
        user: { select: { name: true, email: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(id: string, status: string) {
    const valid = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!valid.includes(status))
      throw new BadRequestException(`Invalid order status: ${status}`);
    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
    });
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

  // ─── Payments ─────────────────────────────────────────────────────────────
  async getPayments(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
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
      this.prisma.payment.count(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
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
                await this.prisma.product.update({
                  where: { id: existing.id },
                  data: {
                    nameFr,
                    slug,
                    description,
                    isPublished,
                    ...(brandId ? { brandId } : {}),
                    ...(categoryId ? { categoryId } : {}),
                  }
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
                const prod = await this.prisma.product.create({
                  data: {
                    sku,
                    nameFr,
                    slug,
                    description,
                    isPublished,
                    ...(brandId ? { brandId } : {}),
                    ...(categoryId ? { categoryId } : {}),
                    variants: {
                      create: {
                        volume: 'default',
                        price,
                        stockQty: stock,
                        skuVariant: `${sku}-default`,
                      }
                    }
                  }
                });
                if (image) {
                  await this.prisma.productImage.create({ data: { productId: prod.id, url: image, isPrimary: true, sortOrder: 0 }});
                }
                created++;
              }
            } catch (err) {
              console.error('Import row error:', err);
              errors++;
            }
          }
          
          resolve({ ok: true, created, updated, errors, message: `Import terminé : ${created} créés, ${updated} mis à jour, ${errors} erreurs` });
        })
        .on('error', (err: any) => {
          console.error('CSV parse error:', err);
          reject(err);
        });
    });
  }
}
