import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { OilFinderOilSpec } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

let cachedCleanCatalog: any = null;
function getCleanCatalog(): Record<string, any> {
  if (!cachedCleanCatalog) {
    const candidatePaths = [
      path.join(__dirname, 'clean-catalog-hierarchy.json'),
      path.join(__dirname, '..', '..', 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
      path.join(process.cwd(), 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
      path.join(process.cwd(), 'backend', 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
      path.join(process.cwd(), 'dist', 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
    ];
    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p)) {
          cachedCleanCatalog = JSON.parse(fs.readFileSync(p, 'utf8'));
          break;
        }
      } catch {}
    }
  }
  return cachedCleanCatalog || {};
}

export type OilSpecRef = Pick<
  OilFinderOilSpec,
  'id' | 'viscosity' | 'apiStandard' | 'aceaStandard' | 'oemApproval' | 'capacityLiters' | 'changeIntervalKm'
>

export interface OilFinderCandidate {
  make: string
  model: string
  generation: string
  yearFrom: number | null
  yearTo: number | null
  engineCode: string
  displacementCc: number | null
  powerKw: number | null
  powerHp: number | null
  fuelType: string
  source: string
  confidence: string
  matchAmbiguity: unknown
  oilSpec: OilSpecRef
}

export type OilFinderResult =
  | {
      status: 'found'
      oilSpec: OilSpecRef
      resolvedBy: 'exact' | 'minor-conflict-auto-resolve'
      confidence: 'high' | 'medium'
      backingRows: number
      candidates: OilFinderCandidate[]
    }
  | {
      status: 'ambiguous'
      message: string
      candidates: OilFinderCandidate[]
    }
  | {
      status: 'not_found'
      message: string
    }

const normFuel = (fuelType: string): string => fuelType.trim().toLowerCase()

function slugify(text: string): string {
  return text
    .toLowerCase()
    // Normalize accented characters (é→e, ë→e, ü→u, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace non-alphanumeric (including parens, slashes, etc.) with dash
    .replace(/[^a-z0-9]+/g, '-')
    // Trim leading/trailing dashes
    .replace(/^-+|-+$/g, '');
}

export const BRAND_ALIASES: Record<string, string[]> = {
  // Cars & Commercial
  volkswagen: ['vw', 'volkswagen', 'volks'],
  vw: ['vw', 'volkswagen', 'volks'],
  bmw: ['bmw', 'b-m-w', 'bmw-ag'],
  mini: ['mini', 'mini-bmw', 'cooper'],
  mercedes: ['mercedes-benz', 'mercedes', 'merce', 'mercedes benz', 'daimler'],
  'mercedes-benz': ['mercedes-benz', 'mercedes', 'merce', 'mercedes benz', 'daimler'],
  smart: ['smart'],
  citroen: ['citroen', 'citroën', 'citro', 'citro-n'],
  'citroën': ['citroen', 'citroën', 'citro', 'citro-n'],
  peugeot: ['peugeot', 'psa'],
  ds: ['ds', 'ds-automobiles', 'citroen-ds', 'ds automobiles'],
  renault: ['renault', 'dacia'],
  dacia: ['dacia', 'renault'],
  opel: ['opel', 'vauxhall', 'gm'],
  vauxhall: ['opel', 'vauxhall', 'gm'],
  fiat: ['fiat', 'abarth'],
  'alfa-romeo': ['alfa-romeo', 'alfa romeo', 'alfa', 'alfaromeo'],
  alfa: ['alfa-romeo', 'alfa romeo', 'alfa', 'alfaromeo'],
  lancia: ['lancia'],
  jeep: ['jeep'],
  ford: ['ford'],
  seat: ['seat', 'cupra'],
  cupra: ['seat', 'cupra'],
  skoda: ['skoda', 'škoda'],
  'škoda': ['skoda', 'škoda'],
  audi: ['audi'],
  toyota: ['toyota'],
  lexus: ['lexus'],
  hyundai: ['hyundai'],
  kia: ['kia'],
  nissan: ['nissan'],
  infiniti: ['infiniti'],
  honda: ['honda'],
  volvo: ['volvo'],
  mazda: ['mazda'],
  mitsubishi: ['mitsubishi', 'mitsu'],
  subaru: ['subaru'],
  suzuki: ['suzuki'],
  'land-rover': ['land-rover', 'land rover', 'landrover', 'range-rover', 'range rover', 'rangerover', 'rover'],
  'land rover': ['land-rover', 'land rover', 'landrover', 'range-rover', 'range rover', 'rangerover', 'rover'],
  jaguar: ['jaguar', 'jag'],
  porsche: ['porsche'],
  chevrolet: ['chevrolet', 'chevy'],
  ssangyong: ['ssangyong', 'ssang yong', 'kg-mobility'],
  mg: ['mg', 'mg-motor', 'morris-garages'],
  haval: ['haval', 'great-wall-haval'],
  geely: ['geely'],
  chery: ['chery'],
  dfsk: ['dfsk', 'dongfeng', 'sokon'],
  'great-wall': ['great-wall', 'great wall', 'greatwall', 'gwm'],
  'great wall': ['great-wall', 'great wall', 'greatwall', 'gwm'],
  byd: ['byd', 'byd-auto'],
  mahindra: ['mahindra'],
  isuzu: ['isuzu'],
  iveco: ['iveco'],
  lada: ['lada', 'vaz', 'avtovaz'],

  // Motorbikes
  yamaha: ['yamaha', 'yamah', 'yamaha-motorcycles', 'yamaha-mot', 'yamaha motorcycles', 'yamaha mot'],
  'harley-davidson': ['harley-davidson', 'harley-davidson-mc', 'harley-dav', 'harley-davidson mc', 'harley'],
  harley: ['harley-davidson', 'harley-davidson-mc', 'harley-dav', 'harley-davidson mc', 'harley'],
  vespa: ['vespa', 'vespa-motorcycles', 'vespa-moto', 'vespa motorcycles', 'vespa moto', 'piaggio'],
  'bmw-motorrad': ['bmw-motorrad', 'motorrad', 'motorrad-motorcycles', 'motorrad motorcycles', 'bmw'],
  motorrad: ['motorrad', 'motorrad-motorcycles', 'motorrad motorcycles', 'bmw-motorrad'],
};

export const BRAND_DEFAULT_SPECS: Record<string, {
  viscosity: string;
  apiStandard: string;
  aceaStandard: string;
  oemApproval: string;
  capacityLiters: number;
  changeIntervalKm: number;
}> = {
  volkswagen: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'VW 504 00 / 507 00 (LongLife III)',
    capacityLiters: 4.5,
    changeIntervalKm: 15000,
  },
  vw: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'VW 504 00 / 507 00 (LongLife III)',
    capacityLiters: 4.5,
    changeIntervalKm: 15000,
  },
  bmw: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'BMW Longlife-04 (LL-04)',
    capacityLiters: 5.2,
    changeIntervalKm: 15000,
  },
  mini: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'BMW Longlife-04 (LL-04)',
    capacityLiters: 4.5,
    changeIntervalKm: 15000,
  },
  mercedes: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'MB 229.51 / MB 229.52',
    capacityLiters: 5.5,
    changeIntervalKm: 15000,
  },
  'mercedes-benz': {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'MB 229.51 / MB 229.52',
    capacityLiters: 5.5,
    changeIntervalKm: 15000,
  },
  smart: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'MB 229.51 / MB 229.52',
    capacityLiters: 3.5,
    changeIntervalKm: 15000,
  },
  audi: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'VW 504 00 / 507 00 (LongLife III)',
    capacityLiters: 4.5,
    changeIntervalKm: 15000,
  },
  seat: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'VW 504 00 / 507 00 (LongLife III)',
    capacityLiters: 4.5,
    changeIntervalKm: 15000,
  },
  cupra: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'VW 504 00 / 507 00 (LongLife III)',
    capacityLiters: 4.5,
    changeIntervalKm: 15000,
  },
  skoda: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'VW 504 00 / 507 00 (LongLife III)',
    capacityLiters: 4.5,
    changeIntervalKm: 15000,
  },
  'škoda': {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'VW 504 00 / 507 00 (LongLife III)',
    capacityLiters: 4.5,
    changeIntervalKm: 15000,
  },
  peugeot: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2',
    oemApproval: 'Peugeot Citroën PSA B71 2290',
    capacityLiters: 3.8,
    changeIntervalKm: 15000,
  },
  citroen: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2',
    oemApproval: 'Peugeot Citroën PSA B71 2290',
    capacityLiters: 3.8,
    changeIntervalKm: 15000,
  },
  'citroën': {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2',
    oemApproval: 'Peugeot Citroën PSA B71 2290',
    capacityLiters: 3.8,
    changeIntervalKm: 15000,
  },
  ds: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2',
    oemApproval: 'Peugeot Citroën PSA B71 2290',
    capacityLiters: 3.8,
    changeIntervalKm: 15000,
  },
  renault: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'Renault RN17 / RN0700 / RN0710',
    capacityLiters: 4.2,
    changeIntervalKm: 15000,
  },
  dacia: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'Renault RN17 / RN0700 / RN0710',
    capacityLiters: 4.2,
    changeIntervalKm: 15000,
  },
  opel: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'GM Dexos2',
    capacityLiters: 4.5,
    changeIntervalKm: 15000,
  },
  vauxhall: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'GM Dexos2',
    capacityLiters: 4.5,
    changeIntervalKm: 15000,
  },
  ford: {
    viscosity: '5W-30',
    apiStandard: 'SL/CF',
    aceaStandard: 'A5/B5',
    oemApproval: 'Ford WSS-M2C913-D / WSS-M2C913-C',
    capacityLiters: 4.1,
    changeIntervalKm: 15000,
  },
  fiat: {
    viscosity: '5W-40',
    apiStandard: 'SN/CF',
    aceaStandard: 'C3',
    oemApproval: 'Fiat 9.55535-S2',
    capacityLiters: 3.5,
    changeIntervalKm: 15000,
  },
  'alfa-romeo': {
    viscosity: '5W-40',
    apiStandard: 'SN/CF',
    aceaStandard: 'C3',
    oemApproval: 'Fiat 9.55535-S2 / Selenia WR',
    capacityLiters: 4.0,
    changeIntervalKm: 15000,
  },
  alfa: {
    viscosity: '5W-40',
    apiStandard: 'SN/CF',
    aceaStandard: 'C3',
    oemApproval: 'Fiat 9.55535-S2 / Selenia WR',
    capacityLiters: 4.0,
    changeIntervalKm: 15000,
  },
  lancia: {
    viscosity: '5W-40',
    apiStandard: 'SN/CF',
    aceaStandard: 'C3',
    oemApproval: 'Fiat 9.55535-S2',
    capacityLiters: 3.5,
    changeIntervalKm: 15000,
  },
  jeep: {
    viscosity: '5W-40',
    apiStandard: 'SN/CF',
    aceaStandard: 'C3',
    oemApproval: 'Fiat 9.55535-S2 / Chrysler MS-12991',
    capacityLiters: 4.0,
    changeIntervalKm: 15000,
  },
  toyota: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2 / C3',
    oemApproval: 'Toyota / Hyundai / Kia / Nissan / Asian OEM',
    capacityLiters: 4.0,
    changeIntervalKm: 15000,
  },
  lexus: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2 / C3',
    oemApproval: 'Toyota / Hyundai / Kia / Nissan / Asian OEM',
    capacityLiters: 4.0,
    changeIntervalKm: 15000,
  },
  hyundai: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2 / C3',
    oemApproval: 'Toyota / Hyundai / Kia / Nissan / Asian OEM',
    capacityLiters: 4.0,
    changeIntervalKm: 15000,
  },
  kia: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2 / C3',
    oemApproval: 'Toyota / Hyundai / Kia / Nissan / Asian OEM',
    capacityLiters: 4.0,
    changeIntervalKm: 15000,
  },
  nissan: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2 / C3',
    oemApproval: 'Toyota / Hyundai / Kia / Nissan / Asian OEM',
    capacityLiters: 4.0,
    changeIntervalKm: 15000,
  },
  infiniti: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2 / C3',
    oemApproval: 'Toyota / Hyundai / Kia / Nissan / Asian OEM',
    capacityLiters: 4.0,
    changeIntervalKm: 15000,
  },
  honda: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'A3/B4',
    oemApproval: 'Honda 08W30-P99-810HE / Asian API SN',
    capacityLiters: 4.0,
    changeIntervalKm: 15000,
  },
  volvo: {
    viscosity: '0W-20',
    apiStandard: 'SN',
    aceaStandard: 'C5',
    oemApproval: 'Volvo VCC-RBS0-2AE / Volvo XC',
    capacityLiters: 5.6,
    changeIntervalKm: 20000,
  },
  mazda: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2',
    oemApproval: 'Mazda Original / Skyactiv Engine Oil',
    capacityLiters: 4.0,
    changeIntervalKm: 15000,
  },
  mitsubishi: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C3',
    oemApproval: 'Mitsubishi MZ320757 / DiaQueen',
    capacityLiters: 4.0,
    changeIntervalKm: 15000,
  },
  subaru: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'A3/B4',
    oemApproval: 'Subaru SOA 427V1700 / K0228-Y0001',
    capacityLiters: 4.5,
    changeIntervalKm: 15000,
  },
  suzuki: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2 / C3',
    oemApproval: 'Suzuki SLS-SN / Asian OEM',
    capacityLiters: 3.5,
    changeIntervalKm: 10000,
  },
  'land-rover': {
    viscosity: '0W-30',
    apiStandard: 'SN',
    aceaStandard: 'C2',
    oemApproval: 'JLR STJLR.03.5007 / Land Rover STC 4184',
    capacityLiters: 6.5,
    changeIntervalKm: 15000,
  },
  'land rover': {
    viscosity: '0W-30',
    apiStandard: 'SN',
    aceaStandard: 'C2',
    oemApproval: 'JLR STJLR.03.5007 / Land Rover STC 4184',
    capacityLiters: 6.5,
    changeIntervalKm: 15000,
  },
  jaguar: {
    viscosity: '0W-30',
    apiStandard: 'SN',
    aceaStandard: 'C2',
    oemApproval: 'JLR STJLR.03.5007',
    capacityLiters: 6.5,
    changeIntervalKm: 15000,
  },
  porsche: {
    viscosity: '0W-40',
    apiStandard: 'SN',
    aceaStandard: 'A3/B4',
    oemApproval: 'Porsche A40 / Porsche Approved Engine Oil',
    capacityLiters: 7.5,
    changeIntervalKm: 15000,
  },
  chevrolet: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'A3/B4',
    oemApproval: 'GM Dexos1 Gen 2 / ACDelco Full Synthetic',
    capacityLiters: 4.7,
    changeIntervalKm: 12000,
  },
  chevy: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'A3/B4',
    oemApproval: 'GM Dexos1 Gen 2 / ACDelco Full Synthetic',
    capacityLiters: 4.7,
    changeIntervalKm: 12000,
  },
  ssangyong: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2 / C3',
    oemApproval: 'Toyota / Hyundai / Kia / Nissan / Asian OEM',
    capacityLiters: 4.5,
    changeIntervalKm: 15000,
  },
  mg: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'A3/B4',
    oemApproval: 'MG / Haval / Geely / BYD API SN',
    capacityLiters: 4.0,
    changeIntervalKm: 10000,
  },
  haval: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'A3/B4',
    oemApproval: 'MG / Haval / Geely / BYD API SN',
    capacityLiters: 4.0,
    changeIntervalKm: 10000,
  },
  geely: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'A3/B4',
    oemApproval: 'MG / Haval / Geely / BYD API SN',
    capacityLiters: 4.0,
    changeIntervalKm: 10000,
  },
  chery: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'A3/B4',
    oemApproval: 'MG / Haval / Geely / BYD API SN',
    capacityLiters: 4.0,
    changeIntervalKm: 10000,
  },
  dfsk: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'A3/B4',
    oemApproval: 'MG / Haval / Geely / BYD API SN',
    capacityLiters: 4.0,
    changeIntervalKm: 10000,
  },
  'great-wall': {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'A3/B4',
    oemApproval: 'MG / Haval / Geely / BYD API SN',
    capacityLiters: 4.2,
    changeIntervalKm: 10000,
  },
  'great wall': {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'A3/B4',
    oemApproval: 'MG / Haval / Geely / BYD API SN',
    capacityLiters: 4.2,
    changeIntervalKm: 10000,
  },
  byd: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'A3/B4',
    oemApproval: 'MG / Haval / Geely / BYD API SN',
    capacityLiters: 4.0,
    changeIntervalKm: 10000,
  },
  mahindra: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2 / C3',
    oemApproval: 'Toyota / Hyundai / Kia / Nissan / Asian OEM',
    capacityLiters: 4.0,
    changeIntervalKm: 10000,
  },
  isuzu: {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C2 / C3',
    oemApproval: 'Toyota / Hyundai / Kia / Nissan / Asian OEM',
    capacityLiters: 5.0,
    changeIntervalKm: 10000,
  },
  iveco: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C2',
    oemApproval: 'Fiat 9.55535-S1 / Iveco 18-1811',
    capacityLiters: 5.0,
    changeIntervalKm: 15000,
  },
  lada: {
    viscosity: '10W-40',
    apiStandard: 'SL/CF',
    aceaStandard: 'A3/B4',
    oemApproval: 'AvtoVAZ / Lada API SL standard',
    capacityLiters: 3.5,
    changeIntervalKm: 10000,
  },
};

