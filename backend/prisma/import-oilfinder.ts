// backend/prisma/import-oilfinder.ts
// ---------------------------------------------------------------------------
// One-off / repeatable staging import for the Oil Finder dataset.
//
//   npx tsx prisma/import-oilfinder.ts                 # dry-run report
//   npx tsx prisma/import-oilfinder.ts --apply         # import (idempotent)
//   npx tsx prisma/import-oilfinder.ts --apply --dir <path>  # custom data dir
//
// Reads:
//   - <dir>/automobile-{brand}.json                (21 files, arrays of entries)
//   - <dir>/characteristics-lookup-conflicts.json  (precomputed conflict report)
//
// Idempotency:
//   - OilFinderOilSpec        upserted by `fingerprint`
//   - OilFinderVehicle        upserted by (make, model, generation, engineCode, source)
//   - OilFinderLookupConflict upserted by (displacementCc, powerHp, fuelType)
// Re-running with updated files updates existing rows in place; nothing is
// deleted, so rows that disappear from the files remain (audit-friendly).
//
// Validation: rows that fail strict validation are SKIPPED and reported —
// never silently coerced (e.g. non-integer powerHp). fuelType is normalized
// to lowercase/trimmed so lookups and the conflicts report join cleanly.
// ---------------------------------------------------------------------------

import { Prisma, PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const APPLY = process.argv.includes('--apply')
const DIR_ARG = process.argv.indexOf('--dir')
const DIR_VALUE = DIR_ARG > -1 ? process.argv[DIR_ARG + 1] : undefined
const DATA_DIR = DIR_VALUE
  ? path.resolve(DIR_VALUE)
  : path.join(__dirname, 'oilfinder-data')

type MatchAmbiguity = Record<string, string> | null

interface VehicleEntry {
  category: string
  make: string
  model: string
  generation?: string | null
  yearFrom?: number | null
  yearTo?: number | null
  engineCode?: string | null
  displacementCc?: number | null
  fuelType: string
  powerKw?: number | null
  powerHp?: number | null
  oilViscosity: string
  oilSpecAPI?: string | null
  oilSpecACEA?: string | null
  oilSpecOEM?: string | null
  oilCapacityLiters?: number | null
  oilChangeIntervalKm?: number | null
  hydraulicTransmissionOilType?: string | null
  hydraulicOilSpecOEM?: string | null
  hydraulicOilCapacityLiters?: number | null
  source: string
  confidence: string
  matchAmbiguity?: MatchAmbiguity
}

interface ConflictEntry {
  displacementCc: number
  powerHp: number
  fuelType: string
  fieldSeverities: Record<string, string>
  candidates?: unknown
}

function norm(str: unknown): string | null {
  if (str == null) return null
  const s = String(str).trim()
  return s === '' ? null : s.toLowerCase()
}

function normStr(str: unknown): string {
  return norm(str) ?? ''
}

function asInt(value: unknown, rowLabel: string, skipped: string[]): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isInteger(n)) {
    skipped.push(`${rowLabel}: field must be an integer, got ${JSON.stringify(value)}`)
    return null
  }
  return n
}

function asFloat(value: unknown, rowLabel: string, skipped: string[]): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  if (Number.isNaN(n)) {
    skipped.push(`${rowLabel}: field must be a number, got ${JSON.stringify(value)}`)
    return null
  }
  return n
}

/** Canonical spec key — lowercase, trimmed, ordered, JSON-encoded. */
function specFingerprint(viscosity: string, api: string | null, acea: string | null, oem: string | null): string {
  return JSON.stringify([normStr(viscosity), norm(api), norm(acea), norm(oem)])
}

function highestSeverity(fieldSeverities: Record<string, string>): string {
  return Object.values(fieldSeverities).some((s) => String(s).toLowerCase() === 'major') ? 'MAJOR' : 'MINOR'
}

