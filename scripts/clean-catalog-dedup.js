const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '../backend/src/oil-finder/clean-catalog-hierarchy.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log('Original makes:', Object.keys(catalog).length);

// 1. Merge helper: merges source model into target model without losing engines or generations
function mergeModels(makeKey, sourceModelKey, targetModelKey, targetModelName) {
  const make = catalog[makeKey];
  if (!make || !make.models) return;
  const source = make.models[sourceModelKey];
  if (!source) return;

  if (!make.models[targetModelKey]) {
    make.models[targetModelKey] = {
      modelName: targetModelName || source.modelName,
      modelSlug: targetModelKey,
      category: source.category || 'automobile',
      generations: {}
    };
  }
  const target = make.models[targetModelKey];
  if (targetModelName) target.modelName = targetModelName;

  for (const [genKey, genVal] of Object.entries(source.generations || {})) {
    if (!target.generations[genKey]) {
      target.generations[genKey] = { ...genVal };
    } else {
      // Merge engines
      const existing = target.generations[genKey].engines || [];
      const seen = new Set(existing.map(e => `${e.engineCode}_${e.powerHp || ''}_${e.fuelType || ''}`));
      for (const eng of (genVal.engines || [])) {
        const k = `${eng.engineCode}_${eng.powerHp || ''}_${eng.fuelType || ''}`;
        if (!seen.has(k)) {
          seen.add(k);
          existing.push(eng);
        }
      }
      target.generations[genKey].engines = existing;
    }
  }

  // Remove source model
  delete make.models[sourceModelKey];
  console.log(`[MERGE] ${makeKey}: merged '${sourceModelKey}' into '${targetModelKey}'`);
}

// 2. Execute targeted merges for duplicates

// BMW
mergeModels('bmw', '1', 'serie-1', 'Série 1');
mergeModels('bmw', '2', 'serie-2', 'Série 2');
mergeModels('bmw', '3', 'serie-3', 'Série 3');
mergeModels('bmw', '5', 'serie-5', 'Série 5');

// Mercedes-Benz
mergeModels('mercedes-benz', 'a-class', 'classe-a', 'Classe A');
mergeModels('mercedes-benz', 'c-class', 'classe-c', 'Classe C');
mergeModels('mercedes-benz', 'e-class', 'classe-e', 'Classe E');
// Handle Mercedes "classe" bogus model: gla and glc
if (catalog['mercedes-benz']?.models?.['classe']) {
  const cMod = catalog['mercedes-benz'].models['classe'];
  if (cMod.generations?.gla) {
    if (!catalog['mercedes-benz'].models['gla']) {
      catalog['mercedes-benz'].models['gla'] = { modelName: 'GLA', modelSlug: 'gla', category: 'automobile', generations: {} };
    }
    catalog['mercedes-benz'].models['gla'].generations['gla'] = cMod.generations.gla;
  }
  if (cMod.generations?.glc) {
    if (!catalog['mercedes-benz'].models['glc']) {
      catalog['mercedes-benz'].models['glc'] = { modelName: 'GLC', modelSlug: 'glc', category: 'automobile', generations: {} };
    }
    catalog['mercedes-benz'].models['glc'].generations['glc'] = cMod.generations.glc;
  }
  delete catalog['mercedes-benz'].models['classe'];
  console.log(`[CLEAN] mercedes-benz: cleaned bogus 'classe' model`);
}

// Volkswagen
mergeModels('volkswagen', 't', 't-roc', 'T-Roc');
mergeModels('volkswagen', 'troc', 't-roc', 'T-Roc');

// Ford
mergeModels('ford', 'c', 'c-max', 'C-Max');
mergeModels('ford', 'cmax', 'c-max', 'C-Max');

// Toyota
mergeModels('toyota', 'rav', 'rav4', 'RAV4');
mergeModels('toyota', 'chr', 'c-hr', 'C-HR');

// Honda
mergeModels('honda', 'crv', 'cr-v', 'CR-V');
mergeModels('honda', 'hrv', 'hr-v', 'HR-V');

// Nissan
mergeModels('nissan', 'xtrail', 'x-trail', 'X-Trail');

