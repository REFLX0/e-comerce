import { PrismaClient, VehicleType, FuelType } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

const prisma = new PrismaClient()

interface CsvRow {
  brand: string
  product: string
  viscosity: string
  api: string
  acea: string
  jaso: string
  vehicleTypes: string
  fuelTypes: string
  minCylinders: string
  maxCylinders: string
  minPower: string
  maxPower: string
  dpfCompatible: string
  turboCompatible: string
  hybridCompatible: string
  oemApprovals: string
  applications: string
  officialSource: string
  tdsUrl: string
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function mapVehicleType(value: string): VehicleType | null {
  const v = value.trim().toUpperCase()
  if (v === 'AUTOMOBILE') return VehicleType.AUTOMOBILE
  if (v === 'MOTO') return VehicleType.MOTO
  if (v === 'POIDS LOURD') return VehicleType.POIDS_LOURD
  if (v === 'AGRICOLE') return VehicleType.AGRICOLE
  return null
}

function mapFuelType(value: string): FuelType | null {
  const v = value.trim().toUpperCase()
  if (v === 'ESSENCE') return FuelType.ESSENCE
  if (v === 'DIESEL') return FuelType.DIESEL
  return null
}

function parseNullableInt(value: string): number | null {
  const v = value.trim()
  if (!v || v.toUpperCase() === 'NULL' || v === '') return null
  const n = parseInt(v, 10)
  return isNaN(n) ? null : n
}

function parseNullableFloat(value: string): number | null {
  const v = value.trim()
  if (!v || v.toUpperCase() === 'NULL' || v === '') return null
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '')
}

async function readCsv(filePath: string): Promise<CsvRow[]> {
  const rows: CsvRow[] = []
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' })
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })
  let headers: string[] = []
  let lineNum = 0
  for await (const line of rl) {
    lineNum++
    if (lineNum === 1) {
      headers = parseCsvLine(line)
      continue
    }
    const values = parseCsvLine(line)
    if (values.length !== headers.length) {
      console.warn(`  [WARN] Line ${lineNum}: column count mismatch (${values.length} vs ${headers.length}), skipping`)
      continue
    }
    const row: any = {}
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = values[i]
    }
    rows.push(row as CsvRow)
  }
  return rows
}

function findMatchingProduct(products: Array<{ id: string; nameFr: string; brandName: string }>, row: CsvRow): string | null {
  const csvBrand = row.brand.trim().toLowerCase()
  const csvProduct = row.product.trim()
  const csvNormalized = normalizeName(csvProduct)

  // Filter by brand first
  const candidates = products.filter(p => p.brandName.toLowerCase() === csvBrand)
  if (candidates.length === 0) return null

  // Try exact match after normalization
  for (const p of candidates) {
    if (normalizeName(p.nameFr) === csvNormalized) return p.id
  }

  // Try substring match: if product name contains the CSV name or vice versa
  for (const p of candidates) {
    const pNormalized = normalizeName(p.nameFr)
    if (pNormalized.includes(csvNormalized) || csvNormalized.includes(pNormalized)) return p.id
  }

  // Try matching by viscosity keyword in name
  const viscosityMatch = csvProduct.match(/(\d+W[-\s]?\d+)/i)
  if (viscosityMatch) {
    const viscosity = viscosityMatch[1].replace(/\s+/g, '').toUpperCase()
    for (const p of candidates) {
      if (normalizeName(p.nameFr).includes(viscosity.toLowerCase())) return p.id
    }
  }

  return null
}

async function main() {
  const csvPath = path.join(__dirname, 'lubricant-dataset.csv')
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`)
    process.exit(1)
  }

  console.log('Reading CSV...')
  const rows = await readCsv(csvPath)
  console.log(`  Loaded ${rows.length} rows from CSV`)

  // Fetch all published products with their brand
  const allProducts = await prisma.product.findMany({
    where: { isPublished: true },
    include: { brand: true },
  })
  const products = allProducts.map(p => ({ id: p.id, nameFr: p.nameFr, brandName: p.brand.name }))
  console.log(`  Found ${products.length} published products in DB`)

  let matched = 0
  let unmatched = 0
  let updated = 0
  let skipped = 0

  for (const row of rows) {
    const productId = findMatchingProduct(products, row)
    if (!productId) {
      unmatched++
      if (unmatched <= 10) {
        console.warn(`  [UNMATCHED] ${row.brand} / ${row.product}`)
      }
      continue
    }
    matched++

    // Parse vehicle types
    const vehicleTypes: VehicleType[] = (row.vehicleTypes || '')
      .split(';')
      .map(v => mapVehicleType(v.trim()))
      .filter((v): v is VehicleType => v !== null)

    // Parse fuel types - only ESSENCE and DIESEL
    const fuelTypes: FuelType[] = (row.fuelTypes || '')
      .split(';')
      .map(f => mapFuelType(f.trim()))
      .filter((f): f is FuelType => f !== null)

    // Determine synthetic type from viscosity / product name
    const productName = row.product.toLowerCase()
    const viscosity = row.viscosity !== 'NA' ? row.viscosity : null

    let isFullySynth = false
    let isSemiSynth = false
    let isMinerale = false

    if (viscosity && (viscosity.startsWith('0W') || viscosity.startsWith('5W'))) {
      // 0W and 5W are typically fully synthetic
      isFullySynth = true
    } else if (viscosity && viscosity.startsWith('10W')) {
      // 10W can be semi-synthetic or fully synthetic
      if (productName.includes('racing') || productName.includes('full') || productName.includes('synth')) {
        isFullySynth = true
      } else {
        isSemiSynth = true
      }
    } else if (viscosity && viscosity.startsWith('15W')) {
      isMinerale = true
    }

    // Get existing specs or create new one
    const existing = await prisma.productSpecs.findUnique({ where: { productId } })
    if (existing) {
      await prisma.productSpecs.update({
        where: { productId },
        data: {
          viscosity: viscosity ?? existing.viscosity,
          vehicleTypes: vehicleTypes.length > 0 ? vehicleTypes : existing.vehicleTypes,
          fuelTypes: fuelTypes.length > 0 ? fuelTypes : existing.fuelTypes,
          isFullySynth,
          isSemiSynth,
          isMinerale,
          // Keep minCylinders/maxCylinders/minPower/maxPower as NULL since dataset has no values
        },
      })
      updated++
    } else {
      // Create new specs for existing products that don't have them yet
      await prisma.productSpecs.create({
        data: {
          productId,
          viscosity,
          vehicleTypes,
          fuelTypes,
          isFullySynth,
          isSemiSynth,
          isMinerale,
        },
      })
      updated++
    }
  }

  console.log(`\nResults:`)
  console.log(`  Matched:   ${matched}`)
  console.log(`  Updated:   ${updated}`)
  console.log(`  Unmatched: ${unmatched}`)
  console.log(`  Skipped:   ${skipped}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
