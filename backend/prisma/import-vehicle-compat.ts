import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface CsvRow {
  make: string
  model: string
  engine: string
  sku: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []

  let startIndex = 0
  const headerLine = lines[0]
  if (headerLine) {
    const first = parseCsvLine(headerLine)
    if (first.length >= 4 && ['make', 'model', 'engine', 'product_sku'].includes(first[0]?.toLowerCase().replace(/^\uFEFF/, '') ?? '')) {
      startIndex = 1
    }
  }

  const rows: CsvRow[] = []
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const cols = parseCsvLine(line)
    if (cols.length < 4) {
      console.warn(`  [SKIP] Line ${i + 1}: expected 4 columns, got ${cols.length} — "${line.trim()}"`)
      continue
    }
    rows.push({
      make: (cols[0] ?? '').replace(/^\uFEFF/, '').trim(),
      model: (cols[1] ?? '').trim(),
      engine: (cols[2] ?? '').trim(),
      sku: (cols[3] ?? '').trim(),
    })
  }
  return rows
}

async function main() {
  const args = process.argv.slice(2)
  const csvPath = args[0]

  if (!csvPath) {
    console.error('Usage: npx tsx prisma/import-vehicle-compat.ts <path/to/file.csv>')
    process.exit(1)
  }

  const resolvedPath = path.resolve(csvPath)
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`)
    process.exit(1)
  }

  const content = fs.readFileSync(resolvedPath, 'utf-8')
  const rows = parseCsv(content)

  if (rows.length === 0) {
    console.log('No data rows found in CSV.')
    await prisma.$disconnect()
    return
  }

  console.log(`\nParsed ${rows.length} rows from ${path.basename(resolvedPath)}`)
  console.log('─'.repeat(60))

  const stats = {
    total: rows.length,
    created: 0,
    skipped: {
      missingSku: 0,
      duplicate: 0,
      error: 0,
    },
    errors: [] as string[],
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (!row) continue
    const lineNum = i + 2
    const prefix = `[${lineNum}] ${row.make} / ${row.model} / ${row.engine} → ${row.sku}`

    try {
      // 1. Find product by SKU
      const product = await prisma.product.findUnique({ where: { sku: row.sku } })
      if (!product) {
        stats.skipped.missingSku++
        console.warn(`  [SKIP] ${prefix} — SKU "${row.sku}" not found in database`)
        continue
      }

      // 2. Find or create VehicleMake
      const make = await prisma.vehicleMake.upsert({
        where: { name: row.make },
        update: {},
        create: { name: row.make, slug: slugify(row.make) },
      })

      // 3. Find or create VehicleModel
      let model = await prisma.vehicleModel.findFirst({
        where: { makeId: make.id, name: row.model },
      })
      if (!model) {
        let slug = slugify(row.model)
        // Ensure slug uniqueness
        const slugConflict = await prisma.vehicleModel.findUnique({ where: { slug } })
        if (slugConflict) {
          slug = `${slugify(row.make)}-${slug}`
        }
        model = await prisma.vehicleModel.create({
          data: { makeId: make.id, name: row.model, slug },
        })
      }

      // 4. Check for existing compatibility (unique constraint: productId + vehicleModelId + engineCode)
      const existing = await prisma.vehicleCompatibility.findFirst({
        where: {
          productId: product.id,
          vehicleModelId: model.id,
          engineCode: row.engine || null,
        },
      })
      if (existing) {
        stats.skipped.duplicate++
        console.log(`  [DUPE] ${prefix} — already exists`)
        continue
      }

      // 5. Create compatibility link
      await prisma.vehicleCompatibility.create({
        data: {
          productId: product.id,
          vehicleModelId: model.id,
          engineCode: row.engine || null,
        },
      })
      stats.created++
      console.log(`  [ OK ] ${prefix}`)
    } catch (err: any) {
      stats.skipped.error++
      const msg = err?.message || String(err)
      stats.errors.push(`Line ${lineNum}: ${msg}`)
      console.error(`  [ERR ] ${prefix} — ${msg}`)
    }
  }

  // Summary
  console.log('')
  console.log('╔══════════════════════════════════════════════╗')
  console.log('║            IMPORT COMPLETE                  ║')
  console.log('╠══════════════════════════════════════════════╣')
  console.log(`║  Total rows processed     : ${String(stats.total).padStart(5)}              ║`)
  console.log(`║  Compatibility links created: ${String(stats.created).padStart(5)}              ║`)
  console.log(`║  Skipped (SKU not found)   : ${String(stats.skipped.missingSku).padStart(5)}              ║`)
  console.log(`║  Skipped (duplicate)       : ${String(stats.skipped.duplicate).padStart(5)}              ║`)
  console.log(`║  Skipped (error)           : ${String(stats.skipped.error).padStart(5)}              ║`)
  console.log('╚══════════════════════════════════════════════╝')

  if (stats.errors.length > 0) {
    console.log('\nErrors:')
    stats.errors.forEach(e => console.log(`  - ${e}`))
  }
}

main()
  .catch(e => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
