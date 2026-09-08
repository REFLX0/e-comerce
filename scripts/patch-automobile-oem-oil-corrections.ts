/**
 * One-off patch: recompute engine-oil specs for the ~40 automobile makes that
 * were just added to tecdoc-catalog-harvester.ts's deriveOilSpecificationRaw()
 * (previously falling through to the generic "Universal ..." fallback).
 *
 * This does NOT re-run the full TecDoc harvest (slow, ~10 minutes, touches the
 * whole catalog). It reuses the exact same derivation logic — copied verbatim
 * from the harvester below — against the VehicleEngine rows that already exist
 * in the DB for just these makes, and re-links each one to the correct
 * OilFinderOilSpec (creating one if the fingerprint doesn't exist yet).
 *
 * Usage:
 *   npx tsx scripts/patch-automobile-oem-oil-corrections.ts            # dry-run report
 *   npx tsx scripts/patch-automobile-oem-oil-corrections.ts --apply    # write changes
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

// Only makes actually touched by the new/changed branches in the harvester —
// scoping the query to these keeps this a targeted patch, not a full re-derive.
const AFFECTED_MAKES = [
  'nissan', 'infiniti', 'renault', 'dacia', 'alpine',
  'opel', 'vauxhall', 'irmscher', 'bitter', 'bedford',
  'fiat', 'alfa-romeo', 'lancia', 'abarth', 'jeep', 'autobianchi', 'zastava',
  'bmw', 'mini', 'alpina', 'wiesmann',
  'mercedes-benz', 'mercedes', 'smart', 'mercedes-benz-bbdc', 'maybach', 'isdera', 'puch',
  'ford', 'ford-usa', 'mercury', 'lincoln',
  'chevrolet', 'cadillac', 'buick', 'gmc', 'gm', 'callaway', 'pontiac', 'oldsmobile', 'hummer',
  'porsche', 'ruf',
  'toyota', 'hyundai', 'kia', 'honda', 'mitsubishi', 'suzuki', 'lexus', 'mazda', 'subaru', 'genesis',
  'rover', 'saab', 'bentley', 'ferrari', 'lamborghini', 'chrysler', 'dodge',
  'maserati', 'ssangyong', 'daewoo', 'mg', 'lada', 'daihatsu', 'haval', 'great-wall',
  'chery', 'dfsk', 'byd', 'landwind-jmc', 'brilliance', 'lotus', 'morgan', 'mclaren',
  'isuzu', 'proton', 'tata', 'austin', 'talbot', 'morris', 'austin-healey', 'riley', 'triumph',
  'tvr', 'uaz', 'fso', 'gaz', 'zaz', 'aixam', 'daimler', 'de-lorean', 'bugatti', 'koenigsegg',
  'rolls-royce', 'nissan', 'infiniti', 'volvo',
];

function slugify(text: string): string {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface OilSpecResult {
  viscosity: string;
  oemApproval?: string;
  apiStandard?: string;
  aceaStandard?: string;
  capacityLiters?: number;
  changeIntervalKm?: number;
}

// ─── verbatim copy of tecdoc-catalog-harvester.ts's deriveOilSpecificationRaw ──
function deriveOilSpecificationRaw(
  makeSlug: string,
  fuelType: string,
  yearFrom: number | null,
  displacementCc: number | null,
  powerHp: number | null
): OilSpecResult | null {
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

  if (['volkswagen', 'audi', 'seat', 'skoda', 'cupra'].includes(makeSlug)) {
    if (isDiesel) {
      if (year < 2007) {
        return { viscosity: '10W-40', oemApproval: 'VW 501.01/505.00', aceaStandard: 'B3/B4', apiStandard: 'CF', capacityLiters: capacity, changeIntervalKm: 10000 };
      }
      return { viscosity: '5W-30', oemApproval: 'VW 504.00/507.00', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    } else {
      if (year >= 2018 && displacementCc && displacementCc <= 2000) {
        return { viscosity: '0W-20', oemApproval: 'VW 508.00/509.00', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
      }
      if (year >= 2008) {
        return { viscosity: '5W-30', oemApproval: 'VW 504.00/507.00', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
      }
      return { viscosity: '5W-40', oemApproval: 'VW 502.00/505.01', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
  }

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
    return { viscosity: '5W-40', oemApproval: 'PSA B71 2296', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'abarth' && !isDiesel) {
    if (year >= 2016) {
      return { viscosity: '5W-40', oemApproval: 'Fiat 9.55535-S3 (Selenia Digitek Pure Energy)', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '10W-50', oemApproval: 'Fiat 9.55535-S2 (Selenia Abarth)', aceaStandard: 'C3', apiStandard: 'SL', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

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
      return { viscosity: '10W-40', oemApproval: undefined, aceaStandard: 'A3/B4', apiStandard: 'SL', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
  }

  if (['bmw', 'mini', 'alpina', 'wiesmann'].includes(makeSlug)) {
    if (year >= 2017 && !isDiesel && displacementCc && displacementCc <= 2000) {
      return { viscosity: '0W-20', oemApproval: 'BMW Longlife-17 FE+', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (isDiesel || year >= 2004) {
      return { viscosity: '5W-30', oemApproval: 'BMW Longlife-04 (LL-04)', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 1995) {
      return { viscosity: '5W-40', oemApproval: 'BMW Longlife-98 (LL-98)', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '10W-40', apiStandard: 'SG/SH', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (['mercedes-benz', 'mercedes', 'smart', 'mercedes-benz-bbdc', 'maybach', 'isdera', 'puch'].includes(makeSlug)) {
    if (year >= 2016 && !isDiesel && displacementCc && displacementCc <= 2000) {
      return { viscosity: '5W-30', oemApproval: 'MB 229.52', aceaStandard: 'C3', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (isDiesel || year >= 2010) {
      return { viscosity: '5W-30', oemApproval: 'MB 229.51 / MB 229.52', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-40', oemApproval: 'MB 229.5', aceaStandard: 'A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (['ford', 'ford-usa', 'mercury', 'lincoln'].includes(makeSlug)) {
    if (isDiesel && year >= 2014) {
      return { viscosity: '0W-30', oemApproval: 'Ford WSS-M2C950-A', aceaStandard: 'C2', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (!isDiesel && year >= 2012 && displacementCc && displacementCc <= 1500) {
      return { viscosity: '5W-20', oemApproval: 'Ford WSS-M2C948-B', aceaStandard: 'C5', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'Ford WSS-M2C913-D', aceaStandard: 'A5/B5', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  if (['chevrolet', 'cadillac', 'buick', 'gmc', 'gm', 'callaway', 'pontiac', 'oldsmobile', 'hummer'].includes(makeSlug)) {
    if (isDiesel) {
      return { viscosity: '5W-30', oemApproval: 'GM dexos2', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2011) {
      return { viscosity: '5W-30', oemApproval: 'GM dexos1 Gen 2', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'GM dexos1', aceaStandard: 'A5/B5', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'volvo') {
    if (year >= 2014) {
      return { viscosity: '0W-20', oemApproval: 'Volvo VCC-RBS0-2AE', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 20000 };
    }
    return { viscosity: '0W-30', oemApproval: 'Volvo VCC 95200377', aceaStandard: 'A5/B5', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  if (['jaguar', 'land-rover', 'land rover'].includes(makeSlug)) {
    if (isDiesel && year >= 2015) {
      return { viscosity: '0W-30', oemApproval: 'JLR STJLR.03.5007', aceaStandard: 'C2', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (!isDiesel && year >= 2017) {
      return { viscosity: '0W-20', oemApproval: 'JLR STJLR.51.5122', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'JLR STJLR.03.5003', aceaStandard: 'A5/B5 / C1', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  if (['porsche', 'ruf'].includes(makeSlug)) {
    if (isDiesel) {
      return { viscosity: '5W-30', oemApproval: 'Porsche C30', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2018) {
      return { viscosity: '0W-40', oemApproval: 'Porsche C40', aceaStandard: 'C3', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '0W-40', oemApproval: 'Porsche A40', aceaStandard: 'A3/B4', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  if (['toyota', 'hyundai', 'kia', 'honda', 'mitsubishi', 'suzuki', 'lexus', 'mazda', 'subaru', 'genesis'].includes(makeSlug)) {
    if (isDiesel) {
      return { viscosity: '5W-30', oemApproval: 'Asian OEM C2/C3 DPF', aceaStandard: 'C2 / C3', apiStandard: 'SN/CF', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2018) {
      return { viscosity: '0W-20', oemApproval: 'Asian OEM Modern Hybrid / Fuel Economy', aceaStandard: 'C5', apiStandard: 'SP / ILSAC GF-6', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'Asian OEM Standard', aceaStandard: 'A5/B5 / C2', apiStandard: 'SN/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'aston-martin') {
    if (year >= 2016 && displacementCc && displacementCc <= 4200) {
      return { viscosity: '5W-30', oemApproval: 'Castrol Edge Professional (MB 229.5 family — AMG-sourced V8)', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-40', oemApproval: 'Castrol Edge Professional (Aston Martin factory-fill partner)', aceaStandard: 'A3/B4', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'rover' && !isDiesel && year >= 1998 && displacementCc && displacementCc >= 1400 && displacementCc <= 2500) {
    return { viscosity: '10W-40', aceaStandard: displacementCc <= 1800 ? 'A1/A2' : 'A2', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'saab') {
    if (year >= 2003 && !isDiesel) {
      return { viscosity: '0W-30', oemApproval: 'GM-LL-A-025', aceaStandard: 'A2/B2 or A3/B3-B4', apiStandard: 'SH/SJ/SL', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (isDiesel) {
      return { viscosity: '10W-40', aceaStandard: 'B2-96/B3-96', apiStandard: 'CD+', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '10W-40', oemApproval: 'Saab Turbo engine oil', aceaStandard: 'A2-96/A3-96', apiStandard: 'SG/SH', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'bentley') {
    if (year >= 2012 && displacementCc && displacementCc <= 4200) {
      return { viscosity: '5W-30', oemApproval: 'VW 504.00/507.00; Bentley G 052 195 (V8)', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    if (year >= 2012) {
      return { viscosity: '0W-40', oemApproval: 'Mobil 1 New Life / Bentley G 052 930 (W12)', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '0W-40', oemApproval: 'Mobil 1 0W-40 (Bentley factory-fill, Continental GT 2004-2011)', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  if (makeSlug === 'ferrari') {
    return { viscosity: '5W-40', oemApproval: 'Shell Helix Ultra 5W-40 (Ferrari factory-fill/sole service recommendation)', aceaStandard: 'A3/B4', apiStandard: 'SN/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'lamborghini' && !isDiesel) {
    if (year >= 2018) {
      return { viscosity: '0W-40', oemApproval: 'Porsche C40 / VW 511.00 (Urus)', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'VW 504.00 (Castrol SLX LongLife III)', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  if (['chrysler', 'dodge'].includes(makeSlug) && !isDiesel && year >= 2000) {
    return { viscosity: '5W-20', oemApproval: 'DaimlerChrysler/FCA MS-6395', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'maserati' && year >= 2014) {
    if (year >= 2018 && displacementCc && displacementCc <= 3000) {
      return { viscosity: '10W-60', oemApproval: 'Shell Helix Ultra Racing 10W-60 (Maserati bulletin MAS002103)', aceaStandard: 'A3/B3, A3/B4', apiStandard: 'SN/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '5W-40', oemApproval: 'Shell Helix Ultra Maserati 5W-40 (Maserati bulletin MAS002103)', aceaStandard: 'A3/B3, A3/B4', apiStandard: 'SL/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'ssangyong') {
    if (isDiesel) {
      return { viscosity: '15W-40', oemApproval: 'MB Sheet 229.1/229.3 (preferred); SsangYong genuine oil', aceaStandard: 'B2/B3/B4', apiStandard: 'CG or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '15W-40', oemApproval: 'MB Sheet 229.1 or 229.3; SsangYong genuine oil', apiStandard: 'SH or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'daewoo') {
    return { viscosity: '10W-40', oemApproval: 'MB Sheet 229.1 (Musso-based applications)', aceaStandard: 'A2 or A3', apiStandard: 'SH or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'mg') {
    if (year >= 2010) {
      return { viscosity: '0W-20', oemApproval: 'SAIC Motor-recommended engine oil', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '10W-40', oemApproval: 'MG Rover specification', aceaStandard: 'A2 or A3 (A1 except VVC engines)', apiStandard: 'SH or SJ', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'lada') {
    if (year >= 2015) {
      return { viscosity: '5W-40', oemApproval: 'STO AAI 003 B5/B6 (LADA-recommended lubricant)', apiStandard: 'SL, SM, or SN', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    if (isDiesel) {
      return { viscosity: '10W-40', aceaStandard: 'B2-96 minimum', apiStandard: 'SG/CF', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '10W-40', aceaStandard: 'A2-96', apiStandard: 'SG/SH/CD', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'daihatsu' && displacementCc && displacementCc >= 1300 && displacementCc <= 1500) {
    return { viscosity: '0W-20', apiStandard: 'SJ or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'haval' && !isDiesel) {
    return { viscosity: '0W-20', oemApproval: 'Haval/GWM OEM-recommended fully synthetic oil', aceaStandard: 'C5', apiStandard: 'SN or SP', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'great-wall' && isDiesel) {
    return { viscosity: year >= 2011 ? '5W-30' : '0W-30', oemApproval: 'Great Wall OEM-specified engine oil', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'chery' && !isDiesel) {
    if (year >= 2020) {
      return { viscosity: '0W-20', oemApproval: 'Chery genuine engine oil', aceaStandard: 'C5', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '5W-30', apiStandard: 'SH or SJ', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'dfsk' && !isDiesel) {
    return { viscosity: '5W-30', apiStandard: 'SM or higher', oemApproval: 'DFSK engine-oil specification', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'byd' && !isDiesel) {
    return { viscosity: '0W-20', oemApproval: 'BYD engine-oil specification', aceaStandard: 'C5', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'landwind-jmc') {
    if (isDiesel) {
      return { viscosity: '10W-40', oemApproval: 'Landwind-approved diesel oil', apiStandard: 'CI-4', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '5W-40', oemApproval: 'Landwind-approved engine oil', apiStandard: 'SN or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'brilliance' && !isDiesel) {
    return { viscosity: '5W-30', oemApproval: 'Brilliance-approved oil', apiStandard: 'SL or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'lotus') {
    if (year >= 2022) {
      return { viscosity: '0W-40', oemApproval: 'Total Quartz 9000 Energy (Lotus Emira factory-fill)', aceaStandard: 'A3/B4', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '5W-40', oemApproval: 'PETRONAS Syntium Racer X1 5W-40 (Lotus approval PE-00137)', aceaStandard: 'A3/B4', apiStandard: 'SM', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'morgan' && year >= 2023) {
    return { viscosity: '0W-30', oemApproval: 'Genuine BMW-specification engine oil', aceaStandard: 'A2/B2, A2/B3, A3/B3 (Plus Four) or C2/C3 (Plus Six)', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  if (makeSlug === 'mclaren' && year >= 2011) {
    return { viscosity: '5W-40', oemApproval: 'Gulf Formula Elite 5W-40 (McLaren approved product)', aceaStandard: 'C3', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'isuzu' && isDiesel) {
    return { viscosity: '10W-30', oemApproval: 'Isuzu BESCO CLEAN / BESCO CLEAN SUPER (JASO DH-2)', aceaStandard: 'E6 or E9', apiStandard: 'CI-4 or CJ-4', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'proton') {
    if (year >= 2020) {
      return { viscosity: '5W-30', oemApproval: 'Proton Genuine Oil (PGO)', apiStandard: 'SP / ILSAC GF-6A', capacityLiters: capacity, changeIntervalKm: 10000 };
    }
    return { viscosity: '10W-30', oemApproval: 'PETRONAS Syntium / Proton Genuine Oil', apiStandard: 'SL or higher', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'tata' && !isDiesel && displacementCc && displacementCc <= 1200) {
    return { viscosity: '5W-30', oemApproval: 'Castrol Magnatec Professional T 5W-30 (Tata Motors recommended)', aceaStandard: 'A5/B5', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'austin') {
    return { viscosity: year >= 1983 ? '10W-40' : '15W-50', capacityLiters: capacity, changeIntervalKm: 8000 };
  }

  if (['talbot', 'morris', 'austin-healey', 'riley', 'triumph'].includes(makeSlug)) {
    return { viscosity: '20W-50', capacityLiters: capacity, changeIntervalKm: 6000 };
  }

  if (makeSlug === 'tvr') {
    if (year >= 2002) {
      return { viscosity: '10W-40', oemApproval: 'Carlube Triple R 10W-40 (semi-synthetic, Speed Six era)', capacityLiters: capacity, changeIntervalKm: 8000 };
    }
    return { viscosity: '5W-50', oemApproval: 'Mobil 1 (TVR-recommended, Rover V8 era)', capacityLiters: capacity, changeIntervalKm: 6000 };
  }

  if (makeSlug === 'uaz') {
    return { viscosity: '10W-40', oemApproval: 'STO AAI-003-98 B4/D2', apiStandard: 'SG/CD or higher (SH, SJ, SL, SM)', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'fso') {
    return { viscosity: '15W-40', apiStandard: isDiesel ? 'SG/CD or CD' : 'SG/CD', capacityLiters: capacity, changeIntervalKm: 8000 };
  }

  if (makeSlug === 'gaz') {
    return { viscosity: '15W-40', apiStandard: 'SF, SG, SH, or SJ', capacityLiters: capacity, changeIntervalKm: 8000 };
  }

  if (makeSlug === 'zaz') {
    return { viscosity: '15W-40', apiStandard: 'SG, SH, or SJ', capacityLiters: capacity, changeIntervalKm: 8000 };
  }

  if (makeSlug === 'aixam' && isDiesel) {
    return { viscosity: '10W-30', oemApproval: 'Aixam Mega oil by Yacco (Kubota Z482 microcar engine)', capacityLiters: capacity, changeIntervalKm: 8000 };
  }

  if (makeSlug === 'daimler') {
    return { viscosity: '15W-50', oemApproval: 'Jaguar BLS-OL-02', apiStandard: 'SE/CC', capacityLiters: capacity, changeIntervalKm: 8000 };
  }

  if (makeSlug === 'de-lorean') {
    return { viscosity: '20W-50', oemApproval: 'Castrol conventional 20W-50 (Classic DeLorean Motor Company guidance)', apiStandard: 'SF', capacityLiters: capacity, changeIntervalKm: 6000 };
  }

  if (makeSlug === 'bugatti') {
    return { viscosity: '10W-60', oemApproval: 'Castrol EDGE 10W-60 (VW 501.00/505.00)', aceaStandard: 'A3/B4', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'koenigsegg') {
    return { viscosity: '10W-60', oemApproval: 'Castrol EDGE 10W-60 (Koenigsegg approved)', aceaStandard: 'A3/B4', capacityLiters: capacity, changeIntervalKm: 10000 };
  }

  if (makeSlug === 'rolls-royce' && year >= 2003) {
    if (year >= 2017 && displacementCc && displacementCc <= 2000) {
      return { viscosity: '0W-20', oemApproval: 'BMW Longlife-17 FE+', aceaStandard: 'C5', apiStandard: 'SP', capacityLiters: capacity, changeIntervalKm: 15000 };
    }
    return { viscosity: '5W-30', oemApproval: 'BMW Longlife-04 (LL-04)', aceaStandard: 'C3', apiStandard: 'SN', capacityLiters: capacity, changeIntervalKm: 15000 };
  }

  // No branch matched -> not one of the makes/conditions this patch corrects.
  // Returning null (instead of the harvester's generic fallback) means the
  // caller below will SKIP this engine, leaving its existing oilSpecId
  // completely untouched.
  return null;
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

function enforceFapSafety(
  spec: OilSpecResult | null,
  isDiesel: boolean,
  year: number
): OilSpecResult | null {
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

function deriveOilSpecification(
  makeSlug: string,
  fuelType: string,
  yearFrom: number | null,
  displacementCc: number | null,
  powerHp: number | null
): OilSpecResult | null {
  const raw = deriveOilSpecificationRaw(makeSlug, fuelType, yearFrom, displacementCc, powerHp);
  if (!raw) return null;
  return enforceFapSafety(raw, isDieselFuelText(fuelType), yearFrom || 2015);
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write)'}`);

  const engines = await prisma.vehicleEngine.findMany({
    where: {
      generation: { model: { make: { slug: { in: AFFECTED_MAKES } } } },
    },
    include: {
      generation: { include: { model: { include: { make: true } } } },
      oilSpec: true,
    },
  });

  console.log(`Found ${engines.length} engines across ${AFFECTED_MAKES.length} affected makes.\n`);

  let unchanged = 0;
  let skippedNoMatch = 0;
  let toUpdate = 0;
  const specCache = new Map<string, string>();
  const byMake = new Map<string, number>();

  for (const eng of engines) {
    const makeSlug = eng.generation.model.make.slug;
    const yearFrom = eng.generation.yearFrom;
    const spec = deriveOilSpecification(makeSlug, eng.fuelType, yearFrom, eng.displacementCc, eng.powerHp);

    if (!spec) {
      skippedNoMatch++;
      continue;
    }

    // MUST include apiStandard -- see the matching comment in tecdoc-catalog-harvester.ts.
    // Without it, e.g. GAZ and ZAZ (same viscosity/OEM/ACEA, different API text) collide
    // onto the same spec row and keep overwriting each other's apiStandard forever.
    const fingerprint = `${slugify(spec.viscosity)}_${slugify(spec.oemApproval || 'generic')}_${slugify(spec.aceaStandard || 'std')}_${slugify(spec.apiStandard || 'anyapi')}`;
    const current = eng.oilSpec;
    const alreadyCorrect =
      current &&
      current.viscosity === spec.viscosity &&
      (current.oemApproval || null) === (spec.oemApproval || null) &&
      (current.aceaStandard || null) === (spec.aceaStandard || null) &&
      (current.apiStandard || null) === (spec.apiStandard || null);

    if (alreadyCorrect) {
      unchanged++;
      continue;
    }

    toUpdate++;
    byMake.set(makeSlug, (byMake.get(makeSlug) || 0) + 1);

    if (APPLY) {
      let specId = specCache.get(fingerprint);
      if (!specId) {
        const upserted = await prisma.oilFinderOilSpec.upsert({
          where: { fingerprint },
          update: {
            viscosity: spec.viscosity,
            oemApproval: spec.oemApproval || null,
            aceaStandard: spec.aceaStandard || null,
            apiStandard: spec.apiStandard || null,
            capacityLiters: spec.capacityLiters || null,
            changeIntervalKm: spec.changeIntervalKm || null,
          },
          create: {
            viscosity: spec.viscosity,
            oemApproval: spec.oemApproval || null,
            aceaStandard: spec.aceaStandard || null,
            apiStandard: spec.apiStandard || null,
            capacityLiters: spec.capacityLiters || null,
            changeIntervalKm: spec.changeIntervalKm || null,
            fingerprint,
          },
        });
        specId = upserted.id;
        specCache.set(fingerprint, specId);
      }
      await prisma.vehicleEngine.update({
        where: { id: eng.id },
        data: { oilSpecId: specId },
      });
    }
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Engines with a corrected spec:   ${toUpdate}`);
  console.log(`  Engines already correct:         ${unchanged}`);
  console.log(`  Engines with no matching branch (left untouched): ${skippedNoMatch}`);
  if (toUpdate > 0) {
    console.log('\n  By make:');
    for (const [make, count] of [...byMake.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`    ${make.padEnd(20)} ${count}`);
    }
  }
  if (!APPLY) {
    console.log('\nRe-run with --apply to write these changes.');
  }
}

main()
  .catch((e) => {
    console.error('FATAL:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
