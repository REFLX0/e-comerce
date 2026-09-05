const fs = require('fs');
const path = require('path');

// ── 1. DEFINITION OF AUTHENTIC MANUFACTURER OIL SPECS ───────────────────────
const SPECS = [
  // VAG Group
  { fingerprint: '5w-30_vw-50400-50700_c3',    viscosity: '5W-30',  api: 'SN',              acea: 'C3',        oem: 'VW 504 00 / 507 00 (LongLife III)',            capacity: 4.5, interval: 15000 },
  { fingerprint: '5w-40_vw-50501-50200_c3',    viscosity: '5W-40',  api: 'SN/CF',           acea: 'C3 / A3/B4', oem: 'VW 505 01 / 502 00 / 505 00',                  capacity: 4.5, interval: 15000 },
  { fingerprint: '10w-40_vw-50101-50500_a3b4', viscosity: '10W-40', api: 'SL/CF',           acea: 'A3/B4',     oem: 'VW 501 01 / 505 00',                           capacity: 4.0, interval: 10000 },
  // PSA Group
  { fingerprint: '5w-30_psa-b71-2290_c2',      viscosity: '5W-30',  api: 'SN/CF',           acea: 'C2',        oem: 'Peugeot Citroën PSA B71 2290',                  capacity: 3.8, interval: 15000 },
  { fingerprint: '0w-30_psa-b71-2312_c1c2',    viscosity: '0W-30',  api: 'SN',              acea: 'C2',        oem: 'Peugeot Citroën PSA B71 2312',                  capacity: 4.0, interval: 15000 },
  { fingerprint: '10w-40_psa-b71-2300_a3b4',   viscosity: '10W-40', api: 'SL/CF',           acea: 'A3/B4',     oem: 'Peugeot Citroën PSA B71 2300 / B71 2294',      capacity: 3.5, interval: 10000 },
  { fingerprint: '5w-40_psa-b71-2296_a3b4',    viscosity: '5W-40',  api: 'SN/CF',           acea: 'A3/B4',     oem: 'Peugeot Citroën PSA B71 2296',                  capacity: 4.0, interval: 15000 },
  // Renault / Dacia / Nissan
  { fingerprint: '5w-30_renault-rn0720_c4',    viscosity: '5W-30',  api: 'SM/CF',           acea: 'C4',        oem: 'Renault RN0720 (dCi DPF / FAP)',               capacity: 4.5, interval: 15000 },
  { fingerprint: '5w-30_renault-rn17_c3',      viscosity: '5W-30',  api: 'SN',              acea: 'C3',        oem: 'Renault RN17 / RN0700 / RN0710',               capacity: 4.2, interval: 15000 },
  { fingerprint: '5w-40_renault-rn0710_a3b4',  viscosity: '5W-40',  api: 'SN/CF',           acea: 'A3/B4',     oem: 'Renault RN0710 / RN0700',                      capacity: 4.5, interval: 15000 },
  { fingerprint: '10w-40_renault-rn0700_a3b4', viscosity: '10W-40', api: 'SL/CF',           acea: 'A3/B4',     oem: 'Renault RN0700',                               capacity: 4.0, interval: 10000 },
  // Fiat / Alfa / Lancia / Jeep (FCA / Stellantis)
  { fingerprint: '5w-40_fiat-955535-s2_c3',    viscosity: '5W-40',  api: 'SN/CF',           acea: 'C3',        oem: 'Fiat 9.55535-S2',                              capacity: 3.2, interval: 15000 },
  { fingerprint: '5w-30_fiat-955535-s1_c2',    viscosity: '5W-30',  api: 'SN',              acea: 'C2',        oem: 'Fiat 9.55535-S1',                              capacity: 3.5, interval: 15000 },
  { fingerprint: '10w-40_fiat-955535-g2_a3b4', viscosity: '10W-40', api: 'SL/CF',           acea: 'A3/B4',     oem: 'Fiat 9.55535-G2 / 9.55535-D2',                capacity: 3.0, interval: 10000 },
  // Ford
  { fingerprint: '5w-30_ford-wss-m2c913-d_a5b5', viscosity: '5W-30', api: 'SL/CF',          acea: 'A5/B5',     oem: 'Ford WSS-M2C913-D / WSS-M2C913-C',             capacity: 4.1, interval: 15000 },
  // Mercedes-Benz
  { fingerprint: '5w-30_mb-22951_c3',          viscosity: '5W-30',  api: 'SN',              acea: 'C3',        oem: 'MB 229.51 / MB 229.52',                        capacity: 5.5, interval: 15000 },
  { fingerprint: '10w-40_mb-2293_a3b4',        viscosity: '10W-40', api: 'SL/CF',           acea: 'A3/B4',     oem: 'MB 229.3 / MB 229.1',                          capacity: 5.0, interval: 10000 },
  // BMW
  { fingerprint: '5w-30_bmw-ll04_c3',          viscosity: '5W-30',  api: 'SN',              acea: 'C3',        oem: 'BMW Longlife-04 (LL-04)',                       capacity: 5.2, interval: 15000 },
  { fingerprint: '5w-40_bmw-ll01_a3b4',        viscosity: '5W-40',  api: 'SN',              acea: 'A3/B4',     oem: 'BMW Longlife-01 (LL-01)',                       capacity: 6.5, interval: 15000 },
  // Asian OEM
  { fingerprint: '5w-30_asian-toyota-c2c3',    viscosity: '5W-30',  api: 'SN/CF',           acea: 'C2 / C3',   oem: 'Toyota / Hyundai / Kia / Nissan / Asian OEM',  capacity: 4.0, interval: 15000 },
  { fingerprint: '0w-20_asian-toyota-sn',      viscosity: '0W-20',  api: 'SP / ILSAC GF-6', acea: 'C5',        oem: 'Toyota Hybrid / Asian Modern Fuel Economy',    capacity: 3.7, interval: 15000 },
  { fingerprint: '10w-40_asian-api-slcf',      viscosity: '10W-40', api: 'SL/CF',           acea: 'A3/B4',     oem: 'Toyota / Hyundai / Asian Classic',             capacity: 3.8, interval: 10000 },
  // Opel / Vauxhall / GM
  { fingerprint: '5w-30_gm-dexos2_c3',         viscosity: '5W-30',  api: 'SN',              acea: 'C3',        oem: 'GM Dexos2',                                    capacity: 4.5, interval: 15000 },
  { fingerprint: '10w-40_gm-b025-api_a3b4',    viscosity: '10W-40', api: 'SL/CF',           acea: 'A3/B4',     oem: 'GM LL-A-025 / GM-LL-B-025',                   capacity: 4.0, interval: 10000 },
  // Volvo
  { fingerprint: '0w-20_volvo-vcc-rbso-2ae_c5', viscosity: '0W-20', api: 'SP',              acea: 'C5',        oem: 'Volvo VCC-RBSO-2AE',                           capacity: 5.0, interval: 15000 },
  { fingerprint: '5w-30_volvo-vcc-rbs0-2ae_c3', viscosity: '5W-30', api: 'SN',              acea: 'C3',        oem: 'Volvo VCC-RBS0-2AE / Volvo XC',               capacity: 5.0, interval: 15000 },
  // Mazda
  { fingerprint: '5w-30_mazda-ms-hv_c2',       viscosity: '5W-30',  api: 'SN/CF',           acea: 'C2',        oem: 'Mazda Original / Skyactiv Engine Oil',         capacity: 4.0, interval: 15000 },
  // Subaru
  { fingerprint: '5w-30_subaru-soa_a3b4',      viscosity: '5W-30',  api: 'SN',              acea: 'A3/B4',     oem: 'Subaru SOA 427V1700 / K0228-Y0001',            capacity: 4.5, interval: 15000 },
  // Mitsubishi
  { fingerprint: '5w-30_mitsubishi-mz320757_c3', viscosity: '5W-30', api: 'SN/CF',          acea: 'C3',        oem: 'Mitsubishi MZ320757 / DiaQueen',               capacity: 4.0, interval: 15000 },
  // Land Rover / Jaguar
  { fingerprint: '5w-30_jlr-03-5006_c3',       viscosity: '5W-30',  api: 'SN',              acea: 'C3',        oem: 'JLR STJLR.03.5006 / Land Rover STC 4184',     capacity: 6.2, interval: 15000 },
  // Porsche
  { fingerprint: '0w-40_porsche-c30_a3b4',     viscosity: '0W-40',  api: 'SN',              acea: 'A3/B4',     oem: 'Porsche C30 / Porsche Approved Engine Oil',    capacity: 7.5, interval: 15000 },
  // Alfa Romeo / Selenia
  { fingerprint: '5w-40_selenia-alfa_c3',      viscosity: '5W-40',  api: 'SN/CF',           acea: 'C3',        oem: 'Selenia WR Pure Energy / Alfa Romeo 9.55535-GS', capacity: 4.0, interval: 15000 },
  // Honda
  { fingerprint: '0w-20_honda-08221_c5',       viscosity: '0W-20',  api: 'SP / ILSAC GF-6', acea: 'C5',        oem: 'Honda 08221-99974 / Honda Genuine Motor Oil',  capacity: 3.7, interval: 15000 },
  { fingerprint: '5w-30_honda-08w30_sn',       viscosity: '5W-30',  api: 'SN/CF',           acea: 'A3/B4',     oem: 'Honda 08W30-P99-810HE / Asian API SN',         capacity: 4.0, interval: 15000 },
  // Suzuki
  { fingerprint: '5w-30_suzuki-sls_sn',        viscosity: '5W-30',  api: 'SN/CF',           acea: 'C2 / C3',   oem: 'Suzuki SLS-SN / Asian OEM',                   capacity: 3.5, interval: 10000 },
  // Chevrolet / GM USA
  { fingerprint: '5w-30_gm-dexos1_sn',         viscosity: '5W-30',  api: 'SN',              acea: 'A3/B4',     oem: 'GM Dexos1 Gen 2 / ACDelco Full Synthetic',    capacity: 4.7, interval: 12000 },
  // Chinese brands (MG, Haval, Geely)
  { fingerprint: '5w-30_chinese-api-sn_a3b4',  viscosity: '5W-30',  api: 'SN/CF',           acea: 'A3/B4',     oem: 'MG / Haval / Geely / BYD API SN',             capacity: 4.0, interval: 10000 },
  // Lada
  { fingerprint: '10w-40_lada-api-sl_a3b4',    viscosity: '10W-40', api: 'SL/CF',           acea: 'A3/B4',     oem: 'AvtoVAZ / Lada API SL standard',              capacity: 3.5, interval: 10000 },
];

