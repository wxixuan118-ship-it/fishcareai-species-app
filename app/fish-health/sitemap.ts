import type { MetadataRoute } from 'next'
import { getAllHealthSlugs } from '@/lib/fish-health'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllHealthSlugs()

  const healthUrls: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url:             `${SITE_URL}/fish-health/${slug}`,
    lastModified:    new Date(),
    changeFrequency: 'monthly',
    priority:        0.85,
  }))

  return [
    {
      url:             `${SITE_URL}/fish-health/`,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        0.7,
    },
    ...healthUrls,
  ]
}
