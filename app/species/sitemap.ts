import type { MetadataRoute } from 'next'
import { getAllSpeciesSlugs, getAllGuidesSlugs } from '@/lib/species'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [encyclopediaSlugs, guideSlugs] = await Promise.all([
    getAllSpeciesSlugs(),
    getAllGuidesSlugs(),
  ])

  const encyclopediaUrls: MetadataRoute.Sitemap = encyclopediaSlugs.map((slug) => ({
    url: `${SITE_URL}/species/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const guideUrls: MetadataRoute.Sitemap = guideSlugs.map((slug) => ({
    url: `${SITE_URL}/species/${slug}/care-guide`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.9,
  }))

  return [...encyclopediaUrls, ...guideUrls]
}
