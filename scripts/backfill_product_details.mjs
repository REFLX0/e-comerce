#!/usr/bin/env node
/**
 * Backfill customer-facing product descriptions and specifications.
 *
 * The Autopart scraper stores most technical-spec rows as
 * `product_id,label|value`.  This script preserves those values and puts them
 * in the product description consumed by the catalogue UI.  Products without
 * a scraper technical row still receive factual catalogue metadata, so neither
 * tab is left empty.
 *
 * Usage:
 *   node scripts/backfill_product_details.mjs --dry-run
 *   node scripts/backfill_product_details.mjs
 */

import { createReadStream, existsSync, readFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = process.env.BACKFILL_WORKSPACE_ROOT || resolve(scriptDirectory, '..')
const sourceDirectory = process.env.BACKFILL_SOURCE_DIRECTORY || resolve(workspaceRoot, 'autopart_db')
const packageJsonPath = process.env.BACKFILL_PACKAGE_JSON || resolve(workspaceRoot, 'backend', 'package.json')
const require = createRequire(packageJsonPath)
const { Pool } = require('pg')

const dryRun = process.argv.includes('--dry-run')
const maxSpecs = 20
const batchSize = 250

function loadEnvironment(filePath) {
  if (!existsSync(filePath)) return {}

  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=')
        if (separator === -1) return [line, '']
        const key = line.slice(0, separator).trim()
        const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
        return [key, value]
      }),
  )
}

function databaseUrl() {
  const environment = {
    ...loadEnvironment(resolve(workspaceRoot, 'backend', '.env')),
    ...loadEnvironment(resolve(workspaceRoot, '.env')),
    ...process.env,
  }

  if (!environment.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Set it in the environment or an .env file.')
  }

  const url = new URL(environment.DATABASE_URL)
  // Docker Compose exposes PostgreSQL as `db`, while the same database is
  // published on localhost:5433 for host-side maintenance scripts.
  if (process.platform === 'win32' && url.hostname === 'db') {
    url.hostname = '127.0.0.1'
    url.port = '5433'
  }
  return url.toString()
}

function parseCsvLine(line) {
  const values = []
  let value = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        value += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (character === ',' && !inQuotes) {
      values.push(value)
      value = ''
    } else {
      value += character
    }
  }

  values.push(value)
  return values
}

