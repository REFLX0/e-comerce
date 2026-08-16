// frontend/lib/navigation/taxonomy.ts
// ---------------------------------------------------------------------------
// Typed navigation taxonomy for the storefront mega-menu.
//
// One source of truth for WHAT the menu shows (strict per-item scoping).
// Each node references an EXISTING category slug in the backend (canonical
// slugs were normalized by backend/prisma/migrate-nav-taxonomy.ts). Labels
// match the agreed French taxonomy; when a node exists in the API tree, the
// live category name from the DB is preferred for display, and `label`
// is the fallback.
//
// Structure (exact):
//   Automobile → Pièces de Rechange / D'origine · Huiles & Lubrifiants Moteur
//   Moto       → Pièces & Consommables · Équipements & Entretien
//   Karting    → Pièces & Consommables
//   Marine     → Huiles & Lubrifiants Marine · Entretien & Accessoires
// ---------------------------------------------------------------------------

export type NavigationTaxonomyNode = {
  /** Canonical category slug (drives links + live-name resolution). */
  slug: string
  /** Taxonomy label — fallback used only if the slug is missing in the API tree. */
  label?: string
  /** Short descriptor rendered as muted helper text under the section header. */
  hint?: string
  children?: NavigationTaxonomyNode[]
}

export type NavigationTaxonomyItem = {
  /** Root category slug (must be a root in the DB tree). */
  slug: string
  /** Fallback label for the nav button. */
  label?: string
  children: NavigationTaxonomyNode[]
}

export const NAVIGATION_TAXONOMY: NavigationTaxonomyItem[] = [
  {
    slug: 'automobile',
    label: 'Automobile',
    children: [
      {
        slug: 'auto-pieces-rechange',
        label: "Pièces de Rechange / D'origine",
        children: [
          {
            slug: 'auto-filtres',
            label: 'Filtres',
            hint: 'Air, Huile, Carburant, Habitacle',
          },
          {
            slug: 'auto-freinage',
            label: 'Freinage',
            hint: 'Disques, Plaquettes, Liquide de frein',
          },
          {
            slug: 'auto-suspension-direction',
            label: 'Suspension & Direction',
            hint: 'Amortisseurs, Huile de direction',
          },
          {
            slug: 'transmission',
            label: 'Boîte de Vitesse',
            hint: 'Huile de boîte',
          },
          { slug: 'auto-moteur-distribution', label: 'Moteur & Distribution' },
          { slug: 'auto-refroidissement-climatisation', label: 'Refroidissement & Climatisation' },
          { slug: 'auto-electricite-eclairage', label: 'Électricité & Éclairage' },
          { slug: 'auto-carrosserie-habitacle', label: 'Carrosserie & Habitacle' },
          { slug: 'auto-echappement', label: 'Échappement' },
          { slug: 'auto-autres-pieces', label: 'Autres pièces auto' },
        ],
      },
      {
        slug: 'auto-huiles-lubrifiants',
        label: 'Huiles & Lubrifiants Moteur',
        children: [
          {
            slug: 'huiles-moteur',
            label: 'Huile Moteur',
            hint: '100% Synthétique, Semi-Synthétique, Minéral',
            children: [
              { slug: 'auto-synthese', label: '100% Synthétique' },
              { slug: 'auto-semi', label: 'Semi-Synthétique' },
              { slug: 'auto-minerale', label: 'Minérale' },
            ],
          },
          {
            slug: 'liquides-auto',
            label: 'Liquides',
            hint: 'Liquide de refroidissement, Liquide de frein, Huile de direction',
          },
          {
            slug: 'additifs',
            label: 'Additifs',
            hint: 'Additif Essence, Additif Diesel, Additif Huile/Graisse',
          },
          {
            slug: 'entretien-auto',
            label: "Produits d'entretien",
            hint: 'AdBlue',
          },
        ],
      },
    ],
  },
  {
    slug: 'moto-karting',
    label: 'Moto',
    children: [
      {
        slug: 'moto-pieces-consommables',
        label: 'Pièces & Consommables',
        children: [
          {
            slug: 'moto-huiles',
            label: 'Huiles moteur spécifiques moto',
            hint: 'Motul, Liqui Moly, etc.',
          },
          { slug: 'moto-lubrifiants-chaine', label: 'Lubrifiants de chaîne et additifs' },
        ],
      },
      {
        slug: 'moto-equipements-entretien',
        label: 'Équipements & Entretien',
        children: [
          {
            slug: 'moto-nettoyage',
            label: 'Produits de nettoyage',
            hint: 'Shampoings et accessoires de detailing',
          },
          {
            slug: 'moto-eclairage',
            label: 'Éclairage',
            hint: 'Ampoules spécialisées (Osram, Neolux)',
          },
        ],
      },
    ],
  },
  {
    slug: 'karting',
    label: 'Karting',
    children: [
      {
        slug: 'karting-pieces-consommables',
        label: 'Pièces & Consommables',
        children: [
          {
            slug: 'karting-huiles',
            label: 'Huiles et lubrifiants haute performance',
            hint: 'Moteurs de karting',
          },
          {
            slug: 'karting-additifs',
            label: 'Additifs et graisses spécifiques',
            hint: 'Compétition',
          },
        ],
      },
    ],
  },
  {
    slug: 'marine',
    label: 'Marine',
    children: [
      {
        slug: 'marine-huiles-lubrifiants',
        label: 'Huiles & Lubrifiants Marine',
        children: [
          {
            slug: 'marine-moteurs',
            label: 'Huiles moteurs marins',
            hint: 'Gamme complète Motul Marine & Liqui Moly',
          },
          {
            slug: 'marine-graisses',
            label: 'Graisses et additifs',
            hint: 'Environnements nautiques',
          },
        ],
      },
      {
        slug: 'marine-entretien-accessoires',
        label: 'Entretien & Accessoires',
        children: [
          {
            slug: 'marine-hivernage',
            label: "Produits d'hivernage",
            hint: 'Étanchéité et maintenance spécifiques',
          },
        ],
      },
    ],
  },
] satisfies NavigationTaxonomyItem[]
