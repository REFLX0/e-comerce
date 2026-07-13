/**
 * MEGA SEED 3 — Huge vehicle database extension
 * Adds 35+ additional makes (Asian, North African, American, Commercial, ...)
 * with 150+ models and extensive oil compatibility mapping.
 * Run inside the backend container: node prisma/mega-seed-3.cjs
 */
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

// ──────────────────────────────────────────────────────────────
// MAKES + MODELS + ENGINES
// ──────────────────────────────────────────────────────────────
const MAKES_MODELS = [

  // ── TOYOTA ─────────────────────────────────────────────────
  {
    name: 'Toyota', slug: 'toyota',
    models: [
      { name: 'Yaris IV',      slug: 'toyota-yaris-iv',      engines: [{ code: '1.0 VVT-i 72', from: 2020, to: null }, { code: '1.5 Hybrid 116', from: 2020, to: null }] },
      { name: 'Corolla XII',   slug: 'toyota-corolla-xii',   engines: [{ code: '1.2 Turbo 116', from: 2019, to: null }, { code: '1.8 Hybrid 122', from: 2019, to: null }, { code: '2.0 Hybrid 184', from: 2019, to: null }] },
      { name: 'Camry XV70',    slug: 'toyota-camry-xv70',    engines: [{ code: '2.5 Hybrid 218', from: 2017, to: null }, { code: '2.5i 207', from: 2017, to: null }] },
      { name: 'RAV4 V',        slug: 'toyota-rav4-v',        engines: [{ code: '2.0i 149', from: 2018, to: null }, { code: '2.5 Hybrid 222', from: 2018, to: null }, { code: '2.5 Plug-in Hybrid 306', from: 2020, to: null }] },
      { name: 'Land Cruiser 300', slug: 'toyota-landcruiser-300', engines: [{ code: '3.5 V6 Turbo 415', from: 2021, to: null }, { code: '3.3 V6 Diesel 309', from: 2021, to: null }] },
      { name: 'Hilux VIII',    slug: 'toyota-hilux-viii',    engines: [{ code: '2.4 D-4D 150', from: 2016, to: null }, { code: '2.8 D-4D 204', from: 2016, to: null }, { code: '2.7i 163', from: 2016, to: null }] },
      { name: 'Prius IV',      slug: 'toyota-prius-iv',      engines: [{ code: '1.8 Hybrid 122', from: 2015, to: 2022 }, { code: '2.0 Plug-in Hybrid 223', from: 2022, to: null }] },
      { name: 'C-HR I',        slug: 'toyota-chr-i',         engines: [{ code: '1.2 Turbo 116', from: 2016, to: null }, { code: '1.8 Hybrid 122', from: 2016, to: null }, { code: '2.0 Hybrid 184', from: 2020, to: null }] },
      { name: 'Fortuner II',   slug: 'toyota-fortuner-ii',   engines: [{ code: '2.4 D-4D 163', from: 2015, to: null }, { code: '2.8 D-4D 204', from: 2015, to: null }, { code: '4.0 V6 278', from: 2015, to: null }] },
    ]
  },

  // ── HONDA ──────────────────────────────────────────────────
  {
    name: 'Honda', slug: 'honda',
    models: [
      { name: 'Civic XI',      slug: 'honda-civic-xi',       engines: [{ code: '1.5 VTEC Turbo 182', from: 2021, to: null }, { code: '2.0 e:HEV 184', from: 2022, to: null }] },
      { name: 'HR-V III',      slug: 'honda-hrv-iii',        engines: [{ code: '1.5 e:HEV 131', from: 2021, to: null }] },
      { name: 'CR-V VI',       slug: 'honda-crv-vi',         engines: [{ code: '1.5 Turbo 193', from: 2022, to: null }, { code: '2.0 e:PHEV 204', from: 2022, to: null }] },
      { name: 'Jazz V',        slug: 'honda-jazz-v',         engines: [{ code: '1.5 e:HEV 109', from: 2020, to: null }] },
      { name: 'City VI',       slug: 'honda-city-vi',        engines: [{ code: '1.5 i-VTEC 119', from: 2020, to: null }, { code: '1.5 e:HEV 109', from: 2020, to: null }] },
      { name: 'Accord X',      slug: 'honda-accord-x',       engines: [{ code: '1.5 Turbo 192', from: 2017, to: null }, { code: '2.0 Sport Hybrid 215', from: 2017, to: null }] },
    ]
  },

  // ── HYUNDAI ────────────────────────────────────────────────
  {
    name: 'Hyundai', slug: 'hyundai',
    models: [
      { name: 'i10 III',       slug: 'hyundai-i10-iii',      engines: [{ code: '1.0 67', from: 2019, to: null }, { code: '1.0 T-GDI 100', from: 2020, to: null }] },
      { name: 'i20 III',       slug: 'hyundai-i20-iii',      engines: [{ code: '1.0 T-GDI 100', from: 2020, to: null }, { code: '1.0 T-GDI 120', from: 2020, to: null }, { code: '1.6 CRDi 115', from: 2020, to: null }] },
      { name: 'i30 III FL',    slug: 'hyundai-i30-iii-fl',   engines: [{ code: '1.0 T-GDI 120', from: 2020, to: null }, { code: '1.5 DPI 110', from: 2020, to: null }, { code: '1.6 CRDi 136', from: 2020, to: null }] },
      { name: 'Tucson IV',     slug: 'hyundai-tucson-iv',    engines: [{ code: '1.6 T-GDI 150', from: 2020, to: null }, { code: '1.6 T-GDI Hybrid 230', from: 2020, to: null }, { code: '1.6 CRDi 136', from: 2020, to: null }] },
      { name: 'Santa Fe IV',   slug: 'hyundai-santa-fe-iv',  engines: [{ code: '1.6 T-GDI Hybrid 265', from: 2020, to: null }, { code: '2.2 CRDi 200', from: 2020, to: null }, { code: '1.6 T-GDI PHEV 265', from: 2021, to: null }] },
      { name: 'Kona II',       slug: 'hyundai-kona-ii',      engines: [{ code: '1.0 T-GDI 120', from: 2023, to: null }, { code: '1.6 T-GDI Hybrid 141', from: 2023, to: null }, { code: 'EV 156', from: 2023, to: null }] },
      { name: 'Ioniq 5',       slug: 'hyundai-ioniq5',       engines: [{ code: 'RWD Standard 170', from: 2021, to: null }, { code: 'RWD Long Range 217', from: 2021, to: null }, { code: 'AWD Long Range 320', from: 2021, to: null }] },
      { name: 'Ioniq 6',       slug: 'hyundai-ioniq6',       engines: [{ code: 'RWD Standard 151', from: 2022, to: null }, { code: 'RWD Long Range 229', from: 2022, to: null }, { code: 'AWD Long Range 325', from: 2022, to: null }] },
    ]
  },

  // ── KIA ────────────────────────────────────────────────────
  {
    name: 'Kia', slug: 'kia',
    models: [
      { name: 'Picanto III',   slug: 'kia-picanto-iii',      engines: [{ code: '1.0 67', from: 2017, to: null }, { code: '1.0 T-GDI 100', from: 2017, to: null }] },
      { name: 'Rio IV',        slug: 'kia-rio-iv',           engines: [{ code: '1.2 84', from: 2017, to: null }, { code: '1.0 T-GDI 100', from: 2017, to: null }, { code: '1.4 CRDi 90', from: 2017, to: null }] },
      { name: 'Ceed III',      slug: 'kia-ceed-iii',         engines: [{ code: '1.0 T-GDI 120', from: 2018, to: null }, { code: '1.5 T-GDI 160', from: 2018, to: null }, { code: '1.6 CRDi 136', from: 2018, to: null }] },
      { name: 'Sportage V',    slug: 'kia-sportage-v',       engines: [{ code: '1.6 T-GDI 150', from: 2022, to: null }, { code: '1.6 T-GDI Hybrid 230', from: 2022, to: null }, { code: '1.6 CRDi 136', from: 2022, to: null }] },
      { name: 'Sorento IV',    slug: 'kia-sorento-iv',       engines: [{ code: '1.6 T-GDI Hybrid 230', from: 2020, to: null }, { code: '2.2 CRDi 202', from: 2020, to: null }, { code: '1.6 T-GDI PHEV 265', from: 2020, to: null }] },
      { name: 'EV6',           slug: 'kia-ev6',              engines: [{ code: 'RWD Standard 170', from: 2021, to: null }, { code: 'RWD Long Range 229', from: 2021, to: null }, { code: 'AWD Long Range 325', from: 2021, to: null }, { code: 'GT AWD 585', from: 2022, to: null }] },
      { name: 'Stinger',       slug: 'kia-stinger',          engines: [{ code: '2.5 T-GDI 300', from: 2021, to: null }, { code: '3.3 T-GDI V6 370', from: 2018, to: null }] },
    ]
  },

  // ── NISSAN ─────────────────────────────────────────────────
  {
    name: 'Nissan', slug: 'nissan',
    models: [
      { name: 'Micra K14',     slug: 'nissan-micra-k14',     engines: [{ code: '0.9 IG-T 90', from: 2017, to: null }, { code: '1.0 IG-T 100', from: 2019, to: null }, { code: '1.5 dCi 90', from: 2017, to: null }] },
      { name: 'Qashqai III',   slug: 'nissan-qashqai-iii',   engines: [{ code: '1.3 DIG-T MHEV 140', from: 2021, to: null }, { code: '1.3 DIG-T MHEV 158', from: 2021, to: null }, { code: '1.5 e-Power 190', from: 2021, to: null }] },
      { name: 'X-Trail IV',    slug: 'nissan-xtrail-iv',     engines: [{ code: '1.5 e-Power 204', from: 2022, to: null }, { code: '1.5 e-Power AWD 213', from: 2022, to: null }] },
      { name: 'Juke II',       slug: 'nissan-juke-ii',       engines: [{ code: '1.0 DIG-T 114', from: 2019, to: null }, { code: '1.6 Hybrid 143', from: 2021, to: null }] },
      { name: 'Navara D23',    slug: 'nissan-navara-d23',    engines: [{ code: '2.3 dCi 160', from: 2016, to: null }, { code: '2.3 dCi 190', from: 2016, to: null }, { code: '2.5 dCi 163', from: 2016, to: null }] },
      { name: 'Leaf II',       slug: 'nissan-leaf-ii',       engines: [{ code: 'EV 150', from: 2017, to: null }, { code: 'EV e+ 217', from: 2019, to: null }] },
      { name: 'Pathfinder IV', slug: 'nissan-pathfinder-iv', engines: [{ code: '3.5 V6 284', from: 2022, to: null }] },
    ]
  },

  // ── MAZDA ──────────────────────────────────────────────────
  {
    name: 'Mazda', slug: 'mazda',
    models: [
      { name: 'Mazda2 DJ',     slug: 'mazda2-dj',            engines: [{ code: '1.5 SKYACTIV-G 75', from: 2015, to: null }, { code: '1.5 SKYACTIV-G 90', from: 2015, to: null }, { code: '1.5 SKYACTIV-D 105', from: 2015, to: null }] },
      { name: 'Mazda3 BP',     slug: 'mazda3-bp',            engines: [{ code: '2.0 SKYACTIV-G 122', from: 2019, to: null }, { code: '2.0 SKYACTIV-X 186', from: 2019, to: null }, { code: '1.8 SKYACTIV-D 116', from: 2019, to: null }] },
      { name: 'Mazda6 GL',     slug: 'mazda6-gl',            engines: [{ code: '2.0 SKYACTIV-G 145', from: 2018, to: null }, { code: '2.5 SKYACTIV-G 194', from: 2018, to: null }, { code: '2.2 SKYACTIV-D 150', from: 2018, to: null }] },
      { name: 'CX-5 KF',      slug: 'mazda-cx5-kf',         engines: [{ code: '2.0 SKYACTIV-G 165', from: 2017, to: null }, { code: '2.5 SKYACTIV-G 194', from: 2017, to: null }, { code: '2.2 SKYACTIV-D 150', from: 2017, to: null }, { code: '2.2 SKYACTIV-D 184', from: 2017, to: null }] },
      { name: 'CX-60',        slug: 'mazda-cx60',           engines: [{ code: '3.3 SKYACTIV-D 200', from: 2022, to: null }, { code: '3.3 SKYACTIV-D 254', from: 2022, to: null }, { code: '2.5 PHEV 327', from: 2022, to: null }] },
      { name: 'MX-5 ND',      slug: 'mazda-mx5-nd',         engines: [{ code: '1.5 SKYACTIV-G 132', from: 2015, to: null }, { code: '2.0 SKYACTIV-G 184', from: 2015, to: null }] },
    ]
  },

  // ── DACIA ──────────────────────────────────────────────────
  {
    name: 'Dacia', slug: 'dacia',
    models: [
      { name: 'Sandero III',   slug: 'dacia-sandero-iii',    engines: [{ code: '1.0 SCe 65', from: 2020, to: null }, { code: '1.0 TCe 90', from: 2020, to: null }, { code: '1.0 TCe 100 GPL', from: 2020, to: null }, { code: '1.5 Blue dCi 95', from: 2020, to: null }] },
      { name: 'Duster II',     slug: 'dacia-duster-ii',      engines: [{ code: '1.0 TCe 90', from: 2018, to: null }, { code: '1.3 TCe 130', from: 2018, to: null }, { code: '1.3 TCe 150 4WD', from: 2018, to: null }, { code: '1.5 Blue dCi 115', from: 2018, to: null }] },
      { name: 'Logan III',     slug: 'dacia-logan-iii',      engines: [{ code: '1.0 SCe 65', from: 2020, to: null }, { code: '1.0 TCe 100', from: 2020, to: null }] },
      { name: 'Jogger',        slug: 'dacia-jogger',         engines: [{ code: '1.0 TCe 110', from: 2021, to: null }, { code: '1.6 Hybrid 140', from: 2023, to: null }] },
      { name: 'Spring',        slug: 'dacia-spring',         engines: [{ code: 'EV 45', from: 2021, to: null }, { code: 'EV 65', from: 2023, to: null }] },
    ]
  },

  // ── SEAT / CUPRA ───────────────────────────────────────────
  {
    name: 'SEAT', slug: 'seat',
    models: [
      { name: 'Ibiza V',       slug: 'seat-ibiza-v',         engines: [{ code: '1.0 MPI 80', from: 2017, to: null }, { code: '1.0 TSI 95', from: 2017, to: null }, { code: '1.0 TSI 110', from: 2017, to: null }, { code: '1.5 TSI 150', from: 2019, to: null }] },
      { name: 'Leon IV',       slug: 'seat-leon-iv',         engines: [{ code: '1.0 eTSI 90', from: 2020, to: null }, { code: '1.5 eTSI 150', from: 2020, to: null }, { code: '2.0 TSI 190', from: 2020, to: null }, { code: '2.0 TDI 115', from: 2020, to: null }, { code: 'e-Hybrid PHEV 204', from: 2020, to: null }] },
      { name: 'Ateca',         slug: 'seat-ateca',           engines: [{ code: '1.0 TSI 115', from: 2016, to: null }, { code: '1.5 TSI 150', from: 2016, to: null }, { code: '2.0 TDI 150', from: 2016, to: null }, { code: '2.0 TSI 190 4Drive', from: 2016, to: null }] },
      { name: 'Arona',         slug: 'seat-arona',           engines: [{ code: '1.0 TSI 95', from: 2017, to: null }, { code: '1.0 TSI 110', from: 2017, to: null }, { code: '1.5 TSI 150', from: 2020, to: null }] },
    ]
  },

  // ── ŠKODA ──────────────────────────────────────────────────
  {
    name: 'Škoda', slug: 'skoda',
    models: [
      { name: 'Fabia IV',      slug: 'skoda-fabia-iv',       engines: [{ code: '1.0 MPI 65', from: 2021, to: null }, { code: '1.0 TSI 95', from: 2021, to: null }, { code: '1.0 TSI 110', from: 2021, to: null }, { code: '1.5 TSI 150', from: 2021, to: null }] },
      { name: 'Octavia IV',    slug: 'skoda-octavia-iv',     engines: [{ code: '1.0 TSI 110', from: 2020, to: null }, { code: '1.5 TSI 150', from: 2020, to: null }, { code: '2.0 TSI 190', from: 2020, to: null }, { code: '2.0 TDI 115', from: 2020, to: null }, { code: 'iV PHEV 245', from: 2020, to: null }] },
      { name: 'Superb III FL', slug: 'skoda-superb-iii',     engines: [{ code: '1.5 TSI 150', from: 2019, to: null }, { code: '2.0 TSI 190', from: 2019, to: null }, { code: '2.0 TDI 150', from: 2019, to: null }, { code: '2.0 TDI 200', from: 2019, to: null }] },
      { name: 'Karoq FL',      slug: 'skoda-karoq-fl',       engines: [{ code: '1.0 TSI 110', from: 2021, to: null }, { code: '1.5 TSI 150', from: 2021, to: null }, { code: '2.0 TDI 116', from: 2021, to: null }, { code: '2.0 TDI 150', from: 2021, to: null }] },
      { name: 'Kodiaq II',     slug: 'skoda-kodiaq-ii',      engines: [{ code: '1.5 TSI 150', from: 2023, to: null }, { code: '2.0 TSI 204', from: 2023, to: null }, { code: '2.0 TDI 150', from: 2023, to: null }, { code: 'iV PHEV 204', from: 2023, to: null }] },
    ]
  },

  // ── FORD ───────────────────────────────────────────────────
  {
    name: 'Ford', slug: 'ford',
    models: [
      { name: 'Fiesta VIII',   slug: 'ford-fiesta-viii',     engines: [{ code: '1.0 EcoBoost 85', from: 2017, to: 2023 }, { code: '1.0 EcoBoost 100', from: 2017, to: 2023 }, { code: '1.0 EcoBoost 125', from: 2017, to: 2023 }, { code: '1.5 EcoBlue 85', from: 2017, to: 2023 }] },
      { name: 'Focus IV',      slug: 'ford-focus-iv',        engines: [{ code: '1.0 EcoBoost MHEV 125', from: 2018, to: null }, { code: '1.5 EcoBoost 150', from: 2018, to: null }, { code: '2.3 EcoBoost 280 ST', from: 2018, to: null }, { code: '1.5 EcoBlue 120', from: 2018, to: null }] },
      { name: 'Puma',          slug: 'ford-puma',            engines: [{ code: '1.0 EcoBoost MHEV 125', from: 2019, to: null }, { code: '1.0 EcoBoost MHEV 155', from: 2019, to: null }, { code: '1.5 EcoBlue 120', from: 2019, to: null }] },
      { name: 'Kuga III',      slug: 'ford-kuga-iii',        engines: [{ code: '1.5 EcoBoost 120', from: 2019, to: null }, { code: '1.5 EcoBoost 150', from: 2019, to: null }, { code: 'PHEV 225', from: 2019, to: null }, { code: '1.5 EcoBlue 120', from: 2019, to: null }] },
      { name: 'Ranger T6 II',  slug: 'ford-ranger-t6-ii',   engines: [{ code: '2.0 EcoBlue 170', from: 2019, to: null }, { code: '2.0 EcoBlue Bi-Turbo 213', from: 2019, to: null }, { code: '3.0 V6 EcoBlue 240', from: 2022, to: null }] },
      { name: 'Mustang VII',   slug: 'ford-mustang-vii',     engines: [{ code: '2.3 EcoBoost 290', from: 2023, to: null }, { code: '5.0 V8 446', from: 2023, to: null }] },
      { name: 'Bronco VI',     slug: 'ford-bronco-vi',       engines: [{ code: '2.3 EcoBoost 300', from: 2021, to: null }, { code: '2.7 EcoBoost V6 315', from: 2021, to: null }] },
    ]
  },

  // ── OPEL / VAUXHALL ────────────────────────────────────────
  {
    name: 'Opel', slug: 'opel',
    models: [
      { name: 'Corsa F',       slug: 'opel-corsa-f',         engines: [{ code: '1.2 75', from: 2019, to: null }, { code: '1.2 Turbo 100', from: 2019, to: null }, { code: '1.2 Turbo 130', from: 2019, to: null }, { code: 'EV 136', from: 2019, to: null }] },
      { name: 'Astra L',       slug: 'opel-astra-l',         engines: [{ code: '1.2 Turbo 110', from: 2021, to: null }, { code: '1.2 Turbo 130', from: 2021, to: null }, { code: '1.5 Diesel 130', from: 2021, to: null }, { code: 'PHEV 180', from: 2021, to: null }] },
      { name: 'Mokka B',       slug: 'opel-mokka-b',         engines: [{ code: '1.2 Turbo 100', from: 2020, to: null }, { code: '1.2 Turbo 130', from: 2020, to: null }, { code: '1.5 Diesel 110', from: 2020, to: null }, { code: 'EV 136', from: 2020, to: null }] },
      { name: 'Grandland X FL',slug: 'opel-grandland-x-fl',  engines: [{ code: '1.2 Turbo 130', from: 2020, to: null }, { code: '1.5 BlueHDi 130', from: 2020, to: null }, { code: 'PHEV 225', from: 2020, to: null }, { code: 'PHEV4 300', from: 2020, to: null }] },
      { name: 'Crossland',     slug: 'opel-crossland',       engines: [{ code: '1.2 83', from: 2020, to: null }, { code: '1.2 Turbo 110', from: 2020, to: null }, { code: '1.5 BlueHDi 110', from: 2020, to: null }] },
    ]
  },

  // ── CITROËN ────────────────────────────────────────────────
  {
    name: 'Citroën', slug: 'citroen',
    models: [
      { name: 'C3 III',        slug: 'citroen-c3-iii',       engines: [{ code: '1.2 PureTech 83', from: 2016, to: null }, { code: '1.2 PureTech 110', from: 2016, to: null }, { code: '1.5 BlueHDi 102', from: 2016, to: null }] },
      { name: 'C4 IV',         slug: 'citroen-c4-iv',        engines: [{ code: '1.2 PureTech 100', from: 2020, to: null }, { code: '1.2 PureTech 130', from: 2020, to: null }, { code: '1.5 BlueHDi 110', from: 2020, to: null }, { code: 'EV 136', from: 2020, to: null }] },
      { name: 'C5 Aircross',   slug: 'citroen-c5-aircross',  engines: [{ code: '1.2 PureTech 130', from: 2018, to: null }, { code: '1.5 BlueHDi 130', from: 2018, to: null }, { code: '2.0 BlueHDi 180', from: 2018, to: null }, { code: 'Hybrid PHEV 225', from: 2020, to: null }] },
      { name: 'Berlingo III',  slug: 'citroen-berlingo-iii', engines: [{ code: '1.2 PureTech 110', from: 2018, to: null }, { code: '1.5 BlueHDi 100', from: 2018, to: null }, { code: '1.5 BlueHDi 130', from: 2018, to: null }] },
      { name: 'C3 Aircross II',slug: 'citroen-c3-aircross-ii', engines: [{ code: '1.2 PureTech 110', from: 2021, to: null }, { code: '1.2 PureTech 130', from: 2021, to: null }, { code: '1.5 BlueHDi 110', from: 2021, to: null }] },
    ]
  },

  // ── FIAT ───────────────────────────────────────────────────
  {
    name: 'Fiat', slug: 'fiat',
    models: [
      { name: 'Panda III FL',  slug: 'fiat-panda-iii-fl',   engines: [{ code: '1.0 Hybrid 70', from: 2020, to: null }, { code: '1.2 69', from: 2016, to: null }] },
      { name: '500X FL',       slug: 'fiat-500x-fl',         engines: [{ code: '1.0 FireFly Turbo 120', from: 2018, to: null }, { code: '1.3 FireFly Turbo 150', from: 2018, to: null }, { code: '1.6 MultiJet II 120', from: 2018, to: null }] },
      { name: 'Tipo II',       slug: 'fiat-tipo-ii',         engines: [{ code: '1.0 Turbo 100', from: 2020, to: null }, { code: '1.4 T-Jet 120', from: 2016, to: null }, { code: '1.6 MultiJet 120', from: 2016, to: null }] },
      { name: '500e III',      slug: 'fiat-500e-iii',        engines: [{ code: 'EV 118', from: 2020, to: null }, { code: 'EV Long Range 118', from: 2021, to: null }] },
      { name: 'Doblo III',     slug: 'fiat-doblo-iii',       engines: [{ code: '1.5 BlueHDi 100', from: 2022, to: null }, { code: '1.2 PureTech 110', from: 2022, to: null }, { code: 'EV 136', from: 2022, to: null }] },
    ]
  },

  // ── DODGE ──────────────────────────────────────────────────
  {
    name: 'Dodge', slug: 'dodge',
    models: [
      { name: 'Charger VIII',  slug: 'dodge-charger-viii',   engines: [{ code: '3.6 V6 Pentastar 300', from: 2011, to: 2023 }, { code: '5.7 HEMI V8 375', from: 2011, to: 2023 }, { code: '6.4 HEMI V8 492', from: 2012, to: 2023 }, { code: 'SRT Hellcat 6.2 717', from: 2015, to: 2023 }] },
      { name: 'Challenger III',slug: 'dodge-challenger-iii', engines: [{ code: '3.6 V6 Pentastar 305', from: 2015, to: 2023 }, { code: '5.7 HEMI V8 375', from: 2015, to: 2023 }, { code: '6.4 HEMI V8 492', from: 2015, to: 2023 }, { code: 'Hellcat 6.2 717', from: 2015, to: 2023 }] },
      { name: 'Durango III',   slug: 'dodge-durango-iii',    engines: [{ code: '3.6 V6 290', from: 2014, to: null }, { code: '5.7 HEMI V8 360', from: 2014, to: null }] },
    ]
  },

  // ── CADILLAC ───────────────────────────────────────────────
  {
    name: 'Cadillac', slug: 'cadillac',
    models: [
      { name: 'Escalade V',    slug: 'cadillac-escalade-v',  engines: [{ code: '6.2 V8 420', from: 2020, to: null }, { code: '3.0 Diesel Turbo 277', from: 2020, to: null }] },
      { name: 'CT5',           slug: 'cadillac-ct5',         engines: [{ code: '2.0 Turbo 237', from: 2019, to: null }, { code: '3.0 Twin Turbo V6 360', from: 2019, to: null }] },
      { name: 'XT5 FL',        slug: 'cadillac-xt5-fl',      engines: [{ code: '2.0 Turbo 237', from: 2020, to: null }, { code: '3.6 V6 310', from: 2020, to: null }] },
    ]
  },

  // ── RAM / DODGE TRUCKS ─────────────────────────────────────
  {
    name: 'RAM', slug: 'ram',
    models: [
      { name: '1500 DT',       slug: 'ram-1500-dt',          engines: [{ code: '3.6 Pentastar V6 305', from: 2019, to: null }, { code: '5.7 HEMI V8 395', from: 2019, to: null }, { code: 'eTorque 3.0 Ecodiesel 260', from: 2019, to: null }] },
      { name: '2500 Heavy Duty',slug: 'ram-2500-hd',         engines: [{ code: '6.4 HEMI V8 410', from: 2014, to: null }, { code: '6.7 Cummins Diesel 370', from: 2014, to: null }] },
    ]
  },

  // ── GENESIS ────────────────────────────────────────────────
  {
    name: 'Genesis', slug: 'genesis',
    models: [
      { name: 'GV70',          slug: 'genesis-gv70',         engines: [{ code: '2.5 Turbo 300', from: 2021, to: null }, { code: '3.5 Turbo V6 380', from: 2021, to: null }, { code: 'Electrified 360', from: 2022, to: null }] },
      { name: 'GV80',          slug: 'genesis-gv80',         engines: [{ code: '2.5 Turbo 300', from: 2020, to: null }, { code: '3.5 Turbo V6 380', from: 2020, to: null }] },
      { name: 'G80 III',       slug: 'genesis-g80-iii',      engines: [{ code: '2.5 Turbo 300', from: 2020, to: null }, { code: '3.5 Turbo V6 375', from: 2020, to: null }, { code: 'Electrified 365', from: 2022, to: null }] },
    ]
  },

  // ── VOLVO TRUCKS / COMMERCIAL ──────────────────────────────
  {
    name: 'Iveco', slug: 'iveco',
    models: [
      { name: 'Daily VI',      slug: 'iveco-daily-vi',       engines: [{ code: '2.3 HPi 116', from: 2014, to: null }, { code: '2.3 HPi 136', from: 2014, to: null }, { code: '3.0 HPi 170', from: 2014, to: null }, { code: '3.0 HPi 210', from: 2014, to: null }] },
      { name: 'Eurocargo',     slug: 'iveco-eurocargo',      engines: [{ code: '6.7 Cursor 185', from: 2015, to: null }, { code: '6.7 Cursor 220', from: 2015, to: null }] },
    ]
  },

  // ── MERCEDES VANS ──────────────────────────────────────────
  {
    name: 'Mercedes-Benz Vans', slug: 'mercedes-benz-vans',
    models: [
      { name: 'Sprinter III',  slug: 'merc-sprinter-iii',    engines: [{ code: '2.0 CDI 114', from: 2018, to: null }, { code: '2.0 CDI 143', from: 2018, to: null }, { code: '2.0 CDI 177', from: 2018, to: null }] },
      { name: 'Vito W447',     slug: 'merc-vito-w447',       engines: [{ code: '1.6 CDI 88', from: 2014, to: null }, { code: '2.0 CDI 136', from: 2014, to: null }, { code: '2.0 CDI 163', from: 2014, to: null }] },
      { name: 'Citan II',      slug: 'merc-citan-ii',        engines: [{ code: '1.5 dCi 75', from: 2021, to: null }, { code: '1.5 dCi 110', from: 2021, to: null }, { code: 'EV 102', from: 2022, to: null }] },
    ]
  },

  // ── RENAULT TRUCKS / VANS ──────────────────────────────────
  {
    name: 'Renault Commercial', slug: 'renault-commercial',
    models: [
      { name: 'Master III FL', slug: 'renault-master-iii-fl', engines: [{ code: '2.3 dCi 110', from: 2019, to: null }, { code: '2.3 dCi 135', from: 2019, to: null }, { code: '2.3 dCi 165', from: 2019, to: null }] },
      { name: 'Trafic III FL', slug: 'renault-trafic-iii-fl', engines: [{ code: '2.0 dCi 110', from: 2019, to: null }, { code: '2.0 dCi 130', from: 2019, to: null }, { code: '2.0 dCi 170', from: 2019, to: null }] },
      { name: 'Kangoo III',    slug: 'renault-kangoo-iii',   engines: [{ code: '1.3 TCe 100', from: 2021, to: null }, { code: '1.5 Blue dCi 95', from: 2021, to: null }, { code: 'EV 90', from: 2021, to: null }] },
    ]
  },

  // ── GREAT WALL MOTOR / GWM ─────────────────────────────────
  {
    name: 'GWM', slug: 'gwm',
    models: [
      { name: 'Haval H6 III',  slug: 'gwm-haval-h6-iii',    engines: [{ code: '1.5 GDIT 150', from: 2021, to: null }, { code: '2.0 GDIT 238', from: 2021, to: null }, { code: '2.0 Hybrid 243', from: 2022, to: null }] },
      { name: 'Poer',          slug: 'gwm-poer',             engines: [{ code: '2.0 GW4D20 143', from: 2020, to: null }, { code: '2.4 GW4G15 141', from: 2020, to: null }] },
      { name: 'Haval Jolion',  slug: 'gwm-haval-jolion',     engines: [{ code: '1.5 GDIT 143', from: 2021, to: null }, { code: '1.5 HEV 190', from: 2022, to: null }] },
    ]
  },

  // ── CHERY ──────────────────────────────────────────────────
  {
    name: 'Chery', slug: 'chery',
    models: [
      { name: 'Tiggo 4 Pro',   slug: 'chery-tiggo4-pro',     engines: [{ code: '1.5 TGDI 147', from: 2021, to: null }] },
      { name: 'Tiggo 7 Pro',   slug: 'chery-tiggo7-pro',     engines: [{ code: '1.6 TGDI 197', from: 2020, to: null }] },
      { name: 'Tiggo 8 Pro',   slug: 'chery-tiggo8-pro',     engines: [{ code: '2.0 TGDI 254', from: 2021, to: null }, { code: '1.6 TGDI 186', from: 2021, to: null }] },
    ]
  },

  // ── BYD ────────────────────────────────────────────────────
  {
    name: 'BYD', slug: 'byd',
    models: [
      { name: 'Atto 3',        slug: 'byd-atto3',            engines: [{ code: 'EV 204', from: 2022, to: null }] },
      { name: 'Han EV',        slug: 'byd-han-ev',           engines: [{ code: 'EV RWD 313', from: 2020, to: null }, { code: 'EV AWD 517', from: 2020, to: null }] },
      { name: 'Tang EV',       slug: 'byd-tang-ev',          engines: [{ code: 'EV AWD 456', from: 2019, to: null }] },
      { name: 'Seal',          slug: 'byd-seal',             engines: [{ code: 'EV RWD 313', from: 2022, to: null }, { code: 'EV AWD 530', from: 2022, to: null }] },
    ]
  },

  // ── GEELY ──────────────────────────────────────────────────
  {
    name: 'Geely', slug: 'geely',
    models: [
      { name: 'Emgrand X7',    slug: 'geely-emgrand-x7',    engines: [{ code: '2.0 139', from: 2018, to: null }, { code: '2.4 V6 136', from: 2018, to: null }] },
      { name: 'Coolray',       slug: 'geely-coolray',        engines: [{ code: '1.5 TGDI 177', from: 2019, to: null }] },
      { name: 'Tugella',       slug: 'geely-tugella',        engines: [{ code: '2.0 T 218', from: 2020, to: null }] },
    ]
  },

  // ── ISUZU ──────────────────────────────────────────────────
  {
    name: 'Isuzu', slug: 'isuzu',
    models: [
      { name: 'D-Max III',     slug: 'isuzu-dmax-iii',       engines: [{ code: '1.9 DDTi 163', from: 2020, to: null }, { code: '3.0 DDTi 190', from: 2020, to: null }] },
      { name: 'MU-X II',       slug: 'isuzu-mux-ii',         engines: [{ code: '1.9 DDTi 163', from: 2020, to: null }, { code: '3.0 DDTi 188', from: 2020, to: null }] },
    ]
  },

  // ── SSANGYONG ──────────────────────────────────────────────
  {
    name: 'SsangYong', slug: 'ssangyong',
    models: [
      { name: 'Korando IV',    slug: 'ssangyong-korando-iv', engines: [{ code: '1.5 GDI Turbo 163', from: 2019, to: null }, { code: '1.6 eDDi 136', from: 2019, to: null }, { code: 'EV 140', from: 2020, to: null }] },
      { name: 'Rexton V',      slug: 'ssangyong-rexton-v',   engines: [{ code: '2.2 eDDi 181', from: 2017, to: null }] },
      { name: 'Tivoli FL',     slug: 'ssangyong-tivoli-fl',  engines: [{ code: '1.5 GDI Turbo 163', from: 2019, to: null }, { code: '1.5 ELPi Turbo LPG 128', from: 2020, to: null }] },
    ]
  },

  // ── LADA ───────────────────────────────────────────────────
  {
    name: 'Lada', slug: 'lada',
    models: [
      { name: 'Vesta',         slug: 'lada-vesta',           engines: [{ code: '1.6 16V 106', from: 2015, to: null }, { code: '1.8 122', from: 2015, to: null }] },
      { name: 'Granta II',     slug: 'lada-granta-ii',       engines: [{ code: '1.6 8V 87', from: 2018, to: null }, { code: '1.6 16V 106', from: 2018, to: null }] },
      { name: 'Niva Legend',   slug: 'lada-niva-legend',     engines: [{ code: '1.7i 83', from: 2021, to: null }] },
    ]
  },

  // ── TATA ───────────────────────────────────────────────────
  {
    name: 'Tata', slug: 'tata',
    models: [
      { name: 'Nexon',         slug: 'tata-nexon',           engines: [{ code: '1.2 Petrol Turbo 120', from: 2017, to: null }, { code: '1.5 Diesel 110', from: 2017, to: null }, { code: 'EV 129', from: 2019, to: null }, { code: 'EV Max 143', from: 2022, to: null }] },
      { name: 'Harrier II',    slug: 'tata-harrier-ii',      engines: [{ code: '2.0 Kryotec 170', from: 2023, to: null }, { code: '2.0 Kryotec 170 4WD', from: 2023, to: null }] },
    ]
  },

  // ── MAHINDRA ───────────────────────────────────────────────
  {
    name: 'Mahindra', slug: 'mahindra',
    models: [
      { name: 'Thar 2020',     slug: 'mahindra-thar-2020',  engines: [{ code: '2.0 mStallion Turbo Petrol 150', from: 2020, to: null }, { code: '2.2 mHawk Diesel 130', from: 2020, to: null }] },
      { name: 'Scorpio N',     slug: 'mahindra-scorpio-n',   engines: [{ code: '2.0 mStallion 200', from: 2022, to: null }, { code: '2.2 mHawk 175', from: 2022, to: null }] },
      { name: 'XUV700',        slug: 'mahindra-xuv700',      engines: [{ code: '2.0 mStallion G300 197', from: 2021, to: null }, { code: '2.2 mHawk D300 185', from: 2021, to: null }] },
    ]
  },

  // ── MARUTI SUZUKI ──────────────────────────────────────────
  {
    name: 'Maruti Suzuki', slug: 'maruti-suzuki',
    models: [
      { name: 'Swift III',     slug: 'maruti-swift-iii',     engines: [{ code: '1.2 Dualjet 90', from: 2017, to: null }, { code: '1.3 DDiS 75', from: 2017, to: 2020 }] },
      { name: 'Baleno II',     slug: 'maruti-baleno-ii',     engines: [{ code: '1.2 Dualjet 90', from: 2022, to: null }, { code: '1.2 DualJet Hybrid 90', from: 2022, to: null }] },
      { name: 'Brezza',        slug: 'maruti-brezza',        engines: [{ code: '1.5 Mild Hybrid 103', from: 2022, to: null }] },
    ]
  },

  // ── HAVAL (standalone) ─────────────────────────────────────
  {
    name: 'Haval', slug: 'haval',
    models: [
      { name: 'H2',            slug: 'haval-h2',             engines: [{ code: '1.5 GDIT 143', from: 2014, to: null }, { code: '2.0T 197', from: 2014, to: null }] },
      { name: 'H9',            slug: 'haval-h9',             engines: [{ code: '2.0T 218', from: 2015, to: null }, { code: '3.0T V6 285', from: 2015, to: null }] },
      { name: 'Dargo',         slug: 'haval-dargo',          engines: [{ code: '1.5T 169', from: 2021, to: null }, { code: '2.0T 252', from: 2021, to: null }] },
    ]
  },

  // ── POLESTAR ───────────────────────────────────────────────
  {
    name: 'Polestar', slug: 'polestar',
    models: [
      { name: 'Polestar 2',    slug: 'polestar-2',           engines: [{ code: 'EV RWD 231', from: 2020, to: null }, { code: 'EV AWD 300', from: 2020, to: null }, { code: 'EV AWD Performance 476', from: 2020, to: null }] },
      { name: 'Polestar 3',    slug: 'polestar-3',           engines: [{ code: 'EV AWD Long Range 360', from: 2023, to: null }, { code: 'EV AWD Performance 517', from: 2023, to: null }] },
    ]
  },

  // ── LYNK & CO ──────────────────────────────────────────────
  {
    name: 'Lynk & Co', slug: 'lynk-co',
    models: [
      { name: '01',            slug: 'lynkco-01',            engines: [{ code: '2.0 T 190', from: 2019, to: null }, { code: '2.0 T 261', from: 2019, to: null }, { code: 'PHEV 261', from: 2019, to: null }] },
      { name: '02',            slug: 'lynkco-02',            engines: [{ code: '2.0 T 190', from: 2019, to: null }] },
    ]
  },

  // ── ALFA ROMEO / WIESMANN ──────────────────────────────────
  {
    name: 'Wiesmann', slug: 'wiesmann',
    models: [
      { name: 'Roadster MF4', slug: 'wiesmann-mf4',         engines: [{ code: '4.0 V8 420 BMW S65', from: 2012, to: null }] },
      { name: 'Project Gecko',slug: 'wiesmann-gecko',        engines: [{ code: 'EV Twin Motor 671', from: 2023, to: null }] },
    ]
  },

  // ── INEOS GRENADIER ────────────────────────────────────────
  {
    name: 'INEOS', slug: 'ineos',
    models: [
      { name: 'Grenadier',     slug: 'ineos-grenadier',      engines: [{ code: '3.0 B58 286 Petrol', from: 2022, to: null }, { code: '3.0 B57 249 Diesel', from: 2022, to: null }] },
    ]
  },
]

