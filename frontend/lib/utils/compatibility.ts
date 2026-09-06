import type { Product, UserCar } from '@/lib/types'
import type { SelectedVehicle } from '@/lib/store/vehicle.store'

export type CompatibilityVehicle = SelectedVehicle | UserCar

const ENGINE_NOISE = new Set([
  'ch',
  'cv',
  'hp',
  'kw',
  'de',
  'du',
  'a',
  'au',
])

const KNOWN_ENGINE_TOKENS = [
  'tdi',
  'tfsi',
  'tsi',
  'fsi',
  'hdi',
  'dci',
  'cdi',
  'jtd',
  'multijet',
  'bluehdi',
]

const FUEL_ALIASES: Record<string, string[]> = {
  essence: ['essence', 'petrol', 'benzine', 'gasoline'],
  diesel: ['diesel', 'gazole', 'dci', 'tdi', 'hdi', 'cdi', 'jtd'],
  hybride: ['hybride', 'hybrid', 'hybrides'],
  electrique: ['electrique', 'electric', 'ev', 'electro'],
  gpl: ['gpl', 'lpg', 'lpgf'],
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
}

function stripHtml(value: string) {
  return decodeHtmlEntities(value).replace(/<[^>]*>/g, ' ')
}

function normalizeText(value?: string | number | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function containsTerm(haystack: string, value?: string | null) {
  const term = normalizeText(value)
  if (!term) return false
  return ` ${haystack} `.includes(` ${term} `)
}

function getMake(vehicle: CompatibilityVehicle) {
  return 'makeName' in vehicle ? vehicle.makeName : vehicle.make
}

function getModel(vehicle: CompatibilityVehicle) {
  return 'modelName' in vehicle ? vehicle.modelName : vehicle.model
}

function getEngine(vehicle: CompatibilityVehicle) {
  return 'engineCode' in vehicle ? vehicle.engineCode : vehicle.engine
}

function getFuel(vehicle: CompatibilityVehicle) {
  return 'fuel' in vehicle ? vehicle.fuel : undefined
}

function getCylinders(vehicle: CompatibilityVehicle) {
  return 'cylinders' in vehicle ? vehicle.cylinders : undefined
}

function getPower(vehicle: CompatibilityVehicle) {
  return 'power' in vehicle ? vehicle.power : undefined
}

function getYear(vehicle: CompatibilityVehicle) {
  return 'year' in vehicle ? vehicle.year : undefined
}

function getMakeAliases(make?: string | null) {
  const normalized = normalizeText(make)
  const aliases = new Set<string>()
  if (normalized) aliases.add(normalized)

  if (normalized === 'volkswagen') aliases.add('vw')
  if (normalized === 'vw') aliases.add('volkswagen')
  if (normalized === 'mercedes') aliases.add('mercedes benz')
  if (normalized === 'mercedes benz') aliases.add('mercedes')
  if (normalized === 'citroen') aliases.add('citroen')

  return [...aliases]
}

function getModelCandidates(model?: string | null, make?: string | null) {
  const normalized = normalizeText(model)
  if (!normalized) return []

  const withoutParentheses = normalizeText(String(model).replace(/\([^)]*\)/g, ' '))
  const words = normalized.split(' ').filter(Boolean)
  const candidates = new Set<string>([normalized, withoutParentheses])
  const makeAliases = new Set(getMakeAliases(make))

  if (words.length >= 2) {
    candidates.add(words.slice(0, 2).join(' '))
  }

  const firstWord = words[0]
  if (
    firstWord &&
    firstWord.length >= 2 &&
    !makeAliases.has(firstWord) &&
    !['classe', 'class', 'serie', 'series'].includes(firstWord)
  ) {
    candidates.add(firstWord)
  }

  return [...candidates]
    .filter((candidate) => candidate.length >= 2)
    .filter((candidate) => !makeAliases.has(candidate))
    .sort((a, b) => b.length - a.length)
}

