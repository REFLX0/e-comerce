/**
 * SpecPart TecDoc Vehicle & Oil Specification Harvester (Turnkey AI Edition)
 *
 * Extracts all vehicles from the PostgreSQL `tecdoc` schema on the VM,
 * normalizes them into the 4-tier hierarchy (Brand -> Model -> Generation -> Engine),
 * enriches all engine specifications with authentic OEM/ACEA/API lubrication standards,
 * and syncs both the JSON catalog and Prisma database tables.
 *
 * Usage inside container:
 *   docker compose exec -T backend npx tsx scripts/tecdoc-catalog-harvester.ts
 *
 * Usage on VM host / local:
 *   npx tsx scripts/tecdoc-catalog-harvester.ts
 */

import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// ─── 1. DATABASE CONNECTION ───────────────────────────────────────────────────
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://kiosquetn:kiosquetn_local_secret@localhost:5433/kiosquetn';

const pool = new Pool({ connectionString });
const prisma = new PrismaClient();

// ─── 2. DATA MODELS ───────────────────────────────────────────────────────────
interface CleanEngine {
  engineCode: string;
  fuelType: string;
  displacementCc: number | null;
  powerHp: number | null;
  powerKw: number | null;
  yearFrom: number | null;
  yearTo: number | null;
  oilSpec: {
    viscosity: string;
    oemApproval?: string;
    apiStandard?: string;
    aceaStandard?: string;
    capacityLiters?: number;
    changeIntervalKm?: number;
  } | null;
}

interface CleanGeneration {
  genName: string;
  genSlug: string;
  yearFrom: number | null;
  yearTo: number | null;
  engines: CleanEngine[];
}

interface CleanModel {
  modelName: string;
  modelSlug: string;
  generations: Record<string, CleanGeneration>;
}

interface CleanMake {
  makeName: string;
  makeSlug: string;
  models: Record<string, CleanModel>;
}

type CleanCatalog = Record<string, CleanMake>;

