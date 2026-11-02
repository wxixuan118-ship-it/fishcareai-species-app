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

// 2026-10-30: 60 template symptom pages Google crawled and declined to index
// (GSC "Crawled - currently not indexed", see reports/gsc-crawled-not-indexed-2026-10-30.csv
// on the main site). Low-demand species x symptom combinations with no cluster
// page to merge into, so they are retired outright rather than redirected:
// lib/fish-health.ts stops serving and listing them and the routes 404.
export const RETIRED_HEALTH_SLUGS: readonly string[] = [
  'adolfo-cory-aggressive',
  'arc-eye-hawkfish-clamped-fins',
  'asian-stone-catfish-jumping',
  'betta-imbellis-pale-color',
  'black-ruby-barb-coughing',
  'black-skirt-tetra-floating',
  'blue-danio-losing-color',
  'bolivian-ram-red-streaks',
  'celestial-pearl-danio-white-spots',
  'checkerboard-cichlid-coughing',
  'checkered-barb-hiding',
  'chocolate-gourami-not-eating',
  'cockatoo-cichlid-fuzzy-growth',
  'denison-barb-curled-body',
  'electric-yellow-cichlid-clamped-fins',
  'elephant-nose-fish-swimming-sideways',
  'emerald-catfish-fuzzy-growth',
  'endlers-livebearer-bulging-eyes',
  'endlers-livebearer-sunken-belly',
  'fairy-cichlid-red-streaks',
  'fairy-cichlid-rubbing',
  'figure-eight-puffer-coughing',
  'figure-eight-puffer-mucus-coating',
  'flame-angelfish-fin-rot',
  'four-eyed-fish-red-streaks',
  'french-angelfish-bloated',
  'garnet-tetra-swimming-sideways',
  'german-blue-ram-curled-body',
  'horseface-loach-black-spots',
  'jewel-cichlid-rubbing',
  'julidochromis-spots-on-fins',
  'kissing-gourami-rubbing',
  'neon-rainbowfish-aggressive',
  'odessa-barb-white-spots',
  'ornate-bichir-bulging-eyes',
  'pacific-blue-tang-pale-color',
  'peacock-bass-not-eating',
  'peacock-cichlid-red-streaks',
  'peacock-spiny-eel-jumping',
  'porcupine-puffer-lethargic',
  'pristella-tetra-white-spots',
  'rainbow-shark-losing-color',
  'red-bellied-piranha-sinking',
  'red-empress-cichlid-hiding',
  'royal-gramma-losing-color',
  'rummy-nose-tetra-sunken-belly',
  'salt-and-pepper-cory-not-eating',
  'siamese-algae-eater-curled-body',
  'silver-arowana-sunken-belly',
  'silver-dollar-pale-color',
  'snowflake-moray-aggressive',
  'snowflake-moray-lethargic',
  'spanish-hogfish-spots-on-fins',
  'striped-headstander-fuzzy-growth',
  'striped-panchax-coughing',
  'swordtail-torn-fins',
  'tinfoil-barb-floating',
  'tinfoil-barb-mucus-coating',
  'turquoise-rainbowfish-gasping',
  'venustus-cichlid-pale-color',
  // 2026-11-01: GSC "Discovered - currently not indexed" (reports/gsc-discovered-not-indexed-2026-11-01.csv
  // on the main site). Same cold-tail pattern: ~700-word template pages for species with no
  // /aquarium-fish-diseases/ hub to merge into. variatus-platy-pale-color is here despite the
  // species being common — the page itself drew 11 impressions and 1 click in 3 months.
  'threadfin-rainbowfish-losing-color',
  'tropheus-cichlid-sinking',
  'turquoise-rainbowfish-floating',
  'upside-down-catfish-bloated',
  'variatus-platy-pale-color',
  'venustus-cichlid-sinking',
  'watchman-goby-rubbing',
  'zebra-pleco-bulging-eyes',
]

const RETIRED_HEALTH = new Set(RETIRED_HEALTH_SLUGS)

/** true when /fish-health/<slug> was retired with no replacement — serve 404, never link. */
export const isRetiredHealth = (slug: string): boolean => RETIRED_HEALTH.has(slug)

/** true when this app must neither serve nor link /fish-health/<slug> (merged or retired). */
export const healthSlugIsGone = (slug: string): boolean =>
  isRetiredHealth(slug) || consolidatedHealthUrl(slug) !== null

export const healthHref = (slug: string) => consolidatedHealthUrl(slug) ?? `/fish-health/${slug}`
export const fishHealthHref = (fishSlug: string) => consolidatedFishUrl(fishSlug) ?? `/fish-health/fish/${fishSlug}`
