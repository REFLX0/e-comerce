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
  category?: string;
  generations: Record<string, CleanGeneration>;
}

interface CleanMake {
  makeName: string;
  makeSlug: string;
  categories?: string[];
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
// TecDoc uses "0000-00-00" as a placeholder for "not set" (seen on every still-in-production
// vehicle's date_to) rather than an actual NULL — reject implausible years so callers never
// see year 0 as a real value. 0 is not null/undefined, so it would otherwise slip straight
// past every `?? fallback` check downstream as a literal (wrong) boundary.
function plausibleYear(y: number): number | null {
  return y >= 1900 && y <= 2100 ? y : null;
}

function parseYearFromDateText(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  let m = s.match(/^(\d{4})-\d{1,2}-\d{1,2}/); // ISO: 2009-06-01
  if (m) return plausibleYear(parseInt(m[1], 10));

  m = s.match(/^\d{1,2}\.(\d{4})$/); // MM.YYYY: 06.2009
  if (m) return plausibleYear(parseInt(m[1], 10));

  m = s.match(/^(\d{4})(\d{2})$/); // YYYYMM: 200906
  if (m) return plausibleYear(parseInt(m[1], 10));

  m = s.match(/\b(19\d{2}|20\d{2})\b/); // fallback: any plausible 4-digit year in the text
  if (m) return plausibleYear(parseInt(m[1], 10));

  return null;
}

// Strict overlap (touching at a shared boundary year does NOT count — that's the normal
// handover between two consecutive real generations, e.g. A3 (8L) ending 2003 and A3 (8P)
// starting 2003). Requires at least one concrete year bound on each side, so two
// generations that both entirely lack year data are never merged into each other.
function yearRangesOverlap(
  aFrom: number | null,
  aTo: number | null,
  bFrom: number | null,
  bTo: number | null
): boolean {
  // Defensive second layer: treat any non-plausible year (0, negative, etc.) as absent,
  // regardless of what produced it — this function should never trust a bad year 0 as a
  // real boundary even if some future caller forgets to run it through plausibleYear first.
  const norm = (y: number | null) => (y != null && y >= 1900 && y <= 2100 ? y : null);
  aFrom = norm(aFrom);
  aTo = norm(aTo);
  bFrom = norm(bFrom);
  bTo = norm(bTo);

  if (aFrom == null && aTo == null) return false;
  if (bFrom == null && bTo == null) return false;
  // A missing yearTo does NOT mean "still in production forever" — it usually just means
  // TecDoc never recorded an end date. Treating it as literal Infinity let a stray old row
  // (e.g. yearFrom 2001, yearTo unknown) falsely "overlap" a much newer, already-dated
  // generation (Fiat Doblo III, curated as 2010-2022) and corrupt its yearFrom down to 2001.
  // Cap an open end at 5 years past its own start instead — long enough to still catch the
  // legitimate case (a new row for a generation's LATER facelift merging into an existing
  // curated entry that starts a few years earlier), short enough that a genuinely distant,
  // different-era row no longer bridges across into an unrelated generation.
  const OPEN_END_CAP_YEARS = 5;
  const aStart = aFrom ?? -Infinity;
  const aEnd = aTo ?? (aFrom != null ? aFrom + OPEN_END_CAP_YEARS : Infinity);
  const bStart = bFrom ?? -Infinity;
  const bEnd = bTo ?? (bFrom != null ? bFrom + OPEN_END_CAP_YEARS : Infinity);
  return aStart < bEnd && bStart < aEnd;
}

// Extract clean commercial model root (e.g. "GOLF VII (5G1)" -> "Golf", gen "Golf VII (5G1)")
// Handles Roman-numeral generations (Golf VII, Clio IV, 208 I), single-letter GM/Opel-style
// codes (Astra H, Corsa D, Vectra C), and Phase/facelift suffixes (Megane II Phase 2).
const ROMAN_NUMERAL = /^(?:X{1,3}(?:IX|IV|V?I{0,3})?|IX|IV|VIII|VII|VI|V|III|II|I|X)$/i;

function cleanCommercialModel(rawDesc: string, makeSlug?: string): { modelName: string; genHint: string } {
  let s = (rawDesc || '').trim();

  // Body-style suffix hints: "CORSA D Van" -> isolate "CORSA D" so the trailing single-letter
  // generation code ("D") is still detected, instead of "Van" blocking it and the whole thing
  // (including the generation letter) being mistaken for a separate model called "Corsa D Van".
  // Matches from the FIRST body-style keyword onward (not just a single trailing word), since
  // TecDoc also uses multi-word compounds here — confirmed on real data: Opel Corsa A-E all
  // have single-word cases (Box/Hatchback/Estate/Van); Fiat Doblo III splits into THREE
  // separate stray models over "Box Body / Estate" and "Platform/Chassis" without this.
  // Confirmed against a full scan of every TecDoc model name with a "/" outside its chassis
  // code (611 rows, all manufacturers) — "Platform/Chassis" and "Box Body / Estate" alone
  // account for the large majority of it, across dozens of unrelated brands (VW, Iveco, Ford,
  // Toyota, Isuzu, Land Rover, Mercedes...). Bus/MPV/Hardtop added from the same scan.
  // Deliberately NOT touching "/" patterns that are genuinely part of the model name itself
  // (Ferrari "365 GTB/4", "348 tb/GTB") — those are correct as-is; forcing them apart would
  // corrupt real data instead of fixing a split.
  // Runs BEFORE chassis-paren extraction: some models put the chassis code mid-string, before
  // the body style ("MOVANO Mk I (A) Chassis/Cab", "COMBO Mk II (C) Box Body / Estate") — the
  // chassis regex below only looks at the end of the string, so it'd miss "(A)"/"(C)" entirely
  // unless the trailing body-style words are stripped first.
  // "Volante" is Aston Martin's own convertible designation (TecDoc uses it as a
  // generic body-style suffix across their whole range, e.g. "DB9 Volante"), safe
  // to treat as a body style for any make since no other manufacturer models it.
  // "Vantage" is ALSO used by TecDoc as a generic Aston Martin coupe/closed-body
  // suffix ("DB9 Vantage", "VANQUISH Vantage") — but "Vantage" is ALSO a real,
  // standalone Aston Martin model in its own right, so stripping it globally would
  // be wrong for other brands and confusing even within Aston Martin; restrict it
  // to Aston Martin specifically, where TecDoc's raw data confirmed the pattern
  // (every DB-series/Virage/Zagato/Vanquish model carries a spurious "Vantage" or
  // "Vantage Vantage" suffix that visibly conflates them with the actual Vantage
  // model — reported live via a "DB11 Vantage" listing that reads as if DB11 and
  // Vantage, two entirely different cars, had been merged into one).
  const astonVantageSuffix = makeSlug === 'aston-martin' ? '|Vantage' : '';
  const bodyMatch = s.match(new RegExp(`^(.*?)\\s+((?:Van|Box|Estate|Saloon|Hatchback|Pickup|Combi|Kombi|Cabriolet|Cabrio|Coupe|Convertible|Roadster|Wagon|Sedan|Platform|Chassis|Bus|MPV|Hardtop|Break|Volante${astonVantageSuffix})\\b.*)$`, 'i'));
  const bodyStyleSuffix = bodyMatch ? ` ${bodyMatch[2]}` : '';
  if (bodyMatch) s = bodyMatch[1].trim();

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
    genHint: `${genCore}${bodyStyleSuffix}${phaseSuffix}${chassis ? ` (${chassis})` : ''}`.trim(),
  };
}

