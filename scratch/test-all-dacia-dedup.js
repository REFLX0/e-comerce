const fs = require('fs');

const catPath = 'backend/src/oil-finder/clean-catalog-hierarchy.json';
const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8'));
const daciaRaw = catalog['dacia'];

// Helper to determine if two engine records represent the same physical engine
function isSamePhysicalEngine(e1, e2) {
  // If exact code match
  if (e1.engineCode.toLowerCase() === e2.engineCode.toLowerCase()) return true;

  // Fuel type must match
  if (e1.fuelType && e2.fuelType && e1.fuelType !== e2.fuelType) return false;

  // Displacement must be close (within 15 cc to handle 1598 vs 1587 or rounding)
  if (e1.displacementCc && e2.displacementCc) {
    if (Math.abs(e1.displacementCc - e2.displacementCc) > 15) return false;
  } else {
    return false; // without displacement match, we cannot safely assert physical equivalence
  }

  // Power HP must be close (within 3 hp to handle 109 vs 110 or 130 vs 131 due to kW to hp conversions)
  if (e1.powerHp && e2.powerHp) {
    if (Math.abs(e1.powerHp - e2.powerHp) > 3) return false;
  } else {
    // If one is missing hp, check if codes correlate or don't merge blindly
    return false;
  }

  return true;
}

// Helper to merge two matching engine records
function mergeEngineRecords(existing, incoming) {
  // Extract potential factory code and marketing label
  const isMarketing = (s) => /^\d+\.\d+/.test(s);
  const isFactoryCode = (s) => /^[A-Z][0-9A-Z]{2,4}(\s+[0-9A-Z]+)?$/i.test(s.trim());

  let marketingLabel = null;
  let factoryCode = null;

  [existing.engineCode, incoming.engineCode].forEach(c => {
    // If it already has format "Marketing (Code)"
    const parenMatch = c.match(/^(.+?)\s*\((.+?)\)$/);
    if (parenMatch) {
      marketingLabel = marketingLabel || parenMatch[1].trim();
      factoryCode = factoryCode || parenMatch[2].trim();
    } else if (isMarketing(c)) {
      marketingLabel = marketingLabel || c.trim();
    } else {
      factoryCode = factoryCode || c.trim();
    }
  });

  let combinedName = existing.engineCode;
  if (marketingLabel && factoryCode && marketingLabel !== factoryCode) {
    combinedName = `${marketingLabel} (${factoryCode})`;
  } else if (marketingLabel) {
    combinedName = marketingLabel;
  } else if (factoryCode) {
    combinedName = factoryCode;
  }

  const primary = incoming.oilSpec ? incoming : existing;
  const secondary = incoming.oilSpec ? existing : incoming;

  return {
    engineCode: combinedName,
    fuelType: primary.fuelType || secondary.fuelType,
    displacementCc: primary.displacementCc || secondary.displacementCc,
    powerHp: primary.powerHp || secondary.powerHp,
    powerKw: primary.powerKw || secondary.powerKw || (primary.powerHp ? Math.round(primary.powerHp * 0.735499) : null),
    yearFrom: primary.yearFrom || secondary.yearFrom || null,
    yearTo: primary.yearTo || secondary.yearTo || null,
    oilSpec: primary.oilSpec || secondary.oilSpec || null
  };
}

// Function to deduplicate an array of engines for a generation
function dedupEngines(rawEngines) {
  const merged = [];

  for (const eng of rawEngines) {
    // Find if an engine in merged matches this physically
    const matchIdx = merged.findIndex(m => isSamePhysicalEngine(m, eng));
    if (matchIdx !== -1) {
      merged[matchIdx] = mergeEngineRecords(merged[matchIdx], eng);
    } else {
      merged.push({ ...eng });
    }
  }

  return merged;
}

// Let's test this on Dokker, Sandero, Logan, Duster
const testModels = ['dokker', 'sandero', 'logan', 'duster'];