async function readCsvRows(filePath, onRow) {
  const input = createReadStream(filePath, { encoding: 'utf8' })
  const lines = createInterface({ input, crlfDelay: Infinity })
  let headers = null

  for await (const line of lines) {
    if (!headers) {
      headers = parseCsvLine(line)
      continue
    }

    const values = parseCsvLine(line)
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
    await onRow(row, values)
  }
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleFromSlug(value) {
  return cleanText(value)
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function productDescription({ name, brand, reference, category, sourceDescription }) {
  const cleanedSource = cleanText(sourceDescription)
    .replace(/\s*—\s*\.?\s*Pièce de qualité livrée partout en Tunisie\.?/i, '')
    .trim()
  const genericSource = !cleanedSource || cleanedSource === name || cleanedSource.length <= name.length + 30

  if (!genericSource) return cleanedSource

  const sentences = [
    `${name} est une pièce de rechange automobile de marque ${brand || 'd’origine contrôlée'}.`,
  ]
  if (reference) sentences.push(`Référence fabricant : ${reference}.`)
  if (category) sentences.push(`Catégorie : ${category}.`)
  return sentences.join(' ')
}

function addDetail(details, label, value) {
  const normalizedLabel = cleanText(label)
  const normalizedValue = cleanText(value)
  if (!normalizedLabel || !normalizedValue || details.some(([existing]) => existing.toLocaleLowerCase('fr') === normalizedLabel.toLocaleLowerCase('fr'))) {
    return
  }
  details.push([normalizedLabel, normalizedValue])
}

function buildDescription(source, fallback) {
  const name = cleanText(source?.name || fallback.name)
  const brand = cleanText(source?.brand || fallback.brand)
  const reference = cleanText(source?.mpn || source?.sku || fallback.sku)
  const category = cleanText(source?.category_name || fallback.category)
  const subcategory = cleanText(source?.subcategory_slug ? titleFromSlug(source.subcategory_slug) : '')
  const details = []

  addDetail(details, 'Marque', brand)
  addDetail(details, 'Référence fabricant', reference)
  addDetail(details, 'Catégorie', category)
  addDetail(details, 'Sous-catégorie', subcategory)

  for (const [label, value] of source?.specifications ?? []) {
    if (details.length >= maxSpecs) break
    addDetail(details, label, value)
  }

  const description = productDescription({
    name,
    brand,
    reference,
    category,
    sourceDescription: source?.description,
  })

  return `${description}\n\nSpécifications techniques:\n${details.map(([label, value]) => `• ${label}: ${value}`).join('\n')}`
}

async function readSourceData() {
  const productsBySku = new Map()
  const specsByProductId = new Map()

  await readCsvRows(resolve(sourceDirectory, 'technical_specs.csv'), async (row, values) => {
    const productId = cleanText(row.product_id)
    // Scraper rows are not quoted. Rejoin any commas split from decimal or
    // multi-value specifications before separating the label from its value.
    const packedSpecification = cleanText(values.slice(1).join(','))
    const separator = packedSpecification.indexOf('|')
    const label = cleanText(separator === -1 ? row.spec_label : packedSpecification.slice(0, separator))
    const value = cleanText(
      separator === -1
        ? values.slice(2).join(',')
        : packedSpecification.slice(separator + 1),
    )

    if (!productId || !label || !value) return
    const specifications = specsByProductId.get(productId) ?? []
    if (!specifications.some(([existingLabel, existingValue]) => existingLabel === label && existingValue === value)) {
      specifications.push([label, value])
    }
    specsByProductId.set(productId, specifications)
  })

  await readCsvRows(resolve(sourceDirectory, 'products.csv'), async (row) => {
    const externalId = cleanText(row.product_id)
    if (!externalId) return

    productsBySku.set(externalId, {
      name: cleanText(row.name),
      brand: cleanText(row.brand),
      sku: cleanText(row.sku),
      mpn: cleanText(row.mpn),
      category_name: cleanText(row.category_name),
      subcategory_slug: cleanText(row.subcategory_slug),
      description: cleanText(row.description),
      specifications: specsByProductId.get(externalId) ?? [],
    })
  })

  return productsBySku
}

async function updateDescriptions(pool, updates) {
  for (let start = 0; start < updates.length; start += batchSize) {
    const batch = updates.slice(start, start + batchSize)
    const bindings = []
    const tuples = batch.map((update, index) => {
      const position = index * 2
      bindings.push(update.id, update.description)
      return `($${position + 1}::text, $${position + 2}::text)`
    })

    await pool.query(
      `UPDATE "Product" AS product
       SET description = source.description
       FROM (VALUES ${tuples.join(', ')}) AS source(id, description)
       WHERE product.id = source.id`,
      bindings,
    )
  }
}

async function main() {
  const productSource = await readSourceData()
  const pool = new Pool({ connectionString: databaseUrl() })

  try {
    const { rows } = await pool.query(`
      SELECT product.id, product.sku, product."nameFr" AS name,
             brand.name AS brand, category."nameFr" AS category
      FROM "Product" AS product
      INNER JOIN "Brand" AS brand ON brand.id = product."brandId"
      INNER JOIN "Category" AS category ON category.id = product."categoryId"
    `)

    const updates = rows.map((product) => ({
      id: product.id,
      description: buildDescription(productSource.get(product.sku), product),
    }))
    const sourceMatched = rows.filter((product) => productSource.has(product.sku)).length

    console.log(`Prepared ${updates.length.toLocaleString()} product descriptions (${sourceMatched.toLocaleString()} matched to scraper records).`)
    if (dryRun) {
      console.log('Dry run complete; no database changes were made.')
      return
    }

    await updateDescriptions(pool, updates)
    console.log(`Updated ${updates.length.toLocaleString()} product descriptions and specification blocks.`)
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error(`Backfill failed: ${error.message}`)
  process.exitCode = 1
})
