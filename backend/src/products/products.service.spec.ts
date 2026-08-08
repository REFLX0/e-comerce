import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

const mockProduct = (overrides = {}) => ({
  id: 'p1',
  slug: 'test-oil',
  nameFr: 'Test Oil 5W-30',
  description: 'A test oil',
  brandId: 'b1',
  categoryId: 'c1',
  isPublished: true,
  isFeatured: false,
  createdAt: new Date(),
  brand: { id: 'b1', name: 'TestBrand', slug: 'test-brand', logoUrl: null },
  category: { id: 'c1', nameFr: 'Moteur', slug: 'moteur' },
  images: [{ url: '/img/product.jpg', isPrimary: true, sortOrder: 0 }],
  variants: [],
  specs: null,
  ...overrides,
});

describe('ProductsService — findBestSellers', () => {
  let service: ProductsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
            product: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get(PrismaService);
  });

  it('returns products ranked by sales from CONFIRMED/SHIPPED/DELIVERED orders only', async () => {
    prisma.$queryRaw.mockResolvedValue([
      { productid: 'p1', totalsold: 10 },
      { productid: 'p2', totalsold: 5 },
    ]);
    prisma.product.findMany.mockResolvedValue([
      mockProduct({ id: 'p1', nameFr: 'Oil A' }),
      mockProduct({ id: 'p2', nameFr: 'Oil B' }),
    ]);

    const result = await service.findBestSellers(2);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Oil A');
    expect(result[1].name).toBe('Oil B');
  });

  it('maintains stable ordering with tiebreaker when products have equal sales', async () => {
    prisma.$queryRaw.mockResolvedValue([
      { productid: 'p3', totalsold: 5 },
      { productid: 'p1', totalsold: 5 },
      { productid: 'p2', totalsold: 5 },
    ]);
    prisma.product.findMany.mockResolvedValue([
      mockProduct({ id: 'p1', nameFr: 'Oil 1' }),
      mockProduct({ id: 'p2', nameFr: 'Oil 2' }),
      mockProduct({ id: 'p3', nameFr: 'Oil 3' }),
    ]);

    const result = await service.findBestSellers(3);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Oil 3');
    expect(result[1].name).toBe('Oil 1');
    expect(result[2].name).toBe('Oil 2');
  });

  it('falls back to isFeatured products when no sales data exists', async () => {
    prisma.$queryRaw.mockResolvedValue([]);
    prisma.product.findMany
      .mockResolvedValueOnce([
        mockProduct({ id: 'f1', nameFr: 'Featured Oil', isFeatured: true }),
        mockProduct({ id: 'f2', nameFr: 'Featured Grease', isFeatured: true }),
      ])
      .mockResolvedValueOnce([
        mockProduct({ id: 'f1', nameFr: 'Featured Oil', isFeatured: true }),
        mockProduct({ id: 'f2', nameFr: 'Featured Grease', isFeatured: true }),
      ]);

    const result = await service.findBestSellers(2);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Featured Oil');
    expect(result[1].name).toBe('Featured Grease');
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isFeatured: true }),
      }),
    );
  });

  it('falls back to newest products when no sales and no featured exist', async () => {
    prisma.$queryRaw.mockResolvedValue([]);
    prisma.product.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([mockProduct({ id: 'n1', nameFr: 'New Oil' })]);

    const result = await service.findBestSellers(2);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('New Oil');
  });

  it('does not include PENDING or CANCELLED orders in the SQL filter', async () => {
    prisma.$queryRaw.mockResolvedValue([]);
    prisma.product.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    await service.findBestSellers(2);

    const sqlCall = prisma.$queryRaw.mock.calls[0][0] as string[];
    const sql = Array.isArray(sqlCall) ? sqlCall.join('') : String(sqlCall);
    expect(sql).toContain("'CONFIRMED'");
    expect(sql).toContain("'SHIPPED'");
    expect(sql).toContain("'DELIVERED'");
    expect(sql).not.toContain("'PENDING'");
    expect(sql).not.toContain("'CANCELLED'");
  });

  it('uses productId as tiebreaker for products with equal sales', async () => {
    prisma.$queryRaw.mockResolvedValue([
      { productid: 'p3', totalsold: 5 },
      { productid: 'p1', totalsold: 5 },
      { productid: 'p2', totalsold: 5 },
    ]);
    prisma.product.findMany.mockResolvedValue([
      mockProduct({ id: 'p1', nameFr: 'Oil 1' }),
      mockProduct({ id: 'p2', nameFr: 'Oil 2' }),
      mockProduct({ id: 'p3', nameFr: 'Oil 3' }),
    ]);

    const result = await service.findBestSellers(3);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Oil 3');
    expect(result[1].name).toBe('Oil 1');
    expect(result[2].name).toBe('Oil 2');
  });
});