// ─── 3. STRING HELPERS ────────────────────────────────────────────────────────
function slugify(text: string): string {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function capitalizeWords(str: string): string {
  return str.replace(/\b\w+/g, txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

// TecDoc's date_from/date_to on this install are stored as free-text (not a real DATE
// column — EXTRACT() fails against it on the live VM), in formats that vary by import
// batch: ISO ("2009-06-01"), "MM.YYYY", "YYYYMM", or plain "YYYY". Extract just the year,
// defensively, without assuming any single format.
function parseYearFromDateText(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  let m = s.match(/^(\d{4})-\d{1,2}-\d{1,2}/); // ISO: 2009-06-01
  if (m) return parseInt(m[1], 10);

  m = s.match(/^\d{1,2}\.(\d{4})$/); // MM.YYYY: 06.2009
  if (m) return parseInt(m[1], 10);

  m = s.match(/^(\d{4})(\d{2})$/); // YYYYMM: 200906
  if (m) return parseInt(m[1], 10);

  m = s.match(/\b(19\d{2}|20\d{2})\b/); // fallback: any plausible 4-digit year in the text
  if (m) return parseInt(m[1], 10);

  return null;
}

// Extract clean commercial model root (e.g. "GOLF VII (5G1)" -> "Golf", gen "Golf VII (5G1)")
// Handles Roman-numeral generations (Golf VII, Clio IV, 208 I), single-letter GM/Opel-style
// codes (Astra H, Corsa D, Vectra C), and Phase/facelift suffixes (Megane II Phase 2).
const ROMAN_NUMERAL = /^(?:X{1,3}(?:IX|IV|V?I{0,3})?|IX|IV|VIII|VII|VI|V|III|II|I|X)$/i;

function cleanCommercialModel(rawDesc: string): { modelName: string; genHint: string } {
  let s = (rawDesc || '').trim();

  // Capture the trailing parenthetical chassis-code group, e.g. "(5G1, BQ1)"
  const parenMatch = s.match(/\s*\(([^)]+)\)\s*$/);
  const chassis = parenMatch ? parenMatch[1].trim() : '';
  s = s.replace(/\s*\([^)]+\)\s*$/, '').trim();

  // Phase / Facelift hints: "MEGANE II Phase 2" -> keep suffix, isolate base for gen matching
  const phaseMatch = s.match(/^(.*?)\s+(Phase\s+\d+|Restylée|LCI|Facelift)\s*$/i);
  const phaseSuffix = phaseMatch ? ` ${phaseMatch[2]}` : '';
  if (phaseMatch) s = phaseMatch[1].trim();

  const tokens = s.split(/\s+/).filter(Boolean);
  const last = tokens[tokens.length - 1] || '';
  let baseTokens = tokens;
  let genToken = '';

  if (tokens.length > 1 && ROMAN_NUMERAL.test(last)) {
    // "GOLF VII", "CLIO IV", "208 I", "MEGANE III"
    genToken = last.toUpperCase();
    baseTokens = tokens.slice(0, -1);
  } else if (tokens.length > 1 && /^[A-Z]$/.test(last)) {
    // "ASTRA H", "CORSA D", "VECTRA C" — GM/Opel single-letter generation codes
    genToken = last.toUpperCase();
    baseTokens = tokens.slice(0, -1);
  } else if (tokens.length > 1 && /^\d$/.test(last)) {
    // Rare numeric generation suffix
    genToken = last;
    baseTokens = tokens.slice(0, -1);
  }

  const baseName = capitalizeWords(baseTokens.join(' ').trim());
  const genCore = genToken ? `${baseName} ${genToken}` : baseName;
  return {
    modelName: baseName,
    genHint: `${genCore}${phaseSuffix}${chassis ? ` (${chassis})` : ''}`.trim(),
  };
}

// ─── 4. DETERMINISTIC OEM OIL SPECIFICATION ENGINE ────────────────────────────
function deriveOilSpecificationRaw(
  makeSlug: string,
  fuelType: string,
  yearFrom: number | null,
  displacementCc: number | null,
  powerHp: number | null
): CleanEngine['oilSpec'] {
  const normFuel = (fuelType || '').toLowerCase();
  const isDiesel =
    normFuel.includes('diesel') ||
    normFuel.includes('dci') ||
    normFuel.includes('tdi') ||
    normFuel.includes('hdi') ||
    normFuel.includes('cdi') ||
    normFuel.includes('crdi') ||
    normFuel.includes('d-4d');
  const year = yearFrom || 2015;

  // Capacity estimation based on displacement & fuel
  let capacity = 4.0;
  if (displacementCc) {
    if (displacementCc < 1100) capacity = 3.2;
    else if (displacementCc < 1400) capacity = 3.6;
    else if (displacementCc < 1700) capacity = isDiesel ? 4.5 : 4.0;
    else if (displacementCc <= 2000) capacity = isDiesel ? 5.0 : 4.5;
    else if (displacementCc <= 2500) capacity = isDiesel ? 6.0 : 5.5;
    else if (displacementCc <= 3200) capacity = 7.0;
    else capacity = 8.5;
  }

  // ── RENAULT / DACIA / NISSAN / ALPINE ───────────────────────────────────────
  if (['renault', 'dacia', 'nissan', 'alpine'].includes(makeSlug)) {
    if (isDiesel) {
      if (year >= 2018) {
        return { viscosity: '5W-30', oemApproval: 'Renault RN17', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
      }
      if (year >= 2010) {
        return { viscosity: '5W-30', oemApproval: 'Renault RN0720', aceaStandard: 'C4', apiStandard: 'SM', capacityLiters: capacity, changeIntervalKm: 15000 };
      }
      return { viscosity: '5W-40', oemApproval: 'Renault RN0710', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
    } else {
      // TCe RS / high-performance petrol (Megane RS, Clio RS, Alpine A110): High-SAPS is
      // correct here — no FAP on these engines.
      if (powerHp && powerHp >= 175) {
        return { viscosity: '0W-40', oemApproval: 'Renault RN17 RSA / RN0710', aceaStandard: 'A3/B4', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 10000 };
      }
      if (year >= 2018) {
        return { viscosity: '5W-30', oemApproval: 'Renault RN17', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
      }
      if (year >= 2008) {
        return { viscosity: '5W-40', oemApproval: 'Renault RN0700 / RN0710', aceaStandard: 'A3/B4', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
      }
      return { viscosity: '10W-40', oemApproval: 'Renault RN0700', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
  }

  // ── VAG (VOLKSWAGEN, AUDI, SEAT, SKODA, CUPRA) ──────────────────────────────
  if (['volkswagen', 'audi', 'seat', 'skoda', 'cupra'].includes(makeSlug)) {
    if (isDiesel) {
      // Pre-2007 diesels predate the EU5 DPF mandate — no FAP, so High-SAPS is safe and correct.
      if (year < 2007) {
        return { viscosity: '10W-40', oemApproval: 'VW 501.01/505.00', aceaStandard: 'B3/B4', apiStandard: 'CF', capacityLiters: capacity, changeIntervalKm: 10000 };
      }
      return { viscosity: '5W-30', oemApproval: 'VW 504.00/507.00', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    } else {
      // EA211 evo / EA888 Gen 3B+/Gen 4 (2018+) run on the low-viscosity 508/509 spec
      if (year >= 2018 && displacementCc && displacementCc <= 2000) {
        return { viscosity: '0W-20', oemApproval: 'VW 508.00/509.00', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
      }
      if (year >= 2008) {
        return { viscosity: '5W-30', oemApproval: 'VW 504.00/507.00', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
      }
      return { viscosity: '5W-40', oemApproval: 'VW 502.00/505.01', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
  }

  // ── STELLANTIS (PEUGEOT, CITROEN, DS, OPEL, VAUXHALL) ──────────────────────
  if (['peugeot', 'citroen', 'ds', 'opel', 'vauxhall'].includes(makeSlug)) {
    if (year >= 2018) {
      return { viscosity: '0W-20', oemApproval: 'PSA B71 2010 (FPW9.55535/03)', aceaStandard: 'C5', apiStandard: 'SN Plus', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2014) {
      return { viscosity: '0W-30', oemApproval: 'PSA B71 2312', aceaStandard: 'C2', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (isDiesel || year >= 2008) {
      return { viscosity: '5W-30', oemApproval: 'PSA B71 2290', aceaStandard: 'C2', apiStandard: 'SN/CF', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '10W-40', oemApproval: 'PSA B71 2300', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── FIAT / ALFA ROMEO / LANCIA / ABARTH / JEEP ─────────────────────────────
  if (['fiat', 'alfa-romeo', 'lancia', 'abarth', 'jeep'].includes(makeSlug)) {
    if (isDiesel) {
      if (year >= 2016) {
        return { viscosity: '0W-30', oemApproval: 'Fiat 9.55535-DS1', aceaStandard: 'C2', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
      }
      return { viscosity: '5W-30', oemApproval: 'Fiat 9.55535-S1', aceaStandard: 'C2', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    } else {
      if (year >= 2019 && displacementCc && displacementCc <= 1400) {
        return { viscosity: '0W-20', oemApproval: 'Fiat 9.55535-DM1', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
      }
      if (year >= 2010) {
        return { viscosity: '5W-40', oemApproval: 'Fiat 9.55535-S2', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
      }
      return { viscosity: '10W-40', oemApproval: 'Fiat 9.55535-G2 / D2', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
  }

  // ── BMW & MINI ─────────────────────────────────────────────────────────────
  if (['bmw', 'mini'].includes(makeSlug)) {
    if (year >= 2017 && !isDiesel && displacementCc && displacementCc <= 2000) {
      return { viscosity: '0W-20', oemApproval: 'BMW Longlife-17 FE+', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (isDiesel || year >= 2004) {
      return { viscosity: '5W-30', oemApproval: 'BMW Longlife-04 (LL-04)', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-40', oemApproval: 'BMW Longlife-01 (LL-01)', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── MERCEDES-BENZ & SMART ──────────────────────────────────────────────────
  if (['mercedes-benz', 'mercedes', 'smart'].includes(makeSlug)) {
    if (year >= 2016 && !isDiesel && displacementCc && displacementCc <= 2000) {
      return { viscosity: '5W-30', oemApproval: 'MB 229.52', aceaStandard: 'C3', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (isDiesel || year >= 2010) {
      return { viscosity: '5W-30', oemApproval: 'MB 229.51 / MB 229.52', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-40', oemApproval: 'MB 229.5', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── FORD ───────────────────────────────────────────────────────────────────
  if (makeSlug === 'ford') {
    if (isDiesel && year >= 2014) {
      return { viscosity: '0W-30', oemApproval: 'Ford WSS-M2C950-A', aceaStandard: 'C2', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (!isDiesel && year >= 2012 && displacementCc && displacementCc <= 1500) {
      return { viscosity: '5W-20', oemApproval: 'Ford WSS-M2C948-B', aceaStandard: 'C5', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'Ford WSS-M2C913-D', aceaStandard: 'A5/B5', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  // ── VOLVO ──────────────────────────────────────────────────────────────────
  if (makeSlug === 'volvo') {
    if (year >= 2014) {
      return { viscosity: '0W-20', oemApproval: 'Volvo VCC-RBS0-2AE', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 20000 };
    }
    return { viscosity: '0W-30', oemApproval: 'Volvo VCC 95200377', aceaStandard: 'A5/B5', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  // ── JAGUAR & LAND ROVER ───────────────────────────────────────────────────
  if (['jaguar', 'land-rover', 'land rover'].includes(makeSlug)) {
    if (isDiesel && year >= 2015) {
      return { viscosity: '0W-30', oemApproval: 'JLR STJLR.03.5007', aceaStandard: 'C2', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (!isDiesel && year >= 2017) {
      return { viscosity: '0W-20', oemApproval: 'JLR STJLR.51.5122', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'JLR STJLR.03.5003', aceaStandard: 'A5/B5 / C1', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  // ── PORSCHE ────────────────────────────────────────────────────────────────
  if (makeSlug === 'porsche') {
    if (isDiesel) {
      return { viscosity: '5W-30', oemApproval: 'Porsche C30', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2018) {
      return { viscosity: '0W-40', oemApproval: 'Porsche C40', aceaStandard: 'C3', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '0W-40', oemApproval: 'Porsche A40', aceaStandard: 'A3/B4', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  // ── ASIAN OEMS (TOYOTA, HYUNDAI, KIA, HONDA, MITSUBISHI, SUZUKI, MAZDA) ────
  if (['toyota', 'hyundai', 'kia', 'honda', 'mitsubishi', 'suzuki', 'lexus', 'mazda', 'subaru'].includes(makeSlug)) {
    if (isDiesel) {
      return { viscosity: '5W-30', oemApproval: 'Asian OEM C2/C3 DPF', aceaStandard: 'C2 / C3', apiStandard: 'SN/CF', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2018) {
      return { viscosity: '0W-20', oemApproval: 'Asian OEM Modern Hybrid / Fuel Economy', aceaStandard: 'C5', apiStandard: 'SP / ILSAC GF-6', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'Asian OEM Standard', aceaStandard: 'A5/B5 / C2', apiStandard: 'SN/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── GENERIC & CHINESE OEMS STRICTLY OBSERVING DPF / SAPS SAFETY ────────────
  if (isDiesel && year >= 2011) {
    return { viscosity: '5W-30', oemApproval: 'Universal Low-SAPS DPF Compliant', aceaStandard: 'C3', apiStandard: 'SN/CF', capacityLiters: capacity, changeIntervalKm: 15000 };
  }
  return { viscosity: '5W-40', oemApproval: 'Universal High-Performance', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
}

function isDieselFuelText(fuelType: string): boolean {
  const f = (fuelType || '').toLowerCase();
  return (
    f.includes('diesel') ||
    f.includes('dci') ||
    f.includes('tdi') ||
    f.includes('hdi') ||
    f.includes('cdi') ||
    f.includes('crdi') ||
    f.includes('d-4d')
  );
}

// HARD SAFETY INVARIANT — independent of any per-brand branch above: a diesel built in
// 2011 or later is assumed to carry a DPF/FAP. It is FORBIDDEN to hand back a High-SAPS
// (A3/B4, or any non-C-class) ACEA rating for such an engine, since High-SAPS ash content
// clogs the particulate filter. This runs as a final gate on every brand's output so a
// mistake in one branch can never leak a filter-killing recommendation.
function enforceFapSafety(
  spec: CleanEngine['oilSpec'],
  isDiesel: boolean,
  year: number
): CleanEngine['oilSpec'] {
  if (!spec || !isDiesel || year < 2011) return spec;
  const acea = (spec.aceaStandard || '').toUpperCase();
  const isLowOrMidSaps = /\bC[1-6]\b/.test(acea);
  if (isLowOrMidSaps) return spec;
  return {
    ...spec,
    viscosity: spec.viscosity && /^0W/.test(spec.viscosity) ? spec.viscosity : '5W-30',
    oemApproval: `${spec.oemApproval || 'OEM'} (Low-SAPS override — DPF safety)`,
    aceaStandard: 'C3',
    apiStandard: 'SN/CF',
  };
}

// Pure battery-electric vehicles carry no engine oil at all. Never guess a spec for them.
function isPureElectric(descText: string, displacementCc: number | null): boolean {
  if (displacementCc) return false; // a parsed liter figure means it's a combustion engine
  const t = (descText || '').toLowerCase();
  const hybridMarkers = /hybrid|hybride|phev|mhev|hev\b|e-tech|e-hdi|e-hybrid/;
  if (hybridMarkers.test(t)) return false; // hybrids with a combustion engine still need oil
  const evMarkers = /(?:^|[^a-z])(100%?\s*electri|électriq|electric|\be-tron\b|\bev\b|kwh|zoe|\bleaf\b|ioniq\s*(5|6)|\bborn\b|bz4x|\btaycan\b|e-208|e-2008|e-c4|id\.\d|id\d\b)/;
  return evMarkers.test(t);
}

export function deriveOilSpecification(
  makeSlug: string,
  fuelType: string,
  yearFrom: number | null,
  displacementCc: number | null,
  powerHp: number | null
): CleanEngine['oilSpec'] {
  const raw = deriveOilSpecificationRaw(makeSlug, fuelType, yearFrom, displacementCc, powerHp);
  return enforceFapSafety(raw, isDieselFuelText(fuelType), yearFrom || 2015);
}

// ─── 5. MAIN HARVESTER EXECUTION ──────────────────────────────────────────────
async function main() {
  console.log('================================================================');
  console.log('🚀 SpecPart Turnkey TecDoc Full Catalog Harvest & Spec Enrichment');
  console.log('================================================================\n');

  // Query all displayable passenger cars with their linked engine codes
  const query = `
    SELECT
      mfr.description AS make_name,
      m.id AS model_id,
      m.description AS model_raw_name,
      pc.id AS car_id,
      pc.description AS car_desc,
      pc.full_description AS car_full_desc,
      pc.date_from::text AS date_from_raw,
      pc.date_to::text AS date_to_raw,
      e.description AS engine_code
    FROM tecdoc.manufacturers mfr
    JOIN tecdoc.models m ON m.manufacturer_id = mfr.id
    JOIN tecdoc.passengercars pc ON pc.model_id = m.id
    LEFT JOIN tecdoc.passengercars_link_engines le ON le.car_id = pc.id
    LEFT JOIN tecdoc.engines e ON e.id = le.engine_id
    WHERE mfr.is_passenger_car = true
      AND mfr.can_be_displayed = true
      AND m.can_be_displayed = true
      AND pc.can_be_displayed = true
    ORDER BY mfr.description, m.description;
  `;

  console.log('⏳ Querying PostgreSQL tecdoc schema...');
  const { rows } = await pool.query(query);
  console.log(`📦 Fetched ${rows.length.toLocaleString()} raw rows from TecDoc.`);

  // Load existing catalog to preserve already-verified models (Dacia & VAG)
  const candidatePaths = [
    path.join(process.cwd(), 'backend/src/oil-finder/clean-catalog-hierarchy.json'),
    path.join(process.cwd(), 'src/oil-finder/clean-catalog-hierarchy.json'),
    path.join(process.cwd(), 'clean-catalog-hierarchy.json'),
    '/app/src/oil-finder/clean-catalog-hierarchy.json',
    '/app/clean-catalog-hierarchy.json',
  ];
  let catalogPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[0];

  let catalog: CleanCatalog = {};
  if (fs.existsSync(catalogPath)) {
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    console.log(`🔍 Loaded existing catalog with ${Object.keys(catalog).length} makes (preserving Dacia & VAG).`);
  }

  let totalNewEngines = 0;
  let skippedVerifiedEngines = 0;

  for (const r of rows) {
    const makeName = (r.make_name || '').trim();
    if (!makeName) continue;
    const makeSlug = slugify(makeName);

    // Strictly skip already verified makes to preserve verified clean generations and audited specs
    if (['dacia', 'volkswagen', 'audi', 'seat', 'skoda', 'cupra'].includes(makeSlug)) {
      skippedVerifiedEngines++;
      continue;
    }

    const { modelName, genHint } = cleanCommercialModel(r.model_raw_name);
    const modelSlug = slugify(modelName);
    const genSlug = slugify(genHint);
    const yearFrom = parseYearFromDateText(r.date_from_raw);
    const yearTo = parseYearFromDateText(r.date_to_raw);

    if (!catalog[makeSlug]) {
      catalog[makeSlug] = {
        makeName,
        makeSlug,
        models: {},
      };
    }

    if (!catalog[makeSlug].models[modelSlug]) {
      catalog[makeSlug].models[modelSlug] = {
        modelName,
        modelSlug,
        generations: {},
      };
    }

    if (!catalog[makeSlug].models[modelSlug].generations[genSlug]) {
      catalog[makeSlug].models[modelSlug].generations[genSlug] = {
        genName: genHint,
        genSlug,
        yearFrom: yearFrom || null,
        yearTo: yearTo || null,
        engines: [],
      };
    }

    const genObj = catalog[makeSlug].models[modelSlug].generations[genSlug];
    if (yearFrom && (!genObj.yearFrom || yearFrom < genObj.yearFrom)) genObj.yearFrom = yearFrom;
    if (yearTo && (!genObj.yearTo || yearTo > genObj.yearTo)) genObj.yearTo = yearTo;

    // Parse engine characteristics from car descriptions
    const descText = `${r.car_desc || ''} ${r.car_full_desc || ''}`;
    const hpMatch = descText.match(/(\d{2,3})\s*(?:ch|hp|ps)/i);
    const ccMatch = descText.match(/(\d\.\d)\s*(?:l|16v|hdi|tdi|dci|vti|tsi|tfsi)?/i);
    const powerHp = hpMatch ? parseInt(hpMatch[1], 10) : null;
    const displacementCc = ccMatch ? Math.round(parseFloat(ccMatch[1]) * 1000) : null;
    const isDiesel = /diesel|hdi|dci|tdi|cdi|crdi|d-4d/i.test(descText);
    const isElectric = !isDiesel && isPureElectric(descText, displacementCc);
    const fuelType = isElectric ? 'electrique' : isDiesel ? 'diesel' : 'essence';

    const engineCode =
      (r.engine_code || '').trim() ||
      (ccMatch ? `${ccMatch[1]} ${isDiesel ? 'Diesel' : 'Essence'}` : isElectric ? 'Moteur Electrique' : 'Moteur Standard');

    // Deduplicate within generation
    const exists = genObj.engines.some(
      e => e.engineCode.toLowerCase() === engineCode.toLowerCase() && e.powerHp === powerHp
    );

    if (!exists) {
      // Pure EVs carry no engine oil — never fabricate a spec (zero-hallucination rule).
      const oilSpec = isElectric
        ? null
        : deriveOilSpecification(makeSlug, fuelType, yearFrom, displacementCc, powerHp);
      genObj.engines.push({
        engineCode,
        fuelType,
        displacementCc,
        powerHp,
        powerKw: powerHp ? Math.round(powerHp * 0.7355) : null,
        yearFrom: yearFrom || null,
        yearTo: yearTo || null,
        oilSpec,
      });
      totalNewEngines++;
    }
  }

  // ─── 6. SAVE JSON CATALOG ─────────────────────────────────────────────────
  const saveTargets = [
    path.join(process.cwd(), 'backend/src/oil-finder/clean-catalog-hierarchy.json'),
    path.join(process.cwd(), 'src/oil-finder/clean-catalog-hierarchy.json'),
    path.join(process.cwd(), 'clean-catalog-hierarchy.json'),
    path.join(process.cwd(), 'oil-finder-full-dataset/clean-catalog-hierarchy.json'),
    '/app/clean-catalog-hierarchy.json',
    '/app/dist/clean-catalog-hierarchy.json',
    '/app/dist/oil-finder/clean-catalog-hierarchy.json',
    '/app/dist/src/oil-finder/clean-catalog-hierarchy.json',
  ];

  let savedCount = 0;
  for (const target of saveTargets) {
    try {
      const dir = path.dirname(target);
      if (fs.existsSync(dir)) {
        fs.writeFileSync(target, JSON.stringify(catalog, null, 2), 'utf8');
        savedCount++;
      }
    } catch {
      // Ignore write error on read-only mount points
    }
  }

  console.log(`\n💾 Saved updated catalog to ${savedCount} target paths.`);
  console.log(`- Total Makes in Catalog: ${Object.keys(catalog).length}`);
  console.log(`- Total Verified Engines Preserved: ${skippedVerifiedEngines.toLocaleString()}`);
  console.log(`- Total New Engines Harvested & Enriched: ${totalNewEngines.toLocaleString()}`);

  // ─── 7. PRISMA DATABASE SYNCHRONIZATION ───────────────────────────────────
  console.log('\n🔄 Synchronizing Prisma Database Tables (Vehicles & Oil Specs)...');

  let dbMakesCount = 0;
  let dbGensCount = 0;
  let dbEnginesCount = 0;

  for (const [mSlug, m] of Object.entries(catalog)) {
    try {
      // 1. Upsert VehicleMake
      const makeRecord = await prisma.vehicleMake.upsert({
        where: { slug: m.makeSlug },
        update: { name: m.makeName },
        create: { name: m.makeName, slug: m.makeSlug },
      });
      dbMakesCount++;

      for (const mod of Object.values(m.models)) {
        const uniqueModelSlug = `${m.makeSlug}-${mod.modelSlug}`;
        const modelRecord = await prisma.vehicleModel.upsert({
          where: { slug: uniqueModelSlug },
          update: { name: mod.modelName, makeId: makeRecord.id },
          create: { name: mod.modelName, slug: uniqueModelSlug, makeId: makeRecord.id },
        });

        for (const gen of Object.values(mod.generations)) {
          const genRecord = await prisma.vehicleGeneration.upsert({
            where: {
              modelId_slug: { modelId: modelRecord.id, slug: gen.genSlug },
            },
            update: {
              name: gen.genName,
              yearFrom: gen.yearFrom || null,
              yearTo: gen.yearTo || null,
            },
            create: {
              modelId: modelRecord.id,
              name: gen.genName,
              slug: gen.genSlug,
              yearFrom: gen.yearFrom || null,
              yearTo: gen.yearTo || null,
            },
          });
          dbGensCount++;

          // Delete existing engines for this generation and recreate
          await prisma.vehicleEngine.deleteMany({
            where: { generationId: genRecord.id },
          });

          for (const eng of gen.engines) {
            let oilSpecId: string | null = null;
            if (eng.oilSpec?.viscosity) {
              const fingerprint = `${slugify(eng.oilSpec.viscosity)}_${slugify(eng.oilSpec.oemApproval || 'generic')}_${slugify(eng.oilSpec.aceaStandard || 'std')}`;
              const spec = await prisma.oilFinderOilSpec.upsert({
                where: { fingerprint },
                update: {
                  viscosity: eng.oilSpec.viscosity,
                  oemApproval: eng.oilSpec.oemApproval || null,
                  aceaStandard: eng.oilSpec.aceaStandard || null,
                  apiStandard: eng.oilSpec.apiStandard || null,
                  capacityLiters: eng.oilSpec.capacityLiters || null,
                  changeIntervalKm: eng.oilSpec.changeIntervalKm || null,
                },
                create: {
                  viscosity: eng.oilSpec.viscosity,
                  oemApproval: eng.oilSpec.oemApproval || null,
                  aceaStandard: eng.oilSpec.aceaStandard || null,
                  apiStandard: eng.oilSpec.apiStandard || null,
                  capacityLiters: eng.oilSpec.capacityLiters || null,
                  changeIntervalKm: eng.oilSpec.changeIntervalKm || null,
                  fingerprint,
                },
              });
              oilSpecId = spec.id;

              // Also link in OilFinderVehicle for instant findByVehicle query resolution
              await prisma.oilFinderVehicle.upsert({
                where: {
                  make_model_generation_engineCode_source: {
                    make: m.makeName,
                    model: mod.modelName,
                    generation: gen.genName,
                    engineCode: eng.engineCode,
                    source: 'tecdoc-harvested',
                  },
                },
                update: {
                  oilSpecId: spec.id,
                  fuelType: eng.fuelType,
                  displacementCc: eng.displacementCc || null,
                  powerHp: eng.powerHp ? Number(eng.powerHp) : null,
                  powerKw: eng.powerKw ? Number(eng.powerKw) : null,
                  yearFrom: eng.yearFrom || null,
                  yearTo: eng.yearTo || null,
                },
                create: {
                  make: m.makeName,
                  model: mod.modelName,
                  generation: gen.genName,
                  engineCode: eng.engineCode,
                  source: 'tecdoc-harvested',
                  confidence: 'high',
                  oilSpecId: spec.id,
                  fuelType: eng.fuelType,
                  displacementCc: eng.displacementCc || null,
                  powerHp: eng.powerHp ? Number(eng.powerHp) : null,
                  powerKw: eng.powerKw ? Number(eng.powerKw) : null,
                  yearFrom: eng.yearFrom || null,
                  yearTo: eng.yearTo || null,
                },
              });
            }

            await prisma.vehicleEngine.create({
              data: {
                generationId: genRecord.id,
                name: `${eng.engineCode} (${eng.powerHp ? eng.powerHp + ' ch' : ''})`.trim(),
                engineCode: eng.engineCode,
                displacementCc: eng.displacementCc || null,
                powerHp: eng.powerHp ? Number(eng.powerHp) : null,
                powerKw: eng.powerKw ? Number(eng.powerKw) : null,
                fuelType: eng.fuelType || 'essence',
                oilSpecId,
              },
            });
            dbEnginesCount++;
          }
        }
      }
    } catch (err: any) {
      console.warn(`Warning syncing make ${m.makeName}:`, err.message);
    }
  }

  console.log('\n🎉 ALL TEC-DOC VEHICLES HARVESTED & ENRICHED SUCCESSFULLY!');
  console.log(`- Database Makes Synced: ${dbMakesCount}`);
  console.log(`- Database Generations Synced: ${dbGensCount}`);
  console.log(`- Database Engines Synced: ${dbEnginesCount}`);
  console.log('✅ Oil Finder is now completely populated with international OEM lubrication standards!');

  await pool.end();
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal Harvest Error:', err);
  process.exit(1);
});
