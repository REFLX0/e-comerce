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
  /** Optional direct link URL (e.g. category with query filters) */
  href?: string
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
        label: 'Huile Moteur',
        labelKey: 'huilesMoteur',
        hint: '100% Synthétique, Semi Synthétique, Minérale',
        hintKey: 'syntheticHint',
        children: [
          { slug: 'auto-synthese', label: '100% Synthétique', labelKey: 'autoSynthese', href: '/categorie/huiles-moteur?type=100%25+Synth%C3%A8se' },
          { slug: 'auto-semi', label: 'Semi Synthétique', labelKey: 'autoSemi', href: '/categorie/huiles-moteur?type=Semi-Synth%C3%A8se' },
          { slug: 'auto-minerale', label: 'Minérale', labelKey: 'autoMinerale', href: '/categorie/huiles-moteur?type=Min%C3%A9rale' },
        ],
      },
      {
        slug: 'liquide-de-frein',
        label: 'Liquide de Frein',
        labelKey: 'liquideFrein',
        hint: 'DOT 3, DOT 4, DOT 5.1',
        hintKey: 'dotHint',
        children: [
          { slug: 'liquide-frein-dot3', label: 'DOT 3', labelKey: 'dot3' },
          { slug: 'liquide-frein-dot4', label: 'DOT 4', labelKey: 'dot4' },
          { slug: 'liquide-frein-dot5-1', label: 'DOT 5.1', labelKey: 'dot51' },
        ],
      },
      {
        slug: 'direction-assistee',
        label: 'Liquide de Direction',
        labelKey: 'liquideDirection',
        hint: 'CHF 11S, LHM, ATF',
        hintKey: 'directionHint',
      },
      {
        slug: 'additifs',
        label: 'Additifs',
        labelKey: 'additifs',
        hint: 'Essence, Diesel, Huile, Boîte & Pont',
        hintKey: 'additifsHint',
        children: [
          { slug: 'additif-essence', label: 'Additif Essence', labelKey: 'additifEssence' },
          { slug: 'additif-diesel', label: 'Additif Diesel', labelKey: 'additifDiesel' },
          { slug: 'additif-huile', label: 'Additif Huile', labelKey: 'additifHuile' },
          { slug: 'additif-boite-pont', label: 'Additif Boîte et Pont', labelKey: 'additifBoitePont' },
        ],
      },
      {
        slug: 'huile-de-boite',
        label: 'Liquide de Transmission',
        labelKey: 'huileBoite',
        hint: 'Manuelle, Automatique, CVT, Double Embrayage',
        hintKey: 'gearboxHint',
      },
      {
        slug: 'autres-liquides-entretien',
        label: 'Autres Liquides et Entretien',
        labelKey: 'autresLiquides',
        hint: 'Antigel / LDR, AdBlue, Produits d entretien',
        hintKey: 'autresLiquidesHint',
        children: [
          { slug: 'antigel-ldr', label: 'Antigel / LDR', labelKey: 'antigelLdr' },
          { slug: 'adblue', label: 'AdBlue', labelKey: 'adblue' },
          { slug: 'produits-entretien', label: "Produits d'entretien", labelKey: 'produitsEntretien' },
        ],
      },
      {
        slug: 'accessoires-auto',
        label: 'Accessoires Auto',
        labelKey: 'accessoiresAuto',
        hint: 'Équipements, Outillage, Sécurité',
      },
    ],
  },
  {
    slug: 'auto-pieces-rechange',
    label: 'Pièces de Rechange',
    labelKey: 'piecesRechange',
    children: [
      {
        slug: 'auto-filtres',
        label: 'Filtres',
        labelKey: 'filtres',
        hint: 'Air, Huile, Carburant, Habitacle, Hydraulique',
        hintKey: 'filtresHint',
        children: [
          { slug: 'filtre-a-air', label: 'Filtre à air', labelKey: 'filtreAir' },
          { slug: 'filtre-a-huile', label: 'Filtre à huile', labelKey: 'filtreHuile' },
          { slug: 'filtre-a-carburant', label: 'Filtre à carburant', labelKey: 'filtreCarburant' },
          { slug: 'filtre-habitacle', label: 'Filtre habitacle', labelKey: 'filtreHabitacle' },
          { slug: 'filtre-hydraulique', label: 'Filtre hydraulique', labelKey: 'filtreHydraulique' },
        ],
      },
      {
        slug: 'auto-freinage',
        label: 'Freinage',
        labelKey: 'freinage',
        hint: 'Disques, Plaquettes, Étriers, Mâchoires',
        hintKey: 'freinageHint',
      },
      {
        slug: 'batteries',
        label: 'Batteries',
        labelKey: 'batteries',
        hint: 'Démarrage, Stop & Start, AGM, EFB (L0 à L6)',
        hintKey: 'batteriesHint',
        // Direct leaf without children per approved specification
      },
      {
        slug: 'auto-suspension-direction',
        label: 'Suspension et Direction',
        labelKey: 'suspensionDirection',
        hint: 'Amortisseurs, Rotules, Bras, Biellettes',
        hintKey: 'suspensionHint',
      },
      {
        slug: 'transmission',
        label: 'Boîte de Vitesses, Embrayage',
        labelKey: 'boiteVitesse',
        hint: 'Kit embrayage, Volant moteur, Cardans',
        hintKey: 'huileBoite',
      },
      { slug: 'auto-moteur-distribution', label: 'Moteur et Distribution', labelKey: 'moteurDistribution', hint: 'Courroies, Chaînes, Galets, Pompes' },
      { slug: 'auto-refroidissement-climatisation', label: 'Refroidissement et Climatisation', labelKey: 'refroidissement', hint: 'Radiateurs, Thermostats, Compresseurs' },
      { slug: 'auto-electricite-eclairage', label: 'Électricité et Éclairage', labelKey: 'electricite', hint: 'Alternateurs, Démarreurs, Projecteurs' },
      { slug: 'auto-carrosserie-habitacle', label: 'Carrosserie et Habitacle', labelKey: 'carrosserie', hint: 'Rétroviseurs, Lève-vitres, Essuie-glaces' },
      { slug: 'auto-autres-pieces', label: 'Échappement et Autres Pièces', labelKey: 'autresPieces', hint: 'Silencieux, Catalyseurs, Fixations' },
    ],
  },
  {
    slug: 'moto-karting',
    label: 'Moto et Karting',
    labelKey: 'motoKarting',
    children: [
      {
        slug: 'moto-huiles',
        label: 'Huile Moteur',
        labelKey: 'motoHuiles',
        hint: '2T, 4T & Karting (JASO MA2, JASO FD)',
      },
      {
        slug: 'moto-huile-boite',
        label: 'Huile de Boîte',
        labelKey: 'motoHuileBoite',
        hint: 'Transoil, Boîte 2T / 4T',
      },
      {
        slug: 'moto-huile-fourche',
        label: 'Huile de Fourche',
        labelKey: 'motoHuileFourche',
        hint: 'Fork Oil 5W, 10W, 15W, 20W',
      },
      {
        slug: 'moto-lubrifiants-chaine',
        label: 'Lubrifiants Chaîne et Additifs',
        labelKey: 'lubrifiantsChaine',
        hint: 'Graisse chaîne, Nettoyant, Dégraissant',
      },
      {
        slug: 'accessoires-moto',
        label: 'Accessoires Moto',
        labelKey: 'accessoiresMoto',
        hint: 'Casques, Gants, Entretien, Outillage',
      },
    ],
  },
  {
    slug: 'marine',
    label: 'Marine',
    labelKey: 'marine',
    children: [
      { slug: 'marine-moteurs', label: 'Huile Moteur', labelKey: 'huilesMarines', hint: 'Moteurs hors-bord & in-board 2T / 4T', hintKey: 'marineHint' },
      { slug: 'marine-hydraulique', label: 'Huile Hydraulique', labelKey: 'hydraulique', hint: 'Direction assistée & trims marins', hintKey: 'hydrauliqueHint' },
      { slug: 'marine-graisses', label: 'Graisse et Additifs', labelKey: 'graisses', hint: 'Protection anti-corrosion & eau de mer', hintKey: 'graissesHint' },
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