// Mazda
mergeModels('mazda', '2', 'mazda-2', 'Mazda 2');
mergeModels('mazda', 'mazda2', 'mazda-2', 'Mazda 2');
mergeModels('mazda', '3', 'mazda-3', 'Mazda 3');
mergeModels('mazda', 'mazda3', 'mazda-3', 'Mazda 3');
mergeModels('mazda', '6', 'mazda-6', 'Mazda 6');
mergeModels('mazda', 'mazda6', 'mazda-6', 'Mazda 6');
mergeModels('mazda', 'cx5', 'cx-5', 'CX-5');
mergeModels('mazda', 'cx3', 'cx-3', 'CX-3');
if (catalog['mazda']?.models?.['mazda']) {
  const mMod = catalog['mazda'].models['mazda'];
  if (mMod.generations?.['mazda-ii']) {
    catalog['mazda'].models['mazda-2'].generations['mazda-ii'] = mMod.generations['mazda-ii'];
  }
  if (mMod.generations?.['mazda-iii']) {
    catalog['mazda'].models['mazda-3'].generations['mazda-iii'] = mMod.generations['mazda-iii'];
  }
  if (mMod.generations?.['mazda-vi']) {
    catalog['mazda'].models['mazda-6'].generations['mazda-vi'] = mMod.generations['mazda-vi'];
  }
  delete catalog['mazda'].models['mazda'];
  console.log(`[CLEAN] mazda: cleaned bogus 'mazda' model`);
}

// Isuzu
mergeModels('isuzu', 'dmax', 'd-max', 'D-Max');
if (catalog['isuzu']?.models?.['isuzu']) {
  delete catalog['isuzu'].models['isuzu'];
  console.log(`[CLEAN] isuzu: removed bogus 'isuzu' model`);
}

// Cupra
if (catalog['cupra']?.models?.['cupra']) {
  delete catalog['cupra'].models['cupra'];
  console.log(`[CLEAN] cupra: removed bogus 'cupra' model`);
}

// Porsche
if (catalog['porsche']?.models?.['porsche']) {
  mergeModels('porsche', 'porsche', '911', '911');
}

// Subaru
if (catalog['subaru']?.models?.['subaru']) {
  mergeModels('subaru', 'subaru', 'xv', 'XV');
}

// Jaguar
if (catalog['jaguar']?.models?.['jaguar']) {
  const jMod = catalog['jaguar'].models['jaguar'];
  if (jMod.generations?.xe) catalog['jaguar'].models['xe'].generations['xe'] = jMod.generations.xe;
  if (jMod.generations?.['f-pace']) catalog['jaguar'].models['f-pace'].generations['f-pace'] = jMod.generations['f-pace'];
  delete catalog['jaguar'].models['jaguar'];
  console.log(`[CLEAN] jaguar: cleaned bogus 'jaguar' model`);
}

// MG
if (catalog['mg']?.models?.['mg']) {
  const mgMod = catalog['mg'].models['mg'];
  for (const [gk, gv] of Object.entries(mgMod.generations || {})) {
    if (gk.includes('zs')) {
      if (!catalog['mg'].models['zs']) catalog['mg'].models['zs'] = { modelName: 'ZS', modelSlug: 'zs', category: 'automobile', generations: {} };
      catalog['mg'].models['zs'].generations[gk] = gv;
    } else if (gk.includes('hs')) {
      if (!catalog['mg'].models['hs']) catalog['mg'].models['hs'] = { modelName: 'HS', modelSlug: 'hs', category: 'automobile', generations: {} };
      catalog['mg'].models['hs'].generations[gk] = gv;
    } else {
      catalog['mg'].models['mg3'].generations[gk] = gv;
    }
  }
  delete catalog['mg'].models['mg'];
  console.log(`[CLEAN] mg: cleaned bogus 'mg' model`);
}

