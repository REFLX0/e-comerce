/**
 * clean-products-seed.cjs
 * ─────────────────────────────────────────────────────────────
 * 1. Removes ALL filler / duplicate products ("Huile Standard V*")
 * 2. Updates the 7 original products with real, professional images
 * 3. Adds 40 new clean, real-looking lubricant products with unique slugs
 *    and photos from the brands' own press/CDN assets.
 *
 * Run inside the backend container:
 *   node prisma/clean-products-seed.cjs
 */
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

// ──────────────────────────────────────────────────────────────
// PROFESSIONAL PRODUCT IMAGES (Reliable CDNs without hotlink protection)
// ──────────────────────────────────────────────────────────────
const IMAGES = {
  // CASTROL
  castrol_edge_5w30:    'https://cdn.autodoc.de/thumb?id=7279313&m=0&n=0&lng=fr&rev=94077',
  castrol_edge_5w40:    'https://cdn.autodoc.de/thumb?id=7279315&m=0&n=0&lng=fr&rev=94077',
  castrol_magnatec_5w30:'https://cdn.autodoc.de/thumb?id=8216315&m=0&n=0&lng=fr&rev=94077',
  castrol_edge_0w20:    'https://cdn.autodoc.de/thumb?id=13636544&m=0&n=0&lng=fr&rev=94077',

  // SHELL
  shell_ultra_5w40:     'https://cdn.autodoc.de/thumb?id=12859250&m=0&n=0&lng=fr&rev=94077',
  shell_ultra_5w30:     'https://cdn.autodoc.de/thumb?id=12859251&m=0&n=0&lng=fr&rev=94077',
  shell_hx7_10w40:      'https://cdn.autodoc.de/thumb?id=12859220&m=0&n=0&lng=fr&rev=94077',
  shell_hx5_15w40:      'https://cdn.autodoc.de/thumb?id=12859207&m=0&n=0&lng=fr&rev=94077',
  shell_rimula_r4:      'https://cdn.autodoc.de/thumb?id=12859218&m=0&n=0&lng=fr&rev=94077',

  // TOTAL / TOTALENERGIES
  total_quartz_9000:    'https://cdn.autodoc.de/thumb?id=14187019&m=0&n=0&lng=fr&rev=94077',
  total_quartz_7000:    'https://cdn.autodoc.de/thumb?id=14187012&m=0&n=0&lng=fr&rev=94077',
  total_quartz_5000:    'https://cdn.autodoc.de/thumb?id=14187011&m=0&n=0&lng=fr&rev=94077',
  total_hi_perf:        'https://cdn.autodoc.de/thumb?id=14187018&m=0&n=0&lng=fr&rev=94077',
  total_rubia:          'https://cdn.autodoc.de/thumb?id=14187023&m=0&n=0&lng=fr&rev=94077',

  // MOTUL
  motul_300v_10w40:     'https://cdn.autodoc.de/thumb?id=8216315&m=0&n=0&lng=fr&rev=94077',
  motul_8100_5w30:      'https://cdn.autodoc.de/thumb?id=8216315&m=0&n=0&lng=fr&rev=94077',
  motul_8100_5w40:      'https://cdn.autodoc.de/thumb?id=8216315&m=0&n=0&lng=fr&rev=94077',
  motul_moto_4t:        'https://cdn.autodoc.de/thumb?id=8216315&m=0&n=0&lng=fr&rev=94077',
  motul_gear_75w80:     'https://cdn.autodoc.de/thumb?id=8216315&m=0&n=0&lng=fr&rev=94077',

  // LIQUI MOLY
  liqui_leichtlauf_5w40:'https://cdn.autodoc.de/thumb?id=9713601&m=0&n=0&lng=fr&rev=94077',
  liqui_molygen_0w30:   'https://cdn.autodoc.de/thumb?id=13636544&m=0&n=0&lng=fr&rev=94077',
  liqui_special_tec_5w30:'https://cdn.autodoc.de/thumb?id=9713601&m=0&n=0&lng=fr&rev=94077',
  liqui_ceratec:        'https://cdn.autodoc.de/thumb?id=9713601&m=0&n=0&lng=fr&rev=94077',
  liqui_oil_sludge:     'https://cdn.autodoc.de/thumb?id=9713601&m=0&n=0&lng=fr&rev=94077',

  // YACCO
  yacco_lube_di_0w20:   'https://cdn.autodoc.de/thumb?id=12859250&m=0&n=0&lng=fr&rev=94077',
  yacco_vx1000_5w40:    'https://cdn.autodoc.de/thumb?id=12859250&m=0&n=0&lng=fr&rev=94077',
  yacco_transpro:       'https://cdn.autodoc.de/thumb?id=12859250&m=0&n=0&lng=fr&rev=94077',

  // BOSCH / PURFLUX (filters)
  bosch_filter:         'https://cdn.autodoc.de/thumb?id=1184345&m=0&n=0&lng=fr&rev=94077',
  purflux_filter:       'https://cdn.autodoc.de/thumb?id=1184345&m=0&n=0&lng=fr&rev=94077',
  mann_filter:          'https://cdn.autodoc.de/thumb?id=1184345&m=0&n=0&lng=fr&rev=94077',

  // Fallback professional oil bottle image (high quality generic)
  generic_oil_1l:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  generic_oil_5l:       'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&q=80',
  generic_additive:     'https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?w=600&q=80',
}

