/**
 * Oil Homologation & Manufacturer Approval Token Normalizer
 *
 * Supports comprehensive auto-detection and synonym generation for:
 * - Volkswagen / VAG: VW 504.00, 504 00, 507.00, 502.00, 505.01, 508.00, 509.00
 * - Mercedes-Benz: MB 229.51, 229.52, 229.5, 229.31, 229.3, 226.5
 * - BMW: BMW LL-04, Longlife-04, LL-01, Longlife-01, LL-12 FE
 * - Renault: RN0700, RN0710, RN0720, RN17
 * - PSA Peugeot Citroën: PSA B71 2290, B71 2312, B71 2297
 * - Porsche: Porsche C30, A40, C20
 * - Ford: WSS-M2C913-D, 913-D, 948-B, WSS-M2C948-B
 * - GM / Opel: dexos2, dexos 2, dexos1
 * - Fiat: 9.55535-S2, 9.55535
 * - Standards: ACEA (C3, C2, A3/B4), API (SP, SN, CF), JASO (MA2, FD)
 */

export interface HomologationExtractionResult {
  tokens: string[];
  remainingQuery: string;
}

export function extractHomologationTokens(rawQuery: string): HomologationExtractionResult {
  const raw = (rawQuery || '').trim();
  if (!raw) return { tokens: [], remainingQuery: '' };

  const tokens: string[] = [];
  let remaining = raw;

  // 1. Volkswagen / Audi / Seat / Skoda (e.g., 504.00, 504 00, 507.00, 502.00, 505.01, 508.00, 509.00)
  const vwMatches = [...raw.matchAll(/(?:vw\s*)?(50\d)[\s.]?(\d{2})/gi)];
  for (const vwMatch of vwMatches) {
    const code1 = vwMatch[1];
    const code2 = vwMatch[2];
    tokens.push(
      `${code1}.${code2}`,
      `${code1} ${code2}`,
      `${code1}${code2}`,
      `VW ${code1}.${code2}`,
      `VW ${code1} ${code2}`,
    );
    if (code1 === '504' || code1 === '507') {
      tokens.push('504.00/507.00', '504 00/507 00', '504 00 / 507 00', '504.00 / 507.00');
    } else if (code1 === '502' || code1 === '505') {
      tokens.push('502.00/505.00', '502 00/505 00', '502 00 / 505 00', '502.00 / 505.00');
    } else if (code1 === '508' || code1 === '509') {
      tokens.push('508.00/509.00', '508 00/509 00', '508 00 / 509 00', '508.00 / 509.00');
    }
    remaining = remaining.replace(vwMatch[0], ' ');
  }

  // 2. Mercedes-Benz (e.g., 229.51, 229.52, 229.5, 229.3, 226.5)
  const mbMatches = [...raw.matchAll(/(?:mb\s*)?(22\d)[\s.]?(\d{1,2})/gi)];
  for (const mbMatch of mbMatches) {
    const code1 = mbMatch[1];
    const code2 = mbMatch[2];
    tokens.push(
      `${code1}.${code2}`,
      `${code1} ${code2}`,
      `MB ${code1}.${code2}`,
      `MB ${code1} ${code2}`,
      `MB${code1}.${code2}`,
    );
    if (code2 === '51' || code2 === '52') {
      tokens.push('229.51/229.52', '229.51 / 229.52');
    }
    remaining = remaining.replace(mbMatch[0], ' ');
  }

  // 3. BMW (e.g., LL-04, LL04, Longlife-04, Longlife 04, LL-01)
  const bmwMatches = [...raw.matchAll(/(?:bmw\s*)?(?:longlife|ll)[\s-]?(\d{2}(?:\s*fe)?)/gi)];
  for (const bmwMatch of bmwMatches) {
    const code = bmwMatch[1].trim();
    tokens.push(
      `Longlife-${code}`,
      `Longlife ${code}`,
      `BMW Longlife-${code}`,
      `BMW Longlife ${code}`,
      `LL-${code}`,
      `LL${code}`,
      `LL ${code}`,
      `BMW LL-${code}`,
    );
    remaining = remaining.replace(bmwMatch[0], ' ');
  }

  // 4. Renault (e.g., RN0700, RN 0700, RN0710, RN0720, RN17)
  const rnMatches = [...raw.matchAll(/(?:renault\s*)?rn[\s-]?(\d{2,4})/gi)];
  for (const rnMatch of rnMatches) {
    const code = rnMatch[1];
    tokens.push(
      `RN${code}`,
      `RN ${code}`,
      `RN-${code}`,
      `Renault RN${code}`,
      `Renault RN ${code}`,
    );
    remaining = remaining.replace(rnMatch[0], ' ');
  }

  // 5. PSA Peugeot Citroën (e.g., B71 2290, B71 2312, B71 2297)
  const psaMatches = [...raw.matchAll(/(?:psa\s*)?b71[\s-]?(\d{4})/gi)];
  for (const psaMatch of psaMatches) {
    const code = psaMatch[1];
    tokens.push(
      `B71 ${code}`,
      `B71${code}`,
      `B71-${code}`,
      `PSA B71 ${code}`,
      `PSA B71${code}`,
    );
    remaining = remaining.replace(psaMatch[0], ' ');
  }

  // 6. Porsche (e.g., C30, A40, C20)
  const porscheMatches = [...raw.matchAll(/(?:porsche\s*)?(c30|a40|c20|c40)\b/gi)];
  for (const porscheMatch of porscheMatches) {
    const code = porscheMatch[1].toUpperCase();
    tokens.push(code, `Porsche ${code}`);
    remaining = remaining.replace(porscheMatch[0], ' ');
  }

  // 7. Ford (e.g., 913-D, 948-B, 950-A)
  const fordMatches = [...raw.matchAll(/(?:wss[\s-]m2c)?(9\d{2})[\s-]?([a-z])/gi)];
  for (const fordMatch of fordMatches) {
    const code = `${fordMatch[1]}-${fordMatch[2].toUpperCase()}`;
    tokens.push(code, `WSS-M2C${code}`, `M2C${code}`, `Ford WSS-M2C${code}`);
    remaining = remaining.replace(fordMatch[0], ' ');
  }

  // 8. General Motors / Opel (e.g., dexos2, dexos 2, dexos1)
  const gmMatches = [...raw.matchAll(/dexos[\s-]?([12](?:\s*gen\s*[23])?)/gi)];
  for (const gmMatch of gmMatches) {
    const code = gmMatch[1].trim();
    tokens.push(`dexos${code}`, `dexos ${code}`, `GM dexos${code}`, `GM dexos ${code}`);
    remaining = remaining.replace(gmMatch[0], ' ');
  }

  // 9. Fiat (e.g., 9.55535-S2, 9.55535)
  const fiatMatches = [...raw.matchAll(/9\.?55535(?:[\s-]?([a-z0-9]+))?/gi)];
  for (const fiatMatch of fiatMatches) {
    tokens.push('9.55535');
    if (fiatMatch[1]) {
      const code = fiatMatch[1].toUpperCase();
      tokens.push(`9.55535-${code}`, `Fiat 9.55535-${code}`);
    }
    remaining = remaining.replace(fiatMatch[0], ' ');
  }

  // 10. ACEA Standards (e.g., C3, C2, A3/B4)
  const aceaMatches = [...raw.matchAll(/(?:acea\s+)?\b(c[1-5]|a[1-5]\/b[1-5])\b/gi)];
  for (const aceaMatch of aceaMatches) {
    const code = aceaMatch[1].toUpperCase();
    tokens.push(`ACEA ${code}`, code);
    remaining = remaining.replace(aceaMatch[0], ' ');
  }

  // 11. API Standards (e.g., API SP, API SN)
  const apiMatches = [...raw.matchAll(/api\s+([a-z]{2}(?:\s*plus)?)/gi)];
  for (const apiMatch of apiMatches) {
    const code = apiMatch[1].toUpperCase();
    tokens.push(`API ${code}`, code);
    remaining = remaining.replace(apiMatch[0], ' ');
  }

  // 12. ILSAC Standards (e.g., ILSAC GF-6A, GF-6, GF-5)
  const ilsacMatches = [...raw.matchAll(/(?:ilsac\s+)?(gf[\s-]?[56][ab]?)\b/gi)];
  for (const ilsacMatch of ilsacMatches) {
    const code = ilsacMatch[1].toUpperCase().replace(/\s+/, '-');
    tokens.push(`ILSAC ${code}`, code);
    remaining = remaining.replace(ilsacMatch[0], ' ');
  }

  // 13. Manufacturer Name Approval Tokens (e.g. Toyota, Lexus, Hyundai, Kia...)
  const mfrMatches = [...raw.matchAll(/\b(toyota|lexus|honda|hyundai|kia|nissan|mazda|subaru|suzuki|daihatsu|isuzu)\b/gi)];
  for (const mfrMatch of mfrMatches) {
    const make = mfrMatch[1].charAt(0).toUpperCase() + mfrMatch[1].slice(1).toLowerCase();
    tokens.push(make);
    remaining = remaining.replace(mfrMatch[0], ' ');
  }

  return {
    tokens: [...new Set(tokens)],
    remainingQuery: remaining.replace(/\s+/g, ' ').trim(),
  };
}
