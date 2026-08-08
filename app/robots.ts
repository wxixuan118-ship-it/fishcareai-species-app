import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/species/', '/fish-health/'],
    },
    sitemap: [
      `${SITE_URL}/species/sitemap.xml`,
      `${SITE_URL}/fish-health/sitemap.xml`,
    ],
  }
}