function engineMatches(compatibilityText: string, engine?: string | null) {
  const normalizedEngine = normalizeText(engine)
  if (!normalizedEngine) return true
  if (containsTerm(compatibilityText, normalizedEngine)) return true

  const tokens = normalizedEngine.split(' ').filter(Boolean)
  const prefix = tokens.slice(0, Math.min(tokens.length, 4)).join(' ')
  if (prefix.split(' ').length >= 2 && containsTerm(compatibilityText, prefix)) {
    return true
  }

  const alphaTokens = tokens.filter(
    (token) => /^[a-z]{2,}$/.test(token) && !ENGINE_NOISE.has(token)
  )
  const numericTokens = tokens.filter((token) => /^\d+$/.test(token))
  const knownEngineTokens = alphaTokens.filter((token) =>
    KNOWN_ENGINE_TOKENS.includes(token)
  )

  if (knownEngineTokens.length > 0 && numericTokens.length > 0) {
    return (
      knownEngineTokens.some((token) => containsTerm(compatibilityText, token)) &&
      numericTokens.slice(0, 2).every((token) => containsTerm(compatibilityText, token))
    )
  }

  if (alphaTokens.length > 0 && !alphaTokens.every((token) => containsTerm(compatibilityText, token))) {
    return false
  }

  if (numericTokens.length > 0) {
    return numericTokens.slice(0, 2).every((token) => containsTerm(compatibilityText, token))
  }

  return alphaTokens.length > 0
}

function fuelMatches(fuel?: string | null, acceptedFuels?: string[] | null) {
  const normalizedFuel = normalizeText(fuel)
  if (!normalizedFuel) return true
  if (!acceptedFuels || acceptedFuels.length === 0) return true

  const normalizedAccepted = acceptedFuels.map(normalizeText).filter(Boolean)
  if (normalizedAccepted.length === 0) return true

  if (normalizedAccepted.includes(normalizedFuel)) return true

  const aliasGroups = Object.entries(FUEL_ALIASES)
  const vehicleGroup = aliasGroups.find(([, aliases]) =>
    aliases.includes(normalizedFuel)
  )
  if (vehicleGroup) {
    return normalizedAccepted.some((accepted) =>
      vehicleGroup[1].includes(accepted) ||
      accepted === vehicleGroup[0]
    )
  }

  return false
}

function cylindersMatch(cylinders?: number | null, minCylinders?: number | null, maxCylinders?: number | null) {
  if (!cylinders) return true
  if (minCylinders != null && cylinders < minCylinders) return false
  if (maxCylinders != null && cylinders > maxCylinders) return false
  return true
}

function powerMatches(power?: number | null, minPower?: number | null, maxPower?: number | null) {
  if (!power) return true
  if (minPower != null && power < minPower) return false
  if (maxPower != null && power > maxPower) return false
  return true
}

function yearInRange(year?: number | null, yearFrom?: number | null, yearTo?: number | null) {
  if (!year) return true
  if (yearFrom != null && year < yearFrom) return false
  if (yearTo != null && year > yearTo) return false
  return true
}

function vehicleMatchesStructured(
  compatibilityText: string,
  vehicle: CompatibilityVehicle
) {
  const make = getMake(vehicle)
  const model = getModel(vehicle)
  if (!make || !model) return false

  const makeMatches = getMakeAliases(make).some((alias) =>
    containsTerm(compatibilityText, alias)
  )
  if (!makeMatches) return false

  const modelMatches = getModelCandidates(model, make).some((candidate) =>
    containsTerm(compatibilityText, candidate)
  )
  if (!modelMatches) return false

  return engineMatches(compatibilityText, getEngine(vehicle))
}

function vehicleMatchesSpecs(product: Product, vehicle: CompatibilityVehicle) {
  const specs = product.specs
  if (!specs) return false

  const makeAliases = getMakeAliases(getMake(vehicle))

  // Check OEM approvals if available
  const rawApprovals = specs.oemApprovals || []
  if (rawApprovals.length > 0 && makeAliases.length > 0) {
    const approvalsLower = rawApprovals.join(' ').toLowerCase()
    const matchesMake = makeAliases.some((alias) => approvalsLower.includes(alias.toLowerCase()))
    if (matchesMake) {
      return true
    }
  }

  const hasFuelConstraint = specs.fuelTypes && specs.fuelTypes.length > 0
  const hasCylindersConstraint =
    specs.minCylinders != null || specs.maxCylinders != null
  const hasPowerConstraint = specs.minPower != null || specs.maxPower != null

  if (!hasFuelConstraint && !hasCylindersConstraint && !hasPowerConstraint) {
    return false
  }

  if (hasFuelConstraint && !fuelMatches(getFuel(vehicle), specs.fuelTypes)) return false
  if (hasCylindersConstraint && !cylindersMatch(getCylinders(vehicle), specs.minCylinders, specs.maxCylinders)) return false
  if (hasPowerConstraint && !powerMatches(getPower(vehicle), specs.minPower, specs.maxPower)) return false

  return true
}

