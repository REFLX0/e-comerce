/**
 * Imports the four source-of-truth CSVs used by the "Trouver mon huile"
 * finder.  It is idempotent and can be re-run after sourcing updates.
 *
 * Usage: npx tsx prisma/import-oil-finder-dataset.ts [directory-containing-csvs]
 */
import { FuelType, PrismaClient, VehicleType } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()
const DEFAULT_DATA_DIRECTORY = path.resolve(process.cwd(), '..', 'tvoil')
const PRICE_TBD_VARIANT_SUFFIX = 'PRICE-TBD-5L'

type CsvRow = Record<string, string>

interface LubricantRow {
  Brand: string
  Product: string
  Viscosity: string
  API: string
  ACEA: string
  JASO: string
  VehicleTypes: string
  FuelTypes: string
  minCylinders: string
  maxCylinders: string
  minPower: string
  maxPower: string
  DPFCompatible: string
  TurboCompatible: string
  HybridCompatible: string
  OEMApprovals: string
  Applications: string
}

interface SourcingRow {
  Brand: string
  Product: string
  'Source URL': string
  'Source title': string
  Evidence: string
  'Derived values': string
  Confidence: string
}

interface CompatibilityRow {
  make: string
  model: string
  engine: string
  product_sku: string
}

interface UnmatchedVehicleRow {
  make: string
  model: string
  engineCode: string
  yearFrom: string
  yearTo: string
  requiredSpecification: string
  source: string
}

function slugify(value: string): string {
  return value
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseCsv<T = CsvRow>(content: string): T[] {
  const records: string[][] = []
  let record: string[] = []
  let field = ''
  let inQuotes = false

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    const nextChar = content[index + 1]

    if (char === '"' && inQuotes && nextChar === '"') {
      field += '"'
      index += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      record.push(field.trim())
      field = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1
      record.push(field.trim())
      if (record.some(Boolean)) records.push(record)
      record = []
      field = ''
    } else {
      field += char
    }
  }

  record.push(field.trim())
  if (record.some(Boolean)) records.push(record)
  if (records.length === 0) return []

  const firstRow = records[0]
  if (!firstRow) return []

  const headers = firstRow.map((header) => header.replace(/^\uFEFF/, '').trim())
  return records.slice(1).map((values) => Object.fromEntries(
    headers.map((header, index) => [header, values[index] ?? '']),
  )) as T[]
}

function readCsv<T = CsvRow>(dataDirectory: string, fileName: string): T[] {
  const filePath = path.join(dataDirectory, fileName)
  if (!fs.existsSync(filePath)) throw new Error(`Missing required data file: ${filePath}`)
  return parseCsv(fs.readFileSync(filePath, 'utf8'))
}

function splitList(value?: string): string[] {
  return (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)
}

function yesNo(value?: string): boolean | null {
  const normalized = value?.trim().toLowerCase()
  if (normalized === 'yes') return true
  if (normalized === 'no') return false
  return null
}