// ── 2. POPULAR VEHICLES CATALOG (TECDOC STRINGS + BASE NAMES + TRIMS) ────────
// Each model entry defines:
// - make
// - models: array of exact TecDoc strings and normalized names
// - generation: code
// - spec: which oil spec fingerprint applies
// - engines: array of [engineCode, dispCc, fuel, hp]
const VEHICLE_GROUPS = [
  // ──────────────────────────────────────────
  // VOLKSWAGEN (VAG)
  // ──────────────────────────────────────────
  {
    make: 'VOLKSWAGEN',
    models: [
      'GOLF VII (5G1, BQ1, BE1, BE2)',
      'GOLF VII Variant (BA5, BV5)',
      'GOLF VII',
      'Golf VII',
      'Golf 7',
      'GOLF VI (5K1)',
      'GOLF VI Variant (AJ5)',
      'GOLF VI',
      'Golf VI',
      'Golf 6',
      'GOLF V (1K1)',
      'GOLF V Variant (1K5)',
      'GOLF V',
      'Golf V',
      'Golf 5',
      'GOLF VIII (CD1)',
      'GOLF VIII',
      'Golf VIII',
      'Golf 8',
      'Golf',
      'GOLF',
    ],
    generation: 'VII',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [
      ['', 1968, 'diesel', 150],
      ['2.0 TDI (CRLB)', 1968, 'diesel', 150],
      ['2.0 TDI', 1968, 'diesel', 150],
      ['CRLB', 1968, 'diesel', 150],
      ['1.6 TDI (CLHA)', 1598, 'diesel', 105],
      ['1.6 TDI', 1598, 'diesel', 105],
      ['1.4 TSI (CZCA)', 1395, 'essence', 125],
      ['1.4 TSI', 1395, 'essence', 125],
      ['1.2 TSI', 1197, 'essence', 105],
      ['1.9 TDI', 1896, 'diesel', 105],
    ],
  },
  {
    make: 'VOLKSWAGEN',
    models: [
      'GOLF IV (1J1)',
      'GOLF IV Variant (1J5)',
      'GOLF IV',
      'Golf IV',
      'Golf 4',
    ],
    generation: 'IV',
    spec: '10w-40_vw-50101-50500_a3b4',
    engines: [
      ['', 1896, 'diesel', 90],
      ['1.9 TDI (ALH)', 1896, 'diesel', 90],
      ['1.9 TDI', 1896, 'diesel', 90],
      ['1.9 SDI', 1896, 'diesel', 68],
      ['1.4 16V (AHW)', 1390, 'essence', 75],
      ['1.4 16V', 1390, 'essence', 75],
      ['1.6 (AKL)', 1595, 'essence', 100],
      ['1.6', 1595, 'essence', 100],
    ],
  },
  {
    make: 'VOLKSWAGEN',
    models: [
      'POLO (6R1, 6C1)',
      'POLO V (6R1, 6C1)',
      'POLO VI (AW1, BZ1)',
      'POLO (9N_, 9A_)',
      'POLO (6N1)',
      'POLO (6N2)',
      'Polo V',
      'Polo VI',
      'Polo 6R',
      'Polo 9N',
      'Polo',
      'POLO',
    ],
    generation: '6R',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [
      ['', 1198, 'essence', 70],
      ['1.2 (CGPA)', 1198, 'essence', 70],
      ['1.2', 1198, 'essence', 70],
      ['1.4 (CGGB)', 1390, 'essence', 85],
      ['1.4', 1390, 'essence', 85],
      ['1.6 TDI (CAYC)', 1598, 'diesel', 105],
      ['1.6 TDI', 1598, 'diesel', 105],
      ['1.2 TSI (CBZA)', 1197, 'essence', 86],
      ['1.2 TSI', 1197, 'essence', 86],
      ['1.4 TDI', 1422, 'diesel', 75],
      ['1.0 TSI', 999, 'essence', 95],
      ['1.0', 999, 'essence', 60],
    ],
  },
  {
    make: 'VOLKSWAGEN',
    models: [
      'PASSAT B8 (3G2, CB2)',
      'PASSAT B8 Variant (3G5, CB5)',
      'PASSAT B7 (362)',
      'PASSAT B6 (3C2)',
      'PASSAT B5.5 (3B3)',
      'Passat B8',
      'Passat B7',
      'Passat B6',
      'Passat',
      'PASSAT',
    ],
    generation: 'B8',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [
      ['', 1968, 'diesel', 150],
      ['2.0 TDI (CRLB)', 1968, 'diesel', 150],
      ['2.0 TDI', 1968, 'diesel', 150],
      ['1.6 TDI', 1598, 'diesel', 120],
      ['1.4 TSI', 1395, 'essence', 150],
      ['1.9 TDI', 1896, 'diesel', 105],
    ],
  },
  {
    make: 'VOLKSWAGEN',
    models: [
      'TIGUAN (5N_)',
      'TIGUAN (AD1, AX1)',
      'TIGUAN ALLSPACE (BW2, BJ2)',
      'Tiguan',
      'TIGUAN',
    ],
    generation: 'AD1',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [
      ['', 1968, 'diesel', 150],
      ['2.0 TDI', 1968, 'diesel', 150],
      ['2.0 TDI 4motion', 1968, 'diesel', 150],
      ['1.4 TSI', 1395, 'essence', 150],
      ['2.0 TSI', 1984, 'essence', 180],
    ],
  },
  {
    make: 'VOLKSWAGEN',
    models: [
      'CADDY III Box Body/MPV (2KA, 2KH, 2CA, 2CH)',
      'CADDY III Estate (2KB, 2KJ, 2CB, 2CJ)',
      'CADDY IV Box Body/MPV (SAA, SAH)',
      'CADDY IV Estate (SAB, SAJ)',
      'Caddy III',
      'Caddy IV',
      'Caddy',
      'CADDY',
    ],
    generation: 'III',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [
      ['', 1968, 'diesel', 102],
      ['2.0 TDI', 1968, 'diesel', 102],
      ['1.6 TDI', 1598, 'diesel', 102],
      ['1.9 TDI', 1896, 'diesel', 105],
      ['2.0 SDI', 1968, 'diesel', 70],
    ],
  },
  {
    make: 'VOLKSWAGEN',
    models: [
      'TOUAREG (7LA, 7L6, 7L7)',
      'TOUAREG (7P5, 7P6)',
      'TOUAREG (CR7)',
      'Touareg',
      'TOUAREG',
    ],
    generation: '7P',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [
      ['', 2967, 'diesel', 245],
      ['3.0 V6 TDI', 2967, 'diesel', 245],
      ['3.0 TDI', 2967, 'diesel', 245],
    ],
  },

  // ──────────────────────────────────────────
  // PEUGEOT
  // ──────────────────────────────────────────
  {
    make: 'PEUGEOT',
    models: [
      '206 Hatchback (2A/C)',
      '206 CC (2D)',
      '206 SW (2E/K)',
      '206 Saloon',
      '206+ (2L_, 2M_)',
      '206+',
      '206',
    ],
    generation: '206',
    spec: '10w-40_psa-b71-2300_a3b4',
    engines: [
      ['', 1360, 'essence', 75],
      ['1.4 i (KFX, KFW)', 1360, 'essence', 75],
      ['1.4 i', 1360, 'essence', 75],
      ['1.4', 1360, 'essence', 75],
      ['1.1 i (HFZ, HFX)', 1124, 'essence', 60],
      ['1.1 i', 1124, 'essence', 60],
      ['1.1', 1124, 'essence', 60],
      ['1.4 HDi (8HX, 8HZ)', 1398, 'diesel', 68],
      ['1.4 HDi', 1398, 'diesel', 68],
      ['1.6 16V (NFU)', 1587, 'essence', 109],
      ['1.6 16V', 1587, 'essence', 109],
      ['1.9 D (WJZ, WJY)', 1868, 'diesel', 69],
      ['2.0 HDI 90 (RHY)', 1997, 'diesel', 90],
      ['2.0 HDI', 1997, 'diesel', 90],
    ],
  },
  {
    make: 'PEUGEOT',
    models: [
      '207 (WA_, WC_)',
      '207 CC (WD_)',
      '207 SW (WK_)',
      '207 Saloon',
      '207',
    ],
    generation: '207',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [
      ['', 1360, 'essence', 75],
      ['1.4 (KFT, KFV)', 1360, 'essence', 75],
      ['1.4', 1360, 'essence', 75],
      ['1.4 16V', 1360, 'essence', 88],
      ['1.4 HDi', 1398, 'diesel', 68],
      ['1.6 HDi', 1560, 'diesel', 90],
      ['1.6 16V VTi', 1598, 'essence', 120],
      ['1.6 16V', 1587, 'essence', 109],
    ],
  },
  {
    make: 'PEUGEOT',
    models: [
      '208 I (CA_, CC_)',
      '208 II (UB_, UP_, UW_, UJ_)',
      '208 I',
      '208 II',
      '208',
    ],
    generation: '208',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [
      ['', 1199, 'essence', 82],
      ['1.2 PureTech (EB2F)', 1199, 'essence', 82],
      ['1.2 PureTech', 1199, 'essence', 82],
      ['1.2 VTi', 1199, 'essence', 82],
      ['EB2F', 1199, 'essence', 82],
      ['1.0 PureTech', 999, 'essence', 68],
      ['1.4 HDi', 1398, 'diesel', 68],
      ['1.6 HDi', 1560, 'diesel', 92],
      ['1.6 BlueHDi 100', 1560, 'diesel', 100],
      ['1.5 BlueHDi 100', 1499, 'diesel', 102],
    ],
  },
  {
    make: 'PEUGEOT',
    models: [
      '301',
      '301 (DD_)',
    ],
    generation: '301',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [
      ['', 1199, 'essence', 82],
      ['1.2 VTi 72', 1199, 'essence', 72],
      ['1.2 VTi 82', 1199, 'essence', 82],
      ['1.2 PureTech', 1199, 'essence', 82],
      ['1.6 VTi 115', 1587, 'essence', 115],
      ['1.6 HDI 92', 1560, 'diesel', 92],
      ['1.6 BlueHDi 100', 1560, 'diesel', 100],
    ],
  },
  {
    make: 'PEUGEOT',
    models: [
      '307 (3A/C)',
      '307 Break (3E)',
      '307 SW (3H)',
      '307 CC (3B)',
      '307',
    ],
    generation: '307',
    spec: '10w-40_psa-b71-2300_a3b4',
    engines: [
      ['', 1587, 'essence', 109],
      ['1.6 16V (NFU)', 1587, 'essence', 109],
      ['1.6 16V', 1587, 'essence', 109],
      ['1.4 (KFW)', 1360, 'essence', 75],
      ['1.4', 1360, 'essence', 75],
      ['2.0 HDi 90', 1997, 'diesel', 90],
      ['2.0 HDi 110', 1997, 'diesel', 107],
      ['1.6 HDi 110', 1560, 'diesel', 109],
    ],
  },
  {
    make: 'PEUGEOT',
    models: [
      '308 I (4A_, 4C_)',
      '308 SW I (4E_, 4H_)',
      '308 II (LB_, LP_, LW_, LH_, L3_)',
      '308 SW II (LC_, LJ_, LR_, LX_)',
      '308 III',
      '308 II',
      '308 I',
      '308',
    ],
    generation: '308',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [
      ['', 1560, 'diesel', 115],
      ['1.6 HDi', 1560, 'diesel', 115],
      ['1.6 BlueHDi 120', 1560, 'diesel', 120],
      ['1.5 BlueHDi 130', 1499, 'diesel', 130],
      ['1.2 PureTech 130', 1199, 'essence', 130],
      ['1.2 PureTech 110', 1199, 'essence', 110],
      ['1.6 VTi', 1598, 'essence', 120],
    ],
  },
  {
    make: 'PEUGEOT',
    models: [
      '2008 I (CU_)',
      '2008 II (U_)',
      '2008 I',
      '2008 II',
      '2008',
    ],
    generation: '2008',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [
      ['', 1199, 'essence', 110],
      ['1.2 PureTech 110', 1199, 'essence', 110],
      ['1.2 PureTech 130', 1199, 'essence', 130],
      ['1.2 PureTech 82', 1199, 'essence', 82],
      ['1.6 BlueHDi 100', 1560, 'diesel', 100],
      ['1.6 HDi', 1560, 'diesel', 92],
    ],
  },
  {
    make: 'PEUGEOT',
    models: [
      '3008 SUV (M_)',
      '3008 (0U_)',
      '3008',
    ],
    generation: '3008',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [
      ['', 1560, 'diesel', 120],
      ['1.6 BlueHDi 120', 1560, 'diesel', 120],
      ['1.5 BlueHDi 130', 1499, 'diesel', 130],
      ['1.2 PureTech 130', 1199, 'essence', 130],
      ['1.6 HDi', 1560, 'diesel', 112],
      ['2.0 BlueHDi 150', 1997, 'diesel', 150],
    ],
  },
  {
    make: 'PEUGEOT',
    models: [
      'PARTNER Box Body/MPV (5_, G_)',
      'PARTNER Combispace (5_, G_)',
      'PARTNER Tepee',
      'PARTNER Box Body/MPV (K9)',
      'Partner Tepee',
      'Partner Box',
      'Partner',
      'PARTNER',
    ],
    generation: 'Partner',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [
      ['', 1560, 'diesel', 90],
      ['1.6 HDi 90', 1560, 'diesel', 90],
      ['1.6 HDi', 1560, 'diesel', 90],
      ['1.6 BlueHDi 100', 1560, 'diesel', 100],
      ['1.9 D', 1868, 'diesel', 69],
      ['1.4', 1360, 'essence', 75],
    ],
  },

  // ──────────────────────────────────────────
  // RENAULT & DACIA
  // ──────────────────────────────────────────
  {
    make: 'RENAULT',
    models: [
      'CLIO II (BB_, CB_)',
      'CLIO II Box Body / Hatchback (SB0/1/2_)',
      'CLIO II',
      'Clio II',
      'Clio 2',
    ],
    generation: 'II',
    spec: '10w-40_renault-rn0700_a3b4',
    engines: [
      ['', 1149, 'essence', 75],
      ['1.2 16V (BB05, BB0W...)', 1149, 'essence', 75],
      ['1.2 16V', 1149, 'essence', 75],
      ['1.2 (BB0A, BB0F...)', 1149, 'essence', 58],
      ['1.2', 1149, 'essence', 58],
      ['1.4 (B/CB0C)', 1390, 'essence', 75],
      ['1.4', 1390, 'essence', 75],
      ['1.4 16V', 1390, 'essence', 98],
      ['1.5 dCi (B/CB07)', 1461, 'diesel', 65],
      ['1.5 dCi', 1461, 'diesel', 65],
      ['1.9 D', 1870, 'diesel', 64],
    ],
  },
  {
    make: 'RENAULT',
    models: [
      'CLIO III (BR0/1, CR0/1)',
      'CLIO III Grandtour (KR0/1_)',
      'CLIO IV (BH_)',
      'CLIO IV Grandtour (KH_)',
      'CLIO V (B7_)',
      'CLIO IV',
      'CLIO III',
      'CLIO V',
      'Clio IV',
      'Clio III',
      'Clio V',
      'Clio 4',
      'Clio 3',
      'Clio 5',
      'Clio',
      'CLIO',
    ],
    generation: 'IV',
    spec: '5w-30_renault-rn0720_c4',
    engines: [
      ['', 1461, 'diesel', 90],
      ['1.5 dCi 90', 1461, 'diesel', 90],
      ['1.5 dCi (K9K)', 1461, 'diesel', 90],
      ['1.5 dCi', 1461, 'diesel', 90],
      ['K9K', 1461, 'diesel', 90],
      ['0.9 TCe 90', 898, 'essence', 90],
      ['0.9 TCe', 898, 'essence', 90],
      ['1.2 16V (D4F)', 1149, 'essence', 75],
      ['1.2 16V', 1149, 'essence', 75],
      ['1.2 TCe', 1197, 'essence', 120],
      ['1.0 TCe', 999, 'essence', 100],
    ],
  },
  {
    make: 'RENAULT',
    models: [
      'SYMBOL I (LB_)',
      'SYMBOL II (LU_)',
      'SYMBOL III',
      'Symbol II',
      'Symbol I',
      'Symbol',
      'SYMBOL',
      'THALIA I (LB_)',
      'THALIA II (LU_)',
      'Thalia',
    ],
    generation: 'II',
    spec: '10w-40_renault-rn0700_a3b4',
    engines: [
      ['', 1149, 'essence', 75],
      ['1.2 16V', 1149, 'essence', 75],
      ['1.4', 1390, 'essence', 75],
      ['1.5 dCi', 1461, 'diesel', 68],
      ['1.5 dCi 85', 1461, 'diesel', 85],
    ],
  },
  {
    make: 'RENAULT',
    models: [
      'MEGANE II (BM0/1_, CM0/1_)',
      'MEGANE II Saloon (LM0/1_)',
      'MEGANE III Hatchback (BZ0/1_, B3_)',
      'MEGANE III Grandtour (KZ0/1)',
      'MEGANE IV Hatchback (B9A/M/N_)',
      'MEGANE IV Grandtour (K9A/M/N_)',
      'Megane II',
      'Megane III',
      'Megane IV',
      'Megane',
      'MEGANE',
    ],
    generation: 'III',
    spec: '5w-30_renault-rn0720_c4',
    engines: [
      ['', 1461, 'diesel', 110],
      ['1.5 dCi 110', 1461, 'diesel', 110],
      ['1.5 dCi', 1461, 'diesel', 110],
      ['1.6 16V', 1598, 'essence', 110],
      ['1.2 TCe', 1197, 'essence', 115],
      ['1.9 dCi', 1870, 'diesel', 130],
      ['1.6 dCi', 1598, 'diesel', 130],
    ],
  },
  {
    make: 'RENAULT',
    models: [
      'KANGOO (KC0/1_)',
      'KANGOO Express (FC0/1_)',
      'KANGOO / GRAND KANGOO II (KW0/1_)',
      'KANGOO Express (FW0/1_)',
      'Kangoo II',
      'Kangoo I',
      'Kangoo',
      'KANGOO',
    ],
    generation: 'II',
    spec: '5w-30_renault-rn0720_c4',
    engines: [
      ['', 1461, 'diesel', 90],
      ['1.5 dCi 90', 1461, 'diesel', 90],
      ['1.5 dCi 75', 1461, 'diesel', 75],
      ['1.5 dCi', 1461, 'diesel', 90],
      ['1.2 16V', 1149, 'essence', 75],
      ['1.9 D', 1870, 'diesel', 65],
    ],
  },
  {
    make: 'RENAULT',
    models: [
      'CAPTUR I (J5_, H5_)',
      'CAPTUR II',
      'Captur I',
      'Captur II',
      'Captur',
      'CAPTUR',
    ],
    generation: 'I',
    spec: '5w-30_renault-rn0720_c4',
    engines: [
      ['', 1461, 'diesel', 90],
      ['1.5 dCi 90', 1461, 'diesel', 90],
      ['1.5 dCi', 1461, 'diesel', 90],
      ['0.9 TCe 90', 898, 'essence', 90],
      ['1.2 TCe', 1197, 'essence', 120],
      ['1.3 TCe', 1332, 'essence', 130],
    ],
  },
  {
    make: 'RENAULT',
    models: [
      'KADJAR (HA_, HL_)',
      'Kadjar',
      'KADJAR',
    ],
    generation: 'I',
    spec: '5w-30_renault-rn0720_c4',
    engines: [
      ['', 1461, 'diesel', 110],
      ['1.5 dCi 110', 1461, 'diesel', 110],
      ['1.5 Blue dCi 115', 1461, 'diesel', 115],
      ['1.2 TCe 130', 1197, 'essence', 130],
      ['1.3 TCe 140', 1332, 'essence', 140],
      ['1.6 dCi 130', 1598, 'diesel', 130],
    ],
  },
  {
    make: 'DACIA',
    models: [
      'DUSTER (HS_)',
      'DUSTER (HM_)',
      'Duster II',
      'Duster I',
      'Duster',
      'DUSTER',
    ],
    generation: 'II',
    spec: '5w-30_renault-rn0720_c4',
    engines: [
      ['', 1461, 'diesel', 110],
      ['1.5 dCi 110 4x4', 1461, 'diesel', 110],
      ['1.5 dCi 110', 1461, 'diesel', 110],
      ['1.5 dCi', 1461, 'diesel', 110],
      ['1.5 Blue dCi 115', 1461, 'diesel', 115],
      ['1.6 16V', 1598, 'essence', 105],
      ['1.3 TCe', 1332, 'essence', 130],
    ],
  },
  {
    make: 'DACIA',
    models: [
      'LOGAN I (LS_)',
      'LOGAN II',
      'LOGAN MCV (KS_)',
      'LOGAN MCV II',
      'Logan II',
      'Logan I',
      'Logan',
      'LOGAN',
    ],
    generation: 'II',
    spec: '10w-40_renault-rn0700_a3b4',
    engines: [
      ['', 1390, 'essence', 75],
      ['1.4 (LSA0, LSA5...)', 1390, 'essence', 75],
      ['1.4 MPI', 1390, 'essence', 75],
      ['1.4', 1390, 'essence', 75],
      ['1.2 16V', 1149, 'essence', 75],
      ['1.6 MPI', 1598, 'essence', 87],
      ['1.5 dCi (LS0J, LS0Y)', 1461, 'diesel', 68],
      ['1.5 dCi', 1461, 'diesel', 75],
      ['0.9 TCe 90', 898, 'essence', 90],
    ],
  },
  {
    make: 'DACIA',
    models: [
      'SANDERO / STEPWAY I (BS_)',
      'SANDERO / STEPWAY II (B8_)',
      'SANDERO',
      'Sandero II',
      'Sandero Stepway',
      'Sandero',
    ],
    generation: 'II',
    spec: '10w-40_renault-rn0700_a3b4',
    engines: [
      ['', 1390, 'essence', 75],
      ['1.4 MPI', 1390, 'essence', 75],
      ['1.4', 1390, 'essence', 75],
      ['1.2 16V', 1149, 'essence', 75],
      ['0.9 TCe', 898, 'essence', 90],
      ['1.5 dCi', 1461, 'diesel', 75],
    ],
  },

  // ──────────────────────────────────────────
  // CITROËN
  // ──────────────────────────────────────────
  {
    make: 'CITROEN',
    models: [
      'C3 I (FC_, FN_)',
      'C3 II (SC_)',
      'C3 III (SX)',
      'C3 Pluriel (HB_)',
      'C3 AIRCROSS II (2R_, 2C_)',
      'C3 II',
      'C3 III',
      'C3 I',
      'C3',
    ],
    generation: 'II',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [
      ['', 1199, 'essence', 82],
      ['1.2 PureTech 82', 1199, 'essence', 82],
      ['1.2 PureTech', 1199, 'essence', 82],
      ['1.2 VTi', 1199, 'essence', 82],
      ['EB2F', 1199, 'essence', 82],
      ['1.4 i', 1360, 'essence', 75],
      ['1.4 HDi', 1398, 'diesel', 68],
      ['1.6 HDi', 1560, 'diesel', 92],
      ['1.6 BlueHDi 100', 1560, 'diesel', 100],
      ['1.1 i', 1124, 'essence', 60],
    ],
  },
  {
    make: 'CITROEN',
    models: [
      'C4 I (LC_)',
      'C4 II (NC_)',
      'C4 CACTUS',
      'C4 PICASSO I (UD_)',
      'C4 PICASSO II',
      'C4 II',
      'C4 I',
      'C4',
    ],
    generation: 'II',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [
      ['', 1560, 'diesel', 110],
      ['1.6 HDi', 1560, 'diesel', 110],
      ['1.6 BlueHDi 120', 1560, 'diesel', 120],
      ['1.2 PureTech 130', 1199, 'essence', 130],
      ['1.6 16V', 1587, 'essence', 109],
      ['1.6 VTi', 1598, 'essence', 120],
    ],
  },
  {
    make: 'CITROEN',
    models: [
      'C-ELYSEE (DD_)',
      'C-Elysée',
      'C-Elysee',
    ],
    generation: 'I',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [
      ['', 1199, 'essence', 82],
      ['1.2 VTi 82', 1199, 'essence', 82],
      ['1.2 PureTech', 1199, 'essence', 82],
      ['1.6 HDI 92', 1560, 'diesel', 92],
      ['1.6 BlueHDi 100', 1560, 'diesel', 100],
      ['1.6 VTi 115', 1587, 'essence', 115],
    ],
  },
  {
    make: 'CITROEN',
    models: [
      'BERLINGO (MF_, GJK_, GFK_)',
      'BERLINGO Box Body/MPV (M_)',
      'BERLINGO MULTISPACE (B9)',
      'BERLINGO Box Body/MPV (B9)',
      'BERLINGO (ER_, EC_)',
      'Berlingo II',
      'Berlingo I',
      'Berlingo',
      'BERLINGO',
    ],
    generation: 'B9',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [
      ['', 1560, 'diesel', 90],
      ['1.6 HDi 90', 1560, 'diesel', 90],
      ['1.6 HDi', 1560, 'diesel', 90],
      ['1.6 BlueHDi 100', 1560, 'diesel', 100],
      ['1.9 D', 1868, 'diesel', 69],
      ['1.4', 1360, 'essence', 75],
    ],
  },
  {
    make: 'CITROEN',
    models: [
      'XSARA (N1)',
      'XSARA Break (N2)',
      'XSARA Coupe (N0)',
      'XSARA PICASSO (N68)',
      'Xsara Picasso',
      'Xsara',
    ],
    generation: 'I',
    spec: '10w-40_psa-b71-2300_a3b4',
    engines: [
      ['', 1587, 'essence', 109],
      ['1.6 16V', 1587, 'essence', 109],
      ['1.4 i', 1360, 'essence', 75],
      ['2.0 HDi 90', 1997, 'diesel', 90],
      ['1.9 D', 1868, 'diesel', 69],
    ],
  },

  // ──────────────────────────────────────────
  // FIAT
  // ──────────────────────────────────────────
  {
    make: 'FIAT',
    models: [
      'PUNTO (188_)',
      'PUNTO Van (188_)',
      'Punto 188',
      'Punto II',
      'Punto 2',
    ],
    generation: '188',
    spec: '10w-40_fiat-955535-g2_a3b4',
    engines: [
      ['', 1242, 'essence', 60],
      ['1.2 60 (188.030...)', 1242, 'essence', 60],
      ['1.2 60', 1242, 'essence', 60],
      ['1.2', 1242, 'essence', 60],
      ['1.2 16V 80', 1242, 'essence', 80],
      ['1.3 JTD 16V', 1248, 'diesel', 70],
      ['1.9 JTD', 1910, 'diesel', 80],
      ['1.9 D 60', 1910, 'diesel', 60],
    ],
  },
  {
    make: 'FIAT',
    models: [
      'GRANDE PUNTO (199_)',
      'PUNTO EVO (199_)',
      'PUNTO (199_)',
      'Grande Punto',
      'Punto Evo',
      'Punto',
      'PUNTO',
    ],
    generation: '199',
    spec: '5w-40_fiat-955535-s2_c3',
    engines: [
      ['', 1242, 'essence', 65],
      ['1.2', 1242, 'essence', 65],
      ['1.2 69', 1242, 'essence', 69],
      ['1.4 (199AXB1A)', 1368, 'essence', 77],
      ['1.4', 1368, 'essence', 77],
      ['1.3 D Multijet', 1248, 'diesel', 75],
      ['1.3 Multijet', 1248, 'diesel', 75],
      ['1.3 Multijet 95', 1248, 'diesel', 95],
      ['1.4 T-Jet', 1368, 'essence', 120],
    ],
  },
  {
    make: 'FIAT',
    models: [
      '500 (312_)',
      '500 C (312_)',
      '500L (351_, 352_)',
      '500X (334_)',
      '500 L',
      '500 X',
      '500',
    ],
    generation: '312',
    spec: '5w-40_fiat-955535-s2_c3',
    engines: [
      ['', 1242, 'essence', 69],
      ['1.2 (312AXA1A)', 1242, 'essence', 69],
      ['1.2', 1242, 'essence', 69],
      ['1.3 D Multijet', 1248, 'diesel', 75],
      ['1.3 Multijet', 1248, 'diesel', 95],
      ['0.9 TwinAir', 875, 'essence', 85],
      ['1.4', 1368, 'essence', 100],
    ],
  },
  {
    make: 'FIAT',
    models: [
      'PANDA (169_)',
      'PANDA (312_, 319_)',
      'Panda II',
      'Panda III',
      'Panda',
      'PANDA',
    ],
    generation: '312',
    spec: '5w-40_fiat-955535-s2_c3',
    engines: [
      ['', 1242, 'essence', 69],
      ['1.2 (312PXA1A)', 1242, 'essence', 69],
      ['1.2', 1242, 'essence', 69],
      ['1.1 (169AXA1A)', 1108, 'essence', 54],
      ['1.1', 1108, 'essence', 54],
      ['1.3 D Multijet', 1248, 'diesel', 75],
    ],
  },
  {
    make: 'FIAT',
    models: [
      'TIPO Estate (356_)',
      'TIPO Hatchback (356_)',
      'TIPO Saloon (356_)',
      'Tipo',
      'TIPO',
    ],
    generation: '356',
    spec: '5w-40_fiat-955535-s2_c3',
    engines: [
      ['', 1368, 'essence', 95],
      ['1.4', 1368, 'essence', 95],
      ['1.3 D Multijet', 1248, 'diesel', 95],
      ['1.6 D Multijet', 1598, 'diesel', 120],
    ],
  },
  {
    make: 'FIAT',
    models: [
      'FIORINO Box Body/MPV (225_)',
      'FIORINO Estate (225_)',
      'Fiorino',
      'FIORINO',
      'QUBO (225_)',
      'Qubo',
    ],
    generation: '225',
    spec: '5w-40_fiat-955535-s2_c3',
    engines: [
      ['', 1248, 'diesel', 75],
      ['1.3 D Multijet', 1248, 'diesel', 75],
      ['1.4', 1360, 'essence', 73],
    ],
  },
  {
    make: 'FIAT',
    models: [
      'DOBLO Box Body/MPV (223_)',
      'DOBLO MPV (119_, 223_)',
      'DOBLO Box Body/MPV (263_)',
      'DOBLO Estate (263_)',
      'Doblo II',
      'Doblo I',
      'Doblo',
      'DOBLO',
    ],
    generation: '263',
    spec: '5w-40_fiat-955535-s2_c3',
    engines: [
      ['', 1248, 'diesel', 90],
      ['1.3 D Multijet', 1248, 'diesel', 90],
      ['1.6 D Multijet', 1598, 'diesel', 105],
      ['1.9 JTD', 1910, 'diesel', 105],
      ['1.4', 1368, 'essence', 77],
    ],
  },
  {
    make: 'FIAT',
    models: [
      'PALIO (178_)',
      'PALIO Weekend (178_)',
      'SIENA (178_)',
      'Palio',
      'Siena',
      'UNO (146_)',
      'Uno',
    ],
    generation: '178',
    spec: '10w-40_fiat-955535-g2_a3b4',
    engines: [
      ['', 1242, 'essence', 60],
      ['1.2', 1242, 'essence', 60],
      ['1.4', 1372, 'essence', 69],
      ['1.7 TD', 1698, 'diesel', 70],
    ],
  },

  // ──────────────────────────────────────────
  // TOYOTA
  // ──────────────────────────────────────────
  {
    make: 'TOYOTA',
    models: [
      'YARIS (_P1_)',
      'YARIS (_P9_)',
      'YARIS (_P13_)',
      'YARIS (_P21_, _PA1_, _PH1_)',
      'Yaris III',
      'Yaris II',
      'Yaris I',
      'Yaris',
      'YARIS',
    ],
    generation: 'P13',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [
      ['', 998, 'essence', 69],
      ['1.0 (KSP130_)', 998, 'essence', 69],
      ['1.0 VVT-i', 998, 'essence', 69],
      ['1.0', 998, 'essence', 69],
      ['1.3 (NSP130_)', 1329, 'essence', 99],
      ['1.3 VVT-i', 1329, 'essence', 99],
      ['1.4 D-4D (NLP130_)', 1364, 'diesel', 90],
      ['1.4 D-4D', 1364, 'diesel', 90],
      ['1.5 Hybrid', 1497, 'essence', 75],
    ],
  },
  {
    make: 'TOYOTA',
    models: [
      'COROLLA (_E11_)',
      'COROLLA (_E12_)',
      'COROLLA (_E15_)',
      'COROLLA Saloon (_E18_, ZRE17_)',
      'COROLLA Saloon (_E21_)',
      'Corolla',
      'COROLLA',
    ],
    generation: 'E18',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [
      ['', 1329, 'essence', 99],
      ['1.33 VVT-i', 1329, 'essence', 99],
      ['1.4 D-4D', 1364, 'diesel', 90],
      ['1.6 (ZRE181)', 1598, 'essence', 132],
      ['1.8 Hybrid', 1798, 'essence', 98],
    ],
  },
  {
    make: 'TOYOTA',
    models: [
      'HILUX VI Pickup (_N1_)',
      'HILUX VII Pickup (_N1_, _N2_, _N3_)',
      'HILUX VIII Pickup (_N1_)',
      'Hilux VII',
      'Hilux VIII',
      'Hilux',
      'HILUX',
    ],
    generation: 'VII',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [
      ['', 2494, 'diesel', 144],
      ['2.5 D-4D 4WD (KUN25_)', 2494, 'diesel', 144],
      ['2.5 D-4D', 2494, 'diesel', 144],
      ['3.0 D-4D 4WD (KUN26_)', 2982, 'diesel', 171],
      ['2.4 D (GUN125_)', 2393, 'diesel', 150],
      ['2.4 D-4D', 2393, 'diesel', 150],
    ],
  },
  {
    make: 'TOYOTA',
    models: [
      'RAV 4 II (_A2_)',
      'RAV 4 III (_A3_)',
      'RAV 4 IV (_A4_)',
      'RAV 4 V (_A5_, _H5_)',
      'RAV 4',
      'RAV4',
    ],
    generation: 'A4',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [
      ['', 1998, 'diesel', 124],
      ['2.0 D (WWA42_)', 1998, 'diesel', 124],
      ['2.0 D-4D', 1998, 'diesel', 124],
      ['2.2 D-4D 4WD', 2231, 'diesel', 150],
      ['2.5 Hybrid', 2494, 'essence', 155],
    ],
  },

  // ──────────────────────────────────────────
  // HYUNDAI & KIA
  // ──────────────────────────────────────────
  {
    make: 'HYUNDAI',
    models: [
      'i10 (PA)',
      'i10 (BA, IA)',
      'i10 (AC3, AI3)',
      'i10 II',
      'i10 I',
      'i10',
    ],
    generation: 'IA',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [
      ['', 998, 'essence', 67],
      ['1.0', 998, 'essence', 67],
      ['1.1', 1086, 'essence', 69],
      ['1.2', 1248, 'essence', 87],
    ],
  },
  {
    make: 'HYUNDAI',
    models: [
      'i20 (PB, PBT)',
      'i20 (GB, IB)',
      'i20 (BC3, BI3)',
      'i20 II',
      'i20 I',
      'i20',
    ],
    generation: 'GB',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [
      ['', 1248, 'essence', 84],
      ['1.2', 1248, 'essence', 84],
      ['1.4', 1368, 'essence', 100],
      ['1.1 CRDi', 1120, 'diesel', 75],
      ['1.4 CRDi', 1396, 'diesel', 90],
    ],
  },
  {
    make: 'HYUNDAI',
    models: [
      'TUCSON (JM)',
      'TUCSON (TL, TLE)',
      'TUCSON (NX4E, NX4A)',
      'Tucson',
      'TUCSON',
    ],
    generation: 'TL',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [
      ['', 1685, 'diesel', 116],
      ['1.7 CRDi', 1685, 'diesel', 116],
      ['1.6 CRDi', 1598, 'diesel', 136],
      ['2.0 CRDi', 1995, 'diesel', 185],
      ['1.6 GDI', 1591, 'essence', 132],
      ['1.6 T-GDI', 1591, 'essence', 177],
    ],
  },
  {
    make: 'KIA',
    models: [
      'PICANTO (BA)',
      'PICANTO (TA)',
      'PICANTO (JA)',
      'Picanto II',
      'Picanto I',
      'Picanto',
      'PICANTO',
    ],
    generation: 'TA',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [
      ['', 998, 'essence', 69],
      ['1.0', 998, 'essence', 69],
      ['1.2', 1248, 'essence', 85],
      ['1.1', 1086, 'essence', 65],
    ],
  },
  {
    make: 'KIA',
    models: [
      'RIO II (JB)',
      'RIO III (UB)',
      'RIO IV (YB, SC, FB)',
      'Rio III',
      'Rio II',
      'Rio',
      'RIO',
    ],
    generation: 'UB',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [
      ['', 1248, 'essence', 85],
      ['1.25 CVVT', 1248, 'essence', 85],
      ['1.2', 1248, 'essence', 85],
      ['1.4 CVVT', 1396, 'essence', 109],
      ['1.1 CRDi', 1120, 'diesel', 75],
      ['1.4 CRDi', 1396, 'diesel', 90],
    ],
  },
  {
    make: 'KIA',
    models: [
      'SPORTAGE (JE_, KM_)',
      'SPORTAGE (SL)',
      'SPORTAGE (QL, QLE)',
      'SPORTAGE (NQ5)',
      'Sportage',
      'SPORTAGE',
    ],
    generation: 'QL',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [
      ['', 1685, 'diesel', 116],
      ['1.7 CRDi', 1685, 'diesel', 116],
      ['1.6 CRDi', 1598, 'diesel', 136],
      ['2.0 CRDi', 1995, 'diesel', 185],
      ['1.6 GDI', 1591, 'essence', 132],
    ],
  },

  // ──────────────────────────────────────────
  // FORD
  // ──────────────────────────────────────────
  {
    make: 'FORD',
    models: [
      'FIESTA IV (JA_, JB_)',
      'FIESTA V (JH_, JD_)',
      'FIESTA VI (CB1, CCN)',
      'FIESTA VII (HJ, HF)',
      'Fiesta VI',
      'Fiesta V',
      'Fiesta',
      'FIESTA',
    ],
    generation: 'VI',
    spec: '5w-30_ford-wss-m2c913-d_a5b5',
    engines: [
      ['', 1242, 'essence', 82],
      ['1.25 (SNJA, SNJB)', 1242, 'essence', 82],
      ['1.25', 1242, 'essence', 82],
      ['1.4', 1388, 'essence', 96],
      ['1.0 EcoBoost', 998, 'essence', 100],
      ['1.4 TDCi', 1399, 'diesel', 68],
      ['1.6 TDCi', 1560, 'diesel', 95],
    ],
  },
  {
    make: 'FORD',
    models: [
      'FOCUS I (DAW, DBW)',
      'FOCUS II (DA_, HCP, DP)',
      'FOCUS III',
      'FOCUS IV (HN)',
      'Focus III',
      'Focus II',
      'Focus',
      'FOCUS',
    ],
    generation: 'III',
    spec: '5w-30_ford-wss-m2c913-d_a5b5',
    engines: [
      ['', 1560, 'diesel', 115],
      ['1.6 TDCi', 1560, 'diesel', 115],
      ['1.0 EcoBoost', 998, 'essence', 125],
      ['1.6 Ti', 1596, 'essence', 125],
      ['2.0 TDCi', 1997, 'diesel', 150],
      ['1.8 TDCi', 1753, 'diesel', 115],
    ],
  },

  // ──────────────────────────────────────────
  // SEAT & SKODA
  // ──────────────────────────────────────────
  {
    make: 'SEAT',
    models: [
      'IBIZA III (6L1)',
      'IBIZA IV (6J5, 6P1)',
      'IBIZA V (KJ1, KJG)',
      'Ibiza IV',
      'Ibiza III',
      'Ibiza',
      'IBIZA',
    ],
    generation: 'IV',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [
      ['', 1198, 'essence', 70],
      ['1.2', 1198, 'essence', 70],
      ['1.4', 1390, 'essence', 85],
      ['1.6 TDI', 1598, 'diesel', 105],
      ['1.2 TSI', 1197, 'essence', 105],
      ['1.9 TDI', 1896, 'diesel', 100],
    ],
  },
  {
    make: 'SEAT',
    models: [
      'LEON (1M1)',
      'LEON (1P1)',
      'LEON (5F1)',
      'LEON (KL1)',
      'Leon III',
      'Leon II',
      'Leon',
      'LEON',
    ],
    generation: '5F',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [
      ['', 1968, 'diesel', 150],
      ['2.0 TDI', 1968, 'diesel', 150],
      ['1.6 TDI', 1598, 'diesel', 105],
      ['1.2 TSI', 1197, 'essence', 105],
      ['1.4 TSI', 1395, 'essence', 125],
    ],
  },
  {
    make: 'SKODA',
    models: [
      'FABIA I (6Y2)',
      'FABIA II (542)',
      'FABIA III (NJ3)',
      'FABIA IV (PJ3)',
      'Fabia II',
      'Fabia III',
      'Fabia',
      'FABIA',
    ],
    generation: 'II',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [
      ['', 1198, 'essence', 70],
      ['1.2', 1198, 'essence', 70],
      ['1.4', 1390, 'essence', 86],
      ['1.6 TDI', 1598, 'diesel', 105],
      ['1.2 TSI', 1197, 'essence', 86],
      ['1.4 TDI', 1422, 'diesel', 70],
    ],
  },
  {
    make: 'SKODA',
    models: [
      'OCTAVIA I (1U2)',
      'OCTAVIA II (1Z3)',
      'OCTAVIA III (5E3, NL3, NR3)',
      'OCTAVIA IV (NX3, NN3)',
      'Octavia III',
      'Octavia II',
      'Octavia',
      'OCTAVIA',
    ],
    generation: 'III',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [
      ['', 1968, 'diesel', 150],
      ['2.0 TDI', 1968, 'diesel', 150],
      ['1.6 TDI', 1598, 'diesel', 105],
      ['1.4 TSI', 1395, 'essence', 140],
      ['1.9 TDI', 1896, 'diesel', 105],
    ],
  },

  // ──────────────────────────────────────────
  // GERMAN PREMIUM (BMW, MERCEDES, AUDI)
  // ──────────────────────────────────────────
  {
    make: 'BMW',
    models: [
      '1 (E87)',
      '1 (F20)',
      '1 (F40)',
      '1 Series',
      'Série 1',
    ],
    generation: 'F20',
    spec: '5w-30_bmw-ll04_c3',
    engines: [
      ['', 1995, 'diesel', 143],
      ['118d', 1995, 'diesel', 143],
      ['120d', 1995, 'diesel', 184],
      ['116d', 1496, 'diesel', 116],
      ['116i', 1598, 'essence', 136],
      ['118i', 1499, 'essence', 136],
    ],
  },
  {
    make: 'BMW',
    models: [
      '3 (E90)',
      '3 (F30, F80)',
      '3 (G20, G80, G28)',
      '3 Series',
      'Série 3',
    ],
    generation: 'F30',
    spec: '5w-30_bmw-ll04_c3',
    engines: [
      ['', 1995, 'diesel', 184],
      ['320d (N47D20C)', 1995, 'diesel', 184],
      ['320d', 1995, 'diesel', 184],
      ['318d', 1995, 'diesel', 143],
      ['316d', 1995, 'diesel', 116],
      ['320i', 1997, 'essence', 184],
    ],
  },
  {
    make: 'BMW',
    models: [
      '3 (E46)',
      '3 Compact (E46)',
      '3 Coupe (E46)',
    ],
    generation: 'E46',
    spec: '5w-40_bmw-ll01_a3b4',
    engines: [
      ['', 1995, 'diesel', 150],
      ['320d', 1995, 'diesel', 150],
      ['318i', 1995, 'essence', 143],
      ['316i', 1796, 'essence', 115],
    ],
  },
  {
    make: 'MERCEDES-BENZ',
    models: [
      'A-CLASS (W169)',
      'A-CLASS (W176)',
      'A-CLASS (W177)',
      'Classe A',
      'A-Class',
    ],
    generation: 'W176',
    spec: '5w-30_mb-22951_c3',
    engines: [
      ['', 1461, 'diesel', 109],
      ['A 180 CDI (176.012)', 1461, 'diesel', 109],
      ['A 180 CDI', 1461, 'diesel', 109],
      ['A 200 CDI', 1796, 'diesel', 136],
      ['A 180 (176.042)', 1595, 'essence', 122],
      ['A 200', 1595, 'essence', 156],
    ],
  },
  {
    make: 'MERCEDES-BENZ',
    models: [
      'C-CLASS (W203)',
      'C-CLASS (W204)',
      'C-CLASS (W205)',
      'Classe C',
      'C-Class',
    ],
    generation: 'W204',
    spec: '5w-30_mb-22951_c3',
    engines: [
      ['', 2143, 'diesel', 170],
      ['C 220 CDI (204.002)', 2143, 'diesel', 170],
      ['C 220 CDI', 2143, 'diesel', 170],
      ['C 200 CDI', 2143, 'diesel', 136],
      ['C 180 CGI', 1796, 'essence', 156],
      ['C 180 Kompressor', 1796, 'essence', 156],
    ],
  },
  {
    make: 'AUDI',
    models: [
      'A3 (8P1)',
      'A3 Sportback (8PA)',
      'A3 (8V1, 8VK)',
      'A3 Sportback (8VA, 8VF)',
      'A3 Sportback (8YA)',
      'A3 (8L1)',
      'A3',
    ],
    generation: '8V',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [
      ['', 1968, 'diesel', 150],
      ['2.0 TDI', 1968, 'diesel', 150],
      ['1.6 TDI', 1598, 'diesel', 105],
      ['1.4 TFSI', 1395, 'essence', 125],
      ['1.2 TFSI', 1197, 'essence', 105],
      ['1.9 TDI', 1896, 'diesel', 105],
    ],
  },
  {
    make: 'AUDI',
    models: [
      'A4 (8E2, B6)',
      'A4 (8EC, B7)',
      'A4 (8K2, B8)',
      'A4 (8W2, 8WC, B9)',
      'A4',
    ],
    generation: 'B8',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [
      ['', 1968, 'diesel', 143],
      ['2.0 TDI', 1968, 'diesel', 143],
      ['2.0 TDI 150', 1968, 'diesel', 150],
      ['1.8 TFSI', 1798, 'essence', 160],
      ['2.0 TFSI', 1984, 'essence', 211],
      ['1.9 TDI', 1896, 'diesel', 130],
    ],
  },

  // ──────────────────────────────────────────
  // NISSAN
  // ──────────────────────────────────────────
  {
    make: 'NISSAN',
    models: [
      'QASHQAI / QASHQAI +2 I (J10, NJ10, JJ10E)',
      'QASHQAI II SUV (J11, J11_)',
      'Qashqai II',
      'Qashqai I',
      'Qashqai',
      'QASHQAI',
    ],
    generation: 'J11',
    spec: '5w-30_renault-rn0720_c4',
    engines: [
      ['', 1461, 'diesel', 110],
      ['1.5 dCi', 1461, 'diesel', 110],
      ['1.6 dCi', 1598, 'diesel', 130],
      ['1.2 DIG-T', 1197, 'essence', 115],
      ['1.6', 1598, 'essence', 114],
    ],
  },
  {
    make: 'NISSAN',
    models: [
      'MICRA III (K12)',
      'MICRA IV (K13)',
      'MICRA V (K14)',
      'Micra IV',
      'Micra III',
      'Micra',
      'MICRA',
    ],
    generation: 'K13',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [
      ['', 1198, 'essence', 80],
      ['1.2', 1198, 'essence', 80],
      ['1.2 DIG-S', 1198, 'essence', 98],
      ['1.5 dCi', 1461, 'diesel', 68],
    ],
  },
];

