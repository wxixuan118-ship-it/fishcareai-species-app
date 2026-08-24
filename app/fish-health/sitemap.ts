import type { MetadataRoute } from 'next'
import sql from '@/lib/db'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [healthRows, speciesRows] = await Promise.all([
    sql<{ slug: string; updated_at: Date | null }[]>`
      SELECT slug, updated_at
      FROM fish_health_content WHERE published = true ORDER BY slug
    `,
    sql<{ slug: string; updated_at: Date | null }[]>`
      SELECT DISTINCT s.slug, s.updated_at
      FROM fish_health_content fhc
      JOIN species s ON fhc.fish_id = s.id
      WHERE fhc.published = true AND s.published = true
    `,
  ])

  const healthUrls: MetadataRoute.Sitemap = healthRows.map((r) => ({
    url: `${SITE_URL}/fish-health/${r.slug}`,
    lastModified: r.updated_at ?? new Date(),
    changeFrequency: 'monthly',
    priority: 0.85,
  }))

  const fishListingUrls: MetadataRoute.Sitemap = speciesRows.map((r) => ({
    url: `${SITE_URL}/fish-health/fish/${r.slug}`,
    lastModified: r.updated_at ?? new Date(),
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  return [
    ...fishListingUrls,
    ...healthUrls,
  ]
}
