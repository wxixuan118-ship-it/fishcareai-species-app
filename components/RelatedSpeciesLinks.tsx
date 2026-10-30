import { careGuideHref } from '@/lib/consolidated'
import type { MainSiteGuide } from '@/lib/main-site-guides'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

interface Props {
  currentSlug: string
  relatedSlugs: string[]
  speciesName: string
  /** Only link to the care guide when a published one exists — the route 404s otherwise. */
  hasGuide?: boolean
  /** In-depth guide for this species on the main site, if there is one. */
  mainGuide?: MainSiteGuide | null
}

// Human-readable label from slug
function slugToLabel(slug: string): string {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function RelatedSpeciesLinks({ currentSlug, relatedSlugs, speciesName, hasGuide = false, mainGuide = null }: Props) {
  return (
    <div style={{ marginTop: 32 }}>
      <h2>Related Species & Guides</h2>
      <div className="guide-links" style={{ marginTop: 12 }}>
        {/* Link to own care guide — only when one is published */}
        {hasGuide && (
          <a href={careGuideHref(currentSlug)}>
            📋 {speciesName} Care Guide
          </a>
        )}
        {mainGuide && (
          <a href={mainGuide.href}>
            📋 {mainGuide.label}
          </a>
        )}
        {/* Related species encyclopedia pages */}
        {relatedSlugs.slice(0, 3).map((slug) => (
          <a key={slug} href={`/species/${slug}`}>
            🐟 {slugToLabel(slug)}
          </a>
        ))}
        {/* Links back to existing static pages */}
        <a href={`${SITE_URL}/guides/`}>
          📚 All Care Guides
        </a>
        <a href={`${SITE_URL}/species`}>
          🔍 Fish Encyclopedia
        </a>
      </div>
    </div>
  )
}
