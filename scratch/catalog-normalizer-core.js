const fs = require('fs');
const path = require('path');

// 1. Load authentic datasets from oil-finder-full-dataset/
const autoDir = 'oil-finder-full-dataset';
const autoFiles = fs.readdirSync(autoDir).filter(f => f.startsWith('automobile-') && f.endsWith('.json') && !f.includes('conflicts'));

const authenticSpecs = []; // list of authentic entries

for (const file of autoFiles) {
  const p = path.join(autoDir, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const item of data) {
    if (item.oilViscosity) {
      authenticSpecs.push({
        make: (item.make || '').toLowerCase().trim(),
        model: (item.model || '').toLowerCase().trim(),
        generation: (item.generation || '').toLowerCase().trim(),
        engineCode: (item.engineCode || '').trim(),
        fuelType: (item.fuelType || '').toLowerCase().trim(),
        displacementCc: item.displacementCc || null,
        powerHp: item.powerHp || null,
        powerKw: item.powerKw || null,
        yearFrom: item.yearFrom || null,
        yearTo: item.yearTo || null,
        oilSpec: {
          viscosity: item.oilViscosity,
          oemApproval: item.oilSpecOEM || null,
          apiStandard: item.oilSpecAPI || null,
          aceaStandard: item.oilSpecACEA || null,
          capacityLiters: item.oilCapacityLiters || null,
          changeIntervalKm: item.oilChangeIntervalKm || null,
        },
        source: item.source || null,
        confidence: item.confidence || 'high'
      });
    }
  }
}

console.log(`Loaded ${authenticSpecs.length} authentic oil specifications from ${autoFiles.length} automobile files.`);

// 2. DPF / Low SAPS Markers
const LOW_SAPS_MARKERS = [
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
  'RN0720', 'RN17', 'DS1',
  'B71 2312', 'B71 2290', 'B71 2010',
  '504 00', '507 00', '504.00', '507.00', '508 00', '509 00', '508.00', '509.00',
  'dexos2', 'DEXOS2', 'DEXOS1',
  '229.31', '229.51', '229.52',
  '9.55535-S1', '9.55535-S2', '9.55535-GS1', '9.55535-DS1',
  'WSS-M2C913-D', 'WSS-M2C950-A',
  'BMW LL-04', 'LL-04',
  'C30'
];

function isLowSaps(spec) {
  if (!spec) return false;
  const approvals = `${spec.oemApproval || ''} ${spec.aceaStandard || ''}`.toUpperCase();
  return LOW_SAPS_MARKERS.some(m => approvals.includes(m.toUpperCase()));
}

// Check if two engine records are physically the same engine within the SAME generation
function isSamePhysicalEngine(e1, e2) {
  // Exact code match
  if (e1.engineCode && e2.engineCode && e1.engineCode.toLowerCase() === e2.engineCode.toLowerCase()) {
    return true;
  }
  // Fuel type must match
  if (e1.fuelType && e2.fuelType && e1.fuelType.toLowerCase() !== e2.fuelType.toLowerCase()) {
    return false;
  }
  // Displacement check (+/- 15 cc)
  if (e1.displacementCc && e2.displacementCc) {
    if (Math.abs(e1.displacementCc - e2.displacementCc) > 15) return false;
  } else {
    return false;
  }
  // Horsepower check (+/- 3 hp)
  if (e1.powerHp && e2.powerHp) {
    if (Math.abs(e1.powerHp - e2.powerHp) > 3) return false;
  } else {
    return false;
  }

  // DPF / Low-SAPS Parity Check:
  // If both carry oil specs and one is Low-SAPS (DPF Euro 5/6) and the other is High-SAPS (pre-DPF Euro 3/4), NEVER merge!
  if (e1.oilSpec && e2.oilSpec) {
    const e1Low = isLowSaps(e1.oilSpec);
    const e2Low = isLowSaps(e2.oilSpec);
    if (e1Low !== e2Low) {
      return false; // protect DPF / SAPS boundary
    }
  }

  return true;
}

