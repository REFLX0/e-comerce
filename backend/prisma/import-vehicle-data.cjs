const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// ── helpers ──────────────────────────────────────────────
const slugify = s =>
  s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const VEHICLE_TYPE_MAP = {
  'Automobile': 'AUTOMOBILE', 'Moto': 'MOTO',
  'Poids Lourd': 'POIDS_LOURD', 'Agricole': 'AGRICOLE'
}
const FUEL_TYPE_MAP = { 'Diesel': 'DIESEL', 'Petrol': 'ESSENCE', 'Electric': null }

function parseCsvLine(line) {
  const result = []; let cur = ''; let inQ = false
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; continue }
    if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; continue }
    cur += ch
  }
  result.push(cur.trim())
  return result
}

// Viscosity patterns to exclude from name-token matching
const VISC_PAT = /^\d{1,2}w\d{0,2}$|^\d{1,3}$|^w\d{1,2}$/i

function extractViscosity(name) {
  const m = name.match(/(\d{1,2}W[-\s]?\d{2})/i)
  return m ? m[1].replace(/\s+/g, '-').toUpperCase() : null
}

function tokenize(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/[\s-]+/)
    .filter(t => t.length > 1 && !['the','and','for','with','l','huile','oil','4t'].includes(t) && !VISC_PAT.test(t))
}

// Fuzzy match: brand must match, viscosity must match (if both present),
// at least 1 significant (non-viscosity) common token required
function productMatch(dbName, dbBrand, csvName) {
  const csvL = csvName.toLowerCase(), dbL = dbName.toLowerCase()
  if (!csvL.includes(dbBrand.toLowerCase())) return false
  const dbVis = extractViscosity(dbName), csvVis = extractViscosity(csvName)
  if (dbVis && csvVis && dbVis !== csvVis) return false
  const dbTokens = new Set(tokenize(dbL.replace(new RegExp(dbBrand.toLowerCase(), 'i'), '')))
  const csvTokens = tokenize(csvL.replace(new RegExp(dbBrand.toLowerCase(), 'i'), ''))
  return csvTokens.filter(t => dbTokens.has(t)).length >= 1
}

async function main() {
  const raw = fs.readFileSync(path.join(__dirname, 'vehicle-data.csv'), 'utf-8')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  const header = parseCsvLine(lines[0])
  const EXPECTED_COLS = header.length

  console.log(`CSV rows: ${lines.length - 1}, expected cols: ${EXPECTED_COLS}`)

  const dbProducts = await prisma.product.findMany({
    where: { isPublished: true, specs: { isNot: null } },
    include: { brand: true, specs: true }
  })
  console.log(`DB products with specs: ${dbProducts.length}`)
  for (const p of dbProducts) {
    console.log(`  - ${p.brand.name} | ${p.nameFr}`)
  }

  await prisma.vehicleCompatibility.deleteMany({})
  await prisma.vehicleModel.deleteMany({})
  await prisma.vehicleMake.deleteMany({})
  console.log('Cleared existing vehicle data')

  let makesCreated = 0, modelsCreated = 0, compatCreated = 0, matchDetails = []
  let skippedRows = 0

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i])
    while (cols.length < EXPECTED_COLS) {
      if (cols[0] === 'Moto' && cols.length === EXPECTED_COLS - 1) {
        cols.splice(3, 0, null)
      } else {
        cols.push(null)
      }
    }
    if (cols.length !== EXPECTED_COLS) {
      console.warn(`  Skip row ${i + 1}: ${cols.length} cols (expected ${EXPECTED_COLS})`)
      skippedRows++
      continue
    }

    const [
      vcat, vbrand, vmodel, gen, yStart, yEnd, engCode, motor,
      disp, cyl, fuel, hp, kw, turbo, hybrid, dpf,
      emiss, visc, cap, api, acea, jaso, oem,
      compatBrands, compatProds, notes, source
    ] = cols.map(s => (!s || s === 'NULL' || s === 'NA') ? null : s)

    const vt = VEHICLE_TYPE_MAP[vcat]
    if (!vt) { skippedRows++; continue }

    const makeSlug = slugify(vbrand)
    let make = await prisma.vehicleMake.findUnique({ where: { slug: makeSlug } })
    if (!make) {
      make = await prisma.vehicleMake.create({ data: { name: vbrand, slug: makeSlug } })
      makesCreated++
    }

    const modelName = gen ? `${vmodel} (${gen})` : vmodel
    const modelSlug = slugify(`${vbrand}-${modelName}`)
    let model = await prisma.vehicleModel.findUnique({ where: { slug: modelSlug } })
    if (!model) {
      model = await prisma.vehicleModel.create({
        data: { makeId: make.id, vehicleType: vt, name: modelName, slug: modelSlug }
      })
      modelsCreated++
    }

    if (!compatProds) continue
    const csvProducts = compatProds.split(';').map(s => s.trim()).filter(Boolean)
    for (const csvProd of csvProducts) {
      for (const dbp of dbProducts) {
        if (productMatch(dbp.nameFr, dbp.brand.name, csvProd)) {
          const engineStr = motor || engCode || null
          const existing = await prisma.vehicleCompatibility.findUnique({
            where: {
              productId_vehicleModelId_engineCode: {
                productId: dbp.id,
                vehicleModelId: model.id,
                engineCode: engineStr || ''
              }
            }
          })
          if (!existing) {
            await prisma.vehicleCompatibility.create({
              data: {
                productId: dbp.id,
                vehicleModelId: model.id,
                engineCode: engineStr,
                yearFrom: yStart ? parseInt(yStart) : null,
                yearTo: yEnd ? parseInt(yEnd) : null
              }
            })
            compatCreated++
            matchDetails.push(`    ${dbp.brand.name} ${dbp.nameFr} ← ${csvProd} (${vbrand} ${modelName})`)
          }
        }
      }
    }
  }

  console.log(`\n=== Results ===`)
  console.log(`Skipped rows: ${skippedRows}`)
  console.log(`Makes created: ${makesCreated}`)
  console.log(`Models created: ${modelsCreated}`)
  console.log(`Compatibilities created: ${compatCreated}`)

  if (matchDetails.length > 0) {
    console.log(`\n=== Matches made ===`)
    matchDetails.forEach(m => console.log(m))
  }

  const finalMakes = await prisma.vehicleMake.count()
  const finalModels = await prisma.vehicleModel.count()
  const finalCompat = await prisma.vehicleCompatibility.count()
  console.log(`\n=== Final counts ===`)
  console.log(`Makes: ${finalMakes}`)
  console.log(`Models: ${finalModels}`)
  console.log(`Compatibilities: ${finalCompat}`)

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
