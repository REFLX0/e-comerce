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
//   Automobile  → Huile moteur · Liquide de frein · Liquide de direction ·
//                 Huile de boîte · Additifs (essence / diesel / huile)
//   Moto & Karting → Pièces & Consommables · Équipements & Entretien · Karting
//   Marine      → Huiles & Lubrifiants Marine · Entretien & Accessoires
//
// NOTE: auto-pieces-rechange and auto-huiles-lubrifiants remain in the DB
// (products still navigable by URL + search) but are intentionally NOT part
// of the flat Automobile menu.
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
        slug: 'huiles-moteur',
        label: 'Huile moteur',
        hint: '100% Synthétique, Semi-Synthétique, Minéral',
      },
      {
        slug: 'liquide-de-frein',
        label: 'Liquide de frein',
        hint: 'DOT 3, DOT 4',
      },
      {
        slug: 'direction-assistee',
        label: 'Liquide de direction',
        hint: 'Huile pour direction assistée',
      },
      {
        slug: 'huile-de-boite',
        label: 'Huile de boîte',
        hint: 'ATF, DSG, CVT, MTF, Hypoid',
      },
      {
        slug: 'additifs',
        label: 'Additifs',
        hint: 'Additif Essence, Additif Diesel, Additif Huile/Graisse',
        children: [
          { slug: 'additif-essence', label: 'Additif Essence' },
          { slug: 'additif-diesel', label: 'Additif Diesel' },
          { slug: 'additif-huile', label: 'Additif Huile' },
        ],
      },
    ],
  },
  {
    slug: 'moto-karting',
    label: 'Moto & Karting',
    children: [
      {
        slug: 'moto-pieces-consommables',
        label: 'Pièces & Consommables',
        children: [
          { slug: 'moto-huile-moteur', label: 'Huile moteur' },
          { slug: 'moto-huile-boite', label: 'Huile de boîte' },
          { slug: 'moto-huile-fourche', label: 'Huile de fourche' },
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
      {
        slug: 'karting-pieces-consommables',
        label: 'Karting',
        hint: 'Compétition',
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
            slug: 'marine-hydraulique',
            label: 'Hydraulique',
            hint: 'Systèmes hydrauliques',
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