async function loadVehicles(skipped: string[]) {
  const files = fs.readdirSync(DATA_DIR).filter((f) => /^(automobile|moto|poids-lourd|agricole|marine)-.+\.json$/i.test(f) && !f.includes('conflicts'))
  if (files.length === 0) {
    throw new Error(`No category-brand.json files found in ${DATA_DIR}`)
  }
  const vehicles: VehicleEntry[] = []
  for (const file of files.sort()) {
    const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')) as unknown
    if (!Array.isArray(raw)) {
      throw new Error(`${file}: expected an array of vehicle entries, got ${typeof raw}`)
    }
    for (const [i, entry] of raw.entries()) {
      const label = `${file}[${i}]`
      // For agricole files, fields might be prefixed with "engine"
      if (entry && typeof entry === 'object') {
        const _e = entry as Record<string, unknown>
        if (!('oilViscosity' in _e) && 'engineOilViscosity' in _e) _e.oilViscosity = _e.engineOilViscosity
        if (!('oilCapacityLiters' in _e) && 'engineOilCapacityLiters' in _e) _e.oilCapacityLiters = _e.engineOilCapacityLiters
        if (!('oilSpecAPI' in _e) && 'engineOilSpecAPI' in _e) _e.oilSpecAPI = _e.engineOilSpecAPI
        if (!('oilSpecACEA' in _e) && 'engineOilSpecACEA' in _e) _e.oilSpecACEA = _e.engineOilSpecACEA
        if (_e.oilSpecMarine && !_e.oilSpecOEM) _e.oilSpecOEM = `NMMA ${_e.oilSpecMarine}`
        if (_e.oilSpecMarine && !_e.oilSpecAPI) _e.oilSpecAPI = 'SJ/SL'
      }
      const e = entry as Partial<VehicleEntry>
      if (!e.make || !e.model || !e.fuelType || !e.oilViscosity || !e.source || !e.confidence) {
        skipped.push(`${label}: missing required field (make/model/fuelType/oilViscosity/source/confidence)`)
        continue
      }
      const displacementCc = asInt(e.displacementCc, label, skipped)
      const powerKw = asFloat(e.powerKw, label, skipped)
      const powerHp = asFloat(e.powerHp, label, skipped)
      const yearFrom = asInt(e.yearFrom, label, skipped)
      const yearTo = asInt(e.yearTo, label, skipped)
      const capacityRaw = e.oilCapacityLiters as unknown
      const capacityLiters = capacityRaw == null || capacityRaw === ''
        ? null
        : Number(capacityRaw)
      if (capacityLiters != null && Number.isNaN(capacityLiters)) {
        skipped.push(`${label}: oilCapacityLiters must be numeric, got ${JSON.stringify(e.oilCapacityLiters)}`)
        continue
      }
      const changeIntervalKm = asInt(e.oilChangeIntervalKm, label, skipped)
      const hydCapacityRaw = e.hydraulicOilCapacityLiters as unknown
      const hydCapacityLiters = hydCapacityRaw == null || hydCapacityRaw === ''
        ? null
        : Number(hydCapacityRaw)
      if (hydCapacityLiters != null && Number.isNaN(hydCapacityLiters)) {
        skipped.push(`${label}: hydraulicOilCapacityLiters must be numeric, got ${JSON.stringify(e.hydraulicOilCapacityLiters)}`)
        continue
      }
      const category = file.startsWith('poids-lourd') ? 'poids-lourd' : (file.match(/^(.*?)-/)?.[1]?.toLowerCase() || 'automobile');
      vehicles.push({
        category,
        make: String(e.make).trim(),
        model: String(e.model).trim(),
        generation: e.generation ? String(e.generation).trim() : '',
        yearFrom,
        yearTo,
        engineCode: e.engineCode ? String(e.engineCode).trim() : '',
        displacementCc,
        powerKw,
        powerHp,
        fuelType: normStr(e.fuelType),
        oilViscosity: String(e.oilViscosity).trim(),
        oilSpecAPI: e.oilSpecAPI ? String(e.oilSpecAPI).trim() : null,
        oilSpecACEA: e.oilSpecACEA ? String(e.oilSpecACEA).trim() : null,
        oilSpecOEM: e.oilSpecOEM ? String(e.oilSpecOEM).trim() : null,
        oilCapacityLiters: capacityLiters,
        oilChangeIntervalKm: changeIntervalKm,
        hydraulicTransmissionOilType: e.hydraulicTransmissionOilType ? String(e.hydraulicTransmissionOilType).trim() : null,
        hydraulicOilSpecOEM: e.hydraulicOilSpecOEM ? String(e.hydraulicOilSpecOEM).trim() : null,
        hydraulicOilCapacityLiters: hydCapacityLiters,
        source: String(e.source).trim(),
        confidence: String(e.confidence).trim().toLowerCase(),
        matchAmbiguity: e.matchAmbiguity ?? null,
      })
    }
  }
  return { vehicles, fileCount: files.length }
}

