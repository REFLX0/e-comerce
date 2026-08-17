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
//   Pièces de Rechange / D'origine → Filtres · Freinage · Suspension & Direction · …
//   Moto & Karting → Pièces & Consommables · Équipements & Entretien · Karting
//   Marine      → Huiles & Lubrifiants Marine · Entretien & Accessoires
//
// NOTE: auto-huiles-lubrifiants remains in the DB (products still navigable by
// URL + search) but is intentionally NOT part of the flat Automobile menu.
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
    slug: 'moto-karting',
    label: 'Moto & Karting',
    children: [
      { slug: 'moto-huile-moteur', label: 'Huile moteur' },
      { slug: 'moto-huile-boite', label: 'Huile de boîte' },
      { slug: 'moto-huile-fourche', label: 'Huile de fourche' },
      { slug: 'moto-lubrifiants-chaine', label: 'Lubrifiants de chaîne et additifs' },
    ],
  },
  {
    slug: 'marine',
    label: 'Marine',
    children: [
      { slug: 'marine-moteurs', label: 'Huiles moteurs marins', hint: 'Motul Marine & Liqui Moly' },
      { slug: 'marine-hydraulique', label: 'Hydraulique', hint: 'Systèmes hydrauliques' },
      { slug: 'marine-graisses', label: 'Graisses et additifs', hint: 'Environnements nautiques' },
    ],
  },
] satisfies NavigationTaxonomyItem[]