// frontend/lib/navigation/taxonomy.ts
// ---------------------------------------------------------------------------
// Typed navigation taxonomy for the storefront mega-menu.
//
// One source of truth for WHAT the menu shows (strict per-item scoping).
// Each node references an EXISTING category slug in the backend (canonical
// slugs were normalized by backend/prisma/migrate-nav-taxonomy.ts). Labels
// match the agreed French taxonomy; when a node exists in the API tree, the
// live category name from the DB is preferred for display, and `label`
// is the fallback. `labelKey`/`hintKey` reference translated strings in the
// `Taxonomy` i18n namespace so the menu renders in fr/en/ar.
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
  /** Translation key for the label (Taxonomy namespace). */
  labelKey?: string
  /** Short descriptor rendered as muted helper text under the section header. */
  hint?: string
  /** Translation key for the hint (Taxonomy namespace). */
  hintKey?: string
  children?: NavigationTaxonomyNode[]
}

export type NavigationTaxonomyItem = {
  /** Root category slug (must be a root in the DB tree). */
  slug: string
  /** Fallback label for the nav button. */
  label?: string
  /** Translation key for the root label (Taxonomy namespace). */
  labelKey?: string
  children: NavigationTaxonomyNode[]
}

export const NAVIGATION_TAXONOMY: NavigationTaxonomyItem[] = [
  {
    slug: 'automobile',
    label: 'Automobile',
    labelKey: 'auto',
    children: [
      {
        slug: 'huiles-moteur',
        label: 'Huile moteur',
        labelKey: 'huilesMoteur',
        hint: '100% Synthétique, Semi-Synthétique, Minéral',
        hintKey: 'syntheticHint',
      },
      {
        slug: 'liquide-de-frein',
        label: 'Liquide de frein',
        labelKey: 'liquideFrein',
        hint: 'DOT 3, DOT 4',
        hintKey: 'dotHint',
      },
      {
        slug: 'direction-assistee',
        label: 'Liquide de direction',
        labelKey: 'liquideDirection',
        hint: 'Huile pour direction assistée',
        hintKey: 'directionHint',
      },
      {
        slug: 'huile-de-boite',
        label: 'Huile de boîte',
        labelKey: 'huileBoite',
        hint: 'ATF, DSG, CVT, MTF, Hypoid',
        hintKey: 'gearboxHint',
      },
      {
        slug: 'additifs',
        label: 'Additifs',
        labelKey: 'additifs',
        hint: 'Additif Essence, Additif Diesel, Additif Huile/Graisse',
        hintKey: 'additifsHint',
        children: [
          { slug: 'additif-essence', label: 'Additif Essence', labelKey: 'additifEssence' },
          { slug: 'additif-diesel', label: 'Additif Diesel', labelKey: 'additifDiesel' },
          { slug: 'additif-huile', label: 'Additif Huile', labelKey: 'additifHuile' },
        ],
      },
    ],
  },
  {
    slug: 'auto-pieces-rechange',
    label: "Pièces de Rechange / D'origine",
    labelKey: 'piecesRechange',
    children: [
      {
        slug: 'auto-filtres',
        label: 'Filtres',
        labelKey: 'filtres',
        hint: 'Air, Huile, Carburant, Habitacle',
        hintKey: 'filtresHint',
      },
      {
        slug: 'auto-freinage',
        label: 'Freinage',
        labelKey: 'freinage',
        hint: 'Disques, Plaquettes, Liquide de frein',
        hintKey: 'freinageHint',
      },
      {
        slug: 'auto-suspension-direction',
        label: 'Suspension & Direction',
        labelKey: 'suspensionDirection',
        hint: 'Amortisseurs, Huile de direction',
        hintKey: 'suspensionHint',
      },
      {
        slug: 'transmission',
        label: 'Boîte de Vitesse',
        labelKey: 'boiteVitesse',
        hint: 'Huile de boîte',
        hintKey: 'huileBoite',
      },
      { slug: 'auto-moteur-distribution', label: 'Moteur & Distribution', labelKey: 'moteurDistribution' },
      { slug: 'auto-refroidissement-climatisation', label: 'Refroidissement & Climatisation', labelKey: 'refroidissement' },
      { slug: 'auto-electricite-eclairage', label: 'Électricité & Éclairage', labelKey: 'electricite' },
      { slug: 'auto-carrosserie-habitacle', label: 'Carrosserie & Habitacle', labelKey: 'carrosserie' },
      { slug: 'auto-echappement', label: 'Échappement', labelKey: 'echappement' },
      { slug: 'auto-autres-pieces', label: 'Autres pièces auto', labelKey: 'autresPieces' },
    ],
  },
  {
    slug: 'moto-karting',
    label: 'Moto & Karting',
    labelKey: 'motoKarting',
    children: [
      { slug: 'moto-huile-moteur', label: 'Huile moteur', labelKey: 'huilesMoteur' },
      { slug: 'moto-huile-boite', label: 'Huile de boîte', labelKey: 'huileBoite' },
      { slug: 'moto-huile-fourche', label: 'Huile de fourche', labelKey: 'motoHuileFourche' },
      { slug: 'moto-lubrifiants-chaine', label: 'Lubrifiants de chaîne et additifs', labelKey: 'lubrifiantsChaine' },
    ],
  },
  {
    slug: 'marine',
    label: 'Marine',
    labelKey: 'marine',
    children: [
      { slug: 'marine-moteurs', label: 'Huiles moteurs marins', labelKey: 'huilesMarines', hint: 'Motul Marine & Liqui Moly', hintKey: 'marineHint' },
      { slug: 'marine-hydraulique', label: 'Hydraulique', labelKey: 'hydraulique', hint: 'Systèmes hydrauliques', hintKey: 'hydrauliqueHint' },
      { slug: 'marine-graisses', label: 'Graisses et additifs', labelKey: 'graisses', hint: 'Environnements nautiques', hintKey: 'graissesHint' },
    ],
  },
] satisfies NavigationTaxonomyItem[]

/** Resolve a node's translated label key. */
export function taxonomyLabelKey(node: { labelKey?: string }): string | undefined {
  return node.labelKey
}

/** Resolve a node's translated hint key. */
export function taxonomyHintKey(node: { hintKey?: string }): string | undefined {
  return node.hintKey
}