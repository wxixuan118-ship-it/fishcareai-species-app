import type { MetadataRoute } from 'next'
import { getAllHealthSlugs, getHealthSpeciesList } from '@/lib/fish-health'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, speciesList] = await Promise.all([
    getAllHealthSlugs(),
    getHealthSpeciesList(),
  ])

  const healthUrls: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url:             `${SITE_URL}/fish-health/${slug}`,
    lastModified:    new Date(),
    changeFrequency: 'monthly',
    priority:        0.85,
  }))

  const fishListingUrls: MetadataRoute.Sitemap = speciesList.map((s) => ({
    url:             `${SITE_URL}/fish-health/fish/${s.slug}/`,
    lastModified:    new Date(),
    changeFrequency: 'monthly',
    priority:        0.75,
  }))

  return [
    {
      url:             `${SITE_URL}/fish-health/`,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        0.7,
    },
    ...fishListingUrls,
    ...healthUrls,
  ]
}
