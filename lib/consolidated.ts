// Health pages that were merged into static guides on the main site.
// nginx on www.fishcareai.com 301s these URLs before they reach this app; the
// helpers below keep the app from linking to them or listing them in sitemaps,
// and the page routes redirect too in case a request arrives directly.
//
// 2026-10-08: clownfish — 150 symptom pages + 5 species health hubs merged into
// /aquarium-fish-diseases/<species>-clownfish-diseases/ (true percula → percula).

const CLOWNFISH_SPECIES = '(?:true-)?(percula|ocellaris|tomato|maroon)-clownfish'
const CLOWNFISH_FISH = new RegExp(`^${CLOWNFISH_SPECIES}$`)
const CLOWNFISH_PAGE = new RegExp(`^${CLOWNFISH_SPECIES}-([a-z-]+)$`)

// Symptom slug → section anchor on the merged species page.
const CLOWNFISH_SECTION: Record<string, string> = {
  'gasping': 'breathing', 'rapid-breathing': 'breathing', 'coughing': 'breathing',
  'white-spots': 'skin', 'black-spots': 'skin', 'spots-on-fins': 'skin', 'fuzzy-growth': 'skin',
  'mucus-coating': 'skin', 'missing-scales': 'skin', 'red-streaks': 'skin',
  'not-eating': 'appetite', 'sunken-belly': 'appetite', 'bloated': 'appetite',
  'swimming-sideways': 'swimming', 'floating': 'swimming', 'sinking': 'swimming',
  'curled-body': 'swimming', 'darting': 'swimming', 'jumping': 'swimming',
  'bulging-eyes': 'eyes', 'cloudy-eyes': 'eyes',
  'fin-rot': 'fins', 'torn-fins': 'fins', 'clamped-fins': 'fins',
  'hiding': 'behavior', 'lethargic': 'behavior', 'aggressive': 'behavior', 'rubbing': 'behavior',
  'losing-color': 'color', 'pale-color': 'color',
}

const clownfishGuide = (species: string) => `/aquarium-fish-diseases/${species}-clownfish-diseases/`

// 2026-10-30: single symptom pages merged into main-site cluster guides (nginx 301s them).
const MERGED_HEALTH: Record<string, string> = {
  'goldfish-pale-color': '/guides/goldfish-care/spots-colour/',
  'oscar-swimming-sideways': '/guides/oscar-fish-care/swimming-problems/',
}

// Care guides nginx 301s to a main-site /guides/ page.
const MERGED_CARE_GUIDES: Record<string, string> = {
  'betta-fish': '/guides/betta-fish-care/',
}

/** Main-site URL that replaced /species/<slug>/care-guide, or null if the guide still lives here. */
export const consolidatedCareGuideUrl = (slug: string): string | null => MERGED_CARE_GUIDES[slug] ?? null
export const careGuideHref = (slug: string) => consolidatedCareGuideUrl(slug) ?? `/species/${slug}/care-guide`

/** New URL for a merged /fish-health/<slug> page, or null if it still lives here. */
export function consolidatedHealthUrl(slug: string): string | null {
  if (MERGED_HEALTH[slug]) return MERGED_HEALTH[slug]
  const m = CLOWNFISH_PAGE.exec(slug)
  if (!m) return null
  const section = CLOWNFISH_SECTION[m[2]]
  return clownfishGuide(m[1]) + (section ? `#${section}` : '')
}

/** New URL for a merged /fish-health/fish/<slug> listing, or null if it still lives here. */
export function consolidatedFishUrl(fishSlug: string): string | null {
  const m = CLOWNFISH_FISH.exec(fishSlug)
  return m ? clownfishGuide(m[1]) : null
}

export const healthHref = (slug: string) => consolidatedHealthUrl(slug) ?? `/fish-health/${slug}`
export const fishHealthHref = (fishSlug: string) => consolidatedFishUrl(fishSlug) ?? `/fish-health/fish/${fishSlug}`
