const MAX_TITLE_LENGTH = 60

/**
 * Matches a trailing brand suffix in any of the spellings that have made it
 * into the database ("| FishCare AI", "- FishCareAI", "– Fishcare Ai", ...).
 */
const BRAND_SUFFIX = /\s*[|\-–—:]\s*fishcare\s*ai\s*$/i

function clean(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

/**
 * The root layout appends " | FishCare AI" to every non-absolute title, so a
 * page title must never carry its own brand suffix or it is rendered twice.
 * Editor-supplied meta_title values often do, sometimes more than once.
 */
export function stripBrand(title: string): string {
  let out = clean(title)
  while (BRAND_SUFFIX.test(out)) out = out.replace(BRAND_SUFFIX, '')
  return out.trim()
}

/**
 * Picks the richest title variant that still fits the SERP limit, keeping the
 * common name — the term people actually search — at the front.
 */
export function buildSpeciesTitle(commonName: string, scientificName?: string | null): string {
  const common = clean(commonName)
  const scientific = scientificName ? clean(scientificName) : ''
  const variants = [
    scientific ? `${common} (${scientific}) — Species Profile` : '',
    `${common} — Species Profile & Care Facts`,
    `${common} — Species Profile`,
    common,
  ].filter(Boolean)

  return variants.find((variant) => variant.length <= MAX_TITLE_LENGTH) ?? common
}

/**
 * Uses an editor's meta_title when there is one, but never lets a stored brand
 * suffix or an over-long value through.
 */
export function resolveSpeciesTitle(
  metaTitle: string | null | undefined,
  commonName: string,
  scientificName?: string | null,
): string {
  const stored = metaTitle ? stripBrand(metaTitle) : ''
  if (stored && stored.length <= MAX_TITLE_LENGTH) return stored
  return buildSpeciesTitle(commonName, scientificName)
}
