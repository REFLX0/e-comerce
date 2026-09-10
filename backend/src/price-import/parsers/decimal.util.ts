/**
 * Converts a European-formatted price cell ("373,7812", "1.234,56", "45") to
 * a JS number. Returns null for an empty/missing cell — callers must never
 * coerce that to 0, since an empty cell means "no new price for this field",
 * not "set the price to zero".
 */
export function convertEuropeanDecimal(
  raw: string | null | undefined,
): number | null {
  if (raw == null) return null;
  const trimmed = raw.trim().replace(/\s/g, '');
  if (trimmed.length === 0) return null;

  let normalized: string;
  if (/^\d{1,3}(\.\d{3})+,\d+$/.test(trimmed)) {
    // Thousands dots + decimal comma, e.g. "1.234,56"
    normalized = trimmed.replace(/\./g, '').replace(',', '.');
  } else if (/^\d+,\d+$/.test(trimmed)) {
    // Plain decimal comma, e.g. "373,7812"
    normalized = trimmed.replace(',', '.');
  } else if (/^\d+(\.\d+)?$/.test(trimmed)) {
    // Already dot-decimal or a plain integer
    normalized = trimmed;
  } else {
    return null;
  }

  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}
