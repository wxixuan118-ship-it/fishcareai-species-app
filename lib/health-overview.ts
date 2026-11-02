// Main-site page that covers every common disease of a species (the "<species> health
// problems" overview). Each /fish-health/<species>-<symptom> page links to it so Google
// sees one overview per species instead of picking a single symptom page for broad
// "health problems" queries.
//
// Only overviews with real content are listed: the ~180-word generated stubs under
// /aquarium-fish-diseases/<species>-diseases/ are left out on purpose. Clownfish symptom
// pages are already 301ed to their species hubs (see consolidated.ts).
//
// 2026-11-02: oscar points at the guide Google's AI Mode cites; the stub hub 301s there.

const HEALTH_OVERVIEWS: Record<string, string> = {
  'oscar':        '/guides/oscar-fish-care/diseases/',
  'angelfish':    '/aquarium-fish-diseases/angelfish-diseases/',
  'discus':       '/aquarium-fish-diseases/discus-diseases/',
  'koi':          '/guides/koi-fish-care/diseases/',
  'rainbow-fish': '/guides/rainbow-fish-care/diseases/',
}

/** Main-site health-problems overview for a species, or null if none is worth linking. */
export const healthOverviewHref = (speciesSlug: string): string | null =>
  HEALTH_OVERVIEWS[speciesSlug] ?? null
