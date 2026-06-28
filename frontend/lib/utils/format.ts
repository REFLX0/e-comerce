export function formatPrice(amount: number): string {
  return (
    new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount) + ' DT'
  )
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
