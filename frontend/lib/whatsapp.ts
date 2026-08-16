import type { CartItem, Product, ProductVariant } from '@/lib/types'

// The support WhatsApp number.
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+21655555555'

// Categories that are NOT physical automotive parts: fluids, lubricants,
// additives, coolants, maintenance/consumable products, and non-car domains.
// The catalogue is a spare-parts store, so everything left is a mechanical part.
const NON_PARTS_CATEGORY_SLUGS = new Set([
  // Fluids & lubricants
  'adblue',
  'antigel',
  'auto-huiles-lubrifiants',
  'auto-minerale',
  'auto-semi',
  'auto-synthese',
  'direction-assistee',
  'graisses',
  'huile-boite-de-vitesses-a-double-embrayage-dsg',
  'huile-moteur',
  'huile-pour-boite-automatique',
  'huile-pour-engrenage-d-essieux',
  'huiles-moteur',
  'hydraulique',
  'liquides-auto',
  'lubrifiants',
  'refroidissement',
  // Additives & consumables
  'additifs',
  'additif-diesel',
  'additif-essence',
  'additif-huile',
  'antigel',
  'entretien-auto',
  // Non-car domains
  'marine',
  'moto',
  'moto-karting',
])

// Non-car domains whose subcategories also use the chassis-verification flow
// of passenger cars (bikes, karts and boats are out of scope).
const NON_AUTO_PREFIXES = ['moto-', 'karting-', 'marine-']

export function isPartsCategory(slug?: string | null): boolean {
  if (!slug) return false
  if (NON_PARTS_CATEGORY_SLUGS.has(slug)) return false
  if (NON_AUTO_PREFIXES.some((prefix) => slug.startsWith(prefix))) return false
  return true
}

function digits(): string {
  return WHATSAPP_NUMBER.replace(/\D/g, '')
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${digits()}?text=${encodeURIComponent(message)}`
}

// Step 2 — automated greeting the customer sends to begin the verification.
export const CHASSIS_GREETING =
  'Bonjour! 👋 Pour vérifier la disponibilité exacte et la correspondance parfaite de mes pièces avec mon véhicule, veuillez nous indiquer le numéro de châssis (carte grise) de votre voiture.'

export function buildProductMessage(
  product: Product,
  variant: ProductVariant,
  quantity: number
): string {
  return `${CHASSIS_GREETING}\n\nPièce concernée : ${quantity}x ${product.name} (Réf: ${variant.sku})`
}

export function buildPartsMessage(items: CartItem[]): string {
  const parts = items.filter((item) => isPartsCategory(item.product.category?.slug))
  const lines = parts.map(
    (item) => `• ${item.quantity}x ${item.product.name} (Réf: ${item.variant.sku})`
  )
  return [
    CHASSIS_GREETING,
    '',
    `Voici les pièces dans mon panier :`,
    lines.join('\n'),
    '',
    'Je vous enverrai mon numéro de châssis dans mon prochain message. Merci de vérifier la disponibilité et la compatibilité.',
  ].join('\n')
}