// Extra VEHICLE_GROUPS that did not fit in the original array
// These are appended at runtime (new brands added below)
const EXTRA_VEHICLE_GROUPS = [
  // ──────────────────────────────────────────
  // AUDI
  // ──────────────────────────────────────────
  {
    make: 'AUDI', models: ['A6 (C6)', 'A6 (C7)', 'A6 (C8)', 'A6'], generation: 'C7',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1968, 'diesel', 177], ['2.0 TDI', 1968, 'diesel', 177], ['3.0 TDI', 2967, 'diesel', 218], ['2.0 TFSI', 1984, 'essence', 211]],
  },
  {
    make: 'AUDI', models: ['Q3 (8U)', 'Q3 (F3)', 'Q3'], generation: 'F3',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1968, 'diesel', 150], ['2.0 TDI', 1968, 'diesel', 150], ['1.4 TFSI', 1395, 'essence', 125], ['1.5 TSI', 1498, 'essence', 150]],
  },
  {
    make: 'AUDI', models: ['Q5 (8R)', 'Q5 (FY)', 'Q5'], generation: 'FY',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1968, 'diesel', 190], ['2.0 TDI', 1968, 'diesel', 190], ['2.0 TFSI', 1984, 'essence', 252]],
  },
  {
    make: 'AUDI', models: ['A1 (8X)', 'A1 Sportback (GB)', 'A1'], generation: '8X',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1395, 'essence', 85], ['1.4 TFSI', 1395, 'essence', 85], ['1.0 TFSI', 999, 'essence', 95], ['1.6 TDI', 1598, 'diesel', 90]],
  },
  {
    make: 'AUDI', models: ['A5 (8T3)', 'A5 Sportback (8TA)', 'A5 (F53, F5P)', 'A5'], generation: 'F5',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1968, 'diesel', 190], ['2.0 TDI', 1968, 'diesel', 190], ['2.0 TFSI', 1984, 'essence', 252]],
  },
  // ──────────────────────────────────────────
  // SEAT extra models
  // ──────────────────────────────────────────
  {
    make: 'SEAT', models: ['ATECA (KH7)', 'Ateca', 'ATECA'], generation: 'KH7',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1968, 'diesel', 150], ['2.0 TDI', 1968, 'diesel', 150], ['1.0 TSI', 999, 'essence', 115], ['1.5 TSI', 1498, 'essence', 150]],
  },
  {
    make: 'SEAT', models: ['ARONA (KJ7)', 'Arona', 'ARONA'], generation: 'KJ7',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 999, 'essence', 95], ['1.0 TSI', 999, 'essence', 95], ['1.6 TDI', 1598, 'diesel', 95]],
  },
  {
    make: 'SEAT', models: ['ALTEA (5P1)', 'ALTEA XL (5P5, 5P8)', 'Altea', 'ALTEA', 'TOLEDO (5P2)', 'Toledo', 'ALHAMBRA (710, 711)', 'Alhambra'], generation: 'I',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1968, 'diesel', 140], ['2.0 TDI', 1968, 'diesel', 140], ['1.6 TDI', 1598, 'diesel', 105], ['1.4 TSI', 1395, 'essence', 125]],
  },
  // ──────────────────────────────────────────
  // SKODA extra models
  // ──────────────────────────────────────────
  {
    make: 'SKODA', models: ['SUPERB I (3U4)', 'SUPERB II (3T4)', 'SUPERB III (3V3)', 'Superb', 'SUPERB'], generation: 'III',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1968, 'diesel', 190], ['2.0 TDI', 1968, 'diesel', 190], ['1.4 TSI', 1395, 'essence', 150], ['2.0 TSI', 1984, 'essence', 280]],
  },
  {
    make: 'SKODA', models: ['KAROQ (NU7)', 'Karoq', 'KAROQ'], generation: 'NU7',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1968, 'diesel', 150], ['2.0 TDI', 1968, 'diesel', 150], ['1.0 TSI', 999, 'essence', 115], ['1.5 TSI', 1498, 'essence', 150]],
  },
  {
    make: 'SKODA', models: ['KODIAQ (NS7)', 'Kodiaq', 'KODIAQ'], generation: 'NS7',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1968, 'diesel', 190], ['2.0 TDI', 1968, 'diesel', 190], ['1.5 TSI', 1498, 'essence', 150], ['2.0 TSI', 1984, 'essence', 180]],
  },
  {
    make: 'SKODA', models: ['RAPID (NA2)', 'RAPID Spaceback (NH1)', 'Rapid', 'RAPID'], generation: 'NA2',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1198, 'essence', 86], ['1.2 TSI', 1197, 'essence', 86], ['1.6 TDI', 1598, 'diesel', 90]],
  },
  // ──────────────────────────────────────────
  // VW extra models
  // ──────────────────────────────────────────
  {
    make: 'VOLKSWAGEN', models: ['T-ROC (A1)', 'T-Roc', 'T ROC', 'TROC'], generation: 'A1',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1968, 'diesel', 150], ['2.0 TDI', 1968, 'diesel', 150], ['1.0 TSI', 999, 'essence', 115], ['1.5 TSI', 1498, 'essence', 150]],
  },
  {
    make: 'VOLKSWAGEN', models: ['TRANSPORTER V (7HB, 7HJ)', 'TRANSPORTER VI (SGA, SGH)', 'Transporter T5', 'Transporter T6', 'Transporter', 'TRANSPORTER'], generation: 'T6',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1968, 'diesel', 102], ['2.0 TDI', 1968, 'diesel', 102], ['2.0 TDI 4motion', 1968, 'diesel', 150], ['1.9 TDI', 1896, 'diesel', 84]],
  },
  {
    make: 'VOLKSWAGEN', models: ['SHARAN (7M8, 7M9, 7M6)', 'SHARAN (7N1, 7N2)', 'Sharan', 'SHARAN'], generation: 'II',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [['', 1968, 'diesel', 140], ['2.0 TDI', 1968, 'diesel', 140], ['1.4 TSI', 1395, 'essence', 150]],
  },
  // ──────────────────────────────────────────
  // PEUGEOT extra models
  // ──────────────────────────────────────────
  {
    make: 'PEUGEOT', models: ['5008 (0U_)', '5008 II (M_)', '5008'], generation: '5008',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [['', 1560, 'diesel', 120], ['1.6 BlueHDi 120', 1560, 'diesel', 120], ['2.0 BlueHDi 150', 1997, 'diesel', 150], ['1.2 PureTech 130', 1199, 'essence', 130]],
  },
  {
    make: 'PEUGEOT', models: ['406 (8B)', '406 Break (8E/F)', '406 Coupe (8C)', '406'], generation: '406',
    spec: '10w-40_psa-b71-2300_a3b4',
    engines: [['', 1761, 'essence', 110], ['1.8 16V', 1761, 'essence', 110], ['2.0 HDI 90', 1997, 'diesel', 90], ['2.0 HDI 110', 1997, 'diesel', 110]],
  },
  // ──────────────────────────────────────────
  // CITROËN extra models
  // ──────────────────────────────────────────
  {
    make: 'CITROEN', models: ['C5 I (DC_)', 'C5 II (RE_)', 'C5 X (EHY)', 'C5'], generation: 'II',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [['', 1997, 'diesel', 138], ['2.0 HDI 138', 1997, 'diesel', 138], ['1.6 HDi', 1560, 'diesel', 110]],
  },
  {
    make: 'CITROEN', models: ['JUMPY (U60)', 'JUMPY II (G9)', 'DISPATCH I', 'DISPATCH II', 'Jumpy', 'JUMPY'], generation: 'II',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [['', 1997, 'diesel', 128], ['2.0 HDI 128', 1997, 'diesel', 128], ['1.6 HDi', 1560, 'diesel', 90]],
  },
  // ──────────────────────────────────────────
  // OPEL / VAUXHALL
  // ──────────────────────────────────────────
  {
    make: 'OPEL', models: ['ASTRA H (L48)', 'ASTRA H GTC (L08)', 'ASTRA H Estate (L35)', 'ASTRA J (P10)', 'ASTRA J GTC (P10)', 'ASTRA J Sports Tourer (P10)', 'ASTRA K (B16)', 'ASTRA K Sports Tourer', 'Astra H', 'Astra J', 'Astra K', 'Astra', 'ASTRA'], generation: 'J',
    spec: '5w-30_gm-dexos2_c3',
    engines: [['', 1598, 'diesel', 110], ['1.6 CDTI', 1598, 'diesel', 110], ['1.7 CDTI (A17DTS)', 1686, 'diesel', 125], ['1.7 CDTI', 1686, 'diesel', 125], ['2.0 CDTI', 1956, 'diesel', 160], ['1.9 CDTI (Z19DTH)', 1910, 'diesel', 120], ['1.9 CDTI', 1910, 'diesel', 120], ['1.6 (Z16XER)', 1598, 'essence', 115], ['1.6', 1598, 'essence', 115], ['1.4 T (A14NEL)', 1364, 'essence', 140], ['1.4 T', 1364, 'essence', 140], ['1.4', 1364, 'essence', 100]],
  },
  {
    make: 'OPEL', models: ['CORSA C (X01)', 'CORSA D (S07)', 'CORSA E (X15)', 'CORSA F (P68)', 'Corsa D', 'Corsa E', 'Corsa', 'CORSA'], generation: 'D',
    spec: '5w-30_gm-dexos2_c3',
    engines: [['', 1229, 'essence', 80], ['1.2 (Z12XEP)', 1229, 'essence', 80], ['1.2', 1229, 'essence', 80], ['1.4 (Z14XEP)', 1364, 'essence', 90], ['1.4', 1364, 'essence', 90], ['1.3 CDTI', 1248, 'diesel', 75], ['1.7 CDTI', 1686, 'diesel', 100]],
  },
  {
    make: 'OPEL', models: ['INSIGNIA A Sports Tourer (G09)', 'INSIGNIA A (G09)', 'INSIGNIA B Sports Tourer (Z18)', 'INSIGNIA B (Z18)', 'Insignia', 'INSIGNIA'], generation: 'B',
    spec: '5w-30_gm-dexos2_c3',
    engines: [['', 1956, 'diesel', 170], ['2.0 CDTI', 1956, 'diesel', 170], ['2.0 CDTI BiTurbo', 1956, 'diesel', 210], ['1.6 CDTI', 1598, 'diesel', 136], ['1.5 CDTi', 1499, 'diesel', 136], ['1.5 Turbo', 1498, 'essence', 165]],
  },
  {
    make: 'OPEL', models: ['MOKKA (J13)', 'MOKKA X (J13)', 'MOKKA A', 'Mokka', 'MOKKA'], generation: 'J13',
    spec: '5w-30_gm-dexos2_c3',
    engines: [['', 1598, 'diesel', 110], ['1.6 CDTI', 1598, 'diesel', 110], ['1.7 CDTI', 1686, 'diesel', 130], ['1.4 T', 1364, 'essence', 140]],
  },
  {
    make: 'OPEL', models: ['MERIVA A (X03)', 'MERIVA B (S10)', 'Meriva', 'MERIVA'], generation: 'B',
    spec: '5w-30_gm-dexos2_c3',
    engines: [['', 1248, 'diesel', 75], ['1.3 CDTI', 1248, 'diesel', 75], ['1.7 CDTI', 1686, 'diesel', 100], ['1.4 T', 1364, 'essence', 120]],
  },
  {
    make: 'OPEL', models: ['ZAFIRA B (A05)', 'ZAFIRA C Tourer (P12)', 'Zafira', 'ZAFIRA'], generation: 'C',
    spec: '5w-30_gm-dexos2_c3',
    engines: [['', 1956, 'diesel', 165], ['2.0 CDTI', 1956, 'diesel', 165], ['1.6 CDTI', 1598, 'diesel', 136], ['1.4 T', 1364, 'essence', 140]],
  },
  {
    make: 'OPEL', models: ['VIVARO A (F7)', 'VIVARO B (X82)', 'Vivaro', 'VIVARO'], generation: 'B',
    spec: '5w-30_gm-dexos2_c3',
    engines: [['', 1598, 'diesel', 120], ['1.6 CDTI', 1598, 'diesel', 120], ['1.6 BiTurbo CDTI', 1598, 'diesel', 145], ['2.0 CDTI', 1956, 'diesel', 150]],
  },
  {
    make: 'OPEL', models: ['VECTRA B (J96)', 'VECTRA C (Z02)', 'Vectra', 'VECTRA'], generation: 'C',
    spec: '10w-40_gm-b025-api_a3b4',
    engines: [['', 1998, 'essence', 140], ['2.0 16V (Z20LER)', 1998, 'essence', 140], ['2.0 DTi', 1995, 'diesel', 100], ['1.9 CDTi', 1910, 'diesel', 120]],
  },
  // ──────────────────────────────────────────
  // ALFA ROMEO
  // ──────────────────────────────────────────
  {
    make: 'ALFA ROMEO', models: ['GIULIETTA (940_)', 'Giulietta', 'GIULIETTA'], generation: '940',
    spec: '5w-40_selenia-alfa_c3',
    engines: [['', 1248, 'diesel', 105], ['1.6 JTDm', 1248, 'diesel', 105], ['2.0 JTDm', 1956, 'diesel', 150], ['1.4 TB', 1368, 'essence', 120], ['1.4 MultiAir', 1368, 'essence', 170]],
  },
  {
    make: 'ALFA ROMEO', models: ['147 (937_)', '147'], generation: '937',
    spec: '10w-40_fiat-955535-g2_a3b4',
    engines: [['', 1598, 'essence', 105], ['1.6 TS (937AXA...)', 1598, 'essence', 105], ['1.9 JTD', 1910, 'diesel', 115], ['2.0 TS', 1970, 'essence', 150]],
  },
  {
    make: 'ALFA ROMEO', models: ['156 (932_)', '156 Sportwagon (932_)', '156'], generation: '932',
    spec: '10w-40_fiat-955535-g2_a3b4',
    engines: [['', 1598, 'essence', 105], ['1.6 TS', 1598, 'essence', 105], ['1.9 JTD', 1910, 'diesel', 115], ['2.0 TS', 1970, 'essence', 150]],
  },
  {
    make: 'ALFA ROMEO', models: ['MITO (955_)', 'MiTo', 'MITO'], generation: '955',
    spec: '5w-40_selenia-alfa_c3',
    engines: [['', 1248, 'diesel', 85], ['1.3 JTDm', 1248, 'diesel', 85], ['1.4 TB', 1368, 'essence', 155], ['1.4 MultiAir', 1368, 'essence', 105]],
  },
  {
    make: 'ALFA ROMEO', models: ['STELVIO (949_)', 'Stelvio', 'STELVIO'], generation: '949',
    spec: '5w-40_selenia-alfa_c3',
    engines: [['', 2143, 'diesel', 210], ['2.2 JTDm', 2143, 'diesel', 210], ['2.0 T', 1995, 'essence', 280]],
  },
  // ──────────────────────────────────────────
  // LANCIA
  // ──────────────────────────────────────────
  {
    make: 'LANCIA', models: ['YPSILON (843_)', 'YPSILON (846_)', 'Ypsilon', 'YPSILON'], generation: '846',
    spec: '5w-40_fiat-955535-s2_c3',
    engines: [['', 1242, 'essence', 69], ['1.2', 1242, 'essence', 69], ['1.3 Multijet', 1248, 'diesel', 85], ['0.9 TwinAir', 875, 'essence', 85]],
  },
  {
    make: 'LANCIA', models: ['DELTA III (844_)', 'Delta', 'DELTA'], generation: '844',
    spec: '5w-40_fiat-955535-s2_c3',
    engines: [['', 1368, 'essence', 150], ['1.4 TB MultiAir', 1368, 'essence', 150], ['2.0 Multijet', 1956, 'diesel', 165]],
  },
  // ──────────────────────────────────────────
  // JEEP
  // ──────────────────────────────────────────
  {
    make: 'JEEP', models: ['RENEGADE (BU)', 'Renegade', 'RENEGADE'], generation: 'BU',
    spec: '5w-40_fiat-955535-s2_c3',
    engines: [['', 1368, 'diesel', 120], ['1.3 MultiAir', 1368, 'essence', 150], ['1.6 MultiJet', 1598, 'diesel', 120], ['2.0 MultiJet 4x4', 1956, 'diesel', 170]],
  },
  {
    make: 'JEEP', models: ['COMPASS II (MP)', 'Compass', 'COMPASS'], generation: 'MP',
    spec: '5w-40_fiat-955535-s2_c3',
    engines: [['', 1956, 'diesel', 170], ['2.0 MultiJet 4x4', 1956, 'diesel', 170], ['1.3 T4 PHEV', 1332, 'essence', 190]],
  },
  {
    make: 'JEEP', models: ['WRANGLER III (JK)', 'WRANGLER IV (JL)', 'Wrangler', 'WRANGLER'], generation: 'JL',
    spec: '5w-40_fiat-955535-s2_c3',
    engines: [['', 1995, 'diesel', 200], ['2.0 Turbo', 1995, 'essence', 272], ['3.6 V6', 3604, 'essence', 284], ['2.2 MultiJet II', 2184, 'diesel', 200]],
  },
  // ──────────────────────────────────────────
  // RENAULT extra models
  // ──────────────────────────────────────────
  {
    make: 'RENAULT', models: ['SCENIC I (JA0/1_)', 'SCENIC II (JM0/1_)', 'SCENIC III (JZ0/1_)', 'SCENIC IV', 'Scenic', 'SCENIC'], generation: 'III',
    spec: '5w-30_renault-rn0720_c4',
    engines: [['', 1461, 'diesel', 110], ['1.5 dCi 110', 1461, 'diesel', 110], ['1.6 16V', 1598, 'essence', 110], ['2.0 dCi', 1995, 'diesel', 150]],
  },
  {
    make: 'RENAULT', models: ['TRAFIC II (FL)', 'TRAFIC III (FG_)', 'Trafic', 'TRAFIC'], generation: 'III',
    spec: '5w-30_renault-rn0720_c4',
    engines: [['', 1598, 'diesel', 120], ['1.6 dCi 120', 1598, 'diesel', 120], ['2.0 dCi', 1995, 'diesel', 115]],
  },
  // ──────────────────────────────────────────
  // DACIA extra models
  // ──────────────────────────────────────────
  {
    make: 'DACIA', models: ['DOKKER (SD_)', 'DOKKER Express (FSD_)', 'Dokker', 'DOKKER'], generation: 'I',
    spec: '10w-40_renault-rn0700_a3b4',
    engines: [['', 1461, 'diesel', 75], ['1.5 dCi 75', 1461, 'diesel', 75], ['1.5 dCi 90', 1461, 'diesel', 90], ['1.6 MPI', 1598, 'essence', 85]],
  },
  // ──────────────────────────────────────────
  // TOYOTA extra models
  // ──────────────────────────────────────────
  {
    make: 'TOYOTA', models: ['CAMRY (_XV4_)', 'CAMRY (_XV5_)', 'CAMRY (_XV7_)', 'Camry', 'CAMRY'], generation: 'XV50',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 1998, 'essence', 151], ['2.0 VVT-i', 1998, 'essence', 151], ['2.5 Hybrid', 2494, 'essence', 218]],
  },
  {
    make: 'TOYOTA', models: ['AVENSIS (_T25_)', 'AVENSIS (_T27_)', 'AVENSIS (_T29_)', 'Avensis', 'AVENSIS'], generation: 'T27',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 1998, 'diesel', 126], ['2.0 D-4D', 1998, 'diesel', 126], ['2.2 D-4D', 2231, 'diesel', 150], ['1.8 (2ZR-FAE)', 1798, 'essence', 147]],
  },
  {
    make: 'TOYOTA', models: ['AURIS (E15_)', 'AURIS (E18_)', 'Auris', 'AURIS'], generation: 'E18',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 1364, 'diesel', 90], ['1.4 D-4D', 1364, 'diesel', 90], ['1.6 (1ZR-FAE)', 1598, 'essence', 132], ['1.8 Hybrid', 1798, 'essence', 136]],
  },
  {
    make: 'TOYOTA', models: ['LAND CRUISER (J12_)', 'LAND CRUISER PRADO (J12_)', 'LAND CRUISER (J200)', 'LAND CRUISER (J300)', 'Land Cruiser', 'LAND CRUISER'], generation: 'J200',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 4461, 'diesel', 286], ['4.5 V8 D-4D', 4461, 'diesel', 286], ['3.0 D-4D (1KD-FTV)', 2982, 'diesel', 173]],
  },
  {
    make: 'TOYOTA', models: ['C-HR (AX10_)', 'C-HR', 'CHR'], generation: 'AX10',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 1197, 'essence', 116], ['1.2 T', 1197, 'essence', 116], ['1.8 Hybrid', 1798, 'essence', 122]],
  },
  // ──────────────────────────────────────────
  // HYUNDAI extra models
  // ──────────────────────────────────────────
  {
    make: 'HYUNDAI', models: ['i30 (FD)', 'i30 (GD)', 'i30 (PD)', 'i30', 'I30'], generation: 'GD',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 1582, 'essence', 132], ['1.6 GDi', 1582, 'essence', 132], ['1.4 T-GDi', 1353, 'essence', 140], ['1.4 CRDi', 1396, 'diesel', 90], ['1.6 CRDi', 1582, 'diesel', 110]],
  },
  {
    make: 'HYUNDAI', models: ['SANTA FE II (CM)', 'SANTA FE III (DM, DX)', 'SANTA FE IV (TM)', 'Santa Fe', 'SANTA FE'], generation: 'DM',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 2199, 'diesel', 197], ['2.2 CRDi 4WD', 2199, 'diesel', 197], ['2.0 CRDi', 1995, 'diesel', 150]],
  },
  {
    make: 'HYUNDAI', models: ['ACCENT III (LC)', 'ACCENT IV (MC)', 'ACCENT (RB)', 'Accent', 'ACCENT'], generation: 'RB',
    spec: '10w-40_asian-api-slcf',
    engines: [['', 1368, 'essence', 100], ['1.4 (G4FA)', 1368, 'essence', 100], ['1.6 (G4FC)', 1591, 'essence', 124], ['1.6 CRDi', 1582, 'diesel', 128]],
  },
  // ──────────────────────────────────────────
  // KIA extra models
  // ──────────────────────────────────────────
  {
    make: 'KIA', models: ['CEED I (ED)', 'CEED II (JD)', 'CEED III (CD)', 'Ceed', 'CEED', 'CEEd'], generation: 'JD',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 1582, 'essence', 132], ['1.6 GDi', 1582, 'essence', 132], ['1.4 T-GDi', 1353, 'essence', 140], ['1.6 CRDi', 1582, 'diesel', 110]],
  },
  {
    make: 'KIA', models: ['SORENTO (BL)', 'SORENTO II (XM)', 'SORENTO III (UM)', 'SORENTO IV (MQ4)', 'Sorento', 'SORENTO'], generation: 'UM',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 2199, 'diesel', 202], ['2.2 CRDi', 2199, 'diesel', 202], ['2.0 CRDi', 1995, 'diesel', 150]],
  },
  // ──────────────────────────────────────────
  // FORD extra models
  // ──────────────────────────────────────────
  {
    make: 'FORD', models: ['FUSION I (JU_)', 'FUSION', 'Fusion'], generation: 'I',
    spec: '5w-30_ford-wss-m2c913-d_a5b5',
    engines: [['', 1388, 'essence', 80], ['1.4', 1388, 'essence', 80], ['1.6 Ti', 1596, 'essence', 100], ['1.4 TDCi', 1399, 'diesel', 68]],
  },
  {
    make: 'FORD', models: ['MONDEO III (B5Y)', 'MONDEO IV (BA7)', 'MONDEO V (CD391)', 'Mondeo', 'MONDEO'], generation: 'IV',
    spec: '5w-30_ford-wss-m2c913-d_a5b5',
    engines: [['', 1997, 'diesel', 140], ['2.0 TDCi', 1997, 'diesel', 140], ['1.6 TDCi', 1560, 'diesel', 115], ['2.0 EcoBoost', 1999, 'essence', 240]],
  },
  {
    make: 'FORD', models: ['KUGA I (CBV)', 'KUGA II (DM2)', 'Kuga', 'KUGA'], generation: 'II',
    spec: '5w-30_ford-wss-m2c913-d_a5b5',
    engines: [['', 1997, 'diesel', 150], ['2.0 TDCi', 1997, 'diesel', 150], ['1.5 EcoBoost', 1498, 'essence', 150]],
  },
  {
    make: 'FORD', models: ['C-MAX I (DM2)', 'C-MAX II (DXA/CB7)', 'C-Max', 'C MAX', 'CMAX'], generation: 'II',
    spec: '5w-30_ford-wss-m2c913-d_a5b5',
    engines: [['', 1560, 'diesel', 115], ['1.6 TDCi', 1560, 'diesel', 115], ['2.0 TDCi', 1997, 'diesel', 150], ['1.0 EcoBoost', 998, 'essence', 100]],
  },
  {
    make: 'FORD', models: ['RANGER (ER, EQ)', 'RANGER (TKE)', 'Ranger', 'RANGER'], generation: 'TKE',
    spec: '5w-30_ford-wss-m2c913-d_a5b5',
    engines: [['', 2198, 'diesel', 160], ['2.2 TDCi 4x4', 2198, 'diesel', 160], ['3.2 TDCi 4x4', 3198, 'diesel', 200]],
  },
  {
    make: 'FORD', models: ['TRANSIT CUSTOM', 'TRANSIT CONNECT', 'TRANSIT IV (FA_)', 'TRANSIT V (FA_)', 'Transit', 'TRANSIT'], generation: 'IV',
    spec: '5w-30_ford-wss-m2c913-d_a5b5',
    engines: [['', 1995, 'diesel', 125], ['2.0 EcoBlue', 1995, 'diesel', 125], ['2.2 TDCi', 2198, 'diesel', 125]],
  },
  // ──────────────────────────────────────────
  // BMW extra models
  // ──────────────────────────────────────────
  {
    make: 'BMW', models: ['5 (E60)', '5 (E61)', '5 (F10)', '5 (F11)', '5 (G30, G31)', '5 Series', 'Série 5'], generation: 'F10',
    spec: '5w-30_bmw-ll04_c3',
    engines: [['', 1995, 'diesel', 184], ['520d', 1995, 'diesel', 184], ['530d', 2993, 'diesel', 258], ['520i', 1997, 'essence', 184]],
  },
  {
    make: 'BMW', models: ['X1 (E84)', 'X1 (F48)', 'X1 (U11)', 'X1'], generation: 'F48',
    spec: '5w-30_bmw-ll04_c3',
    engines: [['', 1995, 'diesel', 150], ['xDrive18d', 1995, 'diesel', 150], ['xDrive20d', 1995, 'diesel', 190], ['sDrive18i', 1499, 'essence', 140]],
  },
  {
    make: 'BMW', models: ['X3 (E83)', 'X3 (F25)', 'X3 (G01, G08)', 'X3'], generation: 'G01',
    spec: '5w-30_bmw-ll04_c3',
    engines: [['', 1995, 'diesel', 190], ['xDrive20d', 1995, 'diesel', 190], ['xDrive30d', 2993, 'diesel', 265], ['xDrive20i', 1998, 'essence', 184]],
  },
  {
    make: 'BMW', models: ['X5 (E53)', 'X5 (E70)', 'X5 (F15)', 'X5 (G05)', 'X5'], generation: 'G05',
    spec: '5w-30_bmw-ll04_c3',
    engines: [['', 2993, 'diesel', 265], ['xDrive30d', 2993, 'diesel', 265], ['xDrive40i', 2998, 'essence', 340]],
  },
  {
    make: 'BMW', models: ['2 (F22)', '2 Active Tourer (F45)', '2 Gran Tourer (F46)', '2 (G42)', '2 Series', 'Série 2'], generation: 'F45',
    spec: '5w-30_bmw-ll04_c3',
    engines: [['', 1995, 'diesel', 150], ['218d', 1995, 'diesel', 150], ['220d', 1995, 'diesel', 190], ['216i', 1499, 'essence', 109]],
  },
  // ──────────────────────────────────────────
  // MERCEDES-BENZ extra models
  // ──────────────────────────────────────────
  {
    make: 'MERCEDES-BENZ', models: ['E-CLASS (W210)', 'E-CLASS (W211)', 'E-CLASS (W212)', 'E-CLASS (W213)', 'Classe E', 'E-Class'], generation: 'W212',
    spec: '5w-30_mb-22951_c3',
    engines: [['', 2143, 'diesel', 170], ['E 220 CDI', 2143, 'diesel', 170], ['E 220 BlueTEC', 2143, 'diesel', 170], ['E 200', 1991, 'essence', 184]],
  },
  {
    make: 'MERCEDES-BENZ', models: ['GLA (X156)', 'GLA (H247)', 'GLA', 'Classe GLA'], generation: 'X156',
    spec: '5w-30_mb-22951_c3',
    engines: [['', 1461, 'diesel', 136], ['GLA 200 CDI', 1461, 'diesel', 136], ['GLA 180 CDI', 1461, 'diesel', 109], ['GLA 200', 1595, 'essence', 156]],
  },
  {
    make: 'MERCEDES-BENZ', models: ['GLC (X253)', 'GLC Coupe (C253)', 'GLC (X254)', 'GLC', 'Classe GLC'], generation: 'X253',
    spec: '5w-30_mb-22951_c3',
    engines: [['', 1950, 'diesel', 170], ['GLC 220 d', 1950, 'diesel', 170], ['GLC 200', 1991, 'essence', 184]],
  },
  {
    make: 'MERCEDES-BENZ', models: ['VITO (638/2)', 'VITO (W639)', 'VITO (W447)', 'Vito', 'VITO', 'VIANO (W639)', 'Viano'], generation: 'W447',
    spec: '5w-30_mb-22951_c3',
    engines: [['', 1950, 'diesel', 136], ['116 CDI', 1950, 'diesel', 163], ['114 CDI', 1598, 'diesel', 136]],
  },
  {
    make: 'MERCEDES-BENZ', models: ['SPRINTER 3,5-t (B906)', 'SPRINTER 5-t (B906)', 'SPRINTER II (NCV3)', 'Sprinter', 'SPRINTER'], generation: 'B906',
    spec: '5w-30_mb-22951_c3',
    engines: [['', 2143, 'diesel', 143], ['313 CDI', 2143, 'diesel', 143], ['316 CDI', 2143, 'diesel', 163]],
  },
  // ──────────────────────────────────────────
  // VOLVO
  // ──────────────────────────────────────────
  {
    make: 'VOLVO', models: ['S40 II (MS)', 'V50 (MW)', 'S40', 'V50'], generation: 'MS',
    spec: '5w-30_volvo-vcc-rbs0-2ae_c3',
    engines: [['', 1560, 'diesel', 110], ['1.6 D', 1560, 'diesel', 110], ['2.0 D', 1997, 'diesel', 136], ['2.0', 1999, 'essence', 145]],
  },
  {
    make: 'VOLVO', models: ['V40 (525, 526)', 'V40 Cross Country', 'V40'], generation: '525',
    spec: '5w-30_volvo-vcc-rbs0-2ae_c3',
    engines: [['', 1560, 'diesel', 115], ['D2', 1560, 'diesel', 115], ['D3', 1969, 'diesel', 150], ['T3', 1498, 'essence', 152], ['T4', 1969, 'essence', 190]],
  },
  {
    make: 'VOLVO', models: ['V60 I (155, 157)', 'V60 II (Z)', 'S60 I (RS, HV)', 'S60 II (134)', 'S60 III', 'V60', 'S60'], generation: 'II',
    spec: '5w-30_volvo-vcc-rbs0-2ae_c3',
    engines: [['', 1969, 'diesel', 150], ['D3', 1969, 'diesel', 150], ['D4', 1969, 'diesel', 190], ['T5', 1969, 'essence', 245]],
  },
  {
    make: 'VOLVO', models: ['XC60 I (156)', 'XC60 II (246)', 'XC60'], generation: 'II',
    spec: '0w-20_volvo-vcc-rbso-2ae_c5',
    engines: [['', 1969, 'diesel', 190], ['D4', 1969, 'diesel', 190], ['D5', 2400, 'diesel', 235], ['B4', 1969, 'essence', 197], ['B5', 1969, 'essence', 250]],
  },
  {
    make: 'VOLVO', models: ['XC90 I (C)', 'XC90 II (256)', 'XC90'], generation: 'II',
    spec: '0w-20_volvo-vcc-rbso-2ae_c5',
    engines: [['', 1969, 'diesel', 235], ['D5', 2400, 'diesel', 235], ['B6', 2953, 'essence', 300], ['T8 Twin Engine', 1969, 'essence', 390]],
  },
  {
    make: 'VOLVO', models: ['V70 III (BW)', 'V70 II (SW)', 'S80 I (TS)', 'S80 II (AS)', 'V70', 'S80'], generation: 'III',
    spec: '5w-30_volvo-vcc-rbs0-2ae_c3',
    engines: [['', 2400, 'diesel', 185], ['D5', 2400, 'diesel', 185], ['2.0 D', 1997, 'diesel', 136]],
  },
  // ──────────────────────────────────────────
  // MAZDA
  // ──────────────────────────────────────────
  {
    make: 'MAZDA', models: ['2 (DE)', '2 (DJ)', 'Mazda 2', 'MAZDA 2', 'Mazda2'], generation: 'DJ',
    spec: '5w-30_mazda-ms-hv_c2',
    engines: [['', 1496, 'essence', 90], ['1.5 Skyactiv-G', 1496, 'essence', 90], ['1.5 Skyactiv-D', 1499, 'diesel', 105]],
  },
  {
    make: 'MAZDA', models: ['3 (BK)', '3 (BL)', '3 (BM)', '3 (BP)', 'Mazda 3', 'MAZDA 3', 'Mazda3'], generation: 'BM',
    spec: '5w-30_mazda-ms-hv_c2',
    engines: [['', 2191, 'diesel', 150], ['2.2 Skyactiv-D', 2191, 'diesel', 150], ['1.5 Skyactiv-G', 1496, 'essence', 100], ['2.0 Skyactiv-G', 1997, 'essence', 165]],
  },
  {
    make: 'MAZDA', models: ['6 (GG)', '6 (GH)', '6 (GJ)', '6 (GL)', 'Mazda 6', 'MAZDA 6', 'Mazda6'], generation: 'GJ',
    spec: '5w-30_mazda-ms-hv_c2',
    engines: [['', 2191, 'diesel', 175], ['2.2 Skyactiv-D', 2191, 'diesel', 175], ['2.0 Skyactiv-G', 1997, 'essence', 165]],
  },
  {
    make: 'MAZDA', models: ['CX-5 (KE)', 'CX-5 (KF)', 'CX-5', 'CX5'], generation: 'KF',
    spec: '5w-30_mazda-ms-hv_c2',
    engines: [['', 2191, 'diesel', 150], ['2.2 Skyactiv-D', 2191, 'diesel', 150], ['2.0 Skyactiv-G', 1997, 'essence', 165], ['2.5 Skyactiv-G', 2488, 'essence', 194]],
  },
  {
    make: 'MAZDA', models: ['CX-3 (DK)', 'CX-3', 'CX3'], generation: 'DK',
    spec: '5w-30_mazda-ms-hv_c2',
    engines: [['', 1496, 'diesel', 105], ['1.5 Skyactiv-D', 1499, 'diesel', 105], ['2.0 Skyactiv-G', 1997, 'essence', 150]],
  },
  // ──────────────────────────────────────────
  // NISSAN extra models
  // ──────────────────────────────────────────
  {
    make: 'NISSAN', models: ['JUKE (F15)', 'JUKE (F16)', 'Juke', 'JUKE'], generation: 'F15',
    spec: '5w-30_renault-rn0720_c4',
    engines: [['', 1197, 'essence', 116], ['1.2 DIG-T', 1197, 'essence', 116], ['1.6 DIG-T', 1598, 'essence', 190], ['1.5 dCi', 1461, 'diesel', 110]],
  },
  {
    make: 'NISSAN', models: ['X-TRAIL I (T30)', 'X-TRAIL II (T31)', 'X-TRAIL III (T32)', 'X-Trail', 'XTRAIL'], generation: 'T32',
    spec: '5w-30_renault-rn0720_c4',
    engines: [['', 1598, 'diesel', 130], ['1.6 dCi 4WD', 1598, 'diesel', 130], ['2.0 dCi', 1995, 'diesel', 150]],
  },
  {
    make: 'NISSAN', models: ['NAVARA (D22)', 'NAVARA (D40)', 'NAVARA (D23)', 'Navara', 'NAVARA'], generation: 'D23',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 2298, 'diesel', 163], ['2.3 dCi 4WD', 2298, 'diesel', 163], ['2.5 dCi', 2488, 'diesel', 174]],
  },
  // ──────────────────────────────────────────
  // HONDA
  // ──────────────────────────────────────────
  {
    make: 'HONDA', models: ['CIVIC VIII (FD, FA)', 'CIVIC IX (FB)', 'CIVIC X (FC, FK)', 'CIVIC XI (FL)', 'Civic', 'CIVIC'], generation: 'X',
    spec: '0w-20_honda-08221_c5',
    engines: [['', 1498, 'essence', 182], ['1.5 VTEC Turbo', 1498, 'essence', 182], ['1.0 VTEC Turbo', 988, 'essence', 129], ['1.6 i-DTEC', 1597, 'diesel', 120], ['1.8 i-VTEC', 1798, 'essence', 142]],
  },
  {
    make: 'HONDA', models: ['JAZZ II (GD)', 'JAZZ III (GE)', 'JAZZ IV (GK)', 'JAZZ V (GR)', 'Jazz', 'JAZZ'], generation: 'GK',
    spec: '0w-20_honda-08221_c5',
    engines: [['', 1317, 'essence', 102], ['1.3 (L13Z1)', 1317, 'essence', 102], ['1.5 i-VTEC', 1498, 'essence', 130]],
  },
  {
    make: 'HONDA', models: ['CR-V II (RD)', 'CR-V III (RE)', 'CR-V IV (RM)', 'CR-V V (RW)', 'CR-V', 'CRV'], generation: 'RW',
    spec: '0w-20_honda-08221_c5',
    engines: [['', 1498, 'essence', 193], ['1.5 VTEC Turbo', 1498, 'essence', 193], ['1.6 i-DTEC', 1597, 'diesel', 120], ['2.0 i-VTEC', 1997, 'essence', 155]],
  },
  {
    make: 'HONDA', models: ['HR-V II (RU)', 'HR-V (ZR)', 'HR-V', 'HRV'], generation: 'ZR',
    spec: '5w-30_honda-08w30_sn',
    engines: [['', 1496, 'essence', 130], ['1.5 i-VTEC', 1496, 'essence', 130], ['1.6 i-DTEC', 1597, 'diesel', 120]],
  },
  {
    make: 'HONDA', models: ['ACCORD VIII (CL)', 'ACCORD IX (CR)', 'Accord', 'ACCORD'], generation: 'CR',
    spec: '5w-30_honda-08w30_sn',
    engines: [['', 1997, 'essence', 156], ['2.0 (K20Z4)', 1997, 'essence', 156], ['2.2 i-DTEC', 2199, 'diesel', 180]],
  },
  // ──────────────────────────────────────────
  // MITSUBISHI
  // ──────────────────────────────────────────
  {
    make: 'MITSUBISHI', models: ['COLT VI (Z3_A, Z2_A)', 'Colt', 'COLT'], generation: 'VI',
    spec: '5w-30_mitsubishi-mz320757_c3',
    engines: [['', 1332, 'essence', 98], ['1.3 (4A90)', 1332, 'essence', 98], ['1.5 (4A91)', 1499, 'essence', 109]],
  },
  {
    make: 'MITSUBISHI', models: ['OUTLANDER II (CW_W)', 'OUTLANDER III (GF_W)', 'Outlander', 'OUTLANDER'], generation: 'III',
    spec: '5w-30_mitsubishi-mz320757_c3',
    engines: [['', 2268, 'diesel', 150], ['2.2 DI-D (4N14)', 2268, 'diesel', 150], ['2.0 (4J11)', 1998, 'essence', 150]],
  },
  {
    make: 'MITSUBISHI', models: ['L200 III (K7_T, K6_T)', 'L200 IV (KH_T)', 'L200 V (KJ_, KL_)', 'L200', 'TRITON'], generation: 'V',
    spec: '5w-30_mitsubishi-mz320757_c3',
    engines: [['', 2442, 'diesel', 154], ['2.4 DI-D (4N15)', 2442, 'diesel', 154], ['2.5 DI-D (4D56T)', 2477, 'diesel', 136]],
  },
  {
    make: 'MITSUBISHI', models: ['ASX (GA_W)', 'ASX'], generation: 'GA',
    spec: '5w-30_mitsubishi-mz320757_c3',
    engines: [['', 1590, 'essence', 117], ['1.6 (4A92)', 1590, 'essence', 117], ['2.2 DI-D', 2268, 'diesel', 150]],
  },
  // ──────────────────────────────────────────
  // SUBARU
  // ──────────────────────────────────────────
  {
    make: 'SUBARU', models: ['IMPREZA III (GE)', 'IMPREZA IV (G4)', 'IMPREZA V (G5)', 'Impreza', 'IMPREZA'], generation: 'IV',
    spec: '5w-30_subaru-soa_a3b4',
    engines: [['', 1995, 'essence', 150], ['2.0 (FB20B)', 1995, 'essence', 150], ['2.0 DIT Turbo', 1995, 'essence', 280]],
  },
  {
    make: 'SUBARU', models: ['FORESTER II (S10)', 'FORESTER III (S11)', 'FORESTER IV (SJ)', 'FORESTER V (SK)', 'Forester', 'FORESTER'], generation: 'SJ',
    spec: '5w-30_subaru-soa_a3b4',
    engines: [['', 1995, 'essence', 150], ['2.0 (FB20)', 1995, 'essence', 150], ['2.0 D (EE20Z)', 1998, 'diesel', 147]],
  },
  {
    make: 'SUBARU', models: ['OUTBACK III (BL, BP)', 'OUTBACK IV (BR)', 'OUTBACK V (BS)', 'Outback', 'OUTBACK'], generation: 'BS',
    spec: '5w-30_subaru-soa_a3b4',
    engines: [['', 2498, 'essence', 175], ['2.5 (FB25)', 2498, 'essence', 175], ['2.0 D (EE20Z)', 1998, 'diesel', 147]],
  },
  {
    make: 'SUBARU', models: ['XV I (GP)', 'XV II (GT)', 'XV', 'SUBARU XV'], generation: 'GT',
    spec: '5w-30_subaru-soa_a3b4',
    engines: [['', 1995, 'essence', 150], ['2.0 (FB20)', 1995, 'essence', 150]],
  },
  // ──────────────────────────────────────────
  // SUZUKI
  // ──────────────────────────────────────────
  {
    make: 'SUZUKI', models: ['SWIFT II (EZ)', 'SWIFT III (FZ, NZ)', 'SWIFT IV (AZ)', 'Swift', 'SWIFT'], generation: 'FZ',
    spec: '5w-30_suzuki-sls_sn',
    engines: [['', 1242, 'essence', 94], ['1.2 DUALJET', 1242, 'essence', 94], ['1.3 DDiS', 1248, 'diesel', 75], ['1.4 Boosterjet', 1373, 'essence', 140]],
  },
  {
    make: 'SUZUKI', models: ['VITARA II (LY)', 'GRAND VITARA II (JT)', 'SX4 S-Cross (JY)', 'Vitara', 'VITARA', 'Grand Vitara', 'S-Cross'], generation: 'LY',
    spec: '5w-30_suzuki-sls_sn',
    engines: [['', 1373, 'essence', 140], ['1.4 Boosterjet', 1373, 'essence', 140], ['1.6 DDiS', 1598, 'diesel', 120], ['1.6 VVT', 1586, 'essence', 120]],
  },
  {
    make: 'SUZUKI', models: ['JIMNY (FJ)', 'Jimny', 'JIMNY'], generation: 'FJ',
    spec: '5w-30_suzuki-sls_sn',
    engines: [['', 1460, 'essence', 102], ['1.5 (K15B)', 1460, 'essence', 102], ['1.3 (G13BB)', 1298, 'essence', 85]],
  },
  {
    make: 'SUZUKI', models: ['CELERIO (LF)', 'Celerio', 'CELERIO', 'ALTO (GF)', 'Alto'], generation: 'LF',
    spec: '5w-30_suzuki-sls_sn',
    engines: [['', 998, 'essence', 68], ['1.0 (K10C)', 998, 'essence', 68]],
  },
  // ──────────────────────────────────────────
  // LAND ROVER
  // ──────────────────────────────────────────
  {
    make: 'LAND ROVER', models: ['DISCOVERY SPORT (LC_)', 'DISCOVERY 4 (L319)', 'DISCOVERY 5 (L462)', 'Discovery', 'DISCOVERY'], generation: 'L462',
    spec: '5w-30_jlr-03-5006_c3',
    engines: [['', 1998, 'diesel', 150], ['2.0 SD4', 1998, 'diesel', 150], ['3.0 TDV6', 2993, 'diesel', 258]],
  },
  {
    make: 'LAND ROVER', models: ['RANGE ROVER EVOQUE (L538)', 'RANGE ROVER SPORT (L320)', 'RANGE ROVER SPORT (L494)', 'RANGE ROVER (L405)', 'Range Rover', 'RANGE ROVER', 'Range Rover Sport', 'Range Rover Evoque'], generation: 'L405',
    spec: '5w-30_jlr-03-5006_c3',
    engines: [['', 2993, 'diesel', 258], ['3.0 TDV6', 2993, 'diesel', 258], ['4.4 SDV8', 4367, 'diesel', 339]],
  },
  {
    make: 'LAND ROVER', models: ['FREELANDER 2 (LF_)', 'FREELANDER', 'Freelander 2'], generation: 'LF',
    spec: '5w-30_jlr-03-5006_c3',
    engines: [['', 2179, 'diesel', 160], ['2.2 TD4', 2179, 'diesel', 160], ['2.0 Si4', 1997, 'essence', 240]],
  },
  {
    make: 'LAND ROVER', models: ['DEFENDER 90 (L316)', 'DEFENDER 110 (L316)', 'DEFENDER (L663)', 'Defender', 'DEFENDER'], generation: 'L663',
    spec: '5w-30_jlr-03-5006_c3',
    engines: [['', 1997, 'diesel', 200], ['D200', 1997, 'diesel', 200], ['D240', 2997, 'diesel', 240], ['P400', 2996, 'essence', 400]],
  },
  // ──────────────────────────────────────────
  // JAGUAR
  // ──────────────────────────────────────────
  {
    make: 'JAGUAR', models: ['XE (X760)', 'Jaguar XE', 'XE'], generation: 'X760',
    spec: '5w-30_jlr-03-5006_c3',
    engines: [['', 1999, 'diesel', 163], ['2.0 D (204DTD)', 1999, 'diesel', 163], ['2.0 (204PT)', 1997, 'essence', 250]],
  },
  {
    make: 'JAGUAR', models: ['F-PACE (X761)', 'Jaguar F-Pace', 'F-Pace'], generation: 'X761',
    spec: '5w-30_jlr-03-5006_c3',
    engines: [['', 1999, 'diesel', 163], ['2.0 D180', 1999, 'diesel', 180], ['2.0 P300', 1997, 'essence', 300]],
  },
  // ──────────────────────────────────────────
  // PORSCHE
  // ──────────────────────────────────────────
  {
    make: 'PORSCHE', models: ['CAYENNE (9PA)', 'CAYENNE II (92A)', 'CAYENNE III (9YA)', 'Cayenne', 'CAYENNE'], generation: '9YA',
    spec: '0w-40_porsche-c30_a3b4',
    engines: [['', 2894, 'essence', 340], ['3.0 V6', 2894, 'essence', 340], ['3.0 E-Hybrid', 2894, 'essence', 462]],
  },
  {
    make: 'PORSCHE', models: ['MACAN (95B)', 'Macan', 'MACAN'], generation: '95B',
    spec: '0w-40_porsche-c30_a3b4',
    engines: [['', 1998, 'diesel', 211], ['2.0 PDK', 1984, 'essence', 252], ['S 3.0 V6', 2995, 'essence', 354]],
  },
  {
    make: 'PORSCHE', models: ['911 (991)', '911 (992)', '911', 'PORSCHE 911'], generation: '992',
    spec: '0w-40_porsche-c30_a3b4',
    engines: [['', 2981, 'essence', 450], ['Carrera', 2981, 'essence', 450], ['Carrera S', 2981, 'essence', 450]],
  },
  // ──────────────────────────────────────────
  // CHEVROLET
  // ──────────────────────────────────────────
  {
    make: 'CHEVROLET', models: ['AVEO / KALOS (T250, T255)', 'AVEO (T300)', 'Aveo', 'AVEO', 'Kalos'], generation: 'T300',
    spec: '5w-30_gm-dexos1_sn',
    engines: [['', 1248, 'essence', 86], ['1.2 (B12D1)', 1248, 'essence', 86], ['1.4 (B14NET)', 1364, 'essence', 101], ['1.3 D (Z13DTJ)', 1248, 'diesel', 75]],
  },
  {
    make: 'CHEVROLET', models: ['CRUZE (J300)', 'CRUZE (J400)', 'Cruze', 'CRUZE'], generation: 'J300',
    spec: '5w-30_gm-dexos1_sn',
    engines: [['', 1998, 'diesel', 163], ['2.0 VCDi (Z20DMH)', 1998, 'diesel', 163], ['1.4 Turbo', 1364, 'essence', 140]],
  },
  {
    make: 'CHEVROLET', models: ['SPARK (M300)', 'SPARK (M400)', 'Spark', 'SPARK'], generation: 'M300',
    spec: '5w-30_gm-dexos1_sn',
    engines: [['', 996, 'essence', 68], ['1.0 (B10S)', 996, 'essence', 68], ['1.2 (B12D1)', 1199, 'essence', 80]],
  },
  // ──────────────────────────────────────────
  // DS AUTOMOBILES
  // ──────────────────────────────────────────
  {
    make: 'DS', models: ['DS 3 (A5)', 'DS 3 Crossback (U65)', 'DS 3', 'DS3'], generation: 'A5',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [['', 1199, 'essence', 130], ['PureTech 130', 1199, 'essence', 130], ['BlueHDi 100', 1499, 'diesel', 102]],
  },
  {
    make: 'DS', models: ['DS 4 (E35)', 'DS 4 Crossback', 'DS 4', 'DS4'], generation: 'E35',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [['', 1598, 'diesel', 120], ['BlueHDi 120', 1560, 'diesel', 120], ['PureTech 180', 1598, 'essence', 180]],
  },
  {
    make: 'DS', models: ['DS 7 Crossback (X74)', 'DS 7', 'DS7'], generation: 'X74',
    spec: '5w-30_psa-b71-2290_c2',
    engines: [['', 1997, 'diesel', 180], ['BlueHDi 180', 1997, 'diesel', 180], ['PureTech 225', 1598, 'essence', 225]],
  },
  // ──────────────────────────────────────────
  // SSANGYONG
  // ──────────────────────────────────────────
  {
    make: 'SSANGYONG', models: ['TIVOLI (X100)', 'Tivoli', 'TIVOLI'], generation: 'X100',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 1597, 'essence', 128], ['1.6 (G16D)', 1597, 'essence', 128], ['1.6 D e-XDi', 1597, 'diesel', 115]],
  },
  {
    make: 'SSANGYONG', models: ['KORANDO III (C200)', 'KORANDO IV (C300)', 'Korando', 'KORANDO'], generation: 'C200',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 1998, 'diesel', 175], ['2.0 e-XDi', 1998, 'diesel', 175], ['1.5 T-GDi', 1497, 'essence', 163]],
  },
  // ──────────────────────────────────────────
  // MG
  // ──────────────────────────────────────────
  {
    make: 'MG', models: ['MG3 (SH)', 'MG 3', 'MG3'], generation: 'SH',
    spec: '5w-30_chinese-api-sn_a3b4',
    engines: [['', 1498, 'essence', 109], ['1.5 VTi', 1498, 'essence', 109]],
  },
  {
    make: 'MG', models: ['MG ZS (AZ)', 'MG ZS EV', 'MG ZS'], generation: 'AZ',
    spec: '5w-30_chinese-api-sn_a3b4',
    engines: [['', 1490, 'essence', 111], ['1.5 VTi-Tech', 1490, 'essence', 111]],
  },
  {
    make: 'MG', models: ['MG HS (APC)', 'MG HS', 'MG5'], generation: 'APC',
    spec: '5w-30_chinese-api-sn_a3b4',
    engines: [['', 1490, 'essence', 162], ['1.5T (15S4H)', 1490, 'essence', 162]],
  },
  // ──────────────────────────────────────────
  // HAVAL
  // ──────────────────────────────────────────
  {
    make: 'HAVAL', models: ['JOLION (HM)', 'H6 (B06)', 'H2 (HG)', 'Jolion', 'H6', 'H2'], generation: 'HM',
    spec: '5w-30_chinese-api-sn_a3b4',
    engines: [['', 1497, 'essence', 150], ['1.5T (GW4G15)', 1497, 'essence', 150], ['2.0T', 1996, 'essence', 190]],
  },
  // ──────────────────────────────────────────
  // GEELY
  // ──────────────────────────────────────────
  {
    make: 'GEELY', models: ['EMGRAND (EC7)', 'ATLAS (NL-3)', 'Emgrand EC7', 'Atlas', 'EMGRAND', 'ATLAS'], generation: 'NL-3',
    spec: '5w-30_chinese-api-sn_a3b4',
    engines: [['', 1498, 'essence', 109], ['1.5 (JLy-4G15B)', 1498, 'essence', 109], ['2.0 (JL486ZQ)', 1997, 'essence', 139]],
  },
  // ──────────────────────────────────────────
  // LADA
  // ──────────────────────────────────────────
  {
    make: 'LADA', models: ['VESTA (GFL11)', 'Vesta', 'VESTA'], generation: 'GFL11',
    spec: '10w-40_lada-api-sl_a3b4',
    engines: [['', 1596, 'essence', 113], ['1.6 (21129)', 1596, 'essence', 113], ['1.8 (21179)', 1774, 'essence', 122]],
  },
  {
    make: 'LADA', models: ['LARGUS (FS015R)', 'Largus', 'LARGUS'], generation: 'FS015R',
    spec: '10w-40_lada-api-sl_a3b4',
    engines: [['', 1596, 'essence', 102], ['1.6 (K4M)', 1596, 'essence', 102]],
  },
  {
    make: 'LADA', models: ['GRANTA (2190)', 'PRIORA (2170)', 'KALINA (1119)', 'Granta', 'Priora', 'Kalina', 'NIVA (2121)', 'Niva'], generation: '2190',
    spec: '10w-40_lada-api-sl_a3b4',
    engines: [['', 1596, 'essence', 98], ['1.6 (11186)', 1596, 'essence', 98], ['1.6 (21126)', 1596, 'essence', 106]],
  },
  // ──────────────────────────────────────────
  // LEXUS
  // ──────────────────────────────────────────
  {
    make: 'LEXUS', models: ['IS III (XE30)', 'IS II (XE20)', 'IS'], generation: 'XE30',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 1998, 'diesel', 150], ['200d', 1998, 'diesel', 150], ['300h', 2499, 'essence', 223]],
  },
  {
    make: 'LEXUS', models: ['NX I (AZ10)', 'NX II (AZ20)', 'NX'], generation: 'AZ10',
    spec: '0w-20_asian-toyota-sn',
    engines: [['', 1998, 'essence', 211], ['NX 200t', 1998, 'essence', 238], ['NX 300h', 2494, 'essence', 197]],
  },
  {
    make: 'LEXUS', models: ['RX III (AL10)', 'RX IV (AL20)', 'RX V (AL30)', 'RX'], generation: 'AL20',
    spec: '0w-20_asian-toyota-sn',
    engines: [['', 2494, 'essence', 300], ['RX 450h', 3456, 'essence', 313], ['RX 350', 3456, 'essence', 277]],
  },
  // ──────────────────────────────────────────
  // INFINITI
  // ──────────────────────────────────────────
  {
    make: 'INFINITI', models: ['Q30 (H15)', 'Q50 (V37)', 'QX60 (L50)', 'Q30', 'Q50', 'QX60'], generation: 'V37',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [['', 1991, 'diesel', 170], ['2.2d', 1991, 'diesel', 170], ['3.5 Hybrid V6', 3498, 'essence', 364]],
  },
  // ──────────────────────────────────────────
  // MINI
  // ──────────────────────────────────────────
  {
    make: 'MINI',
    models: [
      'MINI (R50, R53)', 'MINI (R56)', 'MINI (F55, F56)', 'MINI Clubman (R55)', 'MINI Clubman (F54)',
      'MINI Countryman (R60)', 'MINI Countryman (F60)', 'MINI', 'Mini', 'Mini Cooper', 'Cooper',
    ],
    generation: 'F56',
    spec: '5w-30_bmw-ll04_c3',
    engines: [
      ['', 1499, 'essence', 136],
      ['Cooper', 1499, 'essence', 136],
      ['Cooper S', 1998, 'essence', 192],
      ['Cooper D', 1496, 'diesel', 116],
      ['One', 1499, 'essence', 102],
      ['One D', 1496, 'diesel', 95],
    ],
  },
  // ──────────────────────────────────────────
  // CUPRA
  // ──────────────────────────────────────────
  {
    make: 'CUPRA',
    models: [
      'FORMENTOR (KM7)', 'LEON (KL1)', 'ATECA (KH7)', 'BORN (K11)',
      'Formentor', 'Leon', 'Ateca', 'Cupra Formentor', 'Cupra Leon', 'Cupra Ateca', 'CUPRA',
    ],
    generation: 'KM7',
    spec: '5w-30_vw-50400-50700_c3',
    engines: [
      ['', 1984, 'essence', 310],
      ['1.5 TSI', 1498, 'essence', 150],
      ['2.0 TSI', 1984, 'essence', 190],
      ['2.0 TSI 4Drive', 1984, 'essence', 310],
      ['1.4 e-HYBRID', 1395, 'essence', 204],
      ['2.0 TDI', 1968, 'diesel', 150],
    ],
  },
  // ──────────────────────────────────────────
  // SMART
  // ──────────────────────────────────────────
  {
    make: 'SMART',
    models: [
      'FORTWO Coupe (450)', 'FORTWO Coupe (451)', 'FORTWO Coupe (453)',
      'FORFOUR (454)', 'FORFOUR (453)', 'Fortwo', 'Forfour', 'Smart Fortwo', 'Smart Forfour', 'SMART',
    ],
    generation: '453',
    spec: '5w-30_mb-22951_c3',
    engines: [
      ['', 999, 'essence', 71],
      ['1.0', 999, 'essence', 71],
      ['0.9 Turbo', 898, 'essence', 90],
      ['0.8 CDI', 799, 'diesel', 45],
    ],
  },
  // ──────────────────────────────────────────
  // ISUZU
  // ──────────────────────────────────────────
  {
    make: 'ISUZU',
    models: [
      'D-MAX I (TFR, TFS)', 'D-MAX II (TFR, TFS)', 'D-MAX III (RG01)',
      'D-Max', 'D-MAX', 'DMAX', 'KB', 'ISUZU',
    ],
    generation: 'TFR',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [
      ['', 2499, 'diesel', 136],
      ['2.5 Ddi', 2499, 'diesel', 136],
      ['3.0 Ddi', 2999, 'diesel', 163],
      ['1.9 Ddi', 1898, 'diesel', 163],
      ['2.5 DiTD', 2499, 'diesel', 101],
    ],
  },
  // ──────────────────────────────────────────
  // MAHINDRA
  // ──────────────────────────────────────────
  {
    make: 'MAHINDRA',
    models: [
      'KUV100', 'XUV500', 'XUV300', 'SCORPIO', 'BOLERO', 'THAR',
      'KUV 100', 'XUV 500', 'XUV 300', 'Scorpio', 'Bolero', 'Thar', 'MAHINDRA',
    ],
    generation: 'I',
    spec: '5w-30_asian-toyota-c2c3',
    engines: [
      ['', 1198, 'essence', 82],
      ['1.2 mFalcon G80', 1198, 'essence', 82],
      ['1.2 mFalcon D75', 1198, 'diesel', 77],
      ['2.2 mHawk', 2179, 'diesel', 140],
      ['2.5 D', 2498, 'diesel', 63],
    ],
  },
  // ──────────────────────────────────────────
  // CHERY
  // ──────────────────────────────────────────
  {
    make: 'CHERY',
    models: [
      'TIGGO 2', 'TIGGO 3', 'TIGGO 4', 'TIGGO 7', 'TIGGO 8',
      'ARRIZO 5', 'ARRIZO 6', 'QQ', 'QQ3',
      'Tiggo 2', 'Tiggo 3', 'Tiggo 7', 'Tiggo 8', 'Arrizo 5', 'Tiggo', 'Arrizo', 'CHERY',
    ],
    generation: 'I',
    spec: '5w-30_chinese-api-sn_a3b4',
    engines: [
      ['', 1497, 'essence', 106],
      ['1.5', 1497, 'essence', 106],
      ['1.5 Turbo', 1498, 'essence', 147],
      ['1.6', 1598, 'essence', 126],
      ['1.6 TGDI', 1598, 'essence', 197],
      ['1.1', 1083, 'essence', 68],
    ],
  },
  // ──────────────────────────────────────────
  // DFSK
  // ──────────────────────────────────────────
  {
    make: 'DFSK',
    models: [
      'GLORY 580', 'GLORY 560', 'GLORY IX5', 'K01', 'K02', 'V21', 'V22',
      'Glory 580', 'Glory 560', 'Glory', 'K01H', 'DFSK',
    ],
    generation: 'I',
    spec: '5w-30_chinese-api-sn_a3b4',
    engines: [
      ['', 1498, 'essence', 150],
      ['1.5 Turbo', 1498, 'essence', 150],
      ['1.8', 1798, 'essence', 139],
      ['1.2', 1205, 'essence', 88],
      ['1.3', 1310, 'essence', 82],
    ],
  },
  // ──────────────────────────────────────────
  // GREAT WALL
  // ──────────────────────────────────────────
  {
    make: 'GREAT WALL',
    models: [
      'STEED 5', 'STEED 6', 'WINGLE 5', 'WINGLE 6', 'WINGLE 7',
      'POER', 'HAVAL H6', 'Steed', 'Wingle', 'GREAT WALL',
    ],
    generation: 'I',
    spec: '5w-30_chinese-api-sn_a3b4',
    engines: [
      ['', 1996, 'diesel', 143],
      ['2.0 TD', 1996, 'diesel', 143],
      ['2.0 TCi', 1996, 'diesel', 150],
      ['2.4', 2378, 'essence', 126],
    ],
  },
  // ──────────────────────────────────────────
  // BYD
  // ──────────────────────────────────────────
  {
    make: 'BYD',
    models: [
      'F3', 'F0', 'ATTO 3', 'DOLPHIN', 'SEAL', 'SONG', 'TANG', 'HAN', 'F3 (F3R)', 'BYD',
    ],
    generation: 'I',
    spec: '5w-30_chinese-api-sn_a3b4',
    engines: [
      ['', 1497, 'essence', 109],
      ['1.5 (BYD473QE)', 1497, 'essence', 109],
      ['1.5 T', 1497, 'essence', 154],
      ['1.0', 998, 'essence', 68],
    ],
  },
  // ──────────────────────────────────────────
  // IVECO
  // ──────────────────────────────────────────
  {
    make: 'IVECO',
    models: [
      'DAILY III', 'DAILY IV', 'DAILY V', 'DAILY VI', 'Daily', 'DAILY',
    ],
    generation: 'VI',
    spec: '5w-30_fiat-955535-s1_c2',
    engines: [
      ['', 2287, 'diesel', 126],
      ['2.3 HPI (F1AE)', 2287, 'diesel', 126],
      ['3.0 HPI (F1CE)', 2998, 'diesel', 170],
      ['35C15 / 35S15', 2998, 'diesel', 146],
      ['35C13 / 35S13', 2287, 'diesel', 126],
    ],
  },
];