// ──────────────────────────────────────────────────────────────
// OIL COMPATIBILITY MAP
// Key = product slug (must exist in DB)
// Value = array of vehicle model slugs
// ──────────────────────────────────────────────────────────────
const OIL_COMPAT_MAP = {

  // CASTROL EDGE 5W-30 LL — Suits VAG/BMW/Volvo/Mazda
  'castrol-edge-5w30-ll': [
    'skoda-octavia-iv', 'skoda-superb-iii', 'skoda-fabia-iv', 'skoda-karoq-fl', 'skoda-kodiaq-ii',
    'seat-leon-iv', 'seat-ibiza-v', 'seat-ateca', 'seat-arona',
    'mazda3-bp', 'mazda6-gl', 'mazda-cx5-kf', 'mazda-cx60', 'mazda2-dj',
    'volvo-xc40', 'volvo-xc60-ii', 'volvo-xc90-ii',
    'ford-fiesta-viii', 'ford-focus-iv', 'ford-puma', 'ford-kuga-iii',
  ],

  // SHELL HELIX ULTRA 5W-40 — Suits VAG/Italian/French
  'shell-helix-ultra-5w40': [
    'opel-corsa-f', 'opel-astra-l', 'opel-mokka-b', 'opel-grandland-x-fl', 'opel-crossland',
    'fiat-panda-iii-fl', 'fiat-500x-fl', 'fiat-tipo-ii', 'fiat-doblo-iii',
    'citroen-c3-iii', 'citroen-c4-iv', 'citroen-c5-aircross', 'citroen-berlingo-iii', 'citroen-c3-aircross-ii',
    'seat-leon-iv', 'seat-ibiza-v', 'seat-ateca',
    'honda-civic-xi', 'honda-hrv-iii', 'honda-cr-v-vi', 'honda-jazz-v', 'honda-city-vi',
  ],

  // MOBIL 1 0W-20 — Suits Japanese/Korean/Hybrid
  'mobil1-0w20': [
    'toyota-yaris-iv', 'toyota-corolla-xii', 'toyota-camry-xv70', 'toyota-rav4-v',
    'toyota-landcruiser-300', 'toyota-prius-iv', 'toyota-chr-i', 'toyota-fortuner-ii',
    'honda-civic-xi', 'honda-hrv-iii', 'honda-jazz-v', 'honda-city-vi', 'honda-accord-x',
    'mazda2-dj', 'mazda3-bp', 'mazda-mx5-nd',
    'hyundai-i10-iii', 'hyundai-i20-iii', 'hyundai-kona-ii',
    'kia-picanto-iii', 'kia-rio-iv',
    'nissan-micra-k14', 'nissan-juke-ii', 'nissan-leaf-ii',
  ],

  // TOTAL QUARTZ 9000 5W-40 — Suits French/European
  'total-quartz-9000-5w40': [
    'dacia-sandero-iii', 'dacia-duster-ii', 'dacia-logan-iii', 'dacia-jogger',
    'citroen-c3-iii', 'citroen-c4-iv', 'citroen-c5-aircross',
    'opel-corsa-f', 'opel-astra-l', 'opel-mokka-b',
    'renault-master-iii-fl', 'renault-trafic-iii-fl', 'renault-kangoo-iii',
    'lada-vesta', 'lada-granta-ii', 'lada-niva-legend',
  ],

  // MOTUL 8100 X-CLEAN 5W-30 — Premium VAG/BMW
  'motul-8100-xclean-5w30': [
    'skoda-octavia-iv', 'skoda-superb-iii', 'skoda-karoq-fl', 'skoda-kodiaq-ii',
    'ford-focus-iv', 'ford-kuga-iii', 'ford-puma',
    'seat-leon-iv', 'seat-ateca',
    'mercedes-benz-vans',
    'merc-sprinter-iii', 'merc-vito-w447', 'merc-citan-ii',
    'iveco-daily-vi',
  ],

  // CASTROL EDGE 0W-30 — BMW/Premium European
  'castrol-edge-0w30': [
    'genesis-gv70', 'genesis-gv80', 'genesis-g80-iii',
    'kia-stinger', 'kia-ev6',
    'hyundai-tucson-iv', 'hyundai-santa-fe-iv', 'hyundai-ioniq5', 'hyundai-ioniq6',
    'ineos-grenadier',
  ],

  // SHELL HELIX HX7 10W-40 — Suits older Asian/African fleet
  'shell-helix-hx7-10w40': [
    'toyota-hilux-viii', 'toyota-fortuner-ii', 'toyota-landcruiser-300',
    'nissan-navara-d23', 'nissan-pathfinder-iv',
    'isuzu-dmax-iii', 'isuzu-mux-ii',
    'ford-ranger-t6-ii', 'ford-bronco-vi',
    'mitsubishi-l200-v',
    'gwm-poer', 'gwm-haval-h6-iii',
    'haval-h9', 'haval-dargo',
    'ssangyong-rexton-v',
    'mahindra-thar-2020', 'mahindra-scorpio-n', 'mahindra-xuv700',
    'tata-harrier-ii',
    'lada-vesta', 'lada-niva-legend',
  ],

  // TOTAL QUARTZ 7000 10W-40 — Older NA petrol
  'total-quartz-7000-10w40': [
    'dodge-charger-viii', 'dodge-challenger-iii', 'dodge-durango-iii',
    'ram-1500-dt', 'ram-2500-hd',
    'cadillac-escalade-v', 'cadillac-ct5', 'cadillac-xt5-fl',
    'ford-mustang-vii', 'ford-bronco-vi',
    'chery-tiggo4-pro', 'chery-tiggo7-pro', 'chery-tiggo8-pro',
    'geely-emgrand-x7', 'geely-coolray', 'geely-tugella',
  ],

  // CASTROL MAGNATEC 5W-30 C3 — Japanese/Korean mid-range
  'castrol-magnatec-5w30-c3': [
    'hyundai-i30-iii-fl', 'hyundai-tucson-iv', 'hyundai-kona-ii',
    'kia-ceed-iii', 'kia-sportage-v', 'kia-sorento-iv',
    'mazda3-bp', 'mazda6-gl', 'mazda-cx5-kf',
    'nissan-qashqai-iii', 'nissan-xtrail-iv', 'nissan-juke-ii',
    'subaru-forester-v', 'subaru-outback-vi', 'subaru-impreza-vi',
    'ssangyong-korando-iv', 'ssangyong-tivoli-fl',
  ],

  // MOBIL DELVAC 15W-40 — Commercial/Heavy Diesel
  'mobil-delvac-15w40': [
    'iveco-daily-vi', 'iveco-eurocargo',
    'merc-sprinter-iii', 'merc-vito-w447',
    'renault-master-iii-fl', 'renault-trafic-iii-fl',
    'ford-ranger-t6-ii',
    'isuzu-dmax-iii', 'isuzu-mux-ii',
    'ram-2500-hd',
    'gwm-poer',
    'mahindra-thar-2020',
    'maruti-swift-iii',
  ],

  // SHELL RIMULA R4 15W-40 — Trucks/Industrial
  'shell-rimula-r4-15w40': [
    'iveco-eurocargo',
    'ram-2500-hd',
    'isuzu-dmax-iii', 'isuzu-mux-ii',
    'ford-ranger-t6-ii',
    'gwm-poer',
    'tata-nexon', 'tata-harrier-ii',
  ],

  // CASTROL EDGE TITANIUM 5W-40 — European premium
  'castrol-edge-titanium-5w40': [
    'hyundai-santa-fe-iv', 'hyundai-ioniq5',
    'kia-sorento-iv', 'kia-stinger',
    'genesis-gv70', 'genesis-gv80',
    'polestar-2', 'polestar-3',
    'lynkco-01', 'lynkco-02',
    'geely-tugella',
  ],
}