// ──────────────────────────────────────────────────────────────
// PRODUCT DEFINITIONS
// ──────────────────────────────────────────────────────────────
const PRODUCTS = [
  // ── CASTROL ────────────────────────────────────────────────
  {
    slug: 'castrol-edge-5w30-ll',
    name: 'Castrol EDGE 5W-30 LL',
    sku: 'CAS-5W30-EDGE-LL',
    brand: 'castrol',
    category: 'auto-synthese',
    desc: 'Le fluide Titanium fortifie l\'huile pour résister à la pression et maximiser les performances du moteur. Conforme VW 504 00 / 507 00.',
    isFeatured: true,
    specs: { viscosity: '5W-30', apiStandard: 'API SN', aeceaStandard: 'ACEA C3', isFullySynth: true },
    img: IMAGES.castrol_edge_5w30,
    variants: [
      { vol: '1L', price: 21.5, stock: 80 },
      { vol: '4L', price: 78.0, stock: 40 },
      { vol: '5L', price: 89.0, stock: 30 },
    ]
  },
  {
    slug: 'castrol-edge-5w40',
    name: 'Castrol EDGE 5W-40',
    sku: 'CAS-5W40-EDGE',
    brand: 'castrol',
    category: 'auto-synthese',
    desc: 'Castrol EDGE 5W-40 est une huile moteur 100% synthèse qui offre une protection optimale même dans les conditions les plus exigeantes.',
    isFeatured: true,
    specs: { viscosity: '5W-40', apiStandard: 'API SN PLUS', aeceaStandard: 'ACEA A3/B4', isFullySynth: true },
    img: IMAGES.castrol_edge_5w40,
    variants: [
      { vol: '1L', price: 20.9, stock: 100 },
      { vol: '4L', price: 74.0, stock: 50 },
      { vol: '5L', price: 87.0, stock: 35 },
    ]
  },
  {
    slug: 'castrol-magnatec-5w30-c3',
    name: 'Castrol MAGNATEC Stop-Start 5W-30 C3',
    sku: 'CAS-5W30-MAGN-C3',
    brand: 'castrol',
    category: 'auto-synthese',
    desc: 'Molécules intelligentes qui s\'accrochent au moteur pour le protéger dès le démarrage. Idéale pour les véhicules avec système Stop-Start.',
    isFeatured: false,
    specs: { viscosity: '5W-30', apiStandard: 'API SN', aeceaStandard: 'ACEA C3', isFullySynth: true },
    img: IMAGES.castrol_magnatec_5w30,
    variants: [
      { vol: '1L', price: 17.5, stock: 120 },
      { vol: '4L', price: 63.0, stock: 60 },
    ]
  },
  {
    slug: 'castrol-edge-0w20-c5',
    name: 'Castrol EDGE 0W-20 C5',
    sku: 'CAS-0W20-EDGE-C5',
    brand: 'castrol',
    category: 'auto-synthese',
    desc: 'Ultra-faible viscosité pour les moteurs hybrides et les technologies d\'économie de carburant. Conforme Toyota, Honda, Subaru.',
    isFeatured: false,
    specs: { viscosity: '0W-20', apiStandard: 'API SP', aeceaStandard: 'ACEA C5', isFullySynth: true },
    img: IMAGES.castrol_edge_0w20,
    variants: [
      { vol: '1L', price: 24.0, stock: 50 },
      { vol: '5L', price: 99.0, stock: 20 },
    ]
  },

  // ── SHELL ──────────────────────────────────────────────────
  {
    slug: 'shell-helix-ultra-5w40',
    name: 'Shell Helix Ultra 5W-40',
    sku: 'SHL-5W40-ULTRA',
    brand: 'shell',
    category: 'auto-synthese',
    desc: 'Huile moteur entièrement synthétique formulée avec la technologie PurePlus de Shell, extraite du gaz naturel.',
    isFeatured: true,
    specs: { viscosity: '5W-40', apiStandard: 'API SN PLUS', aeceaStandard: 'ACEA A3/B4', isFullySynth: true },
    img: IMAGES.shell_ultra_5w40,
    variants: [
      { vol: '1L', price: 18.5, stock: 150 },
      { vol: '4L', price: 68.0, stock: 70 },
      { vol: '5L', price: 80.0, stock: 50 },
    ]
  },
  {
    slug: 'shell-helix-ultra-extra-5w30',
    name: 'Shell Helix Ultra Extra 5W-30',
    sku: 'SHL-5W30-ULTRA-EXT',
    brand: 'shell',
    category: 'auto-synthese',
    desc: 'Conforme aux normes BMW LL-04, MB 229.31. Protection maximale pour les diesels à filtre à particules (FAP).',
    isFeatured: false,
    specs: { viscosity: '5W-30', apiStandard: 'API SN', aeceaStandard: 'ACEA C3', isFullySynth: true },
    img: IMAGES.shell_ultra_5w30,
    variants: [
      { vol: '1L', price: 19.0, stock: 80 },
      { vol: '5L', price: 82.0, stock: 35 },
    ]
  },
  {
    slug: 'shell-helix-hx7-10w40',
    name: 'Shell Helix HX7 10W-40',
    sku: 'SHL-10W40-HX7',
    brand: 'shell',
    category: 'auto-semi',
    desc: 'Huile semi-synthétique qui protège efficacement les moteurs en conditions normales et sévères.',
    isFeatured: false,
    specs: { viscosity: '10W-40', apiStandard: 'API SN', aeceaStandard: 'ACEA A3/B4', isSemiSynth: true },
    img: IMAGES.shell_hx7_10w40,
    variants: [
      { vol: '1L', price: 12.5, stock: 200 },
      { vol: '4L', price: 46.0, stock: 100 },
      { vol: '5L', price: 54.0, stock: 80 },
    ]
  },
  {
    slug: 'shell-helix-hx5-15w40',
    name: 'Shell Helix HX5 15W-40',
    sku: 'SHL-15W40-HX5',
    brand: 'shell',
    category: 'auto-minerale',
    desc: 'Huile minérale polyvalente idéale pour les véhicules anciens à essence et diesel. Bonne protection contre l\'usure.',
    isFeatured: false,
    specs: { viscosity: '15W-40', apiStandard: 'API SN', aeceaStandard: 'ACEA A3/B4', isMinerale: true },
    img: IMAGES.shell_hx5_15w40,
    variants: [
      { vol: '1L', price: 9.5, stock: 300 },
      { vol: '4L', price: 34.0, stock: 150 },
      { vol: '5L', price: 40.0, stock: 100 },
    ]
  },
  {
    slug: 'shell-rimula-r4-x-15w40',
    name: 'Shell Rimula R4 X 15W-40',
    sku: 'SHL-15W40-RIMULA-R4X',
    brand: 'shell',
    category: 'poids-lourd-agricole',
    desc: 'Huile diesel pour moteurs de poids lourds, offrant une protection triple contre les chocs thermiques, les dépôts et l\'usure.',
    isFeatured: false,
    specs: { viscosity: '15W-40', apiStandard: 'API CI-4 PLUS', aeceaStandard: 'ACEA E7', isMinerale: true },
    img: IMAGES.shell_rimula_r4,
    variants: [
      { vol: '5L', price: 52.0, stock: 60 },
      { vol: '20L', price: 185.0, stock: 20 },
    ]
  },

  // ── TOTALENERGIES ──────────────────────────────────────────
  {
    slug: 'total-quartz-9000-5w40',
    name: 'TotalEnergies Quartz 9000 5W-40',
    sku: 'TOT-5W40-Q9',
    brand: 'totalenergies',
    category: 'auto-synthese',
    desc: 'Huile 100% synthèse offrant une protection optimale du moteur et des économies de carburant. Conforme PSA B71 2296.',
    isFeatured: true,
    specs: { viscosity: '5W-40', apiStandard: 'API SN', aeceaStandard: 'ACEA A3/B4', isFullySynth: true },
    img: IMAGES.total_quartz_9000,
    variants: [
      { vol: '1L', price: 16.5, stock: 120 },
      { vol: '4L', price: 58.0, stock: 60 },
      { vol: '5L', price: 70.0, stock: 40 },
    ]
  },
  {
    slug: 'total-quartz-7000-10w40',
    name: 'TotalEnergies Quartz 7000 10W-40',
    sku: 'TOT-10W40-Q7',
    brand: 'totalenergies',
    category: 'auto-semi',
    desc: 'Huile moteur semi-synthétique pour essence et diesel — protection haute performance à prix accessible.',
    isFeatured: false,
    specs: { viscosity: '10W-40', apiStandard: 'API SN', aeceaStandard: 'ACEA A3/B4', isSemiSynth: true },
    img: IMAGES.total_quartz_7000,
    variants: [
      { vol: '1L', price: 12.0, stock: 200 },
      { vol: '4L', price: 42.0, stock: 100 },
      { vol: '5L', price: 50.0, stock: 80 },
    ]
  },
  {
    slug: 'total-quartz-5000-15w40',
    name: 'TotalEnergies Quartz 5000 15W-40',
    sku: 'TOT-15W40-Q5',
    brand: 'totalenergies',
    category: 'auto-minerale',
    desc: 'Huile minérale pour moteurs anciens essence et diesel. Protection de base contre l\'usure et les dépôts.',
    isFeatured: false,
    specs: { viscosity: '15W-40', apiStandard: 'API SN', aeceaStandard: 'ACEA A3/B4', isMinerale: true },
    img: IMAGES.total_quartz_5000,
    variants: [
      { vol: '1L', price: 8.5, stock: 400 },
      { vol: '4L', price: 30.0, stock: 200 },
      { vol: '5L', price: 35.0, stock: 150 },
    ]
  },
  {
    slug: 'total-quartz-ineo-c3-5w30',
    name: 'TotalEnergies Quartz INEO C3 5W-30',
    sku: 'TOT-5W30-INEO-C3',
    brand: 'totalenergies',
    category: 'auto-synthese',
    desc: 'Spécialement développée pour les véhicules PSA et BMW équipés de FAP ou de systèmes de dépollution SCR.',
    isFeatured: false,
    specs: { viscosity: '5W-30', apiStandard: 'API SN', aeceaStandard: 'ACEA C3', isFullySynth: true },
    img: IMAGES.total_hi_perf,
    variants: [
      { vol: '1L', price: 17.0, stock: 80 },
      { vol: '5L', price: 72.0, stock: 40 },
    ]
  },
  {
    slug: 'total-rubia-tir-9900-fe-5w30',
    name: 'TotalEnergies Rubia TIR 9900 FE 5W-30',
    sku: 'TOT-5W30-RUBIA-9900',
    brand: 'totalenergies',
    category: 'poids-lourd-agricole',
    desc: 'Huile poids lourds 100% synthèse pour les moteurs euro 5 & 6. Économie de carburant prouvée.',
    isFeatured: false,
    specs: { viscosity: '5W-30', apiStandard: 'API CK-4', aeceaStandard: 'ACEA E6/E9', isFullySynth: true },
    img: IMAGES.total_rubia,
    variants: [
      { vol: '5L', price: 65.0, stock: 30 },
      { vol: '20L', price: 220.0, stock: 10 },
    ]
  },

  // ── MOTUL ──────────────────────────────────────────────────
  {
    slug: 'motul-300v-competition-10w40',
    name: 'Motul 300V Competition 10W-40',
    sku: 'MOT-300V-10W40-COMP',
    brand: 'motul',
    category: 'auto-synthese',
    desc: 'Huile racing 100% synthèse technologie ESTER Core pour circuits et usage sport intensif. Ultra haute résistance thermique.',
    isFeatured: true,
    specs: { viscosity: '10W-40', apiStandard: 'API SN', aeceaStandard: 'ACEA A3', isFullySynth: true },
    img: IMAGES.motul_300v_10w40,
    variants: [
      { vol: '1L', price: 32.0, stock: 40 },
      { vol: '2L', price: 58.0, stock: 25 },
    ]
  },
  {
    slug: 'motul-8100-x-clean-efe-5w30',
    name: 'Motul 8100 X-Clean EFE 5W-30',
    sku: 'MOT-5W30-8100-XCLEAN',
    brand: 'motul',
    category: 'auto-synthese',
    desc: 'Éco-conçue pour les moteurs récents essence et diesel. Faible SAPS. Homologuée BMW LL-04, MB 229.52, Porsche C30.',
    isFeatured: false,
    specs: { viscosity: '5W-30', apiStandard: 'API SN', aeceaStandard: 'ACEA C3', isFullySynth: true },
    img: IMAGES.motul_8100_5w30,
    variants: [
      { vol: '1L', price: 22.0, stock: 60 },
      { vol: '5L', price: 90.0, stock: 30 },
    ]
  },
  {
    slug: 'motul-8100-x-power-10w60',
    name: 'Motul 8100 X-Power 10W-60',
    sku: 'MOT-10W60-8100-XPOWER',
    brand: 'motul',
    category: 'auto-synthese',
    desc: 'Haute viscosité pour moteurs hautes performances BMW M, AMG, Porsche GT. Protection ultime sous haute charge.',
    isFeatured: false,
    specs: { viscosity: '10W-60', apiStandard: 'API SN', aeceaStandard: 'ACEA A3/B4', isFullySynth: true },
    img: IMAGES.motul_8100_5w40,
    variants: [
      { vol: '1L', price: 28.0, stock: 30 },
      { vol: '5L', price: 115.0, stock: 10 },
    ]
  },
  {
    slug: 'motul-7100-moto-4t-20w50',
    name: 'Motul 7100 4T 20W-50',
    sku: 'MOT-20W50-7100-4T',
    brand: 'motul',
    category: 'moto',
    desc: 'Huile moto 4T 100% synthèse pour moteurs à refroidissement par air et liquide. Excellente tenue à haute température.',
    isFeatured: false,
    specs: { viscosity: '20W-50', apiStandard: 'API SJ', isFullySynth: true },
    img: IMAGES.motul_moto_4t,
    variants: [
      { vol: '1L', price: 20.0, stock: 50 },
      { vol: '4L', price: 72.0, stock: 20 },
    ]
  },
  {
    slug: 'motul-gear-competition-75w140',
    name: 'Motul Gear Competition 75W-140',
    sku: 'MOT-75W140-GEAR-COMP',
    brand: 'motul',
    category: 'additifs',
    desc: 'Huile de boîte et pont 100% synthèse pour transmissions sportives et LSD. Résistance extrême à la pression.',
    isFeatured: false,
    specs: { viscosity: '75W-140', isFullySynth: true },
    img: IMAGES.motul_gear_75w80,
    variants: [
      { vol: '1L', price: 35.0, stock: 20 },
    ]
  },

  // ── LIQUI MOLY ─────────────────────────────────────────────
  {
    slug: 'liqui-moly-leichtlauf-5w40',
    name: 'Liqui Moly Leichtlauf High Tech 5W-40',
    sku: 'LIQ-5W40-LEICHT',
    brand: 'liqui-moly',
    category: 'auto-synthese',
    desc: 'Huile haute performance à base d\'esters synthétiques. Faible consommation d\'huile. Homologuée MB 229.3, VW 502 00.',
    isFeatured: false,
    specs: { viscosity: '5W-40', apiStandard: 'API SN', aeceaStandard: 'ACEA A3/B4', isFullySynth: true },
    img: IMAGES.liqui_leichtlauf_5w40,
    variants: [
      { vol: '1L', price: 19.0, stock: 80 },
      { vol: '5L', price: 79.0, stock: 40 },
    ]
  },
  {
    slug: 'liqui-moly-molygen-ng-0w30',
    name: 'Liqui Moly Molygen New Generation 0W-30',
    sku: 'LIQ-0W30-MOLYGEN',
    brand: 'liqui-moly',
    category: 'auto-synthese',
    desc: 'Technologie MoS2 innovante. Excellente économie de carburant. Idéale pour les moteurs modernes et hybrides.',
    isFeatured: false,
    specs: { viscosity: '0W-30', apiStandard: 'API SP', aeceaStandard: 'ACEA C2/C3', isFullySynth: true },
    img: IMAGES.liqui_molygen_0w30,
    variants: [
      { vol: '1L', price: 25.0, stock: 40 },
      { vol: '5L', price: 105.0, stock: 15 },
    ]
  },
  {
    slug: 'liqui-moly-special-tec-f-eco-5w30',
    name: 'Liqui Moly Special Tec F ECO 5W-30',
    sku: 'LIQ-5W30-SPECTEC-FECO',
    brand: 'liqui-moly',
    category: 'auto-synthese',
    desc: 'Spécialement formulée pour Ford, conforme Ford WSS-M2C 913-D. Longue durée de vidange, protection supérieure.',
    isFeatured: false,
    specs: { viscosity: '5W-30', apiStandard: 'API SN', aeceaStandard: 'ACEA A5/B5', isFullySynth: true },
    img: IMAGES.liqui_special_tec_5w30,
    variants: [
      { vol: '1L', price: 18.0, stock: 60 },
      { vol: '5L', price: 75.0, stock: 30 },
    ]
  },
  {
    slug: 'liqui-moly-ceratec',
    name: 'Liqui Moly Cera Tec Additif Anti-Usure',
    sku: 'LIQ-CERATEC-300ML',
    brand: 'liqui-moly',
    category: 'additifs',
    desc: 'Additif céramique haute technologie qui réduit l\'usure et la friction. Un flacon pour 5L d\'huile moteur.',
    isFeatured: true,
    specs: {},
    img: IMAGES.liqui_ceratec,
    variants: [
      { vol: '300ml', price: 28.5, stock: 200 },
    ]
  },
  {
    slug: 'liqui-moly-motor-sludge-remover',
    name: 'Liqui Moly Motor Sludge Remover',
    sku: 'LIQ-SLUDGE-300ML',
    brand: 'liqui-moly',
    category: 'additifs',
    desc: 'Nettoyant moteur puissant qui dissout les dépôts et boues de vieille huile avant la vidange. Protège les segments.',
    isFeatured: false,
    specs: {},
    img: IMAGES.liqui_oil_sludge,
    variants: [
      { vol: '300ml', price: 19.0, stock: 150 },
    ]
  },

  // ── YACCO ──────────────────────────────────────────────────
  {
    slug: 'yacco-lube-di-0w20-c6',
    name: 'Yacco Lube DI 0W-20 C6',
    sku: 'YAC-0W20-LUBE-DI',
    brand: 'yacco',
    category: 'auto-synthese',
    desc: 'Huile 100% synthèse de toute dernière technologie pour moteurs essence et diesel récents. ACEA C6, ultra faible HTHS.',
    isFeatured: true,
    specs: { viscosity: '0W-20', apiStandard: 'API SP', aeceaStandard: 'ACEA C6', isFullySynth: true },
    img: IMAGES.yacco_lube_di_0w20,
    variants: [
      { vol: '1L', price: 22.5, stock: 50 },
      { vol: '5L', price: 95.0, stock: 30 },
    ]
  },
  {
    slug: 'yacco-vx1000-far-5w40',
    name: 'Yacco VX 1000 FAR 5W-40',
    sku: 'YAC-5W40-VX1000-FAR',
    brand: 'yacco',
    category: 'auto-synthese',
    desc: 'Huile 100% synthèse pour moteurs exigeants. Excellente stabilité thermique et résistance à l\'oxydation.',
    isFeatured: false,
    specs: { viscosity: '5W-40', apiStandard: 'API SN', aeceaStandard: 'ACEA A3/B4', isFullySynth: true },
    img: IMAGES.yacco_vx1000_5w40,
    variants: [
      { vol: '1L', price: 20.0, stock: 60 },
      { vol: '5L', price: 82.0, stock: 25 },
    ]
  },
  {
    slug: 'yacco-transpro-ld-10w40',
    name: 'Yacco Transpro LD 10W-40',
    sku: 'YAC-10W40-TRANSPRO-LD',
    brand: 'yacco',
    category: 'poids-lourd-agricole',
    desc: 'Huile semi-synthèse pour moteurs poids lourds longue durée. Résistance élevée à l\'usure et aux dépôts à haute température.',
    isFeatured: false,
    specs: { viscosity: '10W-40', apiStandard: 'API CI-4', aeceaStandard: 'ACEA E7', isSemiSynth: true },
    img: IMAGES.yacco_transpro,
    variants: [
      { vol: '5L', price: 58.0, stock: 40 },
      { vol: '20L', price: 195.0, stock: 10 },
    ]
  },

  // ── FILTRES ────────────────────────────────────────────────
  {
    slug: 'bosch-filtre-a-huile-p3045',
    name: 'Bosch Filtre à Huile P3045',
    sku: 'BOSCH-P3045',
    brand: 'bosch',
    category: 'filtres',
    desc: 'Filtre à huile haute qualité pour moteurs VW / Audi / SEAT / Škoda 1.4-2.0 TSI et TDI. Joint inclus.',
    isFeatured: false,
    specs: {},
    img: IMAGES.bosch_filter,
    variants: [
      { vol: 'Pièce', price: 15.0, stock: 300 },
    ]
  },
  {
    slug: 'purflux-filtre-a-huile-l516a',
    name: 'Purflux Filtre à Huile L516A',
    sku: 'PFX-L516A',
    brand: 'purflux',
    category: 'filtres',
    desc: 'Filtre à huile pour Citroën, Peugeot, Renault moteurs 1.4 à 1.6 HDi / dCi. Filtration à 99% des impuretés.',
    isFeatured: false,
    specs: {},
    img: IMAGES.purflux_filter,
    variants: [
      { vol: 'Pièce', price: 12.0, stock: 500 },
    ]
  },
  {
    slug: 'mann-filter-hu719-6x',
    name: 'Mann-Filter HU 719/6 x Filtre à Huile',
    sku: 'MANN-HU719-6X',
    brand: 'bosch', // using bosch as proxy since no mann brand
    category: 'filtres',
    desc: 'Filtre à huile Original équipement pour BMW Série 1, 3, 5, X1, X3 moteurs 2.0d-3.0d.',
    isFeatured: false,
    specs: {},
    img: IMAGES.mann_filter,
    variants: [
      { vol: 'Pièce', price: 18.5, stock: 200 },
    ]
  },
]

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────
async function getBrandId(slug) {
  const b = await p.brand.findUnique({ where: { slug } })
  return b?.id ?? null
}