// Mini
if (catalog['mini']?.models?.['mini']) {
  const mMod = catalog['mini'].models['mini'];
  if (!catalog['mini'].models['cooper']) catalog['mini'].models['cooper'] = { modelName: 'Mini Hatch / Cooper', modelSlug: 'cooper', category: 'automobile', generations: {} };
  for (const [gk, gv] of Object.entries(mMod.generations || {})) {
    if (gk.includes('countryman')) {
      if (!catalog['mini'].models['countryman']) catalog['mini'].models['countryman'] = { modelName: 'Countryman', modelSlug: 'countryman', category: 'automobile', generations: {} };
      catalog['mini'].models['countryman'].generations[gk] = gv;
    } else if (gk.includes('clubman')) {
      if (!catalog['mini'].models['clubman']) catalog['mini'].models['clubman'] = { modelName: 'Clubman', modelSlug: 'clubman', category: 'automobile', generations: {} };
      catalog['mini'].models['clubman'].generations[gk] = gv;
    } else {
      catalog['mini'].models['cooper'].generations[gk] = gv;
    }
  }
  delete catalog['mini'].models['mini'];
  console.log(`[CLEAN] mini: cleaned bogus 'mini' model`);
}

// Smart
if (catalog['smart']?.models?.['smart']) {
  const sMod = catalog['smart'].models['smart'];
  for (const [gk, gv] of Object.entries(sMod.generations || {})) {
    if (gk.includes('four')) {
      if (catalog['smart'].models['forfour']) catalog['smart'].models['forfour'].generations[gk] = gv;
    } else {
      if (catalog['smart'].models['fortwo']) catalog['smart'].models['fortwo'].generations[gk] = gv;
    }
  }
  delete catalog['smart'].models['smart'];
  console.log(`[CLEAN] smart: cleaned bogus 'smart' model`);
}

// Chery
if (catalog['chery']?.models?.['chery']) {
  delete catalog['chery'].models['chery'];
  console.log(`[CLEAN] chery: removed bogus 'chery' model`);
}
// DFSK
if (catalog['dfsk']?.models?.['dfsk']) {
  delete catalog['dfsk'].models['dfsk'];
  console.log(`[CLEAN] dfsk: removed bogus 'dfsk' model`);
}
// Great Wall
if (catalog['great-wall']?.models?.['great']) {
  delete catalog['great-wall'].models['great'];
  console.log(`[CLEAN] great-wall: removed bogus 'great' model`);
}
// BYD
if (catalog['byd']?.models?.['byd']) {
  delete catalog['byd'].models['byd'];
  console.log(`[CLEAN] byd: removed bogus 'byd' model`);
}

// Mahindra: move passenger cars (KUV100, XUV500, XUV300, Scorpio, Bolero, Thar) to automobile, remove duplicate fragments
if (catalog['mahindra']) {
  if (catalog['mahindra'].models?.['mahindra']) delete catalog['mahindra'].models['mahindra'];
  if (catalog['mahindra'].models?.['kuv']) delete catalog['mahindra'].models['kuv'];
  if (catalog['mahindra'].models?.['xuv']) delete catalog['mahindra'].models['xuv'];
  
  // Set categories for Mahindra
  catalog['mahindra'].categories = ['agricole', 'automobile'];
  for (const [mk, mv] of Object.entries(catalog['mahindra'].models || {})) {
    if (['275', '475', '575'].includes(mk)) {
      mv.category = 'agricole';
    } else {
      mv.category = 'automobile';
    }
  }
  console.log(`[CLEAN] mahindra: cleaned duplicate models and tagged cars vs tractors`);
}

// Renault Trucks: rename single-letter 't' and 'd' to Gamme T / Gamme D
if (catalog['renault-trucks']?.models?.['t']) {
  catalog['renault-trucks'].models['t'].modelName = 'Gamme T';
}
if (catalog['renault-trucks']?.models?.['d']) {
  catalog['renault-trucks'].models['d'].modelName = 'Gamme D';
}

