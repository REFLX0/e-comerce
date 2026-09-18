/**
 * Read a list out of the message catalogue, whatever shape it was saved in.
 *
 * Several list-valued messages (Cgv.articles, Faq.sections and their items,
 * Shipping.features/zones, Returns.conditions/steps, About.values/stats) are
 * stored as objects keyed "0", "1", "2"... rather than JSON arrays - the shape
 * some translation tooling writes. Calling .map() on `t.raw()` of those threw,
 * and the CGV, FAQ, delivery, returns and about pages all rendered the 500
 * error screen instead of their content.
 */
export function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => (value as Record<string, T>)[key] as T)
  }
  return []
}
