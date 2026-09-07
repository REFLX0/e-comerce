const fs = require('fs');

const catPath = 'backend/src/oil-finder/clean-catalog-hierarchy.json';
const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8'));

// Templated engine patterns that were blindly copied across generations in build-popular-vehicles-sql.js
const TEMPLATED_PHANTOM_PATTERNS = [
  { model: 'duster', gen: 'duster-i', engineCode: '1.3 TCe', reason: '1.3 TCe (H5Ht) launched in 2019 on Duster II, never on Duster I' },
  { model: 'duster', gen: 'duster-i', engineCode: '1.5 Blue dCi 115', reason: 'Blue dCi (SCR AdBlue) introduced in 2018 on Duster II, never on Duster I' },
  { model: 'sandero', gen: 'sandero-i', engineCode: '0.9 TCe', reason: '0.9 TCe (H4B) launched in late 2012 on Sandero II, never on Sandero I' },
  { model: 'sandero', gen: 'sandero-ii', engineCode: '1.4 MPI', reason: '1.4 MPI (K7J) discontinued before Sandero II launch, templated from Sandero I' },
  { model: 'logan', gen: 'logan-ii', engineCode: '1.4 (LSA0, LSA5...)', reason: 'Chassis LSA0 and 1.4 MPI discontinued before Logan II, templated from Logan I' },
  { model: 'logan', gen: 'logan-ii', engineCode: '1.6 MPI', reason: '1.6 MPI (K7M 710 Euro 4) discontinued before Logan II, templated from Logan I' },
  { model: 'logan', gen: 'logan-ii', engineCode: '1.5 dCi (LS0J, LS0Y)', reason: 'Chassis LS0J and 68hp dCi Euro 4 discontinued before Logan II, templated from Logan I' }
];

function isSamePhysicalEngine(e1, e2) {
  if (e1.engineCode.toLowerCase() === e2.engineCode.toLowerCase()) return true;
  if (e1.fuelType && e2.fuelType && e1.fuelType !== e2.fuelType) return false;
  if (e1.displacementCc && e2.displacementCc) {
    if (Math.abs(e1.displacementCc - e2.displacementCc) > 15) return false;
  } else {
    return false;
  }
  if (e1.powerHp && e2.powerHp) {
    if (Math.abs(e1.powerHp - e2.powerHp) > 3) return false;
  } else {
    return false;
  }
  return true;
}

