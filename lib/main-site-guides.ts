// Species whose in-depth care guide lives on the main site under /guides/
// rather than at /species/<slug>/care-guide in this app. The species profile
// links to it so the two pages support each other instead of competing for
// the same queries.

export interface MainSiteGuide {
  href: string
  /** The guide's own name, which can be broader than the species (bronze cory → all Corydoras). */
  label: string
  /** What the guide covers, from its meta description. */
  summary: string
}

const MAIN_SITE_GUIDES: Record<string, MainSiteGuide> = {
  'rainbow-fish': {
    href: '/guides/rainbow-fish-care/',
    label: 'Rainbow Fish Care Guide',
    summary: 'school size, 30–55 gallon tanks, hard alkaline water, feeding for color, tank mates, breeding and diseases',
  },
  'bronze-cory': {
    href: '/guides/corydoras-care-guide/',
    label: 'Corydoras Care Guide',
    summary: 'adult size, tank size, water, diet, popular types and breeding',
  },
  oscar: {
    href: '/guides/oscar-fish-care/',
    label: 'Oscar Fish Care Guide',
    summary: 'adult size, lifespan, tank size, tank mates and feeding',
  },
  swordtail: {
    href: '/guides/swordtail-fish-care-and-breeding/',
    label: 'Swordtail Fish Care Guide',
    summary: 'adult size, lifespan, tank size, tank mates, feeding and breeding',
  },
  'zebra-danio': {
    href: '/guides/zebra-danio-fish-care/',
    label: 'Zebra Danio Care Guide',
    summary: 'adult size, lifespan, tank size, tank mates and feeding',
  },
  angelfish: {
    href: '/guides/angelfish-care/',
    label: 'Angelfish Care Guide',
    summary: 'tank size, diet, water parameters and tank mates',
  },
  'betta-fish': {
    href: '/guides/betta-fish-care/',
    label: 'Betta Fish Care Guide',
    summary: 'tank size, water, food and lifespan',
  },
  goldfish: {
    href: '/guides/goldfish-care/',
    label: 'Goldfish Care Guide',
    summary: 'tank size, feeding and lifespan',
  },
  guppy: {
    href: '/guides/guppy-fish-care/',
    label: 'Guppy Care Guide',
    summary: 'tank size, water parameters, diet, lifespan, breeding, fry, tank mates and diseases',
  },
  molly: {
    href: '/guides/molly-fish-care/',
    label: 'Molly Fish Care Guide',
    summary: 'the 9 common types, tank and water needs, feeding, pregnancy signs, fry and tank mates',
  },
  discus: {
    href: '/guides/discus-fish-care-requirements/',
    label: 'Discus Fish Care Requirements',
    summary: 'water, tank size and setup',
  },
  koi: {
    href: '/guides/koi-fish-care/',
    label: 'Koi Fish Care Guide',
    summary: 'pond setup and a feeding chart',
  },
  'blood-parrot-cichlid': {
    href: '/guides/parrot-fish-care/',
    label: 'Parrot Fish Care Guide',
    summary: 'tank size, temperature, food, tank mates, real vs dyed colors, lifespan and health',
  },
  'common-pleco': {
    href: '/guides/pleco-care-guide/',
    label: 'Pleco Care Guide',
    summary: 'pleco species by adult size, tank needs, oxygen, food and tank mates',
  },
  'ocellaris-clownfish': {
    href: '/guides/clownfish-care-guide/',
    label: 'Clownfish Care Guide',
    summary: 'tank size, saltwater parameters, diet, lifespan, anemones, tank mates and breeding',
  },
  'bala-shark':        templated('bala-shark-care-guide', 'Bala Shark'),
  'blue-tang':         templated('blue-tang-care-guide', 'Blue Tang'),
  'bristlenose-pleco': templated('bristlenose-pleco-care-guide', 'Bristlenose Pleco'),
  'cardinal-tetra':    templated('cardinal-tetra-care-guide', 'Cardinal Tetra'),
  'firefish-goby':     templated('firefish-care-guide', 'Firefish'),
  'german-blue-ram':   templated('german-blue-ram-care-guide', 'German Blue Ram'),
  'julii-cory':        templated('julii-cory-care-guide', 'Julii Cory'),
  'neon-tetra':        templated('neon-tetra-care-guide', 'Neon Tetra'),
  otocinclus:          templated('otocinclus-care-guide', 'Otocinclus'),
  'panda-cory':        templated('panda-cory-care-guide', 'Panda Cory'),
  platy:               templated('platy-care-guide', 'Platy'),
  'pygmy-cory':        templated('pygmy-cory-care-guide', 'Pygmy Cory'),
  'yellow-tang':       templated('yellow-tang-care-guide', 'Yellow Tang'),
}

// Main-site guides built from one template, which all cover the same ground.
function templated(dir: string, name: string): MainSiteGuide {
  return {
    href: `/guides/${dir}/`,
    label: `${name} Care Guide`,
    summary: 'tank size, temperature, water quality, feeding, tank mates and a setup checklist',
  }
}

export const mainSiteGuide = (slug: string): MainSiteGuide | null => MAIN_SITE_GUIDES[slug] ?? null

// Species whose symptom and treatment guide lives on the main site.
const CLOWNFISH_HEALTH_SLUGS = new Set([
  'ocellaris-clownfish',
  'percula-clownfish',
  'true-percula-clownfish',
  'tomato-clownfish',
  'maroon-clownfish',
])

export const hasClownfishHealthGuide = (slug: string): boolean => CLOWNFISH_HEALTH_SLUGS.has(slug)