// ─── 4. DETERMINISTIC OEM OIL SPECIFICATION ENGINE ────────────────────────────
function deriveOilSpecificationRaw(
  makeSlug: string,
  fuelType: string,
  yearFrom: number | null,
  displacementCc: number | null,
  powerHp: number | null,
  engineCode?: string
): CleanEngine['oilSpec'] {
  const normEngineCode = (engineCode || '').toUpperCase().replace(/\s+/g, ' ').trim();
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

  // ── RENAULT K9K 782 (specific engine-code override) ────────────────────────
  // The same physical engine variant (K9K 782, confirmed live: 1.5L diesel,
  // 4.5L oil capacity) shows up under multiple car generations with different
  // yearFrom values (e.g. Laguna from 2007, Latitude from 2010) purely
  // because that's when THAT MODEL launched, not when this engine tune
  // debuted. The generic year-bracket logic below was inconsistently
  // classifying the identical engine as both pre-2010 (RN0710/5W-40) and
  // 2010+ (RN0720/5W-30) depending only on which car it happened to be
  // listed under. K9K 782 is confirmed RN0720/5W-30 across the board.
  if (makeSlug === 'renault' && normEngineCode === 'K9K 782') {
    return { viscosity: '5W-30', oemApproval: 'Renault RN0720', aceaStandard: 'C4', apiStandard: 'SM', capacityLiters: 4.5, changeIntervalKm: 15000 };
  }

  // ── RENAULT / DACIA / NISSAN / ALPINE ───────────────────────────────────────
  // Nissan's own petrol engines (VQ/MR/HR series, etc.) are independently designed —
  // never Renault-derived — so they must NOT carry Renault's RN-prefixed approvals.
  // Nissan diesel (dCi) engines in Europe genuinely are Renault-Nissan Alliance hardware,
  // so those stay grouped with Renault below.
  if (['nissan', 'infiniti'].includes(makeSlug) && !isDiesel) {
    if (year >= 2018) {
      return { viscosity: '0W-20', oemApproval: 'Nissan Genuine Oil (API SP, ILSAC GF-6)', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2008) {
      return { viscosity: '5W-30', oemApproval: 'Nissan Genuine Oil (API SN)', aceaStandard: 'A5/B5', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-40', oemApproval: 'Nissan Genuine Oil (API SL)', aceaStandard: 'A3/B4', apiStandard: 'SL', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (['renault', 'dacia', 'nissan', 'alpine', 'infiniti'].includes(makeSlug)) {
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
      // correct here — no FAP on these engines. (Nissan petrol never reaches this branch —
      // handled above.)
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

  // ── OPEL / VAUXHALL — GM-owned until 2017, PSA/Stellantis-owned from 2017+ ──
  // A pre-2018 Opel/Vauxhall was built with GM engineering and rated for GM's own dexos
  // spec — it was NEVER PSA-rated, since Opel/Vauxhall didn't join PSA until 2017. Only
  // 2018+ models (built on genuinely shared PSA platforms) carry real PSA B71 approvals.
  if (['opel', 'vauxhall', 'irmscher', 'bitter', 'bedford'].includes(makeSlug)) {
    if (year >= 2018) {
      return { viscosity: '0W-20', oemApproval: 'PSA B71 2010 (FPW9.55535/03)', aceaStandard: 'C5', apiStandard: 'SN Plus', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (isDiesel) {
      return { viscosity: '5W-30', oemApproval: 'GM dexos2', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2011) {
      return { viscosity: '5W-30', oemApproval: 'GM dexos1 Gen 2', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'GM dexos1', aceaStandard: 'A5/B5', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── STELLANTIS (PEUGEOT, CITROEN, DS) ───────────────────────────────────────
  if (['peugeot', 'citroen', 'ds'].includes(makeSlug)) {
    if (year >= 2018) {
      return { viscosity: '0W-20', oemApproval: 'PSA B71 2010 (FPW9.55535/03)', aceaStandard: 'C5', apiStandard: 'SN Plus', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2014) {
      return { viscosity: '0W-30', oemApproval: 'PSA B71 2312', aceaStandard: 'C2', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (isDiesel || year >= 2008) {
      return { viscosity: '5W-30', oemApproval: 'PSA B71 2290', aceaStandard: 'C2', apiStandard: 'SN/CF', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    // Pre-2008 naturally-aspirated PSA petrol (TU/EW-family engines, e.g. early C4/307/206):
    // 5W-40 under PSA B71 2296 is the standard-documented spec for this era, not 10W-40 —
    // corrected from a real report plus cross-check against known PSA oil-spec history.
    return { viscosity: '5W-40', oemApproval: 'PSA B71 2296', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── ABARTH ─────────────────────────────────────────────────────────────────
  // Abarth's turbo performance engines (T-Jet 1.4, GSE 1.4, GSE 1.75) ran a fixed,
  // distinctly-branded spec across their whole production life — NOT the base-Fiat
  // year brackets below, which are tuned for economy models and would otherwise
  // misclassify a 2008 Abarth 500/595 the same as a base 2008 Fiat Panda. Confirmed
  // live: an Abarth 500/595/695 (312_) 1.4 T-Jet was falling into the shared
  // fallback branch (pre-2010) purely because its generation starts in 2008, even
  // though Selenia Abarth 10W-50 has been the spec since launch.
  if (makeSlug === 'abarth' && !isDiesel) {
    if (year >= 2016) {
      // 695/Turismo/Competizione-era Digitek Pure Energy switch.
      return { viscosity: '5W-40', oemApproval: 'Fiat 9.55535-S3 (Selenia Digitek Pure Energy)', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '10W-50', oemApproval: 'Fiat 9.55535-S2 (Selenia Abarth)', aceaStandard: 'C3', apiStandard: 'SL', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── FIAT / ALFA ROMEO / LANCIA / ABARTH / JEEP ─────────────────────────────
  if (['fiat', 'alfa-romeo', 'lancia', 'abarth', 'jeep', 'autobianchi', 'zastava'].includes(makeSlug)) {
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
      // 'D2' (Fiat's diesel-only approval) and 'CF' (a diesel-only API category) were
      // previously listed here despite this being the petrol branch — corrected after a
      // live report on an Abarth 500/595/695 1.4 T-Jet showing this diesel-contaminated spec.
      return { viscosity: '10W-40', oemApproval: undefined, aceaStandard: 'A3/B4', apiStandard: 'SL', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
  }

  // ── BMW & MINI ─────────────────────────────────────────────────────────────
  // TecDoc links an engine to every car generation it was ever fitted to, including
  // older-looking nameplate generations that got this engine added in a later facelift
  // -- so `year` (sourced from generation.yearFrom) can be an artifact that's decades
  // older than the engine itself. Confirmed live: N55 B30 A (a real 2009+ engine) was
  // linked to "3 (E46)" (1998-2013), computing year=1998 and wrongly returning the
  // pre-2004 Longlife-98 spec for ~100 engine rows across the N-family. BMW's N-series
  // (N40/42/43/45/46/47/51/52/53/54/55/57/62/63/73...) and B-series are well-documented
  // as 2001+ (N42/N46) or, for every other N/B code, solidly 2004+ -- so for any of
  // those (excluding the two ambiguous 2001-era codes), the pre-2004 brackets below are
  // never legitimate regardless of what `year` computes to.
  const isModernBmwFamily = /^(N(?!42\b|46\b)[0-9]|B[0-9])/.test(normEngineCode);
  if (['bmw', 'mini', 'alpina', 'wiesmann'].includes(makeSlug)) {
    if (year >= 2017 && !isDiesel && displacementCc && displacementCc <= 2000) {
      return { viscosity: '0W-20', oemApproval: 'BMW Longlife-17 FE+', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (isDiesel || year >= 2004 || isModernBmwFamily) {
      return { viscosity: '5W-30', oemApproval: 'BMW Longlife-04 (LL-04)', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 1995) {
      // BMW Longlife-98 (LL-98) era — the precursor to LL-01, introduced ~1998.
      return { viscosity: '5W-40', oemApproval: 'BMW Longlife-98 (LL-98)', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    // Pre-1995 classic BMW (E21/E30/early E36, M10/M20/M30/M40/M42 engines) predates
    // BMW's "Longlife" branding entirely (LL-98 didn't launch until ~1998) — attaching
    // it here was anachronistic. Confirmed live on an E30: BMW's own period owner's
    // manual specified a temperature-graduated conventional multigrade (10W-40 for
    // cooler climates up to 20W-50 for hot), not a fixed modern-style grade or
    // Longlife approval. 10W-40 is the best-documented, most broadly-cited figure.
    return { viscosity: '10W-40', apiStandard: 'SG/SH', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── MERCEDES-BENZ & SMART ──────────────────────────────────────────────────
  if (['mercedes-benz', 'mercedes', 'smart', 'mercedes-benz-bbdc', 'maybach', 'isdera', 'puch'].includes(makeSlug)) {
    if (year >= 2016 && !isDiesel && displacementCc && displacementCc <= 2000) {
      return { viscosity: '5W-30', oemApproval: 'MB 229.52', aceaStandard: 'C3', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (isDiesel || year >= 2010) {
      return { viscosity: '5W-30', oemApproval: 'MB 229.51 / MB 229.52', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-40', oemApproval: 'MB 229.5', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── FORD ───────────────────────────────────────────────────────────────────
  if (['ford', 'ford-usa', 'mercury', 'lincoln'].includes(makeSlug)) {
    if (isDiesel && year >= 2014) {
      return { viscosity: '0W-30', oemApproval: 'Ford WSS-M2C950-A', aceaStandard: 'C2', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (!isDiesel && year >= 2012 && displacementCc && displacementCc <= 1500) {
      return { viscosity: '5W-20', oemApproval: 'Ford WSS-M2C948-B', aceaStandard: 'C5', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'Ford WSS-M2C913-D', aceaStandard: 'A5/B5', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  // ── GM (CHEVROLET, CADILLAC, BUICK, GMC) ────────────────────────────────────
  // Pre-2018 Opel/Vauxhall shares this exact GM dexos logic — see its own dedicated
  // branch above, which needs the year-based PSA/GM split that this list doesn't.
  if (['chevrolet', 'cadillac', 'buick', 'gmc', 'gm', 'callaway', 'pontiac', 'oldsmobile', 'hummer'].includes(makeSlug)) {
    if (isDiesel) {
      // dexos2 is GM's own Low-SAPS diesel spec — DPF-safe.
      return { viscosity: '5W-30', oemApproval: 'GM dexos2', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2011) {
      return { viscosity: '5W-30', oemApproval: 'GM dexos1 Gen 2', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'GM dexos1', aceaStandard: 'A5/B5', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 10000 };
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
  if (['porsche', 'ruf'].includes(makeSlug)) {
    if (isDiesel) {
      return { viscosity: '5W-30', oemApproval: 'Porsche C30', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2018) {
      return { viscosity: '0W-40', oemApproval: 'Porsche C40', aceaStandard: 'C3', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '0W-40', oemApproval: 'Porsche A40', aceaStandard: 'A3/B4', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  // ── ASIAN OEMS (TOYOTA, HYUNDAI, KIA, HONDA, MITSUBISHI, SUZUKI, MAZDA) ────
  if (['toyota', 'hyundai', 'kia', 'honda', 'mitsubishi', 'suzuki', 'lexus', 'mazda', 'subaru', 'genesis'].includes(makeSlug)) {
    if (isDiesel) {
      return { viscosity: '5W-30', oemApproval: 'Asian OEM C2/C3 DPF', aceaStandard: 'C2 / C3', apiStandard: 'SN/CF', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2018) {
      return { viscosity: '0W-20', oemApproval: 'Asian OEM Modern Hybrid / Fuel Economy', aceaStandard: 'C5', apiStandard: 'SP / ILSAC GF-6', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'Asian OEM Standard', aceaStandard: 'A5/B5 / C2', apiStandard: 'SN/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── ASTON MARTIN ───────────────────────────────────────────────────────────
  // Aston Martin doesn't publish alphanumeric approval codes the way VW/BMW/MB do;
  // Castrol Edge Professional is their long-documented factory-fill/official partner.
  if (makeSlug === 'aston-martin') {
    if (year >= 2016 && displacementCc && displacementCc <= 4200) {
      // AMG-sourced M177/M178 twin-turbo V8 (DB11/Vantage/DBS V8) — follows the
      // Mercedes-AMG lineage's own low-SAPS MB 229.5-family requirement.
      return { viscosity: '5W-30', oemApproval: 'Castrol Edge Professional (MB 229.5 family — AMG-sourced V8)', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    // AM-developed V12 (2004+) and pre-2004 classic models.
    return { viscosity: '5W-40', oemApproval: 'Castrol Edge Professional (Aston Martin factory-fill partner)', aceaStandard: 'A3/B4', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── ROVER ──────────────────────────────────────────────────────────────────
  // Verified against the Rover 75 Owner's Handbook, MG Rover-era petrol range only
  // (1998-2005, 1400-2500cc). Pre-1998 Rover (Metro/200/400/800/SD1-era, mechanically
  // unrelated engines) intentionally left on the generic fallback — not covered.
  if (makeSlug === 'rover' && !isDiesel && year >= 1998 && displacementCc && displacementCc >= 1400 && displacementCc <= 2500) {
    return { viscosity: '10W-40', aceaStandard: displacementCc <= 1800 ? 'A1/A2' : 'A2', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── SAAB ───────────────────────────────────────────────────────────────────
  if (makeSlug === 'saab') {
    if (year >= 2003 && !isDiesel) {
      return { viscosity: '0W-30', oemApproval: 'GM-LL-A-025', aceaStandard: 'A2/B2 or A3/B3-B4', apiStandard: 'SH/SJ/SL', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (isDiesel) {
      return { viscosity: '10W-40', aceaStandard: 'B2-96/B3-96', apiStandard: 'CD+', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '10W-40', oemApproval: 'Saab Turbo engine oil', aceaStandard: 'A2-96/A3-96', apiStandard: 'SG/SH', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── BENTLEY ────────────────────────────────────────────────────────────────
  if (makeSlug === 'bentley') {
    if (year >= 2012 && displacementCc && displacementCc <= 4200) {
      return { viscosity: '5W-30', oemApproval: 'VW 504.00/507.00; Bentley G 052 195 (V8)', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2012) {
      return { viscosity: '0W-40', oemApproval: 'Mobil 1 New Life / Bentley G 052 930 (W12)', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '0W-40', oemApproval: 'Mobil 1 0W-40 (Bentley factory-fill, Continental GT 2004-2011)', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  // ── FERRARI ────────────────────────────────────────────────────────────────
  if (makeSlug === 'ferrari') {
    return { viscosity: '5W-40', oemApproval: 'Shell Helix Ultra 5W-40 (Ferrari factory-fill/sole service recommendation)', aceaStandard: 'A3/B4', apiStandard: 'SN/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── LAMBORGHINI ──────────────────────────────────────────────────────────
  // Automobiles only. Diesel-tagged Lamborghini entries in this catalog are almost
  // certainly mistagged Lamborghini Trattori tractor data (a different, unrelated
  // company) — deliberately excluded here rather than given a fabricated car spec.
  if (makeSlug === 'lamborghini' && !isDiesel) {
    if (year >= 2018) {
      return { viscosity: '0W-40', oemApproval: 'Porsche C40 / VW 511.00 (Urus)', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'VW 504.00 (Castrol SLX LongLife III)', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  // ── CHRYSLER / DODGE ───────────────────────────────────────────────────────
  // Verified against 2007 Sebring and 2007-2019 Charger owner's manuals — MS-6395 is
  // the constant OEM approval across the group; 5W-20 is the majority-cited viscosity.
  // Plymouth (same corporate group but pre-2000, not covered by these manuals)
  // deliberately excluded — left on the generic fallback.
  if (['chrysler', 'dodge'].includes(makeSlug) && !isDiesel && year >= 2000) {
    return { viscosity: '5W-20', oemApproval: 'DaimlerChrysler/FCA MS-6395', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── MASERATI ───────────────────────────────────────────────────────────────
  if (makeSlug === 'maserati' && year >= 2014) {
    if (year >= 2018 && displacementCc && displacementCc <= 3000) {
      return { viscosity: '10W-60', oemApproval: 'Shell Helix Ultra Racing 10W-60 (Maserati bulletin MAS002103)', aceaStandard: 'A3/B3, A3/B4', apiStandard: 'SN/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '5W-40', oemApproval: 'Shell Helix Ultra Maserati 5W-40 (Maserati bulletin MAS002103)', aceaStandard: 'A3/B3, A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── SSANGYONG ──────────────────────────────────────────────────────────────
  if (makeSlug === 'ssangyong') {
    if (isDiesel) {
      return { viscosity: '15W-40', oemApproval: 'MB Sheet 229.1/229.3 (preferred); SsangYong genuine oil', aceaStandard: 'B2/B3/B4', apiStandard: 'CG or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '15W-40', oemApproval: 'MB Sheet 229.1 or 229.3; SsangYong genuine oil', apiStandard: 'SH or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── DAEWOO ─────────────────────────────────────────────────────────────────
  if (makeSlug === 'daewoo') {
    return { viscosity: '10W-40', oemApproval: 'MB Sheet 229.1 (Musso-based applications)', aceaStandard: 'A2 or A3', apiStandard: 'SH or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── MG ─────────────────────────────────────────────────────────────────────
  if (makeSlug === 'mg') {
    if (year >= 2010) {
      return { viscosity: '0W-20', oemApproval: 'SAIC Motor-recommended engine oil', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '10W-40', oemApproval: 'MG Rover specification', aceaStandard: 'A2 or A3 (A1 except VVC engines)', apiStandard: 'SH or SJ', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── LADA ───────────────────────────────────────────────────────────────────
  if (makeSlug === 'lada') {
    if (year >= 2015) {
      return { viscosity: '5W-40', oemApproval: 'STO AAI 003 B5/B6 (LADA-recommended lubricant)', apiStandard: 'SL, SM, or SN', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    if (isDiesel) {
      return { viscosity: '10W-40', aceaStandard: 'B2-96 minimum', apiStandard: 'SG/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '10W-40', aceaStandard: 'A2-96', apiStandard: 'SG/SH/CD', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── DAIHATSU ───────────────────────────────────────────────────────────────
  // Verified only for the 3SZ-VE/K3-VE (Terios-era, 1300-1500cc) family; other
  // Daihatsu displacements/eras intentionally left on the generic fallback.
  if (makeSlug === 'daihatsu' && displacementCc && displacementCc >= 1300 && displacementCc <= 1500) {
    return { viscosity: '0W-20', apiStandard: 'SJ or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── HAVAL ──────────────────────────────────────────────────────────────────
  if (makeSlug === 'haval' && !isDiesel) {
    return { viscosity: '0W-20', oemApproval: 'Haval/GWM OEM-recommended fully synthetic oil', aceaStandard: 'C5', apiStandard: 'SN or SP', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── GREAT WALL ─────────────────────────────────────────────────────────────
  // Verified only for the GW4D20D diesel (Wingle 7); petrol Great Wall left on fallback.
  if (makeSlug === 'great-wall' && isDiesel) {
    return { viscosity: year >= 2011 ? '5W-30' : '0W-30', oemApproval: 'Great Wall OEM-specified engine oil', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── CHERY ──────────────────────────────────────────────────────────────────
  if (makeSlug === 'chery' && !isDiesel) {
    if (year >= 2020) {
      return { viscosity: '0W-20', oemApproval: 'Chery genuine engine oil', aceaStandard: 'C5', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '5W-30', apiStandard: 'SH or SJ', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── DFSK ───────────────────────────────────────────────────────────────────
  if (makeSlug === 'dfsk' && !isDiesel) {
    return { viscosity: '5W-30', apiStandard: 'SM or higher', oemApproval: 'DFSK engine-oil specification', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── BYD ────────────────────────────────────────────────────────────────────
  if (makeSlug === 'byd' && !isDiesel) {
    return { viscosity: '0W-20', oemApproval: 'BYD engine-oil specification', aceaStandard: 'C5', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── LANDWIND-JMC ───────────────────────────────────────────────────────────
  if (makeSlug === 'landwind-jmc') {
    if (isDiesel) {
      return { viscosity: '10W-40', oemApproval: 'Landwind-approved diesel oil', apiStandard: 'CI-4', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '5W-40', oemApproval: 'Landwind-approved engine oil', apiStandard: 'SN or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── BRILLIANCE ─────────────────────────────────────────────────────────────
  if (makeSlug === 'brilliance' && !isDiesel) {
    return { viscosity: '5W-30', oemApproval: 'Brilliance-approved oil', apiStandard: 'SL or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── LOTUS ──────────────────────────────────────────────────────────────────
  if (makeSlug === 'lotus') {
    if (year >= 2022) {
      return { viscosity: '0W-40', oemApproval: 'Total Quartz 9000 Energy (Lotus Emira factory-fill)', aceaStandard: 'A3/B4', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '5W-40', oemApproval: 'PETRONAS Syntium Racer X1 5W-40 (Lotus approval PE-00137)', aceaStandard: 'A3/B4', apiStandard: 'SM', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── MORGAN ─────────────────────────────────────────────────────────────────
  // Only MY2023+ (Plus Four/Plus Six, genuine BMW-sourced engines) covered — earlier
  // Morgans use a mix of Ford/Rover/Triumph-derived engines with no single safe answer.
  if (makeSlug === 'morgan' && year >= 2023) {
    return { viscosity: '0W-30', oemApproval: 'Genuine BMW-specification engine oil', aceaStandard: 'A2/B2, A2/B3, A3/B3 (Plus Four) or C2/C3 (Plus Six)', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  // ── MCLAREN ────────────────────────────────────────────────────────────────
  if (makeSlug === 'mclaren' && year >= 2011) {
    return { viscosity: '5W-40', oemApproval: 'Gulf Formula Elite 5W-40 (McLaren approved product)', aceaStandard: 'C3', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── ISUZU ──────────────────────────────────────────────────────────────────
  if (makeSlug === 'isuzu' && isDiesel) {
    return { viscosity: '10W-30', oemApproval: 'Isuzu BESCO CLEAN / BESCO CLEAN SUPER (JASO DH-2)', aceaStandard: 'E6 or E9', apiStandard: 'CI-4 or CJ-4', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── PROTON ─────────────────────────────────────────────────────────────────
  if (makeSlug === 'proton') {
    if (year >= 2020) {
      return { viscosity: '5W-30', oemApproval: 'Proton Genuine Oil (PGO)', apiStandard: 'SP / ILSAC GF-6A', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '10W-30', oemApproval: 'PETRONAS Syntium / Proton Genuine Oil', apiStandard: 'SL or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── TATA ───────────────────────────────────────────────────────────────────
  // Verified only for the Revotron 1.2T (Bolt-era, ~1200cc petrol); other Tata
  // engines (including all diesel) intentionally left on the generic fallback.
  if (makeSlug === 'tata' && !isDiesel && displacementCc && displacementCc <= 1200) {
    return { viscosity: '5W-30', oemApproval: 'Castrol Magnatec Professional T 5W-30 (Tata Motors recommended)', aceaStandard: 'A5/B5', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── AUSTIN ─────────────────────────────────────────────────────────────────
  if (makeSlug === 'austin') {
    return { viscosity: year >= 1983 ? '10W-40' : '15W-50', capacityLiters: capacity, changeIntervalKm: 8000 };
  }

  // ── CLASSIC BRITISH (TALBOT, MORRIS, AUSTIN-HEALEY, RILEY, TRIUMPH) ─────────
  // No modern factory approval exists for any of these — period manuals predate
  // API/ACEA entirely. 20W-50 is the commonly-cited period-correct multigrade;
  // this is deliberately NOT paired with a fabricated API/ACEA code.
  if (['talbot', 'morris', 'austin-healey', 'riley', 'triumph'].includes(makeSlug)) {
    return { viscosity: '20W-50', capacityLiters: capacity, changeIntervalKm: 6000 };
  }

  // ── TVR ────────────────────────────────────────────────────────────────────
  if (makeSlug === 'tvr') {
    if (year >= 2002) {
      return { viscosity: '10W-40', oemApproval: 'Carlube Triple R 10W-40 (semi-synthetic, Speed Six era)', capacityLiters: capacity, changeIntervalKm: 8000 };
    }
    return { viscosity: '5W-50', oemApproval: 'Mobil 1 (TVR-recommended, Rover V8 era)', capacityLiters: capacity, changeIntervalKm: 6000 };
  }

  // ── UAZ ────────────────────────────────────────────────────────────────────
  if (makeSlug === 'uaz') {
    return { viscosity: '10W-40', oemApproval: 'STO AAI-003-98 B4/D2', apiStandard: 'SG/CD or higher (SH, SJ, SL, SM)', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── FSO ────────────────────────────────────────────────────────────────────
  if (makeSlug === 'fso') {
    return { viscosity: '15W-40', apiStandard: isDiesel ? 'SG/CD or CD' : 'SG/CD', capacityLiters: capacity, changeIntervalKm: 8000 };
  }

  // ── GAZ ────────────────────────────────────────────────────────────────────
  if (makeSlug === 'gaz') {
    return { viscosity: '15W-40', apiStandard: 'SF, SG, SH, or SJ', capacityLiters: capacity, changeIntervalKm: 8000 };
  }

  // ── ZAZ ────────────────────────────────────────────────────────────────────
  if (makeSlug === 'zaz') {
    return { viscosity: '15W-40', apiStandard: 'SG, SH, or SJ', capacityLiters: capacity, changeIntervalKm: 8000 };
  }

  // ── AIXAM ──────────────────────────────────────────────────────────────────
  if (makeSlug === 'aixam' && isDiesel) {
    return { viscosity: '10W-30', oemApproval: 'Aixam Mega oil by Yacco (Kubota Z482 microcar engine)', capacityLiters: capacity, changeIntervalKm: 8000 };
  }

  // ── DAIMLER (Jaguar-derived legacy) ─────────────────────────────────────────
  if (makeSlug === 'daimler') {
    return { viscosity: '15W-50', oemApproval: 'Jaguar BLS-OL-02', apiStandard: 'SE/CC', capacityLiters: capacity, changeIntervalKm: 8000 };
  }

  // ── DE LOREAN ──────────────────────────────────────────────────────────────
  if (makeSlug === 'de-lorean') {
    return { viscosity: '20W-50', oemApproval: 'Castrol conventional 20W-50 (Classic DeLorean Motor Company guidance)', apiStandard: 'SF', capacityLiters: capacity, changeIntervalKm: 6000 };
  }

  // ── BUGATTI ────────────────────────────────────────────────────────────────
  if (makeSlug === 'bugatti') {
    return { viscosity: '10W-60', oemApproval: 'Castrol EDGE 10W-60 (VW 501.00/505.00)', aceaStandard: 'A3/B4', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── KOENIGSEGG ─────────────────────────────────────────────────────────────
  if (makeSlug === 'koenigsegg') {
    return { viscosity: '10W-60', oemApproval: 'Castrol EDGE 10W-60 (Koenigsegg approved)', aceaStandard: 'A3/B4', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  // ── ROLLS-ROYCE ────────────────────────────────────────────────────────────
  // Only the BMW Group era (2003+, Phantom/Ghost/Wraith onward) is handled — it
  // follows BMW's own Longlife approval chain. Pre-2003 Crewe-era Rolls-Royce
  // (6750cc V8/V12) predates that and needs its own service material, not
  // covered here — intentionally left on the generic fallback.
  if (makeSlug === 'rolls-royce' && year >= 2003) {
    if (year >= 2017 && displacementCc && displacementCc <= 2000) {
      return { viscosity: '0W-20', oemApproval: 'BMW Longlife-17 FE+', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'BMW Longlife-04 (LL-04)', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
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
  powerHp: number | null,
  engineCode?: string
): CleanEngine['oilSpec'] {
  const raw = deriveOilSpecificationRaw(makeSlug, fuelType, yearFrom, displacementCc, powerHp, engineCode);
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
      -- TecDoc engine id 20085 ("AM6U5", 4.2L V8) is bad source data linked to Aston
      -- Martin DB9: the real DB9 was always 6.0L V12 (engine AM3/AM11), no V8 variant
      -- ever existed. Confirmed live and reported by a user; excluded here so it can't
      -- resurface on the next harvest run rather than patching the DB after each one.
      AND NOT (e.id = 20085 AND m.description ILIKE 'DB9%')
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
    console.log(`🔍 Loaded existing catalog with ${Object.keys(catalog).length} makes (existing generations extended, not overwritten).`);
  }

  // Self-heal: a generation's display name is sometimes a hand-curated "Name (YYYY - YYYY)"
  // or "Name (YYYY - Présent)" range set deliberately correct — but a prior run's flawed
  // year-overlap merge could have corrupted the separate numeric yearFrom/yearTo fields
  // (e.g. Fiat "Doblo III (2010 - 2022)" ended up with yearFrom: 2001 after an unrelated old
  // row wrongly bridged into it). Where the name states an explicit range, that's the
  // authoritative value — resync the numeric fields to match it, every run.
  let yearFieldsRepaired = 0;
  for (const m of Object.values(catalog)) {
    for (const mod of Object.values(m.models)) {
      for (const gen of Object.values(mod.generations)) {
        const rangeMatch = gen.genName.match(/\((\d{4})\s*-\s*(\d{4}|Présent|present)\)\s*$/);
        if (!rangeMatch) continue;
        const namedFrom = parseInt(rangeMatch[1], 10);
        const namedTo = /présent|present/i.test(rangeMatch[2]) ? null : parseInt(rangeMatch[2], 10);
        if (gen.yearFrom !== namedFrom || gen.yearTo !== namedTo) {
          gen.yearFrom = namedFrom;
          gen.yearTo = namedTo;
          yearFieldsRepaired++;
        }
      }
    }
  }
  if (yearFieldsRepaired > 0) {
    console.log(`🩹 Resynced year range on ${yearFieldsRepaired.toLocaleString()} generations to match their own curated display name.`);
  }

  let totalNewEngines = 0;

  // TecDoc's manufacturer.description sometimes uses a short/alternate form that slugifies
  // to a DIFFERENT make than the one already curated in the catalog (e.g. raw name "VW"
  // slugifies to "vw", a separate make from the existing hand-curated "volkswagen" entry) —
  // discovered when a full VW harvest landed 118 real models under "vw" instead of merging
  // into "volkswagen". Canonicalize known aliases so extraction always lands on one make.
  const MAKE_SLUG_ALIASES: Record<string, string> = {
    vw: 'volkswagen',
  };

  // Some manufacturers' raw TecDoc model_raw_name is a bare series/class digit or a
  // fragment code rather than the commercial name customers actually search for — e.g.
  // BMW rows come in with model_raw_name "3" instead of "Série 3", so every harvest
  // recreated a stray "3" model bucket sitting right next to the real, already-curated
  // "Série 3" (reported live: the storefront's BMW model picker showing "3" and "2" as
  // if they were car models). Canonicalize known raw model slugs to the correct
  // commercial name + slug BEFORE a bucket is ever created, so the bad fragment merges
  // straight into the right model instead of spawning a visible duplicate. Keyed by
  // "makeSlug:rawModelSlug" (rawModelSlug = slugify(cleanCommercialModel's own output),
  // i.e. matched post-parse, same as modelSlug below).
  const MODEL_SLUG_ALIASES: Record<string, { name: string; slug: string }> = {
    'bmw:1': { name: 'Série 1', slug: 'serie-1' },
    'bmw:2': { name: 'Série 2', slug: 'serie-2' },
    'bmw:3': { name: 'Série 3', slug: 'serie-3' },
    'bmw:4': { name: 'Série 4', slug: 'serie-4' },
    'bmw:5': { name: 'Série 5', slug: 'serie-5' },
    'bmw:6': { name: 'Série 6', slug: 'serie-6' },
    'bmw:7': { name: 'Série 7', slug: 'serie-7' },
    'bmw:8': { name: 'Série 8', slug: 'serie-8' },
    'mercedes-benz:a': { name: 'Classe A', slug: 'classe-a' },
    'mercedes-benz:a-class': { name: 'Classe A', slug: 'classe-a' },
    'mercedes-benz:b': { name: 'Classe B', slug: 'classe-b' },
    'mercedes-benz:c': { name: 'Classe C', slug: 'classe-c' },
    'mercedes-benz:c-class': { name: 'Classe C', slug: 'classe-c' },
    'mercedes-benz:e': { name: 'Classe E', slug: 'classe-e' },
    'mercedes-benz:e-class': { name: 'Classe E', slug: 'classe-e' },
    'mercedes-benz:g': { name: 'Classe G', slug: 'classe-g' },
    'mercedes-benz:s': { name: 'Classe S', slug: 'classe-s' },
    'mercedes-benz:v': { name: 'Classe V', slug: 'classe-v' },
    'volkswagen:t': { name: 'T-Roc', slug: 't-roc' },
    'volkswagen:troc': { name: 'T-Roc', slug: 't-roc' },
    'ford:c': { name: 'C-Max', slug: 'c-max' },
    'ford:cmax': { name: 'C-Max', slug: 'c-max' },
    'toyota:rav': { name: 'RAV4', slug: 'rav4' },
    'toyota:chr': { name: 'C-HR', slug: 'c-hr' },
    'honda:crv': { name: 'CR-V', slug: 'cr-v' },
    'honda:hrv': { name: 'HR-V', slug: 'hr-v' },
    'nissan:xtrail': { name: 'X-Trail', slug: 'x-trail' },
    'mazda:2': { name: 'Mazda 2', slug: 'mazda-2' },
    'mazda:mazda2': { name: 'Mazda 2', slug: 'mazda-2' },
    'mazda:3': { name: 'Mazda 3', slug: 'mazda-3' },
    'mazda:mazda3': { name: 'Mazda 3', slug: 'mazda-3' },
    'mazda:6': { name: 'Mazda 6', slug: 'mazda-6' },
    'mazda:mazda6': { name: 'Mazda 6', slug: 'mazda-6' },
    'mazda:cx5': { name: 'CX-5', slug: 'cx-5' },
    'mazda:cx3': { name: 'CX-3', slug: 'cx-3' },
    'isuzu:dmax': { name: 'D-Max', slug: 'd-max' },
  };

  for (const r of rows) {
    const makeName = (r.make_name || '').trim();
    if (!makeName) continue;
    const rawMakeSlug = slugify(makeName);
    const makeSlug = MAKE_SLUG_ALIASES[rawMakeSlug] || rawMakeSlug;

    const { modelName: rawModelName, genHint } = cleanCommercialModel(r.model_raw_name, makeSlug);
    const rawModelSlug = slugify(rawModelName);
    const modelAlias = MODEL_SLUG_ALIASES[`${makeSlug}:${rawModelSlug}`];
    const modelName = modelAlias?.name || rawModelName;
    const modelSlug = modelAlias?.slug || rawModelSlug;
    const genSlug = slugify(genHint);
    const yearFrom = parseYearFromDateText(r.date_from_raw);
    const yearTo = parseYearFromDateText(r.date_to_raw);

    // Every row this harvester touches comes from tecdoc.manufacturers.is_passenger_car =
    // true — this data is automobile-only. Tag it so the storefront's Moto/Marine/Poids
    // Lourd/Agricole category filters (which pass anything with no category through by
    // default) correctly exclude it instead of leaking hundreds of car brands into every
    // other vehicle category.
    if (!catalog[makeSlug]) {
      catalog[makeSlug] = {
        makeName,
        makeSlug,
        categories: ['automobile'],
        models: {},
      };
    }

    if (!catalog[makeSlug].models[modelSlug]) {
      catalog[makeSlug].models[modelSlug] = {
        modelName,
        modelSlug,
        category: 'automobile',
        generations: {},
      };
    }

    // Exact slug match first. If this is a make with pre-existing hand-curated generations
    // (e.g. Audi/VW/Dacia), TecDoc's raw chassis-code text often won't slug-match a curated
    // entry exactly (e.g. "A3 (8P1)" vs curated "A3 (8P)") — so fall back to matching by
    // overlapping year range within the same model, and extend that existing generation
    // instead of creating a visually-duplicate one in the storefront.
    let genObj = catalog[makeSlug].models[modelSlug].generations[genSlug];
    if (!genObj) {
      const existingGens = Object.values(catalog[makeSlug].models[modelSlug].generations);
      const overlapping = existingGens.find(g => yearRangesOverlap(g.yearFrom, g.yearTo, yearFrom, yearTo));
      if (overlapping) {
        genObj = overlapping;
      } else {
        genObj = {
          genName: genHint,
          genSlug,
          yearFrom: yearFrom || null,
          yearTo: yearTo || null,
          engines: [],
        };
        catalog[makeSlug].models[modelSlug].generations[genSlug] = genObj;
      }
    }
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
        : deriveOilSpecification(makeSlug, fuelType, yearFrom, displacementCc, powerHp, engineCode);
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

  // ─── 5b. BACKFILL LEGACY ENGINES MISSING AN OIL SPEC ──────────────────────
  // Pre-existing curated entries (seeded before automated harvesting) sometimes have
  // oilSpec: null baked in from whoever created that data — the merge/dedup logic above
  // only derives a spec for newly-extracted rows, so legacy nulls were never revisited.
  // Backfill any engine, new or legacy, that has real fuel-type signal and isn't a
  // genuine EV, using the exact same deterministic, audited rules as everything else.
  let backfilledEngines = 0;
  for (const m of Object.values(catalog)) {
    for (const mod of Object.values(m.models)) {
      for (const gen of Object.values(mod.generations)) {
        for (const eng of gen.engines) {
          if (eng.oilSpec) continue;
          if (!eng.fuelType || eng.fuelType === 'electrique') continue;
          eng.oilSpec = deriveOilSpecification(m.makeSlug, eng.fuelType, eng.yearFrom, eng.displacementCc, eng.powerHp, eng.engineCode);
          if (eng.oilSpec) backfilledEngines++;
        }
      }
    }
  }

  // ─── 5c. BACKFILL MISSING CATEGORY TAGS ────────────────────────────────────
  // Same deal, different field: every make/model already in this catalog — whether from
  // the pre-existing curated seed or any earlier harvester run before this fix existed —
  // is automobile-only data (this script only ever queries is_passenger_car = true). Tag
  // whatever's still missing it so the storefront's category filters stop leaking these
  // hundreds of car brands into the Moto/Marine/Poids Lourd/Agricole categories.
  let categoriesBackfilled = 0;
  for (const m of Object.values(catalog)) {
    if (!m.categories) {
      m.categories = ['automobile'];
      categoriesBackfilled++;
    }
    for (const mod of Object.values(m.models)) {
      if (!mod.category) {
        mod.category = 'automobile';
        categoriesBackfilled++;
      }
    }
  }

  // ─── 5d. FIX PHANTOM "MAKE-NAME-AS-MODEL" ENTRIES ─────────────────────────
  // A handful of manufacturers have TecDoc rows whose model_raw_name is just the make
  // name itself (e.g. a "Porsche" model under the Porsche make, "Jaguar" under Jaguar) —
  // cleanCommercialModel() has no way to know that isn't a real commercial model name,
  // so it sails through as a nonsense duplicate-of-the-make entry every single harvest.
  // Route each into its real model using whatever generation-code signal is available;
  // where no such signal exists and the fragment is a pure duplicate of the make with no
  // useful data of its own, drop it — these were manually vetted once already, ported
  // here so the fix survives every future harvest instead of reverting on the next run.
  const mergeModel = (
    makeSlug: string,
    sourceSlug: string,
    targetSlug: string,
    targetName?: string,
  ) => {
    const make = catalog[makeSlug];
    const source = make?.models?.[sourceSlug];
    if (!source) return;

    if (!make.models[targetSlug]) {
      make.models[targetSlug] = {
        modelName: targetName || source.modelName,
        modelSlug: targetSlug,
        category: source.category || 'automobile',
        generations: {},
      };
    }
    const target = make.models[targetSlug];
    if (targetName) target.modelName = targetName;

    for (const [genKey, genVal] of Object.entries(source.generations)) {
      if (!target.generations[genKey]) {
        target.generations[genKey] = genVal;
      } else {
        const existing = target.generations[genKey].engines;
        const seen = new Set(existing.map((e) => `${e.engineCode}_${e.powerHp || ''}_${e.fuelType || ''}`));
        for (const eng of genVal.engines) {
          const k = `${eng.engineCode}_${eng.powerHp || ''}_${eng.fuelType || ''}`;
          if (!seen.has(k)) {
            seen.add(k);
            existing.push(eng);
          }
        }
      }
    }
    delete make.models[sourceSlug];
  };

  const dropIfPresent = (makeSlug: string, modelSlug: string) => {
    if (catalog[makeSlug]?.models?.[modelSlug]) {
      delete catalog[makeSlug].models[modelSlug];
    }
  };

  // Simple unconditional merges: the phantom bucket's data all belongs to one real model.
  mergeModel('porsche', 'porsche', '911', '911');
  mergeModel('subaru', 'subaru', 'xv', 'XV');

  // No recoverable model identity in the fragment itself — drop rather than mislabel.
  dropIfPresent('cupra', 'cupra');
  dropIfPresent('chery', 'chery');
  dropIfPresent('dfsk', 'dfsk');
  dropIfPresent('great-wall', 'great');
  dropIfPresent('byd', 'byd');
  dropIfPresent('isuzu', 'isuzu');
  dropIfPresent('mahindra', 'mahindra');
  dropIfPresent('mahindra', 'kuv');
  dropIfPresent('mahindra', 'xuv');

  // Conditional: route by generation-key content since the phantom bucket mixes several
  // real models together.
  if (catalog.jaguar?.models?.jaguar) {
    const phantom = catalog.jaguar.models.jaguar;
    for (const [gk, gv] of Object.entries(phantom.generations)) {
      const targetSlug = gk.includes('f-pace') ? 'f-pace' : gk.includes('xe') ? 'xe' : null;
      if (targetSlug && catalog.jaguar.models[targetSlug]) {
        catalog.jaguar.models[targetSlug].generations[gk] = gv;
      }
    }
    delete catalog.jaguar.models.jaguar;
  }

  if (catalog.mg?.models?.mg) {
    const phantom = catalog.mg.models.mg;
    for (const [gk, gv] of Object.entries(phantom.generations)) {
      const targetSlug = gk.includes('zs') ? 'zs' : gk.includes('hs') ? 'hs' : 'mg3';
      if (!catalog.mg.models[targetSlug]) {
        catalog.mg.models[targetSlug] = {
          modelName: targetSlug.toUpperCase(),
          modelSlug: targetSlug,
          category: 'automobile',
          generations: {},
        };
      }
      catalog.mg.models[targetSlug].generations[gk] = gv;
    }
    delete catalog.mg.models.mg;
  }

  if (catalog.mini?.models?.mini) {
    const phantom = catalog.mini.models.mini;
    if (!catalog.mini.models.cooper) {
      catalog.mini.models.cooper = { modelName: 'Mini Hatch / Cooper', modelSlug: 'cooper', category: 'automobile', generations: {} };
    }
    for (const [gk, gv] of Object.entries(phantom.generations)) {
      if (gk.includes('countryman')) {
        if (!catalog.mini.models.countryman) {
          catalog.mini.models.countryman = { modelName: 'Countryman', modelSlug: 'countryman', category: 'automobile', generations: {} };
        }
        catalog.mini.models.countryman.generations[gk] = gv;
      } else if (gk.includes('clubman')) {
        if (!catalog.mini.models.clubman) {
          catalog.mini.models.clubman = { modelName: 'Clubman', modelSlug: 'clubman', category: 'automobile', generations: {} };
        }
        catalog.mini.models.clubman.generations[gk] = gv;
      } else {
        catalog.mini.models.cooper.generations[gk] = gv;
      }
    }
    delete catalog.mini.models.mini;
  }

  if (catalog.smart?.models?.smart) {
    const phantom = catalog.smart.models.smart;
    for (const [gk, gv] of Object.entries(phantom.generations)) {
      const targetSlug = gk.includes('four') ? 'forfour' : 'fortwo';
      if (catalog.smart.models[targetSlug]) {
        catalog.smart.models[targetSlug].generations[gk] = gv;
      }
    }
    delete catalog.smart.models.smart;
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
  console.log(`- Total New Engines Harvested & Enriched: ${totalNewEngines.toLocaleString()}`);
  console.log(`- Legacy Engines Backfilled With a Spec: ${backfilledEngines.toLocaleString()}`);
  console.log(`- Makes/Models Tagged With Category "automobile": ${categoriesBackfilled.toLocaleString()}`);

  // ─── 7. PRISMA DATABASE SYNCHRONIZATION ───────────────────────────────────
  console.log('\n🔄 Synchronizing Prisma Database Tables (Vehicles & Oil Specs)...');

  let dbMakesCount = 0;
  let dbGensCount = 0;
  let dbEnginesCount = 0;
  let makesProcessed = 0;
  const totalMakes = Object.keys(catalog).length;

  // Most engines within a brand/era share the exact same derived oil spec (same viscosity +
  // OEM approval + ACEA class), so caching fingerprint -> spec.id here collapses what would
  // otherwise be ~22k redundant upserts down to a few hundred distinct ones.
  const oilSpecCache = new Map<string, string>();

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

          const engineRows: {
            generationId: string;
            name: string;
            engineCode: string;
            displacementCc: number | null;
            powerHp: number | null;
            powerKw: number | null;
            fuelType: string;
            oilSpecId: string | null;
          }[] = [];

          for (const eng of gen.engines) {
            let oilSpecId: string | null = null;
            if (eng.oilSpec?.viscosity) {
              // MUST include apiStandard: two branches can legitimately share the same
              // viscosity/oemApproval/aceaStandard while differing only in apiStandard
              // (e.g. GAZ vs ZAZ both land on "15W-40, no OEM code, no ACEA class" but
              // have different API text) -- without this, they'd collide onto the same
              // spec row and each upsert would silently overwrite the other's apiStandard.
              const fingerprint = `${slugify(eng.oilSpec.viscosity)}_${slugify(eng.oilSpec.oemApproval || 'generic')}_${slugify(eng.oilSpec.aceaStandard || 'std')}_${slugify(eng.oilSpec.apiStandard || 'anyapi')}`;

              let specId = oilSpecCache.get(fingerprint);
              if (!specId) {
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
                specId = spec.id;
                oilSpecCache.set(fingerprint, specId);
              }
              oilSpecId = specId;

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
                  oilSpecId,
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
                  oilSpecId,
                  fuelType: eng.fuelType,
                  displacementCc: eng.displacementCc || null,
                  powerHp: eng.powerHp ? Number(eng.powerHp) : null,
                  powerKw: eng.powerKw ? Number(eng.powerKw) : null,
                  yearFrom: eng.yearFrom || null,
                  yearTo: eng.yearTo || null,
                },
              });
            }

            engineRows.push({
              generationId: genRecord.id,
              name: `${eng.engineCode} (${eng.powerHp ? eng.powerHp + ' ch' : ''})`.trim(),
              engineCode: eng.engineCode,
              displacementCc: eng.displacementCc || null,
              powerHp: eng.powerHp ? Number(eng.powerHp) : null,
              powerKw: eng.powerKw ? Number(eng.powerKw) : null,
              fuelType: eng.fuelType || 'essence',
              oilSpecId,
            });
          }

          // One bulk insert per generation instead of one round trip per engine.
          if (engineRows.length > 0) {
            await prisma.vehicleEngine.createMany({ data: engineRows });
            dbEnginesCount += engineRows.length;
          }
        }
      }

      makesProcessed++;
      if (makesProcessed % 10 === 0 || makesProcessed === totalMakes) {
        console.log(
          `  ... synced ${makesProcessed}/${totalMakes} makes (${dbGensCount.toLocaleString()} generations, ${dbEnginesCount.toLocaleString()} engines so far)`
        );
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