function getCompatibilitySection(description?: string) {
  if (!description) return ''

  const sectionRegex = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<ul[^>]*>([\s\S]*?)<\/ul>/gi
  let match: RegExpExecArray | null

  while ((match = sectionRegex.exec(description))) {
    const heading = normalizeText(stripHtml(match[1] ?? ''))
    if (heading === 'compatibilite vehicules' || heading === 'vehicules compatibles') {
      return normalizeText(stripHtml(match[2] ?? ''))
    }
  }

  return ''
}

function getStructuredCompatibilityText(product: Product) {
  return (
    product.compatibility
      ?.map((item) => `${item.make ?? ''} ${item.model ?? ''} ${item.engine ?? ''}`)
      .map(normalizeText)
      .join(' ') ?? ''
  )
}

export interface VehicleLabelSource {
  makeName?: string | null
  modelName?: string | null
  makeSlug?: string | null
  modelSlug?: string | null
  engineCode?: string | null
}

export function formatVehicleDisplayLabel(vehicle: VehicleLabelSource | null | undefined): string {
  if (!vehicle) return ''

  const formatSlug = (slug?: string | null) => {
    if (!slug) return ''
    const trimmed = slug.replace(/^[-_]+|[-_]+$/g, '')
    return trimmed
      .split(/[-_]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

  const make = (vehicle.makeName || formatSlug(vehicle.makeSlug)).trim()
  const model = (vehicle.modelName || formatSlug(vehicle.modelSlug)).trim()
  const engine = (vehicle.engineCode || '').trim()

  // If engine already begins with or includes make (e.g. legacy TecDoc full_description
  // like 'CITROËN SAXO (S0, S1) 1.1 X,SX'), avoid stuttering duplication.
  const normEngine = engine.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const normMake = make.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (normEngine && normMake && normEngine.includes(normMake)) {
    return engine
  }

  return [make, model, engine].filter(Boolean).join(' ')
}

export function getVehicleCompatibilityLabel(vehicle: CompatibilityVehicle) {
  const make = getMake(vehicle)
  const model = getModel(vehicle)
  const engine = getEngine(vehicle)
  const year = getYear(vehicle)

  const parts = [make, model, engine, year]
  if ('fuel' in vehicle && vehicle.fuel) parts.push(vehicle.fuel)
  if ('power' in vehicle && vehicle.power) parts.push(`${vehicle.power} ch`)

  return parts.filter(Boolean).join(' ')
}

function matchByStructuredEntries(product: Product, vehicle: CompatibilityVehicle) {
  const entries = product.compatibility ?? []
  if (entries.length === 0) return false

  const make = getMake(vehicle)
  const model = getModel(vehicle)
  if (!make || !model) return false

  const makeAliases = getMakeAliases(make)
  const modelCandidates = getModelCandidates(model, make)
  const engine = getEngine(vehicle)
  const year = getYear(vehicle)

  for (const entry of entries) {
    const entryMakeMatches = makeAliases.some((alias) =>
      containsTerm(normalizeText(entry.make), alias)
    )
    if (!entryMakeMatches) continue

    const entryModelMatches = modelCandidates.some((candidate) =>
      containsTerm(normalizeText(entry.model), candidate)
    )
    if (!entryModelMatches) continue

    if (!engineMatches(normalizeText(entry.engine ?? ''), engine)) continue
    if (!yearInRange(year, entry.yearFrom, entry.yearTo)) continue

    return true
  }

  return false
}

export function findProductCompatibilityMatch(
  product: Product,
  vehicles: Array<CompatibilityVehicle | null | undefined>
) {
  const structuredText = getStructuredCompatibilityText(product)
  const descriptionText = getCompatibilitySection(product.description)
  const compatibilityText = [structuredText, descriptionText].filter(Boolean).join(' ')
  const hasCompatibilityData = Boolean(compatibilityText)

  for (const vehicle of vehicles) {
    if (!vehicle) continue

    if (matchByStructuredEntries(product, vehicle)) {
      return {
        vehicle,
        label: getVehicleCompatibilityLabel(vehicle),
        source: 'structured' as const,
      }
    }

    if (hasCompatibilityData && vehicleMatchesStructured(compatibilityText, vehicle)) {
      return {
        vehicle,
        label: getVehicleCompatibilityLabel(vehicle),
        source: 'text' as const,
      }
    }

    if (vehicleMatchesSpecs(product, vehicle)) {
      return {
        vehicle,
        label: getVehicleCompatibilityLabel(vehicle),
        source: 'specs' as const,
      }
    }
  }

  return null
}