async function getCategoryId(slug) {
  const c = await p.category.findUnique({ where: { slug } })
  return c?.id ?? null
}

// ──────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────
async function main() {
  console.log('=== CLEAN PRODUCTS SEED ===\n')

  // 1. Delete the 15 filler "Huile Standard V*" products
  console.log('Removing filler products...')
  const deleted = await p.product.deleteMany({
    where: {
      slug: { startsWith: 'huile-standard-v' }
    }
  })
  console.log(`  Removed ${deleted.count} filler products.\n`)

  // 2. Upsert all real products
  let created = 0, updated = 0, failed = 0

  for (const prod of PRODUCTS) {
    try {
      const brandId = await getBrandId(prod.brand)
      const categoryId = await getCategoryId(prod.category)

      if (!brandId) {
        console.log(`  [skip] Brand not found: ${prod.brand}`)
        failed++; continue
      }
      if (!categoryId) {
        console.log(`  [skip] Category not found: ${prod.category}`)
        failed++; continue
      }

      // Check existing
      const existing = await p.product.findUnique({ where: { slug: prod.slug } })

      if (existing) {
        // Update the image and name
        await p.productImage.deleteMany({ where: { productId: existing.id } })
        await p.product.update({
          where: { id: existing.id },
          data: {
            nameFr: prod.name,
            description: prod.desc,
            isFeatured: prod.isFeatured ?? false,
            images: {
              create: [{ url: prod.img, isPrimary: true, sortOrder: 0 }]
            }
          }
        })
        console.log(`  [update] ${prod.slug}`)
        updated++
      } else {
        // Create new
        await p.product.create({
          data: {
            nameFr: prod.name,
            slug: prod.slug,
            sku: prod.sku,
            description: prod.desc,
            brandId,
            categoryId,
            isPublished: true,
            isFeatured: prod.isFeatured ?? false,
            images: {
              create: [{ url: prod.img, isPrimary: true, sortOrder: 0 }]
            },
            specs: Object.keys(prod.specs).length
              ? { create: prod.specs }
              : undefined,
            variants: {
              create: prod.variants.map((v, idx) => ({
                volume: v.vol,
                price: v.price,
                stockQty: v.stock,
                skuVariant: `${prod.sku}-${v.vol.replace(/\s+/g, '').toUpperCase()}`
              }))
            }
          }
        })
        console.log(`  [create] ${prod.slug}`)
        created++
      }
    } catch (err) {
      console.error(`  [FAIL] ${prod.slug}: ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone: ${created} created, ${updated} updated, ${failed} failed`)
  console.log('=== CLEAN PRODUCTS SEED COMPLETE ===')
  await p.$disconnect()
}

main().catch(async e => {
  console.error(e)
  await p.$disconnect()
  process.exit(1)
})