function numberOrNull(value?: string): number | null {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function vehicleTypes(value?: string): VehicleType[] {
  const values = new Set<VehicleType>()
  for (const item of splitList(value)) {
    if (item === 'Passenger Car') values.add(VehicleType.AUTOMOBILE)
    // Product management must confirm this mapping.  Until then, light
    // commercial oils remain discoverable in the passenger-car finder.
    if (item === 'Light Commercial') values.add(VehicleType.AUTOMOBILE)
  }
  return [...values]
}

function fuelTypes(value?: string): FuelType[] {
  const values = new Set<FuelType>()
  for (const item of splitList(value)) {
    if (item === 'Petrol') values.add(FuelType.ESSENCE)
    if (item === 'Diesel') values.add(FuelType.DIESEL)
  }
  return [...values]
}

/** CSV product names do not carry a SKU, so this mirrors vehicle-compat.csv. */
function productSku(brand: string, product: string): string {
  const value = product
    .replace(new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i'), '')
    .replace(/^Helix\s+/i, '')
    .replace(/^Evolution\s+/i, 'EVO ')
    .replace(/Professional/gi, 'PRO')
    .replace(/AM-L/gi, 'AML')
    .replace(/AV-L/gi, 'AVL')
    .replace(/SYN-NERGY\s+SPEC/gi, 'SYN-NERGY')
    .replace(/X-CLEAN/gi, 'XCLEAN')
    .replace(/FULL-TECH/gi, 'FULLTECH')
    .replace(/LONG\s+LIFE/gi, 'LL')
    .replace(/XTRA\s+/gi, '')
    .replace(/Stop-Start/gi, 'SS')
    .replace(/Magnatec/gi, 'MAGNETEC')
    .replace(/RN-17/gi, 'RN17')
    .replace(/VX\s+1000\s+LL/gi, 'VX1000LL')

  return `${brand}-${value}`
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase()
}

async function ensureCategory() {
  return prisma.category.upsert({
    where: { slug: 'huiles-moteur' },
    update: { nameFr: 'Huiles moteur' },
    create: { nameFr: 'Huiles moteur', slug: 'huiles-moteur' },
  })
}

async function importProducts(dataDirectory: string) {
  const category = await ensureCategory()
  const rows = readCsv<LubricantRow>(dataDirectory, 'lubricant-dataset.csv')
  const productsBySourceName = new Map<string, string>()

  for (const row of rows) {
    const brandName = row.Brand.trim()
    const name = row.Product.trim()
    const sku = productSku(brandName, name)
    const brand = await prisma.brand.upsert({
      where: { slug: slugify(brandName) },
      update: { name: brandName },
      create: { name: brandName, slug: slugify(brandName) },
    })

    const product = await prisma.product.upsert({
      where: { sku },
      update: {
        nameFr: name,
        description: row.Applications.trim() || name,
        brandId: brand.id,
        categoryId: category.id,
        isPublished: true,
        isFeatured: false,
      },
      create: {
        sku,
        slug: `huile-${sku.toLowerCase()}`,
        nameFr: name,
        description: row.Applications.trim() || name,
        brandId: brand.id,
        categoryId: category.id,
        isPublished: true,
        isFeatured: false,
      },
    })

    await prisma.productSpecs.upsert({
      where: { productId: product.id },
      update: {
        viscosity: row.Viscosity || null,
        apiStandard: row.API || null,
        aeceaStandard: row.ACEA || null,
        jasoStandard: row.JASO === 'N/A' ? null : row.JASO || null,
        DPFCompatible: yesNo(row.DPFCompatible),
        TurboCompatible: yesNo(row.TurboCompatible),
        HybridCompatible: yesNo(row.HybridCompatible),
        OEMApprovals: row.OEMApprovals || null,
        vehicleTypes: vehicleTypes(row.VehicleTypes),
        fuelTypes: fuelTypes(row.FuelTypes),
        minCylinders: numberOrNull(row.minCylinders),
        maxCylinders: numberOrNull(row.maxCylinders),
        minPower: numberOrNull(row.minPower),
        maxPower: numberOrNull(row.maxPower),
      },
      create: {
        productId: product.id,
        viscosity: row.Viscosity || null,
        apiStandard: row.API || null,
        aeceaStandard: row.ACEA || null,
        jasoStandard: row.JASO === 'N/A' ? null : row.JASO || null,
        DPFCompatible: yesNo(row.DPFCompatible),
        TurboCompatible: yesNo(row.TurboCompatible),
        HybridCompatible: yesNo(row.HybridCompatible),
        OEMApprovals: row.OEMApprovals || null,
        vehicleTypes: vehicleTypes(row.VehicleTypes),
        fuelTypes: fuelTypes(row.FuelTypes),
        minCylinders: numberOrNull(row.minCylinders),
        maxCylinders: numberOrNull(row.maxCylinders),
        minPower: numberOrNull(row.minPower),
        maxPower: numberOrNull(row.maxPower),
      },
    })

    await prisma.productVariant.upsert({
      where: { skuVariant: `${sku}-${PRICE_TBD_VARIANT_SUFFIX}` },
      update: { volume: '5L', price: 0, stockQty: 0 },
      create: {
        productId: product.id,
        volume: '5L',
        price: 0,
        stockQty: 0,
        skuVariant: `${sku}-${PRICE_TBD_VARIANT_SUFFIX}`,
      },
    })

    productsBySourceName.set(`${brandName}\u0000${name}`, product.id)
  }

  return productsBySourceName
}

async function importSourcing(dataDirectory: string, productIds: Map<string, string>) {
  for (const row of readCsv<SourcingRow>(dataDirectory, 'sourcing-log.csv')) {
    const productId = productIds.get(`${row.Brand.trim()}\u0000${row.Product.trim()}`)
    if (!productId) throw new Error(`Sourcing record has no product: ${row.Brand} / ${row.Product}`)

    await prisma.productSourcing.upsert({
      where: { productId },
      update: {
        sourceUrl: row['Source URL'] || null,
        sourceTitle: row['Source title'] || null,
        evidence: row.Evidence || null,
        derivedValueNotes: row['Derived values'] || null,
        confidence: row.Confidence || 'MEDIUM',
      },
      create: {
        productId,
        sourceUrl: row['Source URL'] || null,
        sourceTitle: row['Source title'] || null,
        evidence: row.Evidence || null,
        derivedValueNotes: row['Derived values'] || null,
        confidence: row.Confidence || 'MEDIUM',
      },
    })
  }
}

async function importCompatibility(dataDirectory: string) {
  for (const row of readCsv<CompatibilityRow>(dataDirectory, 'vehicle-compat.csv')) {
    const product = await prisma.product.findUnique({ where: { sku: row.product_sku } })
    if (!product) throw new Error(`Compatibility references unknown SKU: ${row.product_sku}`)

    const make = await prisma.vehicleMake.upsert({
      where: { name: row.make },
      update: {},
      create: { name: row.make, slug: slugify(row.make) },
    })
    let model = await prisma.vehicleModel.findFirst({ where: { makeId: make.id, name: row.model } })
    if (!model) {
      const baseSlug = `${slugify(row.make)}-${slugify(row.model)}`
      let slug = baseSlug
      let suffix = 2
      while (await prisma.vehicleModel.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${suffix}`
        suffix += 1
      }
      model = await prisma.vehicleModel.create({
        data: { makeId: make.id, name: row.model, slug, vehicleType: VehicleType.AUTOMOBILE },
      })
    }

    const existing = await prisma.vehicleCompatibility.findFirst({
      where: { productId: product.id, vehicleModelId: model.id, engineCode: row.engine || null },
    })
    if (!existing) {
      await prisma.vehicleCompatibility.create({
        data: { productId: product.id, vehicleModelId: model.id, engineCode: row.engine || null },
      })
    }
  }
}

async function importUnmatchedVehicleSeeds(dataDirectory: string) {
  for (const row of readCsv<UnmatchedVehicleRow>(dataDirectory, 'unmatched-engines.csv')) {
    if (!row.make || !row.model) continue
    const existing = await prisma.unmatchedVehicleQuery.findFirst({
      where: {
        make: row.make,
        model: row.model,
        engineCode: row.engineCode || null,
        source: row.source || 'manual_import',
      },
    })
    if (!existing) {
      await prisma.unmatchedVehicleQuery.create({
        data: {
          make: row.make,
          model: row.model,
          engineCode: row.engineCode || null,
          yearFrom: numberOrNull(row.yearFrom),
          yearTo: numberOrNull(row.yearTo),
          requiredSpecification: row.requiredSpecification || null,
          source: row.source || 'manual_import',
        },
      })
    }
  }
}

async function main() {
  const dataDirectory = path.resolve(process.argv[2] || process.env.OIL_DATA_DIR || DEFAULT_DATA_DIRECTORY)
  const productIds = await importProducts(dataDirectory)
  await importSourcing(dataDirectory, productIds)
  await importCompatibility(dataDirectory)
  await importUnmatchedVehicleSeeds(dataDirectory)
  console.log(`Imported ${productIds.size} lubricant products from ${dataDirectory}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
