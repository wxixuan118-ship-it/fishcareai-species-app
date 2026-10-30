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
}

export const mainSiteGuide = (slug: string): MainSiteGuide | null => MAIN_SITE_GUIDES[slug] ?? null
