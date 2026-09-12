/**
 * Collapses duplicate engines within a catalogue generation.
 *
 * Two kinds accumulated:
 *
 *  1. The same engine written differently by the two stores — the catalogue's
 *     "D16DTF" next to a verified entry's "D16DTF (1.6 e-XDi)". The add script
 *     compared exact strings, so both were kept and the customer was offered
 *     the same engine twice.
 *
 *  2. Descriptive placeholders from the TecDoc import — "1.5 (JLy-4G15B)",
 *     "2.0 Diesel", "1.6 Essence" — sitting alongside a real engine code of the
 *     same displacement and fuel in the same generation. The placeholder tells
 *     the customer nothing the real code does not.
 *
 * The surviving entry is the one with the more specific engine code, and it
 * inherits whichever of the two specs is more completely filled in, so nothing
 * researched is lost to a placeholder that happened to be listed first.
 *
 * Runs read-only unless --apply is passed.
 */
const fs = require('fs');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/catalog-dedupe-snapshot-${Date.now()}.json`;

const baseCode = (c) => String(c || '').replace(/\s*\(.*$/, '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const hasTrim = (c) => /\(.*\)/.test(String(c || ''));

/** "1.5", "2.0 Diesel", "1.6 Essence", "1.5 (JLy-4G15B)" — a displacement, not a code. */
const isPlaceholder = (c) => /^\s*\d[.,]\d\s*(\(|$|l\b|litre|essence|diesel|hybrid|tdi|hdi|dci|t\b|turbo)/i.test(String(c || ''));

/** How much a spec actually says, for choosing which of two to keep. */
const specScore = (s) =>
  !s ? -1 : [s.viscosity, s.oemApproval, s.aceaStandard, s.apiStandard, s.capacityLiters, s.changeIntervalKm]
    .filter((v) => v !== null && v !== undefined && v !== '').length;

function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const removed = [];
  let generations = 0;

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        const engines = gen.engines || [];
        if (engines.length < 2) continue;
        generations++;

        const keep = [];
        for (const eng of engines) {
          const code = eng.engineCode || '';
          const placeholder = isPlaceholder(code);

          const twin = keep.find((k) => {
            // Same base code counts as a duplicate only when one side carries no
            // parenthetical at all. Where both do, the parenthetical is what
            // distinguishes them - Alpina's "M30 B34 (34T36)" and
            // "M30 B34 (34C20)" are two different engines on one block - and
            // collapsing them would lose a real variant.
            const bothQualified = hasTrim(k.engineCode) && hasTrim(code);
            if (
              !bothQualified &&
              baseCode(k.engineCode) &&
              baseCode(k.engineCode) === baseCode(code) &&
              (eng.displacementCc == null || k.displacementCc == null ||
                eng.displacementCc === k.displacementCc)
            ) {
              return true;
            }
            // A placeholder is a duplicate of any real code with the same
            // displacement and fuel in this generation, and vice versa.
            const kPlaceholder = isPlaceholder(k.engineCode);
            if (placeholder === kPlaceholder) return false;
            return (
              eng.displacementCc != null &&
              eng.displacementCc === k.displacementCc &&
              (eng.fuelType || null) === (k.fuelType || null)
            );
          });

          if (!twin) { keep.push(eng); continue; }

          // Decide which of the pair survives, then let it take the better spec.
          const twinIsPlaceholder = isPlaceholder(twin.engineCode);
          const preferNew = twinIsPlaceholder && !placeholder;
          const winner = preferNew ? eng : twin;
          const loser = preferNew ? twin : eng;
          if (specScore(loser.oilSpec) > specScore(winner.oilSpec)) winner.oilSpec = loser.oilSpec;
          if (winner.powerHp == null && loser.powerHp != null) winner.powerHp = loser.powerHp;
          if (preferNew) keep[keep.indexOf(twin)] = eng;

          removed.push({
            make: mk.makeName, model: md.modelName, generation: gen.genName,
            dropped: loser.engineCode, kept: winner.engineCode,
          });
        }

        if (keep.length !== engines.length && APPLY) gen.engines = keep;
      }
    }
  }

  console.log(`generations examined: ${generations}`);
  console.log(`duplicate engines ${APPLY ? 'removed' : 'to remove'}: ${removed.length}`);
  const byMake = new Map();
  for (const r of removed) byMake.set(r.make, (byMake.get(r.make) || 0) + 1);
  [...byMake.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)
    .forEach(([k, v]) => console.log(`   ${String(v).padStart(4)}  ${k}`));
  console.log('\n--- sample ---');
  removed.slice(0, 15).forEach((r) => console.log(`   ${r.make} ${r.model}: dropped ${JSON.stringify(r.dropped)} (kept ${JSON.stringify(r.kept)})`));

  if (!APPLY) { console.log('\nNothing written. Re-run with --apply.'); return; }
  fs.writeFileSync(SNAPSHOT, JSON.stringify(removed, null, 2));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}`);
  console.log(`Catalogue file rewritten: ${CATALOG}`);
}

main();