const ALL_VEHICLE_GROUPS = [...VEHICLE_GROUPS, ...EXTRA_VEHICLE_GROUPS];

// ── 3. BUILD SQL STATEMENTS ──────────────────────────────────────────────────
let sql = `-- ============================================================================
-- SPEC-PART: COMPREHENSIVE ALL-BRANDS VEHICLE SEED SCRIPT (PRODUCTION)
-- Covers: VW, Audi, Seat, Skoda, Cupra, Peugeot, Citroën, DS, Renault, Dacia,
--         Opel/Vauxhall, Fiat, Alfa Romeo, Lancia, Jeep, Ford, BMW, Mini,
--         Mercedes-Benz, Smart, Volvo, Mazda, Toyota, Hyundai, Kia, Nissan,
--         Honda, Mitsubishi, Subaru, Suzuki, Land Rover, Jaguar, Porsche,
--         Chevrolet, Ssangyong, MG, Haval, Geely, Chery, DFSK, Great Wall,
--         Mahindra, Isuzu, BYD, Lada, Lexus, Infiniti, Iveco
-- ============================================================================

BEGIN;

-- 1. Ensure all standard OEM specifications exist in OilFinderOilSpec
INSERT INTO "OilFinderOilSpec" (
  id, fingerprint, viscosity, "apiStandard", "aceaStandard", "oemApproval",
  "capacityLiters", "changeIntervalKm"
)
VALUES
`;

