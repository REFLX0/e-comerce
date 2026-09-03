export function formatPrice(amount?: number | null): string {
  if (amount == null || isNaN(Number(amount))) return '0.000 DT'
  const num = Number(amount)
  const parts = num.toFixed(3).split('.')
  const intPart = parts[0] || '0'
  const decPart = parts[1] || '000'
  return `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${decPart} DT`
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-TN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export const WILAYAS_TN = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Béja',
  'Jendouba',
  'Le Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gabès',
  'Medenine',
  'Tataouine',
  'Gafsa',
  'Tozeur',
  'Kébili',
] as const

export type Wilaya = (typeof WILAYAS_TN)[number]

/**
 * Returns a clean, concise product SKU reference.
 * Strips auto-prefixes and unit noise so references look professional (e.g. 'MN-3089-1L', 'LM-2424', '106001').
 */
export function formatSKU(sku?: string): string {
  if (!sku) return 'N/A'
  let clean = sku.replace(/-UNITÉ$/i, '').replace(/-UNITE$/i, '').trim()
  if (clean.startsWith('AUTO-')) {
    const trailingMatch = clean.match(/-(\d+)(?:-([A-Z0-9]+))?$/i)
    if (trailingMatch) {
      const num = trailingMatch[1]
      const suffix = trailingMatch[2] ? `-${trailingMatch[2]}` : ''
      return `REF-${num}${suffix}`
    }
    return clean.replace(/^AUTO-/i, '').slice(0, 16)
  }
  return clean
}

/**
 * Ensures product names are properly formatted and capitalized even if stored in slug format.
 */
export function formatProductName(name?: string, brandName?: string): string {
  if (!name) return ''
  if (!name.includes('-') && !name.includes('_')) return name

  let clean = name.replace(/^auto-/i, '')
  let words = clean.split(/[-_]+/).filter(Boolean)

  const capitalized = words.map((w, idx) => {
    const lower = w.toLowerCase()
    if (/^\d+w\d*$/i.test(lower)) return lower.toUpperCase()
    if (/^\d+(\.\d+)?(l|ml)$/i.test(lower)) return lower.toUpperCase()
    if (/^(4t|2t|atf|dsg|cvt|mtf|dot3|dot4|h1|h4|h7|h11|w5w|led|api|acea|mos2|oem)$/i.test(lower)) {
      return lower.toUpperCase()
    }
    if (/^(\d+)w$/i.test(lower) || /^(\d+)v$/i.test(lower)) return lower.toUpperCase()
    if (idx > 0 && ['de', 'du', 'des', 'le', 'la', 'les', 'et', 'pour', 'en', 'sur', 'a', 'à', 'au', 'aux'].includes(lower)) {
      return lower
    }
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  })

  let title = capitalized.join(' ')
  if (brandName) {
    const brandLower = brandName.toLowerCase()
    if (title.toLowerCase().startsWith(brandLower + ' ')) {
      title = brandName + title.slice(brandName.length)
    }
  }
  return title
}

/**
 * Parses a volume string like "250ml", "500 mL", "1L", "2.5L", "4 L", "5L", "20L", "60L"
 * and returns the numeric value in litres. Returns null if unparseable.
 */
export function parseVolumeToL(volume?: string | null): number | null {
  if (!volume) return null
  const clean = volume.trim().toLowerCase()
  const match = clean.match(/^([\d.]+)\s*(ml|l)$/)
  if (!match || !match[1] || !match[2]) return null
  const numStr = match[1]
  const unit = match[2]
  const val = parseFloat(numStr)
  if (isNaN(val)) return null
  return unit === 'ml' ? val / 1000 : val
}

