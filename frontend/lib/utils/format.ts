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
 * Extracts a cleaner reference number from a raw database SKU.
 * e.g., 'AUTO-MANNOLLIQUIDEDEREFROIDISSEMENTMOTOP-3089-1L' -> '3089'
 * e.g., 'Neolux-N380-V1' -> 'N380'
 */
export function formatSKU(sku?: string): string {
  if (!sku) return 'N/A'
  
  // Clean up auto-generated prefixes
  if (sku.startsWith('AUTO-') || sku.startsWith('MOTO-') || sku.startsWith('MARINE-')) {
    const parts = sku.split('-')
    if (parts.length >= 3) {
      // The reference is usually the second-to-last segment (e.g. [..., name, ref, volume])
      return parts[parts.length - 2] || ''
    }
  }

  // General fallback for normal SKUs (e.g. Neolux-N380-V1 -> N380)
  // If there are exactly 3 parts, the middle one is usually the reference
  const parts = sku.split('-')
  if (parts.length === 3) {
    return parts[1] || sku
  }

  return sku
}