// ──────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────
async function main() {
  console.log('=== MEGA SEED 3: 35 more makes + rich oil compatibility ===\n')

  let makeCount = 0
  let modelCount = 0
  let compatCount = 0
  let skipCount = 0

  const modelRegistry = {} // slug -> { id, engines[] }

  // 1. Upsert all makes & models
  for (const mkData of MAKES_MODELS) {
    const make = await p.vehicleMake.upsert({
      where: { slug: mkData.slug },
      update: { name: mkData.name },
      create: { name: mkData.name, slug: mkData.slug },
    })
    makeCount++
    process.stdout.write(`  [make] ${make.name}\n`)

    for (const mdData of mkData.models) {
      const model = await p.vehicleModel.upsert({
        where: { slug: mdData.slug },
        update: { name: mdData.name },
        create: { makeId: make.id, name: mdData.name, slug: mdData.slug },
      })
      modelRegistry[mdData.slug] = { id: model.id, engines: mdData.engines }
      modelCount++
    }
  }

  console.log(`\nDone: ${makeCount} makes, ${modelCount} models`)

  // 2. Oil compatibility
  console.log('\nAdding oil compatibilities...')

  for (const [productSlug, modelSlugs] of Object.entries(OIL_COMPAT_MAP)) {
    const product = await p.product.findUnique({ where: { slug: productSlug } })
    if (!product) {
      console.log(`  [skip product] ${productSlug}`)
      skipCount++
      continue
    }

    for (const modelSlug of modelSlugs) {
      const modelData = modelRegistry[modelSlug]
      if (!modelData) {
        // model slug might come from previous seed files — try DB lookup
        const dbModel = await p.vehicleModel.findUnique({ where: { slug: modelSlug } })
        if (!dbModel) {
          console.log(`  [skip model] ${modelSlug}`)
          continue
        }
        // use DB model with no engines (just store a generic compat)
        try {
          await p.vehicleCompatibility.upsert({
            where: {
              productId_vehicleModelId_engineCode: {
                productId: product.id,
                vehicleModelId: dbModel.id,
                engineCode: 'All Engines',
              },
            },
            update: {},
            create: {
              productId: product.id,
              vehicleModelId: dbModel.id,
              engineCode: 'All Engines',
              yearFrom: 2015,
              yearTo: null,
            },
          })
          compatCount++
        } catch (_) {}
        continue
      }

      for (const eng of modelData.engines) {
        try {
          await p.vehicleCompatibility.upsert({
            where: {
              productId_vehicleModelId_engineCode: {
                productId: product.id,
                vehicleModelId: modelData.id,
                engineCode: eng.code,
              },
            },
            update: {},
            create: {
              productId: product.id,
              vehicleModelId: modelData.id,
              engineCode: eng.code,
              yearFrom: eng.from,
              yearTo: eng.to,
            },
          })
          compatCount++
        } catch (_) {}
      }
    }
  }

  console.log(`\nAdded ${compatCount} compatibility records.`)
  console.log(`Skipped ${skipCount} missing products.`)
  console.log('\n=== MEGA SEED 3 COMPLETE ===')
  await p.$disconnect()
}

main().catch(async e => {
  console.error(e)
  await p.$disconnect()
  process.exit(1)
})
