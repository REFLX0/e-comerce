const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const prisma = new PrismaClient()

function parseCsvLine(line) {
  const result = []
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

function mapVehicleType(value) {
  const v = value.trim().toUpperCase()
  if (v === 'AUTOMOBILE') return 'AUTOMOBILE'
  if (v === 'MOTO') return 'MOTO'
  if (v === 'POIDS LOURD') return 'POIDS_LOURD'
  if (v === 'AGRICOLE') return 'AGRICOLE'
  return null
}

function mapFuelType(value) {
  const v = value.trim().toUpperCase()
  if (v === 'ESSENCE') return 'ESSENCE'
  if (v === 'DIESEL') return 'DIESEL'
  return null
}

function tokenize(name) {
  return name.toLowerCase().split(/[\s,;:/()&]+/).filter(t => t.length > 1 && !['the','and','for','with'].includes(t))
}

function matchScore(dbName, csvProduct, brandName) {
  const dbTokens = new Set(tokenize(dbName))
  const csvTokens = new Set(tokenize(csvProduct))

  // Remove brand token from DB tokens if it matches the brand
  const brandToken = brandName.toLowerCase()
  dbTokens.delete(brandToken)

  // Count common tokens
  let common = 0
  for (const t of csvTokens) {
    if (dbTokens.has(t)) common++
  }

  // Viscosity match bonus
  const viscMatch = csvProduct.match(/(\d+W[-\s]?\d+)/i)
  if (viscMatch) {
    const v = viscMatch[1].replace(/\s+/g, '').toLowerCase()
    for (const t of dbTokens) {
      if (t.includes(v)) common += 2
    }
  }

  return common
}

async function readCsv(filePath) {
  const rows = []
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' })
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })
  let headers = []
  let lineNum = 0
  for await (const line of rl) {
    lineNum++
    if (lineNum === 1) {
      headers = parseCsvLine(line).map(h => h.trim())
      continue
    }
    const values = parseCsvLine(line)
    if (values.length !== headers.length) {
      console.warn(`  [WARN] Line ${lineNum}: column count mismatch (${values.length} vs ${headers.length}), skipping`)
      continue
    }
    const row = {}
    for (let i = 0; i < headers.length; i++) {
      row[headers[i].trim()] = (values[i] || '').trim()
    }
    rows.push(row)
  }
  return rows
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

  const allProducts = await prisma.product.findMany({
    where: { isPublished: true },
    include: { brand: true },
  })
  const realProducts = allProducts.filter(p =>
    !p.nameFr.startsWith('Test Product') &&
    !p.nameFr.startsWith('DeleteTest') &&
    !p.nameFr.startsWith('Huile Standard') &&
    p.nameFr !== '7410' &&
    p.nameFr !== 'Filtre à Huile Bosch P3045' &&
    p.nameFr !== 'Liqui Moly Ceratec Additif'
  )
  console.log(`  Found ${realProducts.length} real products`)

  for (const product of realProducts) {
    const brandName = product.brand.name
    const dbName = product.nameFr

    let bestRow = null
    let bestScore = 0

    const matchingBrandRows = rows.filter(r => r.Brand.trim().toLowerCase() === brandName.toLowerCase())

    for (const row of matchingBrandRows) {
      const score = matchScore(dbName, row.Product, brandName)
      if (score > bestScore) {
        bestScore = score
        bestRow = row
      }
    }

    if (!bestRow || bestScore < 1) {
      console.log(`  [NO MATCH] ${brandName} / ${dbName} (best score=${bestScore})`)
      continue
    }

    console.log(`  [MATCH] ${brandName} / ${dbName} <- "${bestRow.Product}" (score=${bestScore})`)

    const vehicleTypes = (bestRow.VehicleTypes || '').split(';').map(v => mapVehicleType(v.trim())).filter(Boolean)
    const fuelTypes = (bestRow.FuelTypes || '').split(';').map(f => mapFuelType(f.trim())).filter(Boolean)
    const viscosity = bestRow.Viscosity !== 'NA' ? bestRow.Viscosity : null

    let isFullySynth = false, isSemiSynth = false, isMinerale = false
    if (viscosity && (viscosity.startsWith('0W') || viscosity.startsWith('5W'))) isFullySynth = true
    else if (viscosity && viscosity.startsWith('10W')) isSemiSynth = true
    else if (viscosity && viscosity.startsWith('15W')) isMinerale = true

    const existing = await prisma.productSpecs.findUnique({ where: { productId: product.id } })
    if (existing) {
      await prisma.productSpecs.update({
        where: { productId: product.id },
        data: {
          viscosity: viscosity ?? existing.viscosity,
          vehicleTypes: vehicleTypes.length > 0 ? vehicleTypes : existing.vehicleTypes,
          fuelTypes: fuelTypes.length > 0 ? fuelTypes : existing.fuelTypes,
          isFullySynth, isSemiSynth, isMinerale,
        },
      })
    } else {
      await prisma.productSpecs.create({
        data: { productId: product.id, viscosity, vehicleTypes, fuelTypes, isFullySynth, isSemiSynth, isMinerale },
      })
    }
    console.log(`    vehicleTypes=${JSON.stringify(vehicleTypes)} fuelTypes=${JSON.stringify(fuelTypes)}`)
  }

  console.log('\nDone!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