export function resolveBrandSlugs(brand: string): string[] {
  const clean = brand.trim().toLowerCase();
  const slug = slugify(clean);
  const aliases = BRAND_ALIASES[slug] || BRAND_ALIASES[clean];
  const set = new Set<string>([slug, clean]);
  if (aliases) {
    for (const a of aliases) {
      set.add(a.toLowerCase());
      set.add(slugify(a));
    }
  }
  return Array.from(set);
}

export function extractEngineVariants(engineCode?: string | null): string[] {
  if (!engineCode || !engineCode.trim()) return [''];
  const raw = engineCode.trim();
  const withoutParen = raw.replace(/\s*\([^)]*\)/g, '').trim();
  const parenMatch = raw.match(/\(([^)]+)\)/);
  const insideParen = parenMatch ? parenMatch[1].trim() : '';

  const set = new Set<string>();
  if (raw) set.add(raw);
  if (withoutParen && withoutParen !== raw) set.add(withoutParen);

  // Compact spacing e.g. "320 d" <-> "320d", "2.0 TDI" <-> "2.0TDI"
  const compacted = withoutParen.replace(/(\d+)\s+([a-zA-Z]+)/g, '$1$2');
  if (compacted && compacted !== withoutParen) set.add(compacted);
  const spaced = withoutParen.replace(/(\d+)([a-zA-Z]+)/g, '$1 $2');
  if (spaced && spaced !== withoutParen) set.add(spaced);

  // Inside parens: could be comma-separated codes ("CRBC, CRLB") or spaced ("N47 D20 C")
  if (insideParen) {
    set.add(insideParen);
    const codes = insideParen.split(/[,/|]+/).map((s) => s.trim()).filter(Boolean);
    codes.forEach((c) => {
      set.add(c);
      const cCompact = c.replace(/\s+/g, '');
      if (cCompact !== c) set.add(cCompact);
      const cFirst = c.split(/\s+/)[0].trim();
      if (cFirst.length >= 2) set.add(cFirst);
    });
  }

  // Toyota Land Cruiser / Lexus engine & chassis recognition
  const lower = raw.toLowerCase();
  if (lower.includes('4.7') || lower.includes('2uz') || lower.includes('uzj200') || lower.includes('uzj100')) {
    set.add('2UZ-FE');
    set.add('4.7 VVT-i V8');
    set.add('4.7 V8');
    set.add('4.7');
  }
  if (lower.includes('5.7') || lower.includes('3ur') || lower.includes('urj202') || lower.includes('urj200')) {
    set.add('3UR-FE');
    set.add('5.7 V8');
    set.add('5.7');
  }
  if (lower.includes('4.6') || lower.includes('1ur')) {
    set.add('1UR-FE');
    set.add('4.6 V8');
    set.add('4.6');
  }
  if (lower.includes('4.5') && (lower.includes('vd') || lower.includes('d-4d') || lower.includes('diesel') || lower.includes('d4d'))) {
    set.add('1VD-FTV');
    set.add('4.5 D-4D V8');
    set.add('4.5 D-4D');
  }
  if (lower.includes('4.0') || lower.includes('1gr') || lower.includes('grj200')) {
    set.add('1GR-FE');
    set.add('4.0 V6');
    set.add('4.0');
  }
  if (lower.includes('3.5') && (lower.includes('v35a') || lower.includes('j300'))) {
    set.add('V35A-FTS');
  }
  if (lower.includes('2.8') && (lower.includes('1gd') || lower.includes('prado'))) {
    set.add('1GD-FTV');
  }

  set.add('');
  return Array.from(set);
}

export function extractModelKeywords(model: string): string[] {
  if (!model || !model.trim()) return [];
  const raw = model.trim();
  const withoutParen = raw.replace(/\s*\([^)]*\)/g, '').trim();
  const spaceSeparated = raw.replace(/[-_]+/g, ' ').replace(/\s*\([^)]*\)/g, '').trim();

  const set = new Set<string>();
  if (raw) set.add(raw);
  if (withoutParen && withoutParen !== raw) set.add(withoutParen);
  if (spaceSeparated && spaceSeparated !== raw) set.add(spaceSeparated);

  const stopWords = new Set([
    'hatchback', 'saloon', 'estate', 'box', 'body', 'mpv', 'suv', 'pickup',
    'coupe', 'convertible', 'variant', 'avant', 'touring', 'combi',
  ]);

  const words = spaceSeparated.split(/\s+/).filter((w) => (w.length >= 2 || /^\d+$/.test(w)) && !stopWords.has(w.toLowerCase()));
  words.forEach((w) => set.add(w));

  if (words.length >= 2) {
    set.add(`${words[0]} ${words[1]}`);
  }
  if (words[0] && /^\d+$/.test(words[0])) {
    set.add(`${words[0]} Series`);
    set.add(`Série ${words[0]}`);
    set.add(`Serie ${words[0]}`);
  }

  return Array.from(set);
}