const specValues = SPECS.map((s) => {
  return `  (gen_random_uuid()::text, '${s.fingerprint}', '${s.viscosity}', ${s.api ? `'${s.api}'` : 'NULL'}, ${s.acea ? `'${s.acea}'` : 'NULL'}, '${s.oem}', ${s.capacity}, ${s.interval})`;
}).join(',\n');

sql += specValues + `
ON CONFLICT (fingerprint) DO UPDATE SET
  viscosity = EXCLUDED.viscosity,
  "apiStandard" = EXCLUDED."apiStandard",
  "aceaStandard" = EXCLUDED."aceaStandard",
  "oemApproval" = EXCLUDED."oemApproval",
  "capacityLiters" = EXCLUDED."capacityLiters",
  "changeIntervalKm" = EXCLUDED."changeIntervalKm";

-- 2. Insert all popular vehicle models and engine variants
`;

let vehicleInsertCount = 0;

ALL_VEHICLE_GROUPS.forEach((group, gIdx) => {
  const cteName = `spec_${gIdx}`;
  sql += `\n-- ── ${group.make} (${group.models[0]}) ──\n`;
  sql += `WITH ${cteName} AS (\n  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '${group.spec}' LIMIT 1\n)\n`;
  sql += `INSERT INTO "OilFinderVehicle" (\n  id, category, make, model, generation, "engineCode",\n  "displacementCc", "fuelType", "powerHp", "oilSpecId",\n  source, confidence\n)\n`;
  sql += `SELECT\n  gen_random_uuid()::text,\n  'automobile',\n  v.make,\n  v.model,\n  v.generation,\n  v.engine_code,\n  v.disp,\n  v.fuel,\n  v.hp,\n  ${cteName}.id,\n  'SpecPart OEM Catalogue Homologations',\n  'high'\nFROM ${cteName}, (VALUES\n`;

  const rows = [];
  group.models.forEach((m) => {
    group.engines.forEach(([eng, disp, fuel, hp]) => {
      rows.push(`  ('${group.make.replace(/'/g, "''")}', '${m.replace(/'/g, "''")}', '${group.generation.replace(/'/g, "''")}', '${String(eng).replace(/'/g, "''")}', ${disp}, '${fuel}', ${hp})`);
      vehicleInsertCount++;
    });
  });

  sql += rows.join(',\n') + '\n';
  sql += `) AS v(make, model, generation, engine_code, disp, fuel, hp)\n`;
  sql += `ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;\n`;
});

sql += `
COMMIT;

-- 3. Verification report of seeded models and catalog availability
SELECT 
  v.make,
  count(DISTINCT v.model) AS "Distinct Models",
  count(*) AS "Total Trims / Variants",
  s.viscosity AS "Standard Viscosity",
  s."oemApproval" AS "Homologation"
FROM "OilFinderVehicle" v
JOIN "OilFinderOilSpec" s ON s.id = v."oilSpecId"
WHERE v.source = 'SpecPart OEM Catalogue Homologations'
GROUP BY v.make, s.viscosity, s."oemApproval"
ORDER BY v.make ASC;
`;

const outputPath = path.resolve(__dirname, 'seed-popular-vehicles.sql');
fs.writeFileSync(outputPath, sql, 'utf8');

console.log(`Generated ${outputPath}`);
console.log(`Specs defined: ${SPECS.length}`);
console.log(`Vehicle groups: ${ALL_VEHICLE_GROUPS.length}`);
console.log(`Total vehicle variant rows generated: ${vehicleInsertCount}`);