// Solis: S -> Solis S Series
if (catalog['solis']?.models?.['s']) {
  catalog['solis'].models['s'].modelName = 'Série S (S26 / S50 / S90)';
}
// Agrimont: AGRI -> Série AGRI
if (catalog['agrimont']?.models?.['agri']) {
  catalog['agrimont'].models['agri'].modelName = 'Série AGRI';
}
// Massey Ferguson: MF -> Série MF
if (catalog['massey-ferguson']?.models?.['mf']) {
  catalog['massey-ferguson'].models['mf'].modelName = 'Série MF';
}
// Selva: E -> Série E
if (catalog['selva']?.models?.['e']) {
  catalog['selva'].models['e'].modelName = 'Série E';
}
// Tohatsu: MFS -> Série MFS
if (catalog['tohatsu']?.models?.['mfs']) {
  catalog['tohatsu'].models['mfs'].modelName = 'Série MFS (4-Temps)';
}
// Zimota: ZM -> Série ZM
if (catalog['zimota']?.models?.['zm']) {
  catalog['zimota'].models['zm'].modelName = 'Série ZM';
}
// Senke: SK -> Série SK
if (catalog['senke']?.models?.['sk']) {
  catalog['senke'].models['sk'].modelName = 'Série SK';
}
// SLC: SLC -> Série SLC
if (catalog['slc']?.models?.['slc']) {
  catalog['slc'].models['slc'].modelName = 'Série SLC';
}
// SMT: SMT -> Série SMT
if (catalog['smt']?.models?.['smt']) {
  catalog['smt'].models['smt'].modelName = 'Série SMT';
}

// Now enhance generations with years for BMW and Mercedes so chronological sort works!
const GEN_YEARS = {
  // BMW
  'e87': { yearFrom: 2004, yearTo: 2011, name: 'Série 1 - E87, E81, E82, E88 (2004 - 2011)' },
  'f20': { yearFrom: 2011, yearTo: 2019, name: 'Série 1 - F20, F21 (2011 - 2019)' },
  'f40': { yearFrom: 2019, yearTo: 9999, name: 'Série 1 - F40 (2019 - Présent)' },
  'f22': { yearFrom: 2014, yearTo: 2021, name: 'Série 2 - F22 Coupé / F23 Cabriolet (2014 - 2021)' },
  'active-tourer-f45': { yearFrom: 2014, yearTo: 2021, name: 'Série 2 - Active Tourer F45 (2014 - 2021)' },
  'f45': { yearFrom: 2014, yearTo: 2021, name: 'Série 2 - Active Tourer F45 (2014 - 2021)' },
  'gran-tourer-f46': { yearFrom: 2015, yearTo: 2022, name: 'Série 2 - Gran Tourer F46 (2015 - 2022)' },
  'g42': { yearFrom: 2021, yearTo: 9999, name: 'Série 2 - G42 Coupé (2021 - Présent)' },
  'e46': { yearFrom: 1998, yearTo: 2005, name: 'Série 3 - E46 (1998 - 2005)' },
  'compact-e46': { yearFrom: 2001, yearTo: 2005, name: 'Série 3 - E46 Compact (2001 - 2005)' },
  'coupe-e46': { yearFrom: 1999, yearTo: 2006, name: 'Série 3 - E46 Coupé/Cabrio (1999 - 2006)' },
  'e90': { yearFrom: 2005, yearTo: 2012, name: 'Série 3 - E90, E91, E92, E93 (2005 - 2012)' },
  'f30': { yearFrom: 2012, yearTo: 2019, name: 'Série 3 - F30, F31, F34 GT (2012 - 2019)' },
  'f30-f80': { yearFrom: 2012, yearTo: 2019, name: 'Série 3 - F30, F31, F34 GT (2012 - 2019)' },
  'g20-g80-g28': { yearFrom: 2019, yearTo: 9999, name: 'Série 3 - G20, G21 (2019 - Présent)' },
  'e60': { yearFrom: 2003, yearTo: 2010, name: 'Série 5 - E60 / E61 Touring (2003 - 2010)' },
  'e61': { yearFrom: 2004, yearTo: 2010, name: 'Série 5 - E61 Touring (2004 - 2010)' },
  'f10': { yearFrom: 2010, yearTo: 2017, name: 'Série 5 - F10 / F11 Touring (2010 - 2017)' },
  'f11': { yearFrom: 2010, yearTo: 2017, name: 'Série 5 - F11 Touring (2010 - 2017)' },
  'g30-g31': { yearFrom: 2017, yearTo: 2023, name: 'Série 5 - G30 / G31 Touring (2017 - 2023)' },
  'e84': { yearFrom: 2009, yearTo: 2015, name: 'X1 - E84 (2009 - 2015)' },
  'f48': { yearFrom: 2015, yearTo: 2022, name: 'X1 - F48 (2015 - 2022)' },
  'e83': { yearFrom: 2003, yearTo: 2010, name: 'X3 - E83 (2003 - 2010)' },
  'f25': { yearFrom: 2010, yearTo: 2017, name: 'X3 - F25 (2010 - 2017)' },
  'g01': { yearFrom: 2017, yearTo: 2024, name: 'X3 - G01 (2017 - 2024)' },
  'e53': { yearFrom: 1999, yearTo: 2006, name: 'X5 - E53 (1999 - 2006)' },
  'e70': { yearFrom: 2006, yearTo: 2013, name: 'X5 - E70 (2006 - 2013)' },
  'f15': { yearFrom: 2013, yearTo: 2018, name: 'X5 - F15 (2013 - 2018)' },
  'g05': { yearFrom: 2018, yearTo: 9999, name: 'X5 - G05 (2018 - Présent)' },
  // Mercedes-Benz
  'w168': { yearFrom: 1997, yearTo: 2004, name: 'Classe A - W168 (1997 - 2004)' },
  'w169': { yearFrom: 2004, yearTo: 2012, name: 'Classe A - W169 (2004 - 2012)' },
  'w176': { yearFrom: 2012, yearTo: 2018, name: 'Classe A - W176 (2012 - 2018)' },
  'w177': { yearFrom: 2018, yearTo: 9999, name: 'Classe A - W177 (2018 - Présent)' },
  'w202': { yearFrom: 1993, yearTo: 2000, name: 'Classe C - W202 (1993 - 2000)' },
  'w203': { yearFrom: 2000, yearTo: 2007, name: 'Classe C - W203 (2000 - 2007)' },
  'w204': { yearFrom: 2007, yearTo: 2014, name: 'Classe C - W204 (2007 - 2014)' },
  'w205': { yearFrom: 2014, yearTo: 2021, name: 'Classe C - W205 (2014 - 2021)' },
  'w210': { yearFrom: 1995, yearTo: 2002, name: 'Classe E - W210 (1995 - 2002)' },
  'w211': { yearFrom: 2002, yearTo: 2009, name: 'Classe E - W211 (2002 - 2009)' },
  'w212': { yearFrom: 2009, yearTo: 2016, name: 'Classe E - W212 (2009 - 2016)' },
  'w213': { yearFrom: 2016, yearTo: 2023, name: 'Classe E - W213 (2016 - 2023)' },
};

for (const [makeKey, makeVal] of Object.entries(catalog)) {
  for (const [modelKey, modelVal] of Object.entries(makeVal.models || {})) {
    for (const [genKey, genVal] of Object.entries(modelVal.generations || {})) {
      const match = GEN_YEARS[genKey];
      if (match) {
        if (!genVal.yearFrom || genVal.yearFrom > match.yearFrom) genVal.yearFrom = match.yearFrom;
        if (!genVal.yearTo || genVal.yearTo < match.yearTo) genVal.yearTo = match.yearTo;
        if (match.name) genVal.genName = match.name;
      }
      // Clean up genName if it is just a slug or has no year
      if (genVal.yearFrom && !genVal.genName.includes(String(genVal.yearFrom))) {
        const toStr = genVal.yearTo && genVal.yearTo !== 9999 ? String(genVal.yearTo) : 'Présent';
        genVal.genName = `${genVal.genName} (${genVal.yearFrom} - ${toStr})`;
      }
    }
  }
}

// Ensure every make has categories array
for (const [makeKey, makeVal] of Object.entries(catalog)) {
  if (!makeVal.categories || makeVal.categories.length === 0) {
    makeVal.categories = ['automobile'];
  }
}

// Write cleaned catalog back
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');

const backupPath = path.resolve(__dirname, '../oil-finder-full-dataset/clean-catalog-hierarchy.json');
fs.writeFileSync(backupPath, JSON.stringify(catalog, null, 2), 'utf8');

console.log('Successfully wrote deduplicated catalog hierarchy to both locations!');