function mergeEngineRecords(existing, incoming) {
  const isMarketing = (s) => /^\d+\.\d+/.test(s);

  let marketingLabel = null;
  let factoryCode = null;

  [existing.engineCode, incoming.engineCode].forEach(c => {
    if (!c) return;
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

  let combinedName = existing.engineCode || incoming.engineCode;
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
    oilSpec: primary.oilSpec || secondary.oilSpec || null,
    isTemplatedSeed: primary.isTemplatedSeed && secondary.isTemplatedSeed,
    verificationNote: primary.verificationNote || secondary.verificationNote
  };
}

// 3. Known cross-generational template phantoms from build-popular-vehicles-sql.js
const TEMPLATED_PHANTOM_PATTERNS = [
  // Volkswagen Golf
  { make: 'volkswagen', model: 'golf', genPattern: /golf-vii|golf-viii/, engineCode: '1.9 TDI', reason: '1.9 TDI discontinued with Golf V (replaced by 1.6 TDI in Golf VI/VII)' },
  { make: 'volkswagen', model: 'golf', genPattern: /golf-viii/, engineCode: '1.6 TDI', reason: '1.6 TDI discontinued on Golf VIII in favor of 2.0 TDI Evo' },
  { make: 'volkswagen', model: 'golf', genPattern: /golf-iv|golf-v/, engineCode: '1.2 TSI', reason: '1.2 TSI (EA111) launched on Golf VI in 2009, never on Golf IV or V' },
  { make: 'volkswagen', model: 'golf', genPattern: /golf-iv/, engineCode: '1.4 TSI', reason: '1.4 TSI twincharged/turbo launched on Golf V, never on Golf IV' },
  // Peugeot 206
  { make: 'peugeot', model: '206', genPattern: /206\+/, engineCode: '2.0', reason: '2.0 S16/RC never offered on 206+' },
  { make: 'peugeot', model: '206', genPattern: /206\+/, engineCode: '1.6 16V', reason: '1.6 16V 110hp TU5JP4 not offered on 206+ in Europe/Tunisia (only 1.1i, 1.4i, 1.4 HDi)' },
  // Renault Clio
  { make: 'renault', model: 'clio', genPattern: /clio-ii/, engineCode: '0.9 TCe', reason: '0.9 TCe (H4Bt) launched in 2012 on Clio IV, never on Clio II' },
  { make: 'renault', model: 'clio', genPattern: /clio-iii/, engineCode: '0.9 TCe', reason: '0.9 TCe launched on Clio IV, never on Clio III' },
  // Renault Megane
  { make: 'renault', model: 'megane', genPattern: /megane-ii/, engineCode: '1.2 TCe', reason: '1.2 TCe (H5Ft) launched on Megane III in 2012, never on Megane II' },
  // Citroen C3
  { make: 'citroen', model: 'c3', genPattern: /c3-i/, engineCode: '1.2 PureTech', reason: 'PureTech EB engines launched in 2012 on C3 II, never on C3 I' },
  // Ford Focus
  { make: 'ford', model: 'focus', genPattern: /focus-i|focus-ii/, engineCode: '1.0 EcoBoost', reason: '1.0 EcoBoost launched in 2012 on Focus III, never on Focus I or II' },
  // Ford Fiesta
  { make: 'ford', model: 'fiesta', genPattern: /fiesta-iv|fiesta-v/, engineCode: '1.0 EcoBoost', reason: '1.0 EcoBoost launched in late 2012 on Fiesta VI facelift, never on IV or V' },
  // Dacia (already defined)
  { make: 'dacia', model: 'duster', genPattern: /duster-i/, engineCode: '1.3 TCe', reason: '1.3 TCe launched in 2019 on Duster II, never on Duster I' },
  { make: 'dacia', model: 'duster', genPattern: /duster-i/, engineCode: '1.5 Blue dCi 115', reason: 'Blue dCi introduced in 2018 on Duster II, never on Duster I' },
  { make: 'dacia', model: 'sandero', genPattern: /sandero-i/, engineCode: '0.9 TCe', reason: '0.9 TCe launched in late 2012 on Sandero II, never on Sandero I' },
  { make: 'dacia', model: 'sandero', genPattern: /sandero-ii/, engineCode: '1.4 MPI', reason: '1.4 MPI discontinued before Sandero II launch, templated from Sandero I' },
  { make: 'dacia', model: 'logan', genPattern: /logan-ii/, engineCode: '1.4 (LSA0, LSA5...)', reason: '1.4 MPI discontinued before Logan II, templated from Logan I' },
  { make: 'dacia', model: 'logan', genPattern: /logan-ii/, engineCode: '1.6 MPI', reason: '1.6 MPI Euro 4 discontinued before Logan II, templated from Logan I' },
  { make: 'dacia', model: 'logan', genPattern: /logan-ii/, engineCode: '1.5 dCi (LS0J, LS0Y)', reason: '68hp dCi Euro 4 discontinued before Logan II, templated from Logan I' }
];

function tagTemplatedPhantoms(makeSlug, modelSlug, genSlug, engines) {
  return engines.map(e => {
    // Check if engine code is empty
    if (!e.engineCode || e.engineCode.trim() === '') {
      return {
        ...e,
        isTemplatedSeed: true,
        verificationNote: 'Empty engine code from seed template'
      };
    }
    const phantom = TEMPLATED_PHANTOM_PATTERNS.find(p => 
      p.make === makeSlug && p.model === modelSlug && p.genPattern.test(genSlug) && e.engineCode.startsWith(p.engineCode)
    );
    if (phantom) {
      return {
        ...e,
        isTemplatedSeed: true,
        verificationNote: phantom.reason
      };
    }
    return e;
  });
}

// Find authentic spec match if available
function enrichWithAuthenticSpec(makeSlug, modelSlug, genName, engine) {
  if (engine.oilSpec && engine.oilSpec.viscosity) return engine;

  const match = authenticSpecs.find(a => {
    if (a.make !== makeSlug) return false;
    if (!a.model.includes(modelSlug) && !modelSlug.includes(a.model)) return false;
    if (engine.fuelType && a.fuelType && engine.fuelType !== a.fuelType) return false;
    if (engine.displacementCc && a.displacementCc && Math.abs(engine.displacementCc - a.displacementCc) <= 15) {
      if (engine.powerHp && a.powerHp && Math.abs(engine.powerHp - a.powerHp) <= 3) {
        return true;
      }
    }
    if (engine.engineCode && a.engineCode && (
      engine.engineCode.toLowerCase().includes(a.engineCode.toLowerCase()) ||
      a.engineCode.toLowerCase().includes(engine.engineCode.toLowerCase())
    )) {
      return true;
    }
    return false;
  });

  if (match) {
    return {
      ...engine,
      oilSpec: { ...match.oilSpec },
      displacementCc: engine.displacementCc || match.displacementCc,
      powerHp: engine.powerHp || match.powerHp,
      powerKw: engine.powerKw || match.powerKw,
      fuelType: engine.fuelType || match.fuelType
    };
  }

  return engine;
}

module.exports = {
  isSamePhysicalEngine,
  mergeEngineRecords,
  tagTemplatedPhantoms,
  enrichWithAuthenticSpec,
  isLowSaps,
  authenticSpecs
};

console.log('Normalization engine core loaded successfully.');
