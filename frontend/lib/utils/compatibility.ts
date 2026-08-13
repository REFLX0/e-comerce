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
  return 'engineCode' in vehicle ? vehicle.engineCode : undefined
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

function vehicleMatchesText(compatibilityText: string, vehicle: CompatibilityVehicle) {
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

export function getVehicleCompatibilityLabel(vehicle: CompatibilityVehicle) {
  const make = getMake(vehicle)
  const model = getModel(vehicle)
  const engine = getEngine(vehicle)
  const year = 'year' in vehicle ? vehicle.year : undefined

  return [make, model, engine, year].filter(Boolean).join(' ')
}

export function findProductCompatibilityMatch(
  product: Product,
  vehicles: Array<CompatibilityVehicle | null | undefined>
) {
  const structuredText = getStructuredCompatibilityText(product)
  const descriptionText = getCompatibilitySection(product.description)
  const compatibilityText = [structuredText, descriptionText].filter(Boolean).join(' ')
  if (!compatibilityText) return null

  for (const vehicle of vehicles) {
    if (!vehicle) continue
    if (vehicleMatchesText(compatibilityText, vehicle)) {
      return {
        vehicle,
        label: getVehicleCompatibilityLabel(vehicle),
      }
    }
  }

  return null
}