async function loadConflicts(skipped: string[]) {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.includes('conflicts'))
  const conflicts: ConflictEntry[] = []
  
  if (files.length === 0) {
    return conflicts
  }

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file)
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown
    const list = Array.isArray(raw) ? raw : (raw as { conflicts?: unknown[] }).conflicts
    if (!Array.isArray(list)) {
      throw new Error(`${file}: expected an array (or {conflicts: []})`)
    }
    for (const [i, entry] of list.entries()) {
      const label = `${file}[${i}]`
      const e = entry as Partial<ConflictEntry>
      const displacementCc = asInt(e.displacementCc, label, skipped)
      const powerHp = asFloat(e.powerHp, label, skipped)
      if (displacementCc == null || powerHp == null || !e.fuelType || !e.fieldSeverities) {
        skipped.push(`${label}: missing/invalid displacementCc|powerHp|fuelType|fieldSeverities`)
        continue
      }
      conflicts.push({
        displacementCc,
        powerHp,
        fuelType: normStr(e.fuelType),
        fieldSeverities: e.fieldSeverities,
        candidates: e.candidates ?? null,
      })
    }
  }
  return conflicts
}

async function main() {
  console.log(`Data dir: ${DATA_DIR}`)
  console.log(`Mode: ${APPLY ? 'IMPORT' : 'DRY-RUN (add --apply to write)'}`)

  const skipped: string[] = []
  const { vehicles, fileCount } = await loadVehicles(skipped)
  const conflicts = await loadConflicts(skipped)

  const uniqueVehicles = new Set(vehicles.map((v) => JSON.stringify([v.make, v.model, v.generation, v.engineCode, v.source])))
  const duplicates = vehicles.length - uniqueVehicles.size
  if (duplicates > 0) {
    skipped.push(`SKIP ${duplicates} duplicate row(s) (same make/model/generation/engineCode/source in same run)`)
  }

  console.log('')
  console.log(`Brand files found: ${fileCount} · vehicle entries: ${vehicles.length} · conflict entries: ${conflicts.length}${duplicates ? ` · duplicates within run: ${duplicates}` : ''}`)

  const skippedReport = skipped.length ? `\n${skipped.map((s) => `  ⚠ ${s}`).join('\n')}` : ''
  console.log(`Skipped/warnings: ${skipped.length}${skippedReport}`)

  if (!APPLY) {
    console.log('\nPLAN  ready — re-run with --apply to import')
    return
  }

  // ── Import (single transaction) ────────────────────────────────────
  let specCreated = 0
  let specUpdated = 0
  let vehicleCreated = 0
  let vehicleUpdated = 0
  let conflictCreated = 0
  let conflictUpdated = 0

  await prisma.$transaction(
    async (tx) => {
      const seen = new Map<string, string>() // fingerprint → specId (within run)

      for (const v of vehicles) {
        const fingerprint = specFingerprint(v.oilViscosity, v.oilSpecAPI ?? null, v.oilSpecACEA ?? null, v.oilSpecOEM ?? null)
        let specId = seen.get(fingerprint)
        if (!specId) {
          const existing = await tx.oilFinderOilSpec.findUnique({ where: { fingerprint }, select: { id: true } })
          if (existing) {
            specId = existing.id
            const updated = await tx.oilFinderOilSpec.updateMany({
              where: { id: specId, OR: [{ viscosity: { not: v.oilViscosity } }, { capacityLiters: { not: v.oilCapacityLiters ?? null } }] },
              data: { viscosity: v.oilViscosity, apiStandard: v.oilSpecAPI, aceaStandard: v.oilSpecACEA, oemApproval: v.oilSpecOEM, capacityLiters: v.oilCapacityLiters, changeIntervalKm: v.oilChangeIntervalKm },
            })
            if (updated.count) specUpdated++
          } else {
            specId = (await tx.oilFinderOilSpec.create({
              data: {
                viscosity: v.oilViscosity,
                apiStandard: v.oilSpecAPI,
                aceaStandard: v.oilSpecACEA,
                oemApproval: v.oilSpecOEM,
                capacityLiters: v.oilCapacityLiters,
                changeIntervalKm: v.oilChangeIntervalKm,
                fingerprint,
              },
            })).id
            specCreated++
          }
          seen.set(fingerprint, specId)
        }

        const key = { make: v.make, model: v.model, generation: v.generation ?? '', engineCode: v.engineCode ?? '', source: v.source }
        const existingVehicle = await tx.oilFinderVehicle.findUnique({
          where: { make_model_generation_engineCode_source: key },
          select: { id: true, oilSpecId: true },
        })
        const data = {
          category: v.category,
          yearFrom: v.yearFrom,
          yearTo: v.yearTo,
          displacementCc: v.displacementCc,
          powerKw: v.powerKw,
          powerHp: v.powerHp,
          fuelType: v.fuelType,
          oilSpecId: specId,
          hydraulicTransmissionOilType: v.hydraulicTransmissionOilType ?? null,
          hydraulicOilSpecOEM: v.hydraulicOilSpecOEM ?? null,
          hydraulicOilCapacityLiters: v.hydraulicOilCapacityLiters ?? null,
          confidence: v.confidence,
          matchAmbiguity: v.matchAmbiguity ?? Prisma.JsonNull,
        }
        if (existingVehicle) {
          await tx.oilFinderVehicle.update({ where: { id: existingVehicle.id }, data })
          vehicleUpdated++
        } else {
          await tx.oilFinderVehicle.create({ data: { ...key, ...data } })
          vehicleCreated++
        }
      }

      for (const c of conflicts) {
        const existing = await tx.oilFinderLookupConflict.findUnique({
          where: { displacementCc_powerHp_fuelType: { displacementCc: c.displacementCc, powerHp: c.powerHp, fuelType: c.fuelType } },
          select: { id: true },
        })
        const data = {
          highestSeverity: highestSeverity(c.fieldSeverities),
          fieldSeverities: c.fieldSeverities as object,
          candidateCount: Array.isArray(c.candidates) ? c.candidates.length : Object.keys(c.candidates ?? {}).length,
          rawReport: (c.candidates ? { ...c, candidates: undefined } : c) as object,
        }
        if (existing) {
          await tx.oilFinderLookupConflict.update({ where: { id: existing.id }, data })
          conflictUpdated++
        } else {
          await tx.oilFinderLookupConflict.create({ data: { ...data, displacementCc: c.displacementCc, powerHp: c.powerHp, fuelType: c.fuelType } })
          conflictCreated++
        }
      }
    },
    { timeout: 120_000 },
  )

  console.log('')
  console.log(`IMPORTED ✅`)
  console.log(`  OilFinderOilSpec:        ${specCreated} created, ${specUpdated} updated`)
  console.log(`  OilFinderVehicle:        ${vehicleCreated} created, ${vehicleUpdated} updated`)
  console.log(`  OilFinderLookupConflict: ${conflictCreated} created, ${conflictUpdated} updated`)
}

main()
  .catch((err) => {
    console.error('FATAL:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())