function mergeEngineRecords(existing, incoming) {
  const isMarketing = (s) => /^\d+\.\d+/.test(s);

  let marketingLabel = null;
  let factoryCode = null;

  [existing.engineCode, incoming.engineCode].forEach(c => {
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

function dedupAndTagEngines(modelSlug, genSlug, rawEngines) {
  const merged = [];

  for (const eng of rawEngines) {
    const matchIdx = merged.findIndex(m => isSamePhysicalEngine(m, eng));
    if (matchIdx !== -1) {
      merged[matchIdx] = mergeEngineRecords(merged[matchIdx], eng);
    } else {
      merged.push({ ...eng });
    }
  }

  // Tag templated phantom entries
  return merged.map(e => {
    const isPhantom = TEMPLATED_PHANTOM_PATTERNS.find(p => 
      p.model === modelSlug && p.gen === genSlug && e.engineCode.startsWith(p.engineCode)
    );
    if (isPhantom) {
      return {
        ...e,
        isTemplatedSeed: true,
        verificationNote: isPhantom.reason
      };
    }
    return e;
  });
}

// Build clean Dacia object
const dacia = catalog['dacia'];
const cleanDacia = {
  makeName: dacia.makeName || 'Dacia',
  makeSlug: 'dacia',
  models: {}
};

// Generation definitions for Dacia
const DACIA_SCHEMA = {
  'dokker': {
    name: 'Dokker',
    generations: {
      'dokker-i': {
        genName: 'Dokker I',
        genSlug: 'dokker-i',
        yearFrom: 2013,
        yearTo: 2021,
        sourceSlugs: ['dokker-i-2013-2021', 'sd', 'express-fsd', 'dokker-i']
      }
    }
  },
  'sandero': {
    name: 'Sandero',
    generations: {
      'sandero-i': {
        genName: 'Sandero I',
        genSlug: 'sandero-i',
        yearFrom: 2008,
        yearTo: 2012,
        sourceSlugs: ['sandero-i-2008-2012', 'sandero-i']
      },
      'sandero-ii': {
        genName: 'Sandero II',
        genSlug: 'sandero-ii',
        yearFrom: 2012,
        yearTo: 2020,
        sourceSlugs: ['sandero-ii-2012-2020', 'stepway-2018-2020', 'sandero-ii', 'stepway']
      },
      'sandero-iii': {
        genName: 'Sandero III',
        genSlug: 'sandero-iii',
        yearFrom: 2020,
        yearTo: 9999,
        sourceSlugs: ['sandero-iii-2020-present', 'stepway-2021-present']
      }
    }
  },
  'logan': {
    name: 'Logan',
    generations: {
      'logan-i': {
        genName: 'Logan I',
        genSlug: 'logan-i',
        yearFrom: 2004,
        yearTo: 2013,
        sourceSlugs: ['logan-i', 'mcv-ks']
      },
      'logan-ii': {
        genName: 'Logan II',
        genSlug: 'logan-ii',
        yearFrom: 2013,
        yearTo: 2020,
        sourceSlugs: ['logan-ii-2014-2020', 'logan-ii']
      },
      'logan-iii': {
        genName: 'Logan III',
        genSlug: 'logan-iii',
        yearFrom: 2020,
        yearTo: 9999,
        sourceSlugs: ['logan-iii-2020-present']
      }
    }
  },
  'duster': {
    name: 'Duster',
    generations: {
      'duster-i': {
        genName: 'Duster I',
        genSlug: 'duster-i',
        yearFrom: 2010,
        yearTo: 2018,
        sourceSlugs: ['duster-i-2010-2018', 'duster-i', 'hs']
      },
      'duster-ii': {
        genName: 'Duster II',
        genSlug: 'duster-ii',
        yearFrom: 2018,
        yearTo: 2024,
        sourceSlugs: ['duster-ii-2018-2024', 'duster-ii-2019-2024', 'duster-ii', 'hm']
      },
      'duster-iii': {
        genName: 'Duster III',
        genSlug: 'duster-iii',
        yearFrom: 2024,
        yearTo: 9999,
        sourceSlugs: ['duster-iii-2024-present']
      }
    }
  },
  'lodgy': {
    name: 'Lodgy',
    generations: {
      'lodgy-i': {
        genName: 'Lodgy I',
        genSlug: 'lodgy-i',
        yearFrom: 2013,
        yearTo: 2022,
        sourceSlugs: ['lodgy-i-2013-2022', 'lodgy-i']
      }
    }
  },
  'jogger': {
    name: 'Jogger',
    generations: {
      'jogger-i': {
        genName: 'Jogger I',
        genSlug: 'jogger-i',
        yearFrom: 2022,
        yearTo: 9999,
        sourceSlugs: ['jogger-i-2022-present', 'jogger-i']
      }
    }
  }
};

for (const [modelSlug, modelDef] of Object.entries(DACIA_SCHEMA)) {
  const existingModel = dacia.models[modelSlug] || {};
  const cleanModel = {
    modelName: modelDef.name,
    modelSlug: modelSlug,
    generations: {}
  };

  for (const [genSlug, genDef] of Object.entries(modelDef.generations)) {
    const rawEngines = [];
    if (existingModel.generations) {
      genDef.sourceSlugs.forEach(srcSlug => {
        const srcGen = existingModel.generations[srcSlug];
        if (srcGen && srcGen.engines) {
          rawEngines.push(...srcGen.engines);
        }
      });
    }

    const dedupedEngines = dedupAndTagEngines(modelSlug, genSlug, rawEngines);

    cleanModel.generations[genSlug] = {
      genName: genDef.genName,
      genSlug: genSlug,
      yearFrom: genDef.yearFrom,
      yearTo: genDef.yearTo,
      engines: dedupedEngines
    };
  }

  cleanDacia.models[modelSlug] = cleanModel;
}

console.log('=== CLEAN DACIA STRUCTURE COMPILED ===');
for (const [mSlug, m] of Object.entries(cleanDacia.models)) {
  console.log(`\nModel: ${m.modelName} (${mSlug})`);
  for (const [gSlug, g] of Object.entries(m.generations)) {
    console.log(`  Generation: "${g.genName}" (${g.yearFrom} - ${g.yearTo}) [Engines: ${g.engines.length}]`);
    g.engines.forEach(e => {
      const spec = e.oilSpec ? `${e.oilSpec.viscosity} ${e.oilSpec.oemApproval || ''}` : 'NULL';
      const flag = e.isTemplatedSeed ? ` [FLAGGED: ${e.verificationNote}]` : '';
      console.log(`    - ${e.engineCode} | ${e.fuelType} | ${e.displacementCc}cc | ${e.powerHp}hp | Oil: ${spec}${flag}`);
    });
  }
}

module.exports = { cleanDacia };
