export function formatPrice(amount: number): string {
  if (amount == null || isNaN(amount)) return '0.000 DT'
  const parts = amount.toFixed(3).split('.')
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
 * Returns the raw SKU as-is. SKUs are stored in a clean format
 * (e.g. 'MOT-300V-10W40', 'TOTALENERGIES-QUARTZ-INEO-FIRST-0W-20-5L')
 * and should be displayed without heuristic extraction.
 */
export function formatSKU(sku?: string): string {
  if (!sku) return 'N/A'
  return sku
}
