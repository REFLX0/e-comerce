/**
 * Single source of truth for the public site identity.
 *
 * Legal copy (CGV, mentions légales) used to name the domain literally in every
 * locale file, so it silently went stale the moment the site moved. The message
 * catalogues now carry a `{siteDomain}` token that is filled from the same env
 * var the canonical URLs and sitemap use.
 */
const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const SITE_URL = RAW_SITE_URL.replace(/\/$/, '')

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'specpart'

export const SITE_DOMAIN = (() => {
  try {
    return new URL(SITE_URL).host
  } catch {
    return 'localhost:3000'
  }
})()

/** Fill `{siteDomain}` in strings read with `t.raw()`, which does not interpolate. */
export function withSiteDomain(text: string): string {
  return text.replaceAll('{siteDomain}', SITE_DOMAIN)
}

/**
 * Public contact address. Kept here rather than inline in the footer so a
 * domain change is one edit, not a hunt through components.
 */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || `contact@${SITE_DOMAIN}`
