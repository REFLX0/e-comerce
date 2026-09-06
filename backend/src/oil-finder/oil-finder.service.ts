import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { OilFinderOilSpec } from '@prisma/client'

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
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'Volvo VCC-RBS0-2AE / Volvo XC',
    capacityLiters: 5.0,
    changeIntervalKm: 15000,
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
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'JLR STJLR.03.5006 / Land Rover STC 4184',
    capacityLiters: 6.0,
    changeIntervalKm: 15000,
  },
  'land rover': {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'JLR STJLR.03.5006 / Land Rover STC 4184',
    capacityLiters: 6.0,
    changeIntervalKm: 15000,
  },
  jaguar: {
    viscosity: '5W-30',
    apiStandard: 'SN',
    aceaStandard: 'C3',
    oemApproval: 'JLR STJLR.03.5006 / Land Rover STC 4184',
    capacityLiters: 6.0,
    changeIntervalKm: 15000,
  },
  porsche: {
    viscosity: '0W-40',
    apiStandard: 'SN',
    aceaStandard: 'A3/B4',
    oemApproval: 'Porsche C30 / Porsche Approved Engine Oil',
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
      // Deduce era from model generation / chassis indicators
      if (/saxo|106|205|306|406|xantia|xsara|golf\s*(?:iv|4|iii|3)|polo\s*6n|clio\s*(?:ii|2|i|1)|megane\s*(?:i|1)|punto\s*(?:1|i)|e36|e39|w124|w202/.test(combined)) {
        detectedYear = 1999;
      } else if (/golf\s*(?:v|5|vi|6)|clio\s*(?:iii|3)|megane\s*(?:ii|2)|206|207|307|c3\s*i|c4\s*i|astra\s*(?:g|h)|e90|w203|w204/.test(combined)) {
        detectedYear = 2008;
      } else if (/golf\s*(?:vii|7|viii|8)|clio\s*(?:iv|4|v|5)|208|308|c3\s*(?:ii|iii)|c4\s*ii|astra\s*(?:j|k)|f30|g20|w205|captur|kadjar|duster|sandero/.test(combined)) {
        detectedYear = 2016;
      } else {
        detectedYear = 2012; // modern default
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

  // 4. Determine fuel type & injection technology
  const isDiesel = /(?:dci|tdi|hdi|bluehdi|cdti|crdi|multijet|jtd|d-4d|d4d|did|di-d|tdci|cdi|bluetec|ddis|crd|\bd\b|diesel|sdi)/i.test(combined);
  const isHybrid = /(?:hybrid|e-tech|phev|mhev|prius)/i.test(combined);
  const isPureTech = /puretech/i.test(combined);
  const isEcoBoost = /ecoboost/i.test(combined);
  const isTurboPetrol = /(?:tce|tsi|tfsi|puretech|ecoboost|thp|turbo|t-gdi|tgdi)/i.test(combined);

  const fuelType = isDiesel ? 'diesel' : isHybrid ? 'hybrid' : 'essence';

  const calcCapacity = (base: number) => {
    if (!displacementCc) return base;
    if (displacementCc <= 1200) return Math.max(3.0, base - 0.5);
    if (displacementCc >= 2500) return base + 1.5;
    if (displacementCc >= 2000) return base + 0.5;
    return base;
  };

  // 5. High-Precision OEM Homologation Engine by Brand Family
  const isRenaultFamily = ['renault', 'dacia'].includes(mfrSlug);
  const isPsaFamily = ['peugeot', 'citroen', 'citroën', 'ds', 'ds-automobiles'].includes(mfrSlug);
  const isVagFamily = ['volkswagen', 'vw', 'audi', 'seat', 'skoda', 'škoda', 'cupra'].includes(mfrSlug);
  const isBmwFamily = ['bmw', 'mini'].includes(mfrSlug);
  const isMercedesFamily = ['mercedes', 'mercedes-benz', 'smart'].includes(mfrSlug);
  const isFordFamily = ['ford'].includes(mfrSlug);
  const isFiatFamily = ['fiat', 'alfa-romeo', 'alfa', 'lancia', 'jeep', 'abarth'].includes(mfrSlug);
  const isOpelFamily = ['opel', 'vauxhall'].includes(mfrSlug);
  const isAsianFamily = ['toyota', 'lexus', 'hyundai', 'kia', 'nissan', 'infiniti', 'honda', 'mazda', 'mitsubishi', 'subaru', 'suzuki', 'ssangyong', 'mahindra', 'isuzu'].includes(mfrSlug);
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
    if (detectedYear >= 2018 || /1\.3|1\.0\s*tce/i.test(combined) || combined.includes('megane')) {
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
    if (isTurboPetrol || detectedYear >= 2007) {
      return {
        viscosity: '5W-40',
        apiStandard: 'SN/CF',
        aceaStandard: 'A3/B4',
        oemApproval: 'Renault RN0710 / RN0700',
        capacityLiters: calcCapacity(4.2),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
      };
    }
    return {
      viscosity: detectedYear < 2002 ? '10W-40' : '5W-40',
      apiStandard: 'SL/CF',
      aceaStandard: 'A3/B4',
      oemApproval: 'Renault RN0700',
      capacityLiters: calcCapacity(4.0),
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
    if (isDiesel) {
      if (detectedYear >= 2014 || /bluehdi|1\.5\s*hdi/i.test(combined)) {
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
    if (/vti|thp/i.test(combined) || detectedYear >= 2010) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN/CF',
        aceaStandard: 'C2',
        oemApproval: 'Peugeot Citroën PSA B71 2290',
        capacityLiters: calcCapacity(4.0),
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
    if (isEcoBoost && (displacementCc || 0) <= 1000) {
      return {
        viscosity: '5W-20',
        apiStandard: 'SN',
        aceaStandard: 'C5',
        oemApproval: 'Ford WSS-M2C948-B',
        capacityLiters: calcCapacity(4.1),
        changeIntervalKm: 15000,
        fuelType,
        displacementCc,
        powerHp,
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
      // 2.9 V6 Biturbo Quadrifoglio (510ch)
      if (/2\.9|quadrifoglio/i.test(combined) || (powerHp && powerHp >= 500)) {
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
      // 2.2 JTDM Diesel (136ch - 210ch)
      if (isDiesel || /2\.2|jtd/i.test(combined)) {
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
      // 2.0 Turbo MultiAir (952ABA25B, 200ch / 280ch Veloce / Q4)
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

    // FireFly 1.0 / 1.3 GSE Turbo (Fiat 500X, Tipo, Jeep Renegade, Compass 2018+)
    if (/gse|firefly/i.test(combined) || (detectedYear >= 2018 && /renegade|compass|500x|tipo/i.test(combined) && !isDiesel)) {
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

    if (isDiesel) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN',
        aceaStandard: 'C2',
        oemApproval: 'Fiat 9.55535-S1',
        capacityLiters: calcCapacity(3.5),
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
      oemApproval: 'Fiat 9.55535-G2 / 9.55535-D2',
      capacityLiters: calcCapacity(3.0),
      changeIntervalKm: 10000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── OPEL / VAUXHALL ──
  if (isOpelFamily) {
    if (detectedYear >= 2005) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN',
        aceaStandard: 'C3',
        oemApproval: 'GM Dexos2',
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
      oemApproval: 'GM LL-A-025 / GM-LL-B-025',
      capacityLiters: calcCapacity(4.0),
      changeIntervalKm: 10000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── ASIAN BRANDS (TOYOTA, HYUNDAI, KIA, NISSAN, HONDA, MAZDA...) ──
  if (isAsianFamily) {
    // Toyota Land Cruiser / Lexus LX V8 & V6 specific engine calibrations (matching Liqui Moly Guide)
    const isLandCruiser = combined.includes('land cruiser') || combined.includes('landcruiser') || combined.includes('prado');
    if (isLandCruiser || mfrSlug === 'toyota' || mfrSlug === 'lexus') {
      // 4.7L V8 (2UZ-FE / UZJ200 / UZJ100): Liqui Moly specifies Leichtlauf High Tech 5W-40, 7.1L (dry) / 6.2L (service)
      if (combined.includes('4.7') || combined.includes('2uz') || combined.includes('uzj200') || combined.includes('uzj100')) {
        return {
          viscosity: '5W-40',
          apiStandard: 'SN/CF',
          aceaStandard: 'A3/B4',
          oemApproval: 'Toyota / Lexus / MB 229.5 / Porsche A40',
          capacityLiters: 7.1,
          changeIntervalKm: 15000,
          fuelType: 'essence',
          displacementCc: displacementCc || 4664,
          powerHp: powerHp || 288,
        };
      }
      // 5.7L V8 (3UR-FE / URJ202): Liqui Moly specifies Special Tec AA 0W-20 / 5W-30, 7.5L
      if (combined.includes('5.7') || combined.includes('3ur') || combined.includes('urj202')) {
        return {
          viscosity: '0W-20',
          apiStandard: 'SP',
          aceaStandard: 'ILSAC GF-6A',
          oemApproval: 'Toyota / Lexus API SP / ILSAC GF-6A',
          capacityLiters: 7.5,
          changeIntervalKm: 10000,
          fuelType: 'essence',
          displacementCc: displacementCc || 5663,
          powerHp: powerHp || 381,
        };
      }
      // 4.6L V8 (1UR-FE / URJ200): Liqui Moly specifies 0W-20 / 5W-30, 7.5L
      if (combined.includes('4.6') || combined.includes('1ur')) {
        return {
          viscosity: '0W-20',
          apiStandard: 'SP',
          aceaStandard: 'ILSAC GF-6A',
          oemApproval: 'Toyota / Lexus API SP / ILSAC GF-6A',
          capacityLiters: 7.5,
          changeIntervalKm: 10000,
          fuelType: 'essence',
          displacementCc: displacementCc || 4608,
          powerHp: powerHp || 309,
        };
      }
      // 4.5L V8 D-4D (1VD-FTV / VDJ200): Liqui Moly specifies Top Tec 4200 / 4300 5W-30 ACEA C2, 9.2L
      if ((combined.includes('4.5') || combined.includes('1vd')) && (isDiesel || combined.includes('d-4d') || combined.includes('diesel') || combined.includes('d4d'))) {
        return {
          viscosity: '5W-30',
          apiStandard: 'SN/CF',
          aceaStandard: 'C2',
          oemApproval: 'Toyota DL-1 / ACEA C2',
          capacityLiters: 9.2,
          changeIntervalKm: 10000,
          fuelType: 'diesel',
          displacementCc: displacementCc || 4461,
          powerHp: powerHp || 286,
        };
      }
      // 4.0L V6 (1GR-FE / GRJ200): 5W-30, 5.2L
      if (combined.includes('4.0') || combined.includes('1gr')) {
        return {
          viscosity: '5W-30',
          apiStandard: 'SP',
          aceaStandard: 'ILSAC GF-6A',
          oemApproval: 'Toyota / Lexus API SP / ILSAC GF-6A',
          capacityLiters: 5.2,
          changeIntervalKm: 10000,
          fuelType: 'essence',
          displacementCc: displacementCc || 3956,
          powerHp: powerHp || 275,
        };
      }
    }

    if (isHybrid) {
      const is25Hybrid = combined.includes('2.5') || (displacementCc !== null && displacementCc >= 2400 && displacementCc <= 2600);
      const isRav4 = combined.includes('rav');
      const capacity = (is25Hybrid || isRav4) ? 4.4 : calcCapacity(3.7);
      return {
        viscosity: '0W-20',
        apiStandard: 'API SP / ILSAC GF-6A',
        aceaStandard: 'ILSAC GF-6A',
        oemApproval: 'Toyota / Lexus API SP / ILSAC GF-6A',
        capacityLiters: capacity,
        changeIntervalKm: 15000,
        fuelType,
        displacementCc: displacementCc || (is25Hybrid ? 2494 : null),
        powerHp: powerHp || (is25Hybrid ? 155 : null),
      };
    }

    // Hyundai / Kia Kappa 1.0 T-GDi (G3LC) - 100ch / 120ch (Official: 0W-30 ACEA C2, 3.6L)
    if (
      combined.includes('g3lc') ||
      ((mfrSlug === 'hyundai' || mfrSlug === 'kia') &&
        (combined.includes('1.0') || displacementCc === 998) &&
        (combined.includes('t-gdi') || combined.includes('tgdi') || combined.includes('turbo') || powerHp === 100 || powerHp === 120))
    ) {
      return {
        viscosity: '0W-30',
        apiStandard: 'SN',
        aceaStandard: 'C2',
        oemApproval: 'Hyundai / Kia ACEA C2 (0W-30)',
        capacityLiters: 3.6,
        changeIntervalKm: 15000,
        fuelType: 'essence',
        displacementCc: 998,
        powerHp: powerHp || 100,
      };
    }
    if (detectedYear >= 2008 || isDiesel) {
      return {
        viscosity: '5W-30',
        apiStandard: 'SN/CF',
        aceaStandard: 'C2 / C3',
        oemApproval: 'Toyota / Hyundai / Kia / Nissan / Asian OEM',
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
      oemApproval: 'Toyota / Hyundai / Asian Classic',
      capacityLiters: calcCapacity(3.8),
      changeIntervalKm: 10000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── VOLVO ──
  if (isVolvo) {
    return {
      viscosity: '5W-30',
      apiStandard: 'SN',
      aceaStandard: 'C3',
      oemApproval: 'Volvo VCC-RBS0-2AE / Volvo XC',
      capacityLiters: calcCapacity(5.0),
      changeIntervalKm: 15000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── PORSCHE ──
  if (isPorsche) {
    return {
      viscosity: '0W-40',
      apiStandard: 'SN',
      aceaStandard: 'A3/B4',
      oemApproval: 'Porsche C30 / Porsche Approved Engine Oil',
      capacityLiters: calcCapacity(7.5),
      changeIntervalKm: 15000,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  // ── DEFAULT CAR FALLBACK FROM BRAND SPEC OR 5W-30 C3 ──
  const matchedBrandKey = resolveBrandSlugs(make).find((b) => BRAND_DEFAULT_SPECS[b]);
  if (matchedBrandKey) {
    const s = BRAND_DEFAULT_SPECS[matchedBrandKey];
    return {
      ...s,
      fuelType,
      displacementCc,
      powerHp,
    };
  }

  return {
    viscosity: '5W-30',
    apiStandard: 'SN/CF',
    aceaStandard: 'C3',
    oemApproval: 'API SN / ACEA C3 European Standard',
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
      let tecdocTrim = engineCode || '';

      try {
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
          LIMIT 1
        `, brandSlugs, slugify(model));

        if (pcRows.length > 0) {
          if (pcRows[0].yearFrom) tecdocYearFrom = pcRows[0].yearFrom;
          if (pcRows[0].yearTo) tecdocYearTo = pcRows[0].yearTo;
          if (pcRows[0].description) tecdocTrim = pcRows[0].description;
        }
      } catch {
        // TecDoc lookup optional
      }

      const resolved = resolveAutomotiveOemSpec(
        make,
        model,
        tecdocTrim || engineCode,
        tecdocYearFrom,
        tecdocYearTo,
      );

      // Search DB for existing OilFinderOilSpec matching the resolved specification
      const oemKeyword = resolved.oemApproval.split(' ')[0];
      const dbSpec = await (this.prisma as any).oilFinderOilSpec?.findFirst?.({
        where: {
          OR: [
            { oemApproval: { contains: oemKeyword, mode: 'insensitive' } },
            { AND: [{ viscosity: resolved.viscosity }, { aceaStandard: resolved.aceaStandard }] },
            { viscosity: resolved.viscosity },
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
    const cat = category?.toLowerCase().trim() || 'auto';
    const isMoto = cat.includes('moto') || cat.includes('karting') || cat.includes('2-roues') || cat.includes('scooter');
    const isAgri = cat.includes('agri') || cat.includes('tractor') || cat.includes('tracteur');
    const isCv = !isAgri && (cat.includes('poids') || cat.includes('commercial') || cat.includes('heavy') || cat.includes('truck') || cat.includes('camion'));
    const isMarine = cat.includes('marine') || cat.includes('boat') || cat.includes('bateau');

    let whereClause = 'mfr.can_be_displayed = true';
    if (isMoto) {
      whereClause += ' AND mfr.is_motorbike = true';
    } else if (isCv) {
      whereClause += ' AND (mfr.is_commercial_vehicle = true OR mfr.is_transporter = true)';
    } else if (isAgri) {
      whereClause += ' AND (mfr.is_commercial_vehicle = true OR mfr.is_engine = true)';
    } else if (isMarine) {
      whereClause += ' AND (mfr.is_engine = true OR mfr.is_commercial_vehicle = true)';
    } else {
      whereClause += ' AND mfr.is_passenger_car = true';
    }

    const makeMap = new Map<string, string>();

    try {
      const tecdocRows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT COALESCE(NULLIF(mfr.description, ''), mfr.matchcode) AS name
        FROM tecdoc.manufacturers mfr
        WHERE ${whereClause}
        ORDER BY name ASC
      `);
      for (const r of tecdocRows) {
        if (r.name) makeMap.set(slugify(r.name), r.name);
      }
    } catch (e) {
      this.logger.error('Error fetching makes from TecDoc', e);
    }

    try {
      const rows = await this.prisma.oilFinderVehicle?.findMany?.({
        select: { make: true },
        distinct: ['make'],
        orderBy: { make: 'asc' },
      });
      if (rows && rows.length > 0) {
        for (const r of rows) {
          if (r.make && !makeMap.has(slugify(r.make))) {
            makeMap.set(slugify(r.make), r.make);
          }
        }
      }
    } catch (e) {
      this.logger.warn('Failed to query oilFinderVehicle makes fallback', e);
    }

    if (makeMap.size > 0) {
      return Array.from(makeMap.entries())
        .map(([slug, name]) => ({ slug, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    return [];
  }

  async getModels(makeName: string) {
    const brandSlugs = resolveBrandSlugs(makeName);
    const modelMap = new Map<string, string>();

    try {
      const tecdocRows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT m.description AS name, LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) AS slug
        FROM tecdoc.models m
        JOIN tecdoc.manufacturers mfr ON mfr.id = m.manufacturer_id
        WHERE m.can_be_displayed = true
          AND (
            LOWER(REGEXP_REPLACE(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode), '[^a-zA-Z0-9]+', '-', 'g')) = ANY($1::text[])
            OR LOWER(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode)) = ANY($1::text[])
            OR LOWER(REGEXP_REPLACE(mfr.matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = ANY($1::text[])
            OR LOWER(mfr.matchcode) = ANY($1::text[])
          )
        ORDER BY m.description ASC
      `, brandSlugs);
      for (const r of tecdocRows) {
        if (r.name) modelMap.set(r.slug || slugify(r.name), r.name);
      }
    } catch (e) {
      this.logger.error(`Error fetching models from TecDoc for make: ${makeName}`, e);
    }

    try {
      const rows = await this.prisma.oilFinderVehicle?.findMany?.({
        where: { make: { equals: makeName.trim(), mode: 'insensitive' as const } },
        select: { model: true },
        distinct: ['model'],
        orderBy: { model: 'asc' },
      });
      if (rows && rows.length > 0) {
        for (const r of rows) {
          const s = slugify(r.model);
          if (r.model && !modelMap.has(s)) {
            modelMap.set(s, r.model);
          }
        }
      }
    } catch (e) {
      this.logger.warn(`Failed to query oilFinderVehicle models fallback for make ${makeName}`, e);
    }

    if (modelMap.size > 0) {
      return Array.from(modelMap.entries())
        .map(([slug, name]) => ({ slug, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    return [];
  }

  async getEngines(makeName: string, modelName: string) {
    const brandSlugs = resolveBrandSlugs(makeName);
    const modelNorm = modelName.trim().toLowerCase();

    const engineMap = new Map<string, { engineCode: string; yearFrom: number | null; yearTo: number | null }>();

    // 1. Query tecdoc.passengercars joined with tecdoc.models and tecdoc.manufacturers
    try {
      const tecdocPassCars: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT 
          COALESCE(NULLIF(pc.description, ''), pc.full_description) AS "engineCode",
          CASE 
            WHEN pc.date_from::text ~ '^[12]\\d{3}' THEN SUBSTRING(pc.date_from::text, 1, 4)::int
            WHEN pc.date_from::text ~ '\\d{4}$' THEN SUBSTRING(pc.date_from::text, LENGTH(pc.date_from::text)-3, 4)::int
            ELSE NULL 
          END AS "yearFrom",
          CASE 
            WHEN pc.date_to::text ~ '^[12]\\d{3}' AND SUBSTRING(pc.date_to::text, 1, 4) != '0000' THEN SUBSTRING(pc.date_to::text, 1, 4)::int
            WHEN pc.date_to::text ~ '\\d{4}$' AND SUBSTRING(pc.date_to::text, LENGTH(pc.date_to::text)-3, 4) != '0000' THEN SUBSTRING(pc.date_to::text, LENGTH(pc.date_to::text)-3, 4)::int
            ELSE NULL 
          END AS "yearTo"
        FROM tecdoc.passengercars pc
        JOIN tecdoc.models m ON m.id = pc.model_id
        JOIN tecdoc.manufacturers mfr ON mfr.id = m.manufacturer_id
        WHERE pc.can_be_displayed = true
          AND (
            LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) = $1
            OR LOWER(m.description) = $1
            OR $1 ILIKE '%' || LOWER(m.description) || '%'
            OR LOWER(m.description) ILIKE '%' || $1 || '%'
          )
          AND (
            LOWER(REGEXP_REPLACE(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode), '[^a-zA-Z0-9]+', '-', 'g')) = ANY($2::text[])
            OR LOWER(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode)) = ANY($2::text[])
            OR LOWER(REGEXP_REPLACE(mfr.matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = ANY($2::text[])
            OR LOWER(mfr.matchcode) = ANY($2::text[])
          )
        ORDER BY "engineCode" ASC
      `, modelNorm, brandSlugs);

      for (const pc of tecdocPassCars) {
        if (pc.engineCode) {
          const key = pc.engineCode.trim().toLowerCase();
          if (!engineMap.has(key)) {
            engineMap.set(key, {
              engineCode: pc.engineCode.trim(),
              yearFrom: pc.yearFrom != null ? Number(pc.yearFrom) : null,
              yearTo: pc.yearTo != null ? Number(pc.yearTo) : null,
            });
          }
        }
      }
    } catch (e) {
      this.logger.error(`Error fetching passenger car engines from TecDoc for ${makeName} ${modelName}`, e);
    }

    // 2. Query oilFinderVehicle table in DB for matching make and model variants
    try {
      const modelKeywords = extractModelKeywords(modelName);
      const orConditions: any[] = [
        { model: { equals: modelName.trim(), mode: 'insensitive' as const } },
        { model: { contains: modelName.trim(), mode: 'insensitive' as const } },
      ];
      for (const kw of modelKeywords) {
        if (kw.length >= 3) {
          orConditions.push({ model: { contains: kw, mode: 'insensitive' as const } });
        }
      }

      const rows = await this.prisma.oilFinderVehicle.findMany({
        where: {
          make: { equals: makeName.trim(), mode: 'insensitive' as const },
          OR: orConditions,
          engineCode: { not: '' },
        },
        select: {
          engineCode: true,
          yearFrom: true,
          yearTo: true,
          displacementCc: true,
          powerHp: true,
          fuelType: true,
          model: true,
        },
        distinct: ['engineCode'],
        orderBy: { engineCode: 'asc' },
      }).catch(() => [] as any[]);

      for (const r of rows) {
        if (r.engineCode) {
          const rawCode = r.engineCode.trim();
          const key = rawCode.toLowerCase();
          if (!engineMap.has(key)) {
            let label = rawCode;
            if (/^[A-Z0-9-]+$/.test(rawCode) && r.displacementCc && r.powerHp) {
              const liters = (r.displacementCc / 1000).toFixed(1);
              label = `${liters}L (${rawCode}) - ${Math.round(r.powerHp)}ch`;
            }
            const alreadyPresent = Array.from(engineMap.values()).some((e) =>
              e.engineCode.toLowerCase().includes(rawCode.toLowerCase())
            );
            if (!alreadyPresent) {
              engineMap.set(key, {
                engineCode: label,
                yearFrom: r.yearFrom || null,
                yearTo: r.yearTo || null,
              });
            }
          }
        }
      }
    } catch (e) {
      this.logger.warn(`Failed to query oilFinderVehicle engines for ${makeName} ${modelName}`, e);
    }

    if (engineMap.size > 0) {
      return Array.from(engineMap.values()).sort((a, b) => a.engineCode.localeCompare(b.engineCode));
    }

    // 4. Return the model from tecdoc.models as the standard engine configuration
    try {
      const modelRow: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT 
          m.description || ' (Moteur d''origine)' AS "engineCode",
          CASE WHEN m.date_from::text ~ '^[12]\\d{3}' THEN SUBSTRING(m.date_from::text, 1, 4)::int ELSE NULL END AS "yearFrom",
          CASE WHEN m.date_to::text ~ '^[12]\\d{3}' AND SUBSTRING(m.date_to::text, 1, 4) != '0000' THEN SUBSTRING(m.date_to::text, 1, 4)::int ELSE NULL END AS "yearTo"
        FROM tecdoc.models m
        WHERE (
          LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) = $1
          OR LOWER(m.description) = $1
          OR $1 ILIKE '%' || LOWER(m.description) || '%'
          OR LOWER(m.description) ILIKE '%' || $1 || '%'
        )
        LIMIT 1
      `, modelNorm);

      if (modelRow.length > 0) {
        return modelRow;
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