export function resolveAutomotiveOemSpec(
  make: string,
  model: string,
  engineCode?: string | null,
  yearFrom?: number | null,
  yearTo?: number | null,
): {
  viscosity: string;
  apiStandard: string;
  aceaStandard: string;
  oemApproval: string;
  capacityLiters: number;
  changeIntervalKm: number;
  fuelType: string;
  displacementCc: number | null;
  powerHp: number | null;
} {
  const mfrSlug = slugify(make.trim());
  const combined = `${make} ${model} ${engineCode || ''}`.toLowerCase();

  // 1. Determine vehicle production year
  let detectedYear = yearFrom ?? null;
  if (!detectedYear) {
    const yearMatch = combined.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch) {
      detectedYear = parseInt(yearMatch[1], 10);
    } else {
      if (/saxo|106|205|306|406|xantia|xsara|golf\s*(?:iv|4|iii|3)|polo\s*6n|clio\s*(?:ii|2|i|1)|megane\s*(?:i|1)|punto\s*(?:1|i)|e36|e39|w124|w202/.test(combined)) {
        detectedYear = 1999;
      } else if (/golf\s*(?:v|5|vi|6)|clio\s*(?:iii|3)|megane\s*(?:ii|2)|206|207|307|c3\s*i|c4\s*i|astra\s*(?:g|h)|e90|w203|w204/.test(combined)) {
        detectedYear = 2008;
      } else if (/golf\s*(?:vii|7|viii|8)|clio\s*(?:iv|4|v|5)|208|308|c3\s*(?:ii|iii)|c4\s*ii|astra\s*(?:j|k)|f30|g20|w205|captur|kadjar|duster|sandero/.test(combined)) {
        detectedYear = 2016;
      } else {
        detectedYear = 2012;
      }
    }
  }

  // 2. Parse displacement (Cc) if present
  let displacementCc: number | null = null;
  const dispMatch = combined.match(/(\d+[.,]\d+)\s*(?:l|dci|tdi|hdi|tce|tsi|puretech|vti|16v)?/i);
  if (dispMatch) {
    const val = parseFloat(dispMatch[1].replace(',', '.'));
    if (val >= 0.6 && val <= 7.0) {
      displacementCc = Math.round(val * 1000);
    }
  }

  // 3. Parse power (Hp) if present
  let powerHp: number | null = null;
  const hpMatch = combined.match(/(?:dci|tdi|hdi|puretech|tce|tsi|\s)(\d{2,3})\s*(?:ch|hp|ps|cv)?\b/i);
  if (hpMatch) {
    const val = parseInt(hpMatch[1], 10);
    if (val >= 40 && val <= 600) {
      powerHp = val;
    }
  }

  // 4. Enhanced fuel type & injection technology detection
  const isDiesel = /(?:dci|tdi|hdi|bluehdi|cdti|crdi|multijet|jtd|jtdm|d-4d|d4d|d-cat|did|di-d|tdci|cdi|bluetec|ddis|crd|\bd\b|diesel|sdi|ecoblue|tdv6|sdv6|tdv8|sdv8|aj200d|\bd\d{2,3}\b|\bd[2-5]\b|[12]gd|1vd|1nd|1kd|2kd|199b\w*|199a2|937a\w*|330a\w*|f1a\w+|55266388|55268532|55268818|d13a|d16a|d4f\w+|d4h\w+|d4e\w+|d4c\w+|dv5\w*|dv6\w*|a15dt|f15dt|a20dt|m9t|4m41|4d56|4n13|yd25|k9k|xwdb|xwfa|xwka|psdb|xvca|xvcb|xvcc|a270d02)/i.test(combined);
  const isHybrid = /(?:hybrid|e-tech|phev|mhev|prius|2zr-fxe|fxe\b)/i.test(combined);
  const isPureTech = /puretech|eb2/i.test(combined);
  const isEcoBoost = /ecoboost|m1da|m1je|m1na|m2da|m2dc|sfja|sfjb|yyja|yyjb/i.test(combined);
  const isTurboPetrol = /(?:tce|tsi|tfsi|puretech|ecoboost|thp|turbo|t-gdi|tgdi|8nr|1\.2t|1\.0t|1\.5t|1\.4t|1\.6t|dlaa|chzb|dada|dpba|dkta|dkza|dnpa|czpa|g3lc|g4ld|g4lh|g4fj)/i.test(combined);

  const fuelType = isDiesel ? 'diesel' : isHybrid ? 'hybrid' : 'essence';

  const calcCapacity = (base: number) => {
    if (!displacementCc) return base;
    let c = base;
    if (displacementCc <= 1200) c = Math.max(3.0, base - 0.5);
    else if (displacementCc >= 2500) c = base + 1.5;
    else if (displacementCc >= 2000) c = base + 0.5;
    return Math.round(c * 10) / 10;
  };

  // 5. Brand families
  const isRenaultFamily = ['renault', 'dacia'].includes(mfrSlug);
  const isPsaFamily = ['peugeot', 'citroen', 'citroën', 'ds', 'ds-automobiles'].includes(mfrSlug);
  const isVagFamily = ['volkswagen', 'vw', 'audi', 'seat', 'skoda', 'škoda', 'cupra'].includes(mfrSlug);
  const isBmwFamily = ['bmw', 'mini'].includes(mfrSlug);
  const isMercedesFamily = ['mercedes', 'mercedes-benz', 'smart'].includes(mfrSlug);
  const isFordFamily = ['ford'].includes(mfrSlug);
  const isFiatFamily = ['fiat', 'alfa-romeo', 'alfa', 'lancia', 'jeep', 'abarth'].includes(mfrSlug);
  const isOpelFamily = ['opel', 'vauxhall'].includes(mfrSlug);
  const isChevroletFamily = ['chevrolet', 'chevy'].includes(mfrSlug);
  const isAsianFamily = ['toyota', 'lexus', 'hyundai', 'kia', 'nissan', 'infiniti', 'honda', 'mazda', 'mitsubishi', 'subaru', 'suzuki', 'ssangyong', 'mahindra', 'isuzu'].includes(mfrSlug);
  const isJlrFamily = ['land-rover', 'range-rover', 'jaguar'].includes(mfrSlug);
  const isVolvo = ['volvo'].includes(mfrSlug);
  const isPorsche = ['porsche'].includes(mfrSlug);

  // ── RENAULT / DACIA ──
  if (isRenaultFamily) {
    if (isDiesel) {
      if (detectedYear >= 2018 || /blue\s*dci/i.test(combined)) {
        return {
          viscosity: '5W-30',
          apiStandard: 'SN',
          aceaStandard: 'C3',
          oemApproval: 'Renault RN17 / RN0700 / RN0710',
          capacityLiters: calcCapacity(4.5),
          changeIntervalKm: 15000,
          fuelType,
          displacementCc,
          powerHp,
        };
      }
      if (detectedYear >= 2007 || /dci/i.test(combined)) {
        return {
          viscosity: '5W-30',
          apiStandard: 'SM/CF',
          aceaStandard: 'C4',
          oemApproval: 'Renault RN0720 (dCi DPF / FAP)',
          capacityLiters: calcCapacity(4.5),
          changeIntervalKm: 15000,
          fuelType,
          displacementCc,
          powerHp,
        };
      }
      return {
        viscosity: '10W-40',
        apiStandard: 'SL/CF',
        aceaStandard: 'A3/B4',
        oemApproval: 'Renault RN0700 / RN0710',
        capacityLiters: calcCapacity(4.5),
        changeIntervalKm: 10000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }
    if (/k4m|k7m/i.test(combined)) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN',
        aceaStandard: 'A3/B4',
        oemApproval: 'RN0700',
        capacityLiters: calcCapacity(3.5),
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: displacementCc || 1598,
        powerHp,
      };
    }
    if (/h5ft/i.test(combined)) {
      if (combined.includes('captur')) {
        return {
          viscosity: '5W-30',
          apiStandard: 'SN',
          aceaStandard: 'A3/B4',
          oemApproval: 'RN0710',
          capacityLiters: 4.6,
          changeIntervalKm: 15000,
          fuelType: 'essence',
          displacementCc: 1197,
          powerHp: 120,
        };
      }
      if (combined.includes('duster') && detectedYear < 2024) {
        return {
          viscosity: '5W-40',
          apiStandard: 'SN',
          aceaStandard: 'A3/B4',
          oemApproval: 'RN0710',
          capacityLiters: 4.6,
          changeIntervalKm: 15000,
          fuelType: 'essence',
          displacementCc: 1198,
          powerHp: 125,
        };
      }
    }
    if (combined.includes('logan') && /b4d/i.test(combined)) {
      const isDacia = mfrSlug === 'dacia';
      return {
        viscosity: isDacia ? '5W-30' : '5W-40',
        apiStandard: 'SN',
        aceaStandard: isDacia ? 'C3' : 'A3/B4',
        oemApproval: 'RN0710',
        capacityLiters: 4.0,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: 999,
        powerHp: 73,
      };
    }
    if (detectedYear >= 2018 || /1\.3|1\.0\s*tce/i.test(combined) || combined.includes('megane') || /b4d/i.test(combined)) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN',
        aceaStandard: 'C3',
        oemApproval: 'Renault RN17 / RN0700 / RN0710',
        capacityLiters: calcCapacity(4.2),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }
    if (detectedYear >= 2005) {
      return {
        viscosity: '5W-40',
        apiStandard: 'SN/CF',
        aceaStandard: 'A3/B4',
        oemApproval: 'Renault RN0710 / RN0700',
        capacityLiters: calcCapacity(4.0),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }
    return {
      viscosity: '10W-40',
      apiStandard: 'SL/CF',
      aceaStandard: 'A3/B4',
      oemApproval: 'Renault RN0700',
      capacityLiters: calcCapacity(3.8),
      changeIntervalKm: 10000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── PSA (PEUGEOT / CITROËN / DS) ──
  if (isPsaFamily) {
    if (detectedYear < 2001 || /saxo|106|205|306|xantia|xsara/i.test(combined)) {
      return {
        viscosity: '10W-40',
        apiStandard: 'SL/CF',
        aceaStandard: 'A3/B4',
        oemApproval: 'Peugeot Citroën PSA B71 2300 / B71 2294',
        capacityLiters: calcCapacity(3.5),
        changeIntervalKm: 10000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }

    // Modern PSA 0W-20 standard (PSA B71 2010 / Stellantis FPW9.55535/03):
    // 1.5 BlueHDi (DV5RD, DV5RC, DV5) and latest EB2 PureTech (EB2ADTS, EB2ADTD, EB2DTS 2018+)
    if (/b71\s*2010|fpw|dv5|eb2adt|eb2dts/i.test(combined) || (detectedYear >= 2018 && (/1\.5\s*(?:blue)?hdi/i.test(combined) || /puretech/i.test(combined)))) {
      return {
        viscosity: '0W-20',
        apiStandard: 'SN Plus / SP',
        aceaStandard: 'C5',
        oemApproval: 'PSA B71 2010 / Stellantis FPW9.55535/03',
        capacityLiters: (displacementCc || 0) <= 1200 ? 3.5 : 3.8,
        changeIntervalKm: 15000,
        fuelType,
        displacementCc: displacementCc || (isDiesel ? 1499 : 1199),
        powerHp,
      };
    }

    if (isDiesel) {
      if (/dv6dted|dv6c|dv6ated|9hp|9hr/i.test(combined)) {
        return {
          viscosity: '5W-30',
          apiStandard: 'SN/CF',
          aceaStandard: 'C2',
          oemApproval: 'Peugeot Citroën PSA B71 2290',
          capacityLiters: calcCapacity(3.8),
          changeIntervalKm: 15000,
          fuelType,
          displacementCc,
          powerHp,
        };
      }
      if (detectedYear >= 2014 || /bluehdi|dv6fc|dv6fd/i.test(combined)) {
        return {
          viscosity: '0W-30',
          apiStandard: 'SN',
          aceaStandard: 'C2',
          oemApproval: 'Peugeot Citroën PSA B71 2312',
          capacityLiters: calcCapacity(3.8),
          changeIntervalKm: 15000,
          fuelType,
          displacementCc,
          powerHp,
        };
      }
      return {
        viscosity: '5W-30',
        apiStandard: 'SN/CF',
        aceaStandard: 'C2',
        oemApproval: 'Peugeot Citroën PSA B71 2290',
        capacityLiters: calcCapacity(3.8),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }

    // PSA B71 2296 (5W-40) for classic atmospheric petrols: EC5, TU5JP4, EW10
    if (/ec5|tu5jp4|ew10/i.test(combined)) {
      return {
        viscosity: '5W-40',
        apiStandard: 'SN/CF',
        aceaStandard: 'A3/B4',
        oemApproval: 'Peugeot Citroën PSA B71 2296',
        capacityLiters: calcCapacity(3.5),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc: displacementCc || 1587,
        powerHp: powerHp || 115,
      };
    }

    // PSA B71 2290 (5W-30) for classic EB2F (1.2 PureTech atmo), EB2DTM (110ch Euro 6b), VTi, THP
    if (/eb2f\b|eb2dtm|eb2\b|vti|thp|hnf/i.test(combined)) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN/CF',
        aceaStandard: 'C2',
        oemApproval: 'Peugeot Citroën PSA B71 2290',
        capacityLiters: calcCapacity(3.5),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc: displacementCc || 1199,
        powerHp,
      };
    }

    // PureTech 1.2 2014-2017: PSA B71 2312 (0W-30)
    if (isPureTech || (detectedYear >= 2014 && (displacementCc || 0) <= 1200)) {
      return {
        viscosity: '0W-30',
        apiStandard: 'SN',
        aceaStandard: 'C2',
        oemApproval: 'Peugeot Citroën PSA B71 2312 / PSA B71 2290',
        capacityLiters: calcCapacity(3.5),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }

    return {
      viscosity: '5W-40',
      apiStandard: 'SN/CF',
      aceaStandard: 'A3/B4',
      oemApproval: 'Peugeot Citroën PSA B71 2296',
      capacityLiters: calcCapacity(3.8),
      changeIntervalKm: 15000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── VOLKSWAGEN GROUP (VW, AUDI, SEAT, SKODA, CUPRA) ──
  if (isVagFamily) {
    if (detectedYear < 2000 || /golf\s*(?:iii|3)|polo\s*6n|passat\s*b4/i.test(combined)) {
      return {
        viscosity: '10W-40',
        apiStandard: 'SL/CF',
        aceaStandard: 'A3/B4',
        oemApproval: 'VW 501 01 / 505 00',
        capacityLiters: calcCapacity(4.0),
        changeIntervalKm: 10000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }
    if (isDiesel) {
      if (detectedYear >= 2005 || /cr|common\s*rail|golf\s*(?:vi|6|vii|7|viii|8)/i.test(combined)) {
        return {
          viscosity: '5W-30',
          apiStandard: 'SN',
          aceaStandard: 'C3',
          oemApproval: 'VW 504 00 / 507 00 (LongLife III)',
          capacityLiters: calcCapacity(4.5),
          changeIntervalKm: 15000,
          fuelType,
          displacementCc,
          powerHp,
        };
      }
      return {
        viscosity: '5W-40',
        apiStandard: 'SN/CF',
        aceaStandard: 'C3 / A3/B4',
        oemApproval: 'VW 505 01 / 502 00 / 505 00',
        capacityLiters: calcCapacity(4.5),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }

    // Modern downsized VAG EA211evo / EA888 Gen 3B/4 petrols (2018+, 1.0 TSI, 1.5 TSI Evo, 2.0 TSI GPF):
    // Factory specification strictly requires 0W-20 VW 508 00 / 509 00 (LongLife IV)
    const isVagTsiEvo = !isDiesel && (
      /1\.5\s*t[fs]i|1\.0\s*t[fs]i|evo\b|dlaa|chzb|dada|dpba|dkta|dkza|dnpa|czpa|dsca|dhsa/i.test(combined) ||
      (detectedYear >= 2018 && ((combined.includes('polo') && /chyb/i.test(combined)) || (isTurboPetrol && !/chyb/i.test(combined))))
    );
    if (isVagTsiEvo) {
      return {
        viscosity: '0W-20',
        apiStandard: 'SP',
        aceaStandard: 'C5',
        oemApproval: 'VW 508 00 / 509 00 (LongLife IV)',
        capacityLiters: (displacementCc || 0) <= 1200 ? 4.0 : 4.3,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: displacementCc || 1498,
        powerHp: powerHp || 150,
      };
    }

    if (isTurboPetrol || detectedYear >= 2005) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN',
        aceaStandard: 'C3',
        oemApproval: 'VW 504 00 / 507 00 (LongLife III)',
        capacityLiters: calcCapacity(4.5),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }

    return {
      viscosity: '5W-40',
      apiStandard: 'SN/CF',
      aceaStandard: 'A3/B4',
      oemApproval: 'VW 502 00 / 505 00',
      capacityLiters: calcCapacity(4.0),
      changeIntervalKm: 15000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── BMW / MINI ──
  if (isBmwFamily) {
    if (detectedYear >= 2004) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN',
        aceaStandard: 'C3',
        oemApproval: 'BMW Longlife-04 (LL-04)',
        capacityLiters: calcCapacity(5.2),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }
    if (detectedYear >= 1998) {
      return {
        viscosity: '5W-40',
        apiStandard: 'SN',
        aceaStandard: 'A3/B4',
        oemApproval: 'BMW Longlife-01 (LL-01)',
        capacityLiters: calcCapacity(5.5),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }
    return {
      viscosity: '10W-40',
      apiStandard: 'SL/CF',
      aceaStandard: 'A3/B4',
      oemApproval: 'BMW Special Oil / ACEA A3/B3',
      capacityLiters: calcCapacity(5.0),
      changeIntervalKm: 10000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── MERCEDES-BENZ / SMART ──
  if (isMercedesFamily) {
    if (detectedYear >= 2005 || isDiesel) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN',
        aceaStandard: 'C3',
        oemApproval: 'MB 229.51 / MB 229.52',
        capacityLiters: calcCapacity(5.5),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }
    return {
      viscosity: '5W-40',
      apiStandard: 'SN/CF',
      aceaStandard: 'A3/B4',
      oemApproval: 'MB 229.3 / MB 229.5',
      capacityLiters: calcCapacity(5.5),
      changeIntervalKm: 15000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── FORD ──
  if (isFordFamily) {
    // EcoBlue diesels (Focus, Kuga, Ranger, Transit, Mondeo, EcoSport): 0W-30 WSS-M2C950-A
    const isEcoBlue = /ecoblue|xwdb|xwfa|xwka|psdb/i.test(combined) || (isDiesel && detectedYear >= 2016);
    if (isEcoBlue && isDiesel) {
      return {
        viscosity: '0W-30',
        apiStandard: 'SN',
        aceaStandard: 'C2',
        oemApproval: 'Ford WSS-M2C950-A',
        capacityLiters: (displacementCc || 0) <= 1600 ? 4.2 : 5.6,
        changeIntervalKm: 15000,
        fuelType: 'diesel',
        displacementCc: displacementCc || 1499,
        powerHp: powerHp || 120,
      };
    }

    // 1.0 EcoBoost: 5W-20 WSS-M2C948-B
    if (isEcoBoost || /m1da|m1je|m1na|m2da|m2dc|sfja|sfjb|yyja|yyjb/i.test(combined)) {
      return {
        viscosity: '5W-20',
        apiStandard: 'SN',
        aceaStandard: 'C5',
        oemApproval: 'Ford WSS-M2C948-B',
        capacityLiters: 4.1,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: displacementCc || 998,
        powerHp: powerHp || 100,
      };
    }

    return {
      viscosity: '5W-30',
      apiStandard: 'SL/CF',
      aceaStandard: 'A5/B5',
      oemApproval: 'Ford WSS-M2C913-D / WSS-M2C913-C',
      capacityLiters: calcCapacity(4.1),
      changeIntervalKm: 15000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── FIAT / ALFA ROMEO / JEEP / LANCIA ──
  if (isFiatFamily) {
    // Alfa Romeo Giulia (952) & Stelvio (949)
    const isGiuliaOrStelvio = /giulia|stelvio|952|949/i.test(combined);
    if (isGiuliaOrStelvio) {
      // 2.9 V6 Biturbo Quadrifoglio (510ch, 670050436)
      if (/2\.9|quadrifoglio|67005/i.test(combined) || (powerHp && powerHp >= 500)) {
        return {
          viscosity: '0W-40',
          apiStandard: 'SN',
          aceaStandard: 'C3',
          oemApproval: 'Fiat 9.55535-GH2',
          capacityLiters: 7.0,
          changeIntervalKm: 15000,
          fuelType: 'essence',
          displacementCc: 2891,
          powerHp: powerHp || 510,
        };
      }
      // 2.2 JTDM Diesel (55266388, 55268532, 55268818)
      if (isDiesel || /2\.2|jtd|55266388|55268532|55268818/i.test(combined)) {
        return {
          viscosity: '0W-20',
          apiStandard: 'SN',
          aceaStandard: 'C2',
          oemApproval: 'Fiat 9.55535-DS1 / 9.55535-GS1',
          capacityLiters: 4.3,
          changeIntervalKm: 20000,
          fuelType: 'diesel',
          displacementCc: 2143,
          powerHp: powerHp || 180,
        };
      }
      // 2.0 Turbo MultiAir (952ABA25B, 952APA25B, 55273835, 200ch / 280ch Veloce / Q4)
      return {
        viscosity: '0W-30',
        apiStandard: 'SN',
        aceaStandard: 'C2',
        oemApproval: 'Fiat 9.55535-GS1 / ACEA C2 (0W-30)',
        capacityLiters: 5.2,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: displacementCc || 1995,
        powerHp: powerHp || 200,
      };
    }

    // Jeep Wrangler 2.0 Turbo (GME-T4 272ch)
    if (/gme-t4|wrangler/i.test(combined) && !isDiesel) {
      return {
        viscosity: '0W-20',
        apiStandard: 'SN Plus',
        aceaStandard: 'C2',
        oemApproval: 'Chrysler MS-6395 / Fiat 9.55535-GS1',
        capacityLiters: 4.7,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: 1995,
        powerHp: powerHp || 272,
      };
    }

    // Fiat / Jeep FireFly 1.0 / 1.3 GSE Turbo (332A2000 on 500X, Renegade, Compass):
    if (/332a2/i.test(combined)) {
      return {
        viscosity: '0W-30',
        apiStandard: 'SN',
        aceaStandard: 'C2',
        oemApproval: 'Fiat 9.55535-GS1',
        capacityLiters: 3.8,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: displacementCc || 1332,
        powerHp: powerHp || 150,
      };
    }
    if (/gse|firefly/i.test(combined)) {
      return {
        viscosity: '0W-20',
        apiStandard: 'SN Plus',
        aceaStandard: 'C2',
        oemApproval: 'Fiat 9.55535-GSX / 9.55535-GS1',
        capacityLiters: 3.8,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: displacementCc || 1332,
        powerHp: powerHp || 150,
      };
    }

    // Fiat Doblo / Scudo with PSA engines:
    if (/dv5/i.test(combined)) {
      return {
        viscosity: '0W-20',
        apiStandard: 'SN Plus / SP',
        aceaStandard: 'C5',
        oemApproval: 'PSA B71 2010 / Stellantis FPW9.55535/03',
        capacityLiters: 3.8,
        changeIntervalKm: 15000,
        fuelType: 'diesel',
        displacementCc: 1499,
        powerHp: powerHp || 100,
      };
    }
    if (/dv6/i.test(combined)) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN/CF',
        aceaStandard: 'C2',
        oemApproval: 'PSA B71 2290 / Fiat 9.55535-S1',
        capacityLiters: 3.8,
        changeIntervalKm: 15000,
        fuelType: 'diesel',
        displacementCc: 1560,
        powerHp: powerHp || 90,
      };
    }

    // Modern 500 Hybrid 1.0 FireFly (199A3000): 0W-20 Fiat 9.55535-DM1
    if (/199a3/i.test(combined) || (isHybrid && /500/i.test(combined))) {
      return {
        viscosity: '0W-20',
        apiStandard: 'SP',
        aceaStandard: 'C5',
        oemApproval: 'Fiat 9.55535-DM1',
        capacityLiters: 2.8,
        changeIntervalKm: 15000,
        fuelType: 'hybrid',
        displacementCc: 999,
        powerHp: 70,
      };
    }

    // Jeep 2.0 MultiJet Euro 6 (A270D02): 5W-30 Fiat 9.55535-S1
    if (/a270/i.test(combined)) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN',
        aceaStandard: 'C2',
        oemApproval: 'Fiat 9.55535-S1',
        capacityLiters: 4.3,
        changeIntervalKm: 20000,
        fuelType: 'diesel',
        displacementCc: 1956,
        powerHp: 140,
      };
    }

    // Modern MultiJet diesels Euro 6 (Tipo, 500X, Doblo, Fiorino, Ducato): 0W-30 Fiat 9.55535-DS1 / S1
    if (isDiesel) {
      // Fiat Tipo 1.6 Multijet 130 AdBlue Euro 6d (2018+, 937AM5000): 0W-20 Fiat 9.55535-DSX
      if (combined.includes('tipo') && /937am/i.test(combined) && (detectedYear >= 2018 || /adblue|130|357/i.test(combined))) {
        return {
          viscosity: '0W-20',
          apiStandard: 'SN',
          aceaStandard: 'C5',
          oemApproval: 'Fiat 9.55535-DSX',
          capacityLiters: 4.8,
          changeIntervalKm: 15000,
          fuelType: 'diesel',
          displacementCc: 1598,
          powerHp: 130,
        };
      }
      if (detectedYear >= 2015 || /199b1|937am|199a2|f1a|330a1/i.test(combined)) {
        return {
          viscosity: '0W-30',
          apiStandard: 'SN',
          aceaStandard: 'C2',
          oemApproval: 'Fiat 9.55535-DS1 / 9.55535-S1',
          capacityLiters: calcCapacity(3.8),
          changeIntervalKm: 15000,
          fuelType: 'diesel',
          displacementCc: displacementCc || 1598,
          powerHp: powerHp || 120,
        };
      }
      return {
        viscosity: '5W-30',
        apiStandard: 'SN',
        aceaStandard: 'C2',
        oemApproval: 'Fiat 9.55535-S1',
        capacityLiters: calcCapacity(3.5),
        changeIntervalKm: 15000,
        fuelType: 'diesel',
        displacementCc,
        powerHp,
      };
    }

    // Fiat / Jeep 1.4 MultiAir Turbo (199A4000 on 500X, Renegade, Compass): 0W-30 Fiat 9.55535-GS1
    if (/199a4/i.test(combined)) {
      return {
        viscosity: '0W-30',
        apiStandard: 'SN',
        aceaStandard: 'C2',
        oemApproval: 'Fiat 9.55535-GS1',
        capacityLiters: 3.8,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: 1368,
        powerHp: 140,
      };
    }

    // Modern FIRE 1.2 post-2015 Euro 6 (Fiat 500, Panda 169A4.000): 5W-30 Fiat 9.55535-S1
    if (/169a4/i.test(combined)) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN',
        aceaStandard: 'C2',
        oemApproval: 'Fiat 9.55535-S1',
        capacityLiters: 2.8,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: 1242,
        powerHp: 69,
      };
    }

    if (detectedYear >= 2005) {
      return {
        viscosity: '5W-40',
        apiStandard: 'SN/CF',
        aceaStandard: 'C3',
        oemApproval: 'Fiat 9.55535-S2',
        capacityLiters: calcCapacity(3.2),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }
    return {
      viscosity: '10W-40',
      apiStandard: 'SL/CF',
      aceaStandard: 'A3/B4',
      oemApproval: 'Fiat 9.55535-G2',
      capacityLiters: calcCapacity(3.0),
      changeIntervalKm: 10000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── OPEL / VAUXHALL ──
  if (isOpelFamily) {
    // Stellantis-era PSA engines: Corsa F (F12XHL, F10XHL), Mokka, Crossland, Grandland (F15DTH, A15DTH, A20DTH)
    if (/f12xhl|f10xhl/i.test(combined)) {
      return {
        viscosity: '0W-20',
        apiStandard: 'SN Plus / SP',
        aceaStandard: 'C5',
        oemApproval: 'Opel OV0401547 / PSA B71 2010',
        capacityLiters: 3.5,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: 1199,
        powerHp: 100,
      };
    }
    if (/f15dth|a15dth|a20dth/i.test(combined)) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN/CF',
        aceaStandard: 'C3',
        oemApproval: 'GM Dexos2 / Opel OV0401547',
        capacityLiters: calcCapacity(4.0),
        changeIntervalKm: 15000,
        fuelType: 'diesel',
        displacementCc,
        powerHp,
      };
    }
    if (detectedYear >= 2019 || /corsa\s*f/i.test(combined)) {
      return {
        viscosity: '0W-20',
        apiStandard: 'SN Plus',
        aceaStandard: 'C5',
        oemApproval: 'Opel OV0401547 / PSA B71 2010',
        capacityLiters: 3.5,
        changeIntervalKm: 15000,
        fuelType,
        displacementCc: displacementCc || 1199,
        powerHp: powerHp || 100,
      };
    }
    return {
      viscosity: '5W-30',
      apiStandard: 'SN/CF',
      aceaStandard: 'C3',
      oemApproval: 'GM Dexos2',
      capacityLiters: calcCapacity(4.5),
      changeIntervalKm: 15000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── CHEVROLET ──
  if (isChevroletFamily) {
    if (/li5|li6|lsy|lyx/i.test(combined) || (detectedYear >= 2018 && !isDiesel)) {
      return {
        viscosity: '0W-20',
        apiStandard: 'SP',
        aceaStandard: 'ILSAC GF-6A',
        oemApproval: 'GM Dexos1 Gen2 / Gen3',
        capacityLiters: 4.2,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc,
        powerHp,
      };
    }
    return {
      viscosity: '5W-30',
      apiStandard: 'SN/CF',
      aceaStandard: 'C3',
      oemApproval: 'GM Dexos2 / GM Dexos1 Gen 2',
      capacityLiters: calcCapacity(4.5),
      changeIntervalKm: 15000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── ASIAN MANUFACTURERS (TOYOTA, HYUNDAI, KIA, NISSAN, HONDA, MAZDA, MITSUBISHI, SUZUKI) ──
  if (isAsianFamily) {
    // 1. Toyota / Lexus
    if (mfrSlug === 'toyota' || mfrSlug === 'lexus') {
      // Toyota Land Cruiser V8 Petrols:
      if (/2uz|uzj/i.test(combined)) {
        return {
          viscosity: '5W-40',
          apiStandard: 'SN',
          aceaStandard: 'A3/B4',
          oemApproval: 'Toyota / Lexus / MB 229.5 / Porsche A40',
          capacityLiters: 7.1,
          changeIntervalKm: 15000,
          fuelType: 'essence',
          displacementCc: 4664,
          powerHp: powerHp || 288,
        };
      }
      if (/3ur|1ur|urj/i.test(combined)) {
        return {
          viscosity: '0W-20',
          apiStandard: 'SP',
          aceaStandard: 'ILSAC GF-6A',
          oemApproval: 'Toyota / Lexus API SP / ILSAC GF-6A',
          capacityLiters: 7.5,
          changeIntervalKm: 15000,
          fuelType: 'essence',
          displacementCc: combined.includes('5.7') || /3ur/i.test(combined) ? 5663 : 4608,
          powerHp: powerHp || 381,
        };
      }

      // Toyota D-4D Diesels (Hilux 2GD/1GD, Fortuner 2GD, Prado 1GD, Land Cruiser 1VD-FTV, Yaris 1ND-TV):
      if (isDiesel || /[12]gd|1vd|1nd|1kd|2kd/i.test(combined)) {
        return {
          viscosity: '5W-30',
          apiStandard: 'SN/CF',
          aceaStandard: 'C2',
          oemApproval: 'Toyota DL-1 / ACEA C2',
          capacityLiters: (displacementCc || 0) >= 4000 ? 9.2 : (displacementCc || 0) >= 2400 ? 7.5 : 4.2,
          changeIntervalKm: 15000,
          fuelType: 'diesel',
          displacementCc: displacementCc || 2393,
          powerHp: powerHp || 150,
        };
      }
      // Classic Toyota petrols (1NR, 1ZR, 3ZR, 2TR, 2NR): 5W-30
      if (/1nr|1zr|3zr|2tr|2nr/i.test(combined) && !isHybrid) {
        return {
          viscosity: '5W-30',
          apiStandard: 'SN',
          aceaStandard: 'ILSAC GF-5',
          oemApproval: 'Toyota Genuine Motor Oil 5W-30',
          capacityLiters: (displacementCc || 0) <= 1400 ? 3.4 : 4.2,
          changeIntervalKm: 15000,
          fuelType: 'essence',
          displacementCc,
          powerHp,
        };
      }
      // Toyota modern petrols (1KR, 8NR, M15A, M20A, hybrids):
      if (/8nr|1kr|m15a|m20a/i.test(combined) || isHybrid || (detectedYear >= 2018 && (displacementCc || 0) <= 2000)) {
        return {
          viscosity: '0W-20',
          apiStandard: 'SP',
          aceaStandard: 'ILSAC GF-6A',
          oemApproval: 'Toyota / Lexus API SP / ILSAC GF-6A',
          capacityLiters: (combined.includes('rav') || (displacementCc || 0) >= 2400) ? 4.4 : (displacementCc || 0) <= 1200 ? 3.6 : 4.2,
          changeIntervalKm: 15000,
          fuelType: isHybrid ? 'hybrid' : 'essence',
          displacementCc,
          powerHp,
        };
      }
      return {
        viscosity: '5W-30',
        apiStandard: 'SN',
        aceaStandard: 'ILSAC GF-5',
        oemApproval: 'Toyota Genuine Motor Oil 5W-30',
        capacityLiters: calcCapacity(4.2),
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc,
        powerHp,
      };
    }

    // 2. Hyundai & Kia
    if (mfrSlug === 'hyundai' || mfrSlug === 'kia') {
      // 0W-20 modern MPI/DPI & compact turbo (G4FJ on Kona/Tucson, G3LA, G4LA, G4FC, G4FG, G4NL, G4NA, G6DC, G4KN 2016+)
      if (!isDiesel && (/kona.*g4fj|tucson.*g4fj/i.test(combined) || /g3la|g4la|g4fc|g4fg|g4nl|g4na|g6dc|g4kn/i.test(combined))) {
        return {
          viscosity: '0W-20',
          apiStandard: 'SP',
          aceaStandard: 'ILSAC GF-6A',
          oemApproval: 'Hyundai / Kia API SP / ILSAC GF-6A',
          capacityLiters: (displacementCc || 0) >= 2000 ? 5.8 : (displacementCc || 0) <= 1200 ? 3.1 : 4.0,
          changeIntervalKm: 15000,
          fuelType: 'essence',
          displacementCc: displacementCc || 1197,
          powerHp: powerHp || 84,
        };
      }
      // 0W-30 engines: T-GDI (G3LC, G4LD, G4LH, G4FJ), Smartstream (G4KL), and CRDi diesels (D4FA, D4FC, D4FE, D4HA, D4HE)
      if (/g3lc|g4ld|g4lh|g4fj|g4kl|d4fa|d4fc|d4fe|d4ha|d4he|d4cb|d4ea/i.test(combined)) {
        return {
          viscosity: '0W-30',
          apiStandard: 'SN',
          aceaStandard: 'C2',
          oemApproval: 'Hyundai / Kia ACEA C2 / C3 (0W-30)',
          capacityLiters: (displacementCc || 0) >= 2000 ? 6.5 : 3.6,
          changeIntervalKm: 15000,
          fuelType: isDiesel ? 'diesel' : 'essence',
          displacementCc: displacementCc || (isDiesel ? 1582 : 998),
          powerHp: powerHp || 100,
        };
      }
      return {
        viscosity: '5W-30',
        apiStandard: 'SN/CF',
        aceaStandard: 'C3',
        oemApproval: 'Hyundai / Kia Genuine Oil 5W-30',
        capacityLiters: calcCapacity(4.0),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }

    // 3. Nissan
    if (mfrSlug === 'nissan') {
      if (/hr10ddt|hr15de|kr15ddt/i.test(combined)) {
        return {
          viscosity: '0W-20',
          apiStandard: 'SP',
          aceaStandard: 'ILSAC GF-6A',
          oemApproval: 'Nissan LE-PF / API SP / ILSAC GF-6A',
          capacityLiters: 4.1,
          changeIntervalKm: 15000,
          fuelType: 'essence',
          displacementCc,
          powerHp,
        };
      }
      if (detectedYear < 2008 && /yd25|patrol/i.test(combined)) {
        return {
          viscosity: '5W-30',
          apiStandard: 'SN/CF',
          aceaStandard: 'A3/B4',
          oemApproval: 'Nissan LL-01A / ACEA A3/B4',
          capacityLiters: calcCapacity(6.5),
          changeIntervalKm: 10000,
          fuelType,
          displacementCc,
          powerHp,
        };
      }
      return {
        viscosity: '5W-30',
        apiStandard: 'SN/CF',
        aceaStandard: 'C3',
        oemApproval: 'Renault RN17 / Nissan Motor Oil 5W-30',
        capacityLiters: calcCapacity(4.5),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }

    // 4. Mitsubishi
    if (mfrSlug === 'mitsubishi') {
      if (/4b40|4b12/i.test(combined)) {
        return {
          viscosity: '0W-20',
          apiStandard: 'SP',
          aceaStandard: 'ILSAC GF-6A',
          oemApproval: 'Mitsubishi Motors Genuine 0W-20',
          capacityLiters: 4.3,
          changeIntervalKm: 15000,
          fuelType: 'essence',
          displacementCc,
          powerHp,
        };
      }
      if (/dv5rc/i.test(combined)) {
        return {
          viscosity: '0W-30',
          apiStandard: 'SN',
          aceaStandard: 'C2',
          oemApproval: 'PSA B71 2312',
          capacityLiters: 3.8,
          changeIntervalKm: 15000,
          fuelType: 'diesel',
          displacementCc: 1499,
          powerHp: 120,
        };
      }
      return {
        viscosity: '5W-30',
        apiStandard: 'SN/CF',
        aceaStandard: 'C3 / A3/B4',
        oemApproval: 'Mitsubishi Diamond Evolution 5W-30',
        capacityLiters: calcCapacity(4.5),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }

    // 5. Suzuki
    if (mfrSlug === 'suzuki') {
      if (/d13aa|ddis/i.test(combined) || isDiesel) {
        return {
          viscosity: '5W-30',
          apiStandard: 'SN',
          aceaStandard: 'C2',
          oemApproval: 'Suzuki RO-2 / ACEA C2',
          capacityLiters: 3.2,
          changeIntervalKm: 15000,
          fuelType: 'diesel',
          displacementCc: 1248,
          powerHp: 75,
        };
      }
      if (/k12b|k14b/i.test(combined)) {
        return {
          viscosity: '5W-30',
          apiStandard: 'SN',
          aceaStandard: 'ILSAC GF-5',
          oemApproval: 'Suzuki Genuine Motor Oil 5W-30',
          capacityLiters: 3.2,
          changeIntervalKm: 15000,
          fuelType: 'essence',
          displacementCc: 1242,
          powerHp: 90,
        };
      }
      return {
        viscosity: '0W-20',
        apiStandard: 'SP',
        aceaStandard: 'ILSAC GF-6A',
        oemApproval: 'Suzuki Ecstar / API SP / ILSAC GF-6A',
        capacityLiters: 3.6,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc,
        powerHp,
      };
    }


    // Honda & Mazda (retaining existing excellent calibrations)
    if (mfrSlug === 'honda') {
      return {
        viscosity: '0W-20',
        apiStandard: 'SP',
        aceaStandard: 'ILSAC GF-6A',
        oemApproval: 'Honda Type 2.0 / API SP / ILSAC GF-6A',
        capacityLiters: (displacementCc || 0) <= 1200 ? 3.5 : 3.7,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc,
        powerHp,
      };
    }
    if (mfrSlug === 'mazda') {
      return {
        viscosity: '0W-20',
        apiStandard: 'SP',
        aceaStandard: 'ILSAC GF-6A',
        oemApproval: 'Mazda Supra 0W-20 / API SP / ILSAC GF-6A',
        capacityLiters: 4.2,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc,
        powerHp,
      };
    }

    return {
      viscosity: '5W-30',
      apiStandard: 'SN/CF',
      aceaStandard: 'C2 / C3',
      oemApproval: 'Asian OEM Genuine 5W-30',
      capacityLiters: calcCapacity(4.0),
      changeIntervalKm: 15000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── JAGUAR / LAND ROVER / RANGE ROVER ──
  if (isJlrFamily) {
    if (isDiesel && (combined.includes('3.0') || combined.includes('2.7') || (displacementCc && displacementCc >= 2500) || /tdv6|sdv6|306dt|276dt/i.test(combined))) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN',
        aceaStandard: 'C1',
        oemApproval: 'Ford WSS-M2C934-B / JLR STJLR.03.5005',
        capacityLiters: 6.0,
        changeIntervalKm: 15000,
        fuelType: 'diesel',
        displacementCc: displacementCc || 2993,
        powerHp: powerHp || 258,
      };
    }
    if (isDiesel && (detectedYear >= 2015 || /ingenium|d150|d180|d200|d240|aj200d/i.test(combined) || (displacementCc && displacementCc <= 2200))) {
      return {
        viscosity: '0W-30',
        apiStandard: 'SN',
        aceaStandard: 'C2',
        oemApproval: 'JLR STJLR.03.5007 / ACEA C2',
        capacityLiters: 6.5,
        changeIntervalKm: 15000,
        fuelType: 'diesel',
        displacementCc: displacementCc || 1999,
        powerHp: powerHp || 180,
      };
    }
    if (!isDiesel && (detectedYear >= 2017 || /ingenium|p200|p250|p300|aj200p|si4/i.test(combined)) && (displacementCc || 0) <= 2000) {
      return {
        viscosity: '0W-20',
        apiStandard: 'SN Plus / SP',
        aceaStandard: 'C5',
        oemApproval: 'JLR STJLR.51.5122 / STJLR.03.5006',
        capacityLiters: 7.0,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: displacementCc || 1997,
        powerHp: powerHp || 250,
      };
    }
    if (!isDiesel && ((displacementCc && displacementCc >= 3000) || /v8|supercharged|aj133|aj126/i.test(combined))) {
      return {
        viscosity: '0W-20',
        apiStandard: 'SN',
        aceaStandard: 'C5 / A1/B1',
        oemApproval: 'JLR STJLR.03.5004 / STJLR.51.5122',
        capacityLiters: 8.0,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: displacementCc || 5000,
        powerHp: powerHp || 510,
      };
    }
    return {
      viscosity: '5W-30',
      apiStandard: 'SL/CF',
      aceaStandard: 'A5/B5',
      oemApproval: 'Ford WSS-M2C913-B / JLR STJLR.03.5003',
      capacityLiters: 6.0,
      changeIntervalKm: 15000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── VOLVO ──
  if (isVolvo) {
    const isDriveE = detectedYear >= 2014 || /drive-e|vea|d4204|b4204/i.test(combined) || ((displacementCc || 0) <= 2000 && detectedYear >= 2013);
    if (isDriveE) {
      return {
        viscosity: '0W-20',
        apiStandard: 'SN',
        aceaStandard: 'C5',
        oemApproval: 'Volvo VCC-RBS0-2AE / Volvo XC',
        capacityLiters: 5.6,
        changeIntervalKm: 20000,
        fuelType,
        displacementCc: displacementCc || 1969,
        powerHp,
      };
    }
    return {
      viscosity: '0W-30',
      apiStandard: 'SL/CF',
      aceaStandard: 'A5/B5',
      oemApproval: 'Volvo VCC 95200377 / ACEA A5/B5',
      capacityLiters: 5.8,
      changeIntervalKm: 15000,
      fuelType,
      displacementCc: displacementCc || 2400,
      powerHp,
    };
  }

  // ── PORSCHE ──
  if (isPorsche) {
    if (isDiesel || isHybrid || /diesel|tdi|hybrid/i.test(combined)) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN',
        aceaStandard: 'C3',
        oemApproval: 'Porsche C30 / VW 504 00 / 507 00',
        capacityLiters: 7.3,
        changeIntervalKm: 15000,
        fuelType: isDiesel ? 'diesel' : 'hybrid',
        displacementCc: displacementCc || 2967,
        powerHp: powerHp || 262,
      };
    }
    if (/macan/i.test(combined) && (displacementCc || 0) <= 2000) {
      return {
        viscosity: '0W-20',
        apiStandard: 'SP',
        aceaStandard: 'C5',
        oemApproval: 'Porsche C20 / VW 508 00',
        capacityLiters: 5.2,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: 1984,
        powerHp: 245,
      };
    }
    return {
      viscosity: '0W-40',
      apiStandard: 'SN',
      aceaStandard: 'A3/B4',
      oemApproval: 'Porsche A40',
      capacityLiters: 7.5,
      changeIntervalKm: 15000,
      fuelType: 'essence',
      displacementCc: displacementCc || 2981,
      powerHp: powerHp || 385,
    };
  }

  return {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C3',
    oemApproval: 'API SN / ACEA C3 Universal OEM Synthetic 5W-30',
    capacityLiters: calcCapacity(4.5),
    changeIntervalKm: 15000,
    fuelType,
    displacementCc,
    powerHp,
  };
}

@Injectable()
export class OilFinderService {
  private readonly logger = new Logger(OilFinderService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findByVehicle(make: string, model: string, engineCode?: string | null): Promise<OilFinderResult> {
    const makeNorm = make.trim().toUpperCase();
    const modelNorm = model.trim().toUpperCase();
    const eUpper = (engineCode || '').toUpperCase();

    // 1. Try DB lookup first (exact/insensitive match on the raw name)
    const where = {
      make: { equals: make.trim(), mode: 'insensitive' as const },
      model: { equals: model.trim(), mode: 'insensitive' as const },
      ...(engineCode ? { engineCode: { equals: engineCode.trim(), mode: 'insensitive' as const } } : {}),
    };

    let rows = await this.prisma.oilFinderVehicle.findMany({
      where,
      include: { oilSpec: true },
      orderBy: [{ source: 'asc' }, { id: 'asc' }],
    }).catch(() => []);

    const brandSlugs = resolveBrandSlugs(make);
    const engineVariants = extractEngineVariants(engineCode);
    const modelKeywords = extractModelKeywords(model);

    // 1b. If nothing found by direct match, match across slugified candidate models from DB
    if (rows.length === 0) {
      const makeSlug = slugify(make.trim());
      const modelSlug = slugify(model.trim());
      const allRows = await this.prisma.oilFinderVehicle.findMany({
        select: { make: true, model: true },
        distinct: ['make', 'model'],
      }).catch(() => [] as { make: string; model: string }[]);

      const candidateMatches = allRows.filter((r) => {
        const rMakeSlug = slugify(r.make);
        if (rMakeSlug !== makeSlug && !brandSlugs.includes(rMakeSlug)) return false;
        const rModelSlug = slugify(r.model);
        return (
          rModelSlug === modelSlug ||
          modelSlug.startsWith(rModelSlug) ||
          rModelSlug.startsWith(modelSlug) ||
          modelKeywords.some((kw) => {
            const kwSlug = slugify(kw);
            return kwSlug.length >= 2 && (rModelSlug.includes(kwSlug) || kwSlug.includes(rModelSlug));
          })
        );
      });

      for (const match of candidateMatches) {
        for (const alt of engineVariants) {
          rows = await this.prisma.oilFinderVehicle.findMany({
            where: {
              make: { equals: match.make, mode: 'insensitive' as const },
              model: { equals: match.model, mode: 'insensitive' as const },
              ...(alt ? { engineCode: { equals: alt, mode: 'insensitive' as const } } : { engineCode: '' }),
            },
            include: { oilSpec: true },
            orderBy: [{ source: 'asc' }, { id: 'asc' }],
          }).catch(() => []);
          if (rows.length > 0) break;
        }
        if (rows.length > 0) break;
      }
    }

    // 1c. If still nothing found, try matching by model keywords and clean model names across brand aliases
    if (rows.length === 0) {
      for (const bSlug of brandSlugs) {
        for (const kw of modelKeywords) {
          for (const eng of engineVariants) {
            rows = await this.prisma.oilFinderVehicle.findMany({
              where: {
                make: { contains: bSlug, mode: 'insensitive' as const },
                AND: [
                  {
                    OR: [
                      { model: { equals: kw, mode: 'insensitive' as const } },
                      { model: { contains: kw, mode: 'insensitive' as const } },
                    ],
                  },
                  eng ? {
                    OR: [
                      { engineCode: { equals: eng, mode: 'insensitive' as const } },
                      { engineCode: { contains: eng, mode: 'insensitive' as const } },
                      { engineCode: '' },
                    ],
                  } : { engineCode: '' },
                ],
              },
              include: { oilSpec: true },
              orderBy: [{ source: 'asc' }, { id: 'asc' }],
            }).catch(() => []);
            if (rows.length > 0) break;
          }
          if (rows.length > 0) break;
        }
        if (rows.length > 0) break;
      }
    }

    // 1d. General model fallback if all rows for that model share the same oil spec
    if (rows.length === 0) {
      for (const kw of modelKeywords) {
        for (const bSlug of brandSlugs) {
          const candidateRows = await this.prisma.oilFinderVehicle.findMany({
            where: {
              make: { contains: bSlug, mode: 'insensitive' as const },
              OR: [
                { model: { equals: kw, mode: 'insensitive' as const } },
                { model: { contains: kw, mode: 'insensitive' as const } },
              ],
            },
            include: { oilSpec: true },
            orderBy: [{ source: 'asc' }, { id: 'asc' }],
          }).catch(() => []);
          if (candidateRows.length > 0) {
            const distinct = groupBySpec(candidateRows);
            if (distinct.length === 1) {
              rows = candidateRows;
              break;
            }
          }
        }
        if (rows.length > 0) break;
      }
    }

    if (rows.length > 0) {
      const distinct = groupBySpec(rows);
      return {
        status: 'found',
        oilSpec: distinct[0].spec,
        resolvedBy: distinct.length === 1 ? 'exact' : 'minor-conflict-auto-resolve',
        confidence: distinct.length === 1 ? 'high' : 'medium',
        backingRows: rows.length,
        candidates: toCandidates(rows),
      };
    }

    // 2. Dynamic TecDoc-based category detection for informative user messaging
    let isTruck = false;
    let isMoto = false;
    let isEngineCategory = false;
    let isPassengerCar = false;

    try {
      const tecdocStart = performance.now();
      const tecdocInfo: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT 
          COALESCE(m.is_commercial_vehicle, mfr.is_commercial_vehicle, false) AS is_truck,
          COALESCE(m.is_motorbike, mfr.is_motorbike, false) AS is_moto,
          COALESCE(m.is_engine, mfr.is_engine, false) AS is_engine,
          COALESCE(m.is_passenger_car, mfr.is_passenger_car, false) AS is_car,
          COALESCE(m.is_transporter, mfr.is_transporter, false) AS is_van
        FROM tecdoc.models m
        JOIN tecdoc.manufacturers mfr ON mfr.id = m.manufacturer_id
        WHERE (
          LOWER(REGEXP_REPLACE(mfr.matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = ANY($1::text[])
          OR LOWER(mfr.matchcode) = ANY($1::text[])
          OR LOWER(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode)) = ANY($1::text[])
          OR LOWER(REGEXP_REPLACE(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode), '[^a-zA-Z0-9]+', '-', 'g')) = ANY($1::text[])
        )
        AND (
          LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) = $2
          OR LOWER(m.description) = $2
          OR $2 ILIKE '%' || LOWER(m.description) || '%'
          OR LOWER(m.description) ILIKE '%' || $2 || '%'
        )
        LIMIT 1
      `, brandSlugs, slugify(model));
      const tecdocDuration = Math.round(performance.now() - tecdocStart);

      if (tecdocDuration > 50) {
        this.logger.warn(`[SLOW QUERY] TecDoc classification query for "${make} ${model}" took ${tecdocDuration}ms (threshold: 50ms)`);
      } else {
        this.logger.log(`TecDoc classification query for "${make} ${model}" completed in ${tecdocDuration}ms`);
      }

      if (tecdocInfo.length > 0) {
        const r = tecdocInfo[0];
        isTruck = Boolean(r.is_truck || r.is_van);
        isMoto = Boolean(r.is_moto);
        isEngineCategory = Boolean(r.is_engine);
        isPassengerCar = Boolean(r.is_car);
      } else {
        const mfrStart = performance.now();
        const mfrRows: any[] = await this.prisma.$queryRawUnsafe(`
          SELECT is_commercial_vehicle, is_motorbike, is_engine, is_passenger_car, is_transporter
          FROM tecdoc.manufacturers
          WHERE LOWER(REGEXP_REPLACE(matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = ANY($1::text[])
             OR LOWER(matchcode) = ANY($1::text[])
             OR LOWER(COALESCE(NULLIF(description, ''), matchcode)) = ANY($1::text[])
             OR LOWER(REGEXP_REPLACE(COALESCE(NULLIF(description, ''), matchcode), '[^a-zA-Z0-9]+', '-', 'g')) = ANY($1::text[])
          LIMIT 1
        `, brandSlugs);
        const mfrDuration = Math.round(performance.now() - mfrStart);

        if (mfrDuration > 50) {
          this.logger.warn(`[SLOW QUERY] TecDoc manufacturer lookup for "${make}" took ${mfrDuration}ms (threshold: 50ms)`);
        } else {
          this.logger.log(`TecDoc manufacturer lookup for "${make}" completed in ${mfrDuration}ms`);
        }

        if (mfrRows.length > 0) {
          const m = mfrRows[0];
          isTruck = Boolean(m.is_commercial_vehicle || m.is_transporter);
          isMoto = Boolean(m.is_motorbike);
          isEngineCategory = Boolean(m.is_engine);
          isPassengerCar = Boolean(m.is_passenger_car);
        }
      }
    } catch (err) {
      this.logger.error(`Error querying TecDoc classification for ${make} ${model}`, err);
    }

    const isMarine = isEngineCategory && (
      makeNorm.includes('MARINE') || makeNorm.includes('PENTA') || makeNorm.includes('YANMAR') || makeNorm.includes('MERCURY') ||
      modelNorm.includes('BOAT') || modelNorm.includes('BATEAU') || modelNorm.includes('HORS-BORD') || modelNorm.includes('OUTBOARD') ||
      modelNorm.includes('INBOARD') || eUpper.includes('MARINE')
    ) || makeNorm.includes('MARINE') || makeNorm.includes('BATEAU');

    const isAgri = (isEngineCategory || isTruck) && (
      makeNorm.includes('AGRI') || makeNorm.includes('TRACT') || modelNorm.includes('TRACT') ||
      ['DEUTZ', 'FENDT', 'CLAAS', 'KUBOTA', 'VALTRA', 'SAME', 'STEYR', 'LANDINI', 'MCCORMICK', 'AGCO', 'JOHN DEERE', 'MASSEY'].some(m => makeNorm.includes(m))
    ) || makeNorm.includes('TRACTEUR') || makeNorm.includes('TRACTOR');

    if (isMoto) {
      return {
        status: 'not_found',
        message: `Véhicule détecté comme moto / 2-roues (${make} ${model}), aucune spécification d'huile homologuée n'est enregistrée dans la base.`,
      };
    }

    if (isMarine) {
      return {
        status: 'not_found',
        message: `Moteur détecté comme marin (${make} ${model}), aucune spécification d'huile homologuée n'est enregistrée dans la base.`,
      };
    }

    if (isAgri) {
      return {
        status: 'not_found',
        message: `Véhicule détecté comme engin agricole / tracteur (${make} ${model}), aucune spécification d'huile homologuée n'est enregistrée dans la base.`,
      };
    }

    if (isTruck) {
      return {
        status: 'not_found',
        message: `Véhicule détecté comme poids lourd / utilitaire (${make} ${model}), aucune spécification d'huile homologuée n'est enregistrée dans la base.`,
      };
    }

    // 3. Automobile / Passenger Car Fallback:
    // If make is recognized as a known car manufacturer, resolve the authentic
    // manufacturer homologation tailored to this car's motorisation, fuel technology, and era.
    const matchedBrandKey = brandSlugs.find((b) => BRAND_DEFAULT_SPECS[b] || BRAND_ALIASES[b]);
    if (matchedBrandKey) {
      let tecdocYearFrom: number | null = null;
      let tecdocYearTo: number | null = null;
      let tecdocTrim = '';

      try {
        const engineFilter = engineCode ? `%${engineCode.trim().toLowerCase()}%` : null;
        const pcRows: any[] = await this.prisma.$queryRawUnsafe(`
          SELECT 
            COALESCE(NULLIF(pc.description, ''), pc.full_description) AS "description",
            CASE WHEN pc.date_from::text ~ '^[12]\\d{3}' THEN SUBSTRING(pc.date_from::text, 1, 4)::int ELSE NULL END AS "yearFrom",
            CASE WHEN pc.date_to::text ~ '^[12]\\d{3}' AND SUBSTRING(pc.date_to::text, 1, 4) != '0000' THEN SUBSTRING(pc.date_to::text, 1, 4)::int ELSE NULL END AS "yearTo"
          FROM tecdoc.passengercars pc
          JOIN tecdoc.models m ON m.id = pc.model_id
          JOIN tecdoc.manufacturers mfr ON mfr.id = m.manufacturer_id
          WHERE (
            LOWER(REGEXP_REPLACE(mfr.matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = ANY($1::text[])
            OR LOWER(mfr.matchcode) = ANY($1::text[])
            OR LOWER(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode)) = ANY($1::text[])
            OR LOWER(REGEXP_REPLACE(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode), '[^a-zA-Z0-9]+', '-', 'g')) = ANY($1::text[])
          )
          AND (
            LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) = $2
            OR LOWER(m.description) = $2
            OR $2 ILIKE '%' || LOWER(m.description) || '%'
            OR LOWER(m.description) ILIKE '%' || $2 || '%'
          )
          ${engineFilter ? `AND (
            LOWER(pc.description) ILIKE $3
            OR LOWER(pc.full_description) ILIKE $3
            OR $3 ILIKE '%' || LOWER(pc.description) || '%'
          )` : ''}
          ORDER BY (CASE WHEN pc.description IS NOT NULL AND pc.description != '' THEN 0 ELSE 1 END), pc.id ASC
          LIMIT 1
        `, ...(engineFilter ? [brandSlugs, slugify(model), engineFilter] : [brandSlugs, slugify(model)]));

        if (pcRows.length > 0) {
          if (pcRows[0].yearFrom) tecdocYearFrom = pcRows[0].yearFrom;
          if (pcRows[0].yearTo) tecdocYearTo = pcRows[0].yearTo;
          if (pcRows[0].description) tecdocTrim = pcRows[0].description;
        }
      } catch {
        // TecDoc lookup optional
      }

      // Preserve genuine engineCode passed by caller; NEVER pollute it with unrelated tecdocTrim
      const effectiveTrim = engineCode ? engineCode.trim() : tecdocTrim;

      const resolved = resolveAutomotiveOemSpec(
        make,
        model,
        effectiveTrim,
        tecdocYearFrom,
        tecdocYearTo,
      );

      // Search DB for existing OilFinderOilSpec strictly matching the resolved specification's viscosity and OEM/ACEA standard
      const dbSpec = await (this.prisma as any).oilFinderOilSpec?.findFirst?.({
        where: {
          viscosity: resolved.viscosity,
          OR: [
            ...(resolved.oemApproval ? [{ oemApproval: { contains: resolved.oemApproval.split('/')[0].trim(), mode: 'insensitive' } }] : []),
            ...(resolved.aceaStandard ? [{ aceaStandard: { contains: resolved.aceaStandard.split('/')[0].trim(), mode: 'insensitive' } }] : []),
          ],
        },
        orderBy: { id: 'asc' },
      }).catch(() => null);

      const specToReturn: OilSpecRef = dbSpec ? {
        id: dbSpec.id,
        viscosity: resolved.viscosity || dbSpec.viscosity,
        apiStandard: resolved.apiStandard || dbSpec.apiStandard,
        aceaStandard: resolved.aceaStandard || dbSpec.aceaStandard,
        oemApproval: resolved.oemApproval || dbSpec.oemApproval,
        capacityLiters: resolved.capacityLiters || dbSpec.capacityLiters,
        changeIntervalKm: resolved.changeIntervalKm || dbSpec.changeIntervalKm,
      } : {
        id: `oem-${matchedBrandKey}-${slugify(resolved.viscosity)}`,
        ...resolved,
      };

      return {
        status: 'found',
        oilSpec: specToReturn,
        resolvedBy: 'minor-conflict-auto-resolve',
        confidence: 'medium',
        backingRows: 1,
        candidates: [{
          make,
          model,
          generation: '',
          yearFrom: tecdocYearFrom,
          yearTo: tecdocYearTo,
          engineCode: tecdocTrim || engineCode || '',
          displacementCc: resolved.displacementCc,
          powerKw: resolved.powerHp ? Math.round(resolved.powerHp * 0.7457) : null,
          powerHp: resolved.powerHp,
          fuelType: resolved.fuelType,
          source: 'manufacturer-standard',
          confidence: 'medium',
          matchAmbiguity: null,
          oilSpec: specToReturn,
        }],
      };
    }

    if (isPassengerCar) {
      return {
        status: 'not_found',
        message: `Véhicule détecté comme automobile (${make} ${model}), aucune spécification d'huile homologuée n'est enregistrée dans la base.`,
      };
    }

    return {
      status: 'not_found',
      message: `Aucune spécification d'huile trouvée pour ${make} ${model}${engineCode ? ` (${engineCode})` : ''} dans la base de données.`,
    };
  }

  async findByCharacteristics(displacementCc: number, powerHp: number, fuelType: string): Promise<OilFinderResult> {
    const fuel = normFuel(fuelType);
    const key = { displacementCc, powerHp, fuelType: fuel };

    const rows = await this.prisma.oilFinderVehicle.findMany({
      where: key,
      include: { oilSpec: true },
      orderBy: [{ source: 'asc' }, { id: 'asc' }],
    }).catch(() => []);

    if (rows.length > 0) {
      const distinct = groupBySpec(rows);
      return {
        status: 'found',
        oilSpec: distinct[0].spec,
        resolvedBy: distinct.length === 1 ? 'exact' : 'minor-conflict-auto-resolve',
        confidence: distinct.length === 1 ? 'high' : 'medium',
        backingRows: rows.length,
        candidates: toCandidates(rows),
      };
    }

    return {
      status: 'not_found',
      message: `Aucune spécification d'huile trouvée pour les caractéristiques: ${displacementCc}cm³, ${powerHp}ch, ${fuel}.`,
    };
  }

  async getMakes(category?: string) {
    const catalog = getCleanCatalog();
    const makeMap = new Map<string, string>();

    // 1. Normalized Clean Hierarchy
    for (const m of Object.values(catalog) as any[]) {
      if (m.makeName && m.makeSlug) {
        makeMap.set(m.makeSlug, m.makeName);
      }
    }

    // 2. Database VehicleMake
    try {
      const dbMakes = await (this.prisma as any).vehicleMake?.findMany?.({
        select: { name: true, slug: true },
        orderBy: { name: 'asc' },
      });
      if (dbMakes && dbMakes.length > 0) {
        for (const m of dbMakes) {
          if (m.slug && m.name && !makeMap.has(m.slug)) {
            makeMap.set(m.slug, m.name);
          }
        }
      }
    } catch {
      // ignore
    }

    if (makeMap.size > 0) {
      return Array.from(makeMap.entries())
        .map(([slug, name]) => ({ slug, name }))
        .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    }

    return [];
  }

  async getModels(makeName: string) {
    const catalog = getCleanCatalog();
    const mSlug = slugify(makeName);

    // 1. Clean Normalized Hierarchy
    const makeObj = catalog[mSlug] || Object.values(catalog).find((m: any) => slugify(m.makeName) === mSlug || m.makeSlug === mSlug);
    if (makeObj && makeObj.models) {
      const cleanModels = Object.values(makeObj.models).map((mod: any) => {
        const gens = Object.values(mod.generations || {}) as any[];
        let yearFrom: number | null = null;
        let yearTo: number | null = null;
        for (const g of gens) {
          if (g.yearFrom && (!yearFrom || g.yearFrom < yearFrom)) yearFrom = g.yearFrom;
          if (g.yearTo && (!yearTo || g.yearTo > yearTo)) yearTo = g.yearTo;
        }
        return {
          name: mod.modelName,
          slug: mod.modelSlug,
          yearFrom,
          yearTo: yearTo === 9999 ? null : yearTo,
        };
      });

      if (cleanModels.length > 0) {
        return cleanModels.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
      }
    }

    // 2. Database VehicleModel
    try {
      const dbModels = await (this.prisma as any).vehicleModel?.findMany?.({
        where: {
          make: {
            OR: [
              { slug: mSlug },
              { name: { equals: makeName.trim(), mode: 'insensitive' } },
            ],
          },
        },
        select: { name: true, slug: true },
        orderBy: { name: 'asc' },
      });
      if (dbModels && dbModels.length > 0) {
        return dbModels.map((m: any) => ({
          name: m.name,
          slug: m.slug,
          yearFrom: null,
          yearTo: null,
        })).sort((a: any, b: any) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
      }
    } catch {
      // ignore
    }

    return [];
  }

  async getGenerations(makeName: string, modelName: string) {
    const catalog = getCleanCatalog();
    const mSlug = slugify(makeName);
    const modSlug = slugify(modelName);

    // 1. Clean Normalized Hierarchy
    const makeObj = catalog[mSlug] || Object.values(catalog).find((m: any) => slugify(m.makeName) === mSlug || m.makeSlug === mSlug);
    if (makeObj && makeObj.models) {
      const modelObj = makeObj.models[modSlug] || Object.values(makeObj.models).find((mod: any) => slugify(mod.modelName) === modSlug || mod.modelSlug === modSlug);
      if (modelObj && modelObj.generations) {
        return Object.values(modelObj.generations)
          .map((g: any) => ({
            name: g.genName,
            slug: g.genSlug,
            yearFrom: g.yearFrom || null,
            yearTo: g.yearTo === 9999 ? null : g.yearTo || null,
          }))
          .sort((a: any, b: any) => (a.yearFrom || 0) - (b.yearFrom || 0));
      }
    }

    // 2. Database VehicleGeneration
    try {
      const dbGens = await (this.prisma as any).vehicleGeneration?.findMany?.({
        where: {
          model: {
            OR: [
              { slug: `${mSlug}-${modSlug}` },
              { name: { equals: modelName.trim(), mode: 'insensitive' } },
            ],
          },
        },
        select: { name: true, slug: true, yearFrom: true, yearTo: true },
        orderBy: { yearFrom: 'asc' },
      });
      if (dbGens && dbGens.length > 0) {
        return dbGens.map((g: any) => ({
          name: g.name,
          slug: g.slug,
          yearFrom: g.yearFrom,
          yearTo: g.yearTo,
        }));
      }
    } catch {
      // ignore
    }

    return [];
  }

  async getEngines(makeName: string, modelName: string, generationName?: string) {
    const catalog = getCleanCatalog();
    const mSlug = slugify(makeName);
    const modSlug = slugify(modelName);

    // 1. Clean Normalized Hierarchy
    const makeObj = catalog[mSlug] || Object.values(catalog).find((m: any) => slugify(m.makeName) === mSlug || m.makeSlug === mSlug);
    if (makeObj && makeObj.models) {
      const modelObj = makeObj.models[modSlug] || Object.values(makeObj.models).find((mod: any) => slugify(mod.modelName) === modSlug || mod.modelSlug === modSlug);
      if (modelObj && modelObj.generations) {
        let targetEngines: any[] = [];
        if (generationName) {
          const genSlug = slugify(generationName);
          const genObj = modelObj.generations[genSlug] || Object.values(modelObj.generations).find((g: any) =>
            slugify(g.genName) === genSlug ||
            g.genSlug === genSlug ||
            g.genName.toLowerCase().includes(generationName.toLowerCase()) ||
            generationName.toLowerCase().includes(g.genName.toLowerCase())
          );
          if (genObj && genObj.engines) {
            targetEngines = genObj.engines;
          }
        } else {
          for (const g of Object.values(modelObj.generations) as any[]) {
            if (Array.isArray(g.engines)) {
              targetEngines.push(...g.engines);
            }
          }
        }

        if (targetEngines.length > 0) {
          const seen = new Set<string>();
          const result: any[] = [];
          for (const eng of targetEngines) {
            const key = `${eng.engineCode.toLowerCase()}_${eng.powerHp || ''}_${eng.fuelType || ''}`;
            if (!seen.has(key)) {
              seen.add(key);
              result.push({
                engineCode: eng.engineCode,
                yearFrom: eng.yearFrom || null,
                yearTo: eng.yearTo === 9999 ? null : eng.yearTo || null,
                fuelType: eng.fuelType,
                displacementCc: eng.displacementCc,
                powerHp: eng.powerHp,
                powerKw: eng.powerKw,
                previewOil: eng.oilSpec ? {
                  viscosity: eng.oilSpec.viscosity,
                  oemApproval: eng.oilSpec.oemApproval,
                } : undefined,
              });
            }
          }
          return result.sort((a, b) => (a.powerHp || 0) - (b.powerHp || 0));
        }
      }
    }

    // 2. Database VehicleEngine
    try {
      const dbEngines = await (this.prisma as any).vehicleEngine?.findMany?.({
        where: {
          generation: {
            model: {
              name: { equals: modelName.trim(), mode: 'insensitive' },
            },
            ...(generationName ? { name: { contains: generationName.trim(), mode: 'insensitive' } } : {}),
          },
        },
        include: { oilSpec: true },
        orderBy: { powerHp: 'asc' },
      });
      if (dbEngines && dbEngines.length > 0) {
        return dbEngines.map((e: any) => ({
          engineCode: e.engineCode,
          fuelType: e.fuelType,
          displacementCc: e.displacementCc,
          powerHp: e.powerHp,
          powerKw: e.powerKw,
          previewOil: e.oilSpec ? {
            viscosity: e.oilSpec.viscosity,
            oemApproval: e.oilSpec.oemApproval,
          } : undefined,
        }));
      }
    } catch {
      // ignore
    }

    return [{ engineCode: 'Moteur standard / D’origine', yearFrom: null, yearTo: null }];
  }
}

function groupBySpec(rows: Array<{ oilSpec: OilFinderOilSpec }>): Array<{ spec: OilSpecRef; count: number }> {
  const map = new Map<string, { spec: OilSpecRef; count: number }>()
  for (const row of rows) {
    const entry = map.get(row.oilSpec.id) ?? { spec: row.oilSpec, count: 0 }
    entry.count += 1
    map.set(row.oilSpec.id, entry)
  }
  return [...map.values()].sort((a, b) => {
    // Most-supported spec wins. Tie-break on id for stable, deterministic output.
    if (b.count !== a.count) return b.count - a.count
    return a.spec.id.localeCompare(b.spec.id)
  })
}

function toCandidates(rows: Array<OilFinderCandidate>): OilFinderCandidate[] {
  return rows.map((r) => ({
    make: r.make,
    model: r.model,
    generation: r.generation,
    yearFrom: r.yearFrom,
    yearTo: r.yearTo,
    engineCode: r.engineCode,
    displacementCc: r.displacementCc,
    powerKw: r.powerKw,
    powerHp: r.powerHp,
    fuelType: r.fuelType,
    source: r.source,
    confidence: r.confidence,
    matchAmbiguity: r.matchAmbiguity,
    oilSpec: r.oilSpec,
  }))
}
