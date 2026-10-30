import type { MetadataRoute } from 'next'
import sql from '@/lib/db'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

export const dynamic = 'force-dynamic'

// Care guides the main site's nginx 301s to a /guides/ page — keep redirects out of the sitemap.
const REDIRECTED_GUIDE_SLUGS = new Set(['betta-fish'])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [speciesRows, guideRows] = await Promise.all([
    sql<{ slug: string; updated_at: Date | null }[]>`
      SELECT slug, updated_at
      FROM species WHERE published = true ORDER BY common_name
    `,
    sql<{ slug: string; updated_at: Date | null }[]>`
      SELECT s.slug, GREATEST(sg.updated_at, s.updated_at) AS updated_at
      FROM species_guides sg
      JOIN species s ON sg.species_id = s.id
      WHERE sg.published = true AND s.published = true
    `,
  ])

  const encyclopediaUrls: MetadataRoute.Sitemap = speciesRows.map((r) => ({
    url: `${SITE_URL}/species/${r.slug}`,
    lastModified: r.updated_at ?? new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const guideUrls: MetadataRoute.Sitemap = guideRows.filter((r) => !REDIRECTED_GUIDE_SLUGS.has(r.slug)).map((r) => ({
    url: `${SITE_URL}/species/${r.slug}/care-guide`,
    lastModified: r.updated_at ?? new Date(),
    changeFrequency: 'monthly',
    priority: 0.9,
  }))

  return [...encyclopediaUrls, ...guideUrls]
}