testModels.forEach(modelSlug => {
  const model = daciaRaw.models[modelSlug];
  console.log('================================================================');
  console.log(`MODEL: ${modelSlug.toUpperCase()}`);
  console.log('================================================================');

  // Define generation grouping
  let genGroups = {};
  if (modelSlug === 'dokker') {
    genGroups = {
      'dokker-i': {
        name: 'Dokker I',
        years: '2013 - 2021',
        sourceGenSlugs: ['dokker-i-2013-2021', 'sd', 'express-fsd', 'dokker-i']
      }
    };
  } else if (modelSlug === 'sandero') {
    genGroups = {
      'sandero-i': {
        name: 'Sandero I',
        years: '2008 - 2012',
        sourceGenSlugs: ['sandero-i-2008-2012', 'sandero-i']
      },
      'sandero-ii': {
        name: 'Sandero II',
        years: '2012 - 2020',
        sourceGenSlugs: ['sandero-ii-2012-2020', 'stepway-2018-2020', 'sandero-ii', 'stepway']
      },
      'sandero-iii': {
        name: 'Sandero III',
        years: '2020 - Présent',
        sourceGenSlugs: ['sandero-iii-2020-present', 'stepway-2021-present']
      }
    };
  } else if (modelSlug === 'logan') {
    genGroups = {
      'logan-i': {
        name: 'Logan I',
        years: '2004 - 2013',
        sourceGenSlugs: ['logan-i', 'mcv-ks']
      },
      'logan-ii': {
        name: 'Logan II',
        years: '2013 - 2020',
        sourceGenSlugs: ['logan-ii-2014-2020', 'logan-ii']
      },
      'logan-iii': {
        name: 'Logan III',
        years: '2020 - Présent',
        sourceGenSlugs: ['logan-iii-2020-present']
      }
    };
  } else if (modelSlug === 'duster') {
    genGroups = {
      'duster-i': {
        name: 'Duster I',
        years: '2010 - 2018',
        sourceGenSlugs: ['duster-i-2010-2018', 'duster-i', 'hs']
      },
      'duster-ii': {
        name: 'Duster II',
        years: '2018 - 2024',
        sourceGenSlugs: ['duster-ii-2018-2024', 'duster-ii-2019-2024', 'duster-ii', 'hm']
      },
      'duster-iii': {
        name: 'Duster III',
        years: '2024 - Présent',
        sourceGenSlugs: ['duster-iii-2024-present']
      }
    };
  }

  for (const [canonSlug, group] of Object.entries(genGroups)) {
    console.log(`\n----------------------------------------------------------------`);
    console.log(`GENERATION: ${group.name} (${group.years}) [Slug: ${canonSlug}]`);
    console.log(`Sources combined: ${group.sourceGenSlugs.join(', ')}`);
    console.log(`----------------------------------------------------------------`);

    // Collect all raw engines
    const rawEngines = [];
    group.sourceGenSlugs.forEach(slug => {
      const g = model.generations[slug];
      if (g && g.engines) {
        g.engines.forEach(e => rawEngines.push({ ...e, _sourceGen: slug }));
      }
    });

    console.log(`BEFORE (Raw entries: ${rawEngines.length}):`);
    rawEngines.forEach(e => {
      const spec = e.oilSpec ? `${e.oilSpec.viscosity} ${e.oilSpec.oemApproval || ''}` : 'null';
      console.log(`  - [from ${e._sourceGen}] "${e.engineCode}" | ${e.fuelType} | ${e.displacementCc}cc | ${e.powerHp}hp | oilSpec: ${spec}`);
    });

    // Dedup
    const deduped = dedupEngines(rawEngines);
    console.log(`\nAFTER DEDUP (Unique physical engines: ${deduped.length}):`);
    deduped.forEach(e => {
      const spec = e.oilSpec ? `${e.oilSpec.viscosity} | ${e.oilSpec.oemApproval || 'none'} | ACEA ${e.oilSpec.aceaStandard || 'none'} | ${e.oilSpec.capacityLiters || 'none'}L` : 'null';
      console.log(`  * "${e.engineCode}" | ${e.fuelType} | ${e.displacementCc}cc | ${e.powerHp}hp | oilSpec: ${spec}`);
    });
  }
});
