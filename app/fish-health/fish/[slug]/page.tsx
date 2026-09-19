import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getHealthPagesByFish } from '@/lib/fish-health'
import sql from '@/lib/db'

// Rendered on first request, then served from the ISR cache (see ../[slug]/page.tsx).
export const revalidate = 3600
export const dynamicParams = true

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

const URGENCY_BADGE: Record<string, { label: string; cls: string }> = {
  monitor:   { label: 'Monitor',   cls: 'bdg bgood' },
  urgent:    { label: 'Urgent',    cls: 'bdg bwarn' },
  emergency: { label: 'Emergency', cls: 'bdg bdng' },
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const [species] = await sql<{ common_name: string; scientific_name: string }[]>`
    SELECT common_name, scientific_name FROM species WHERE slug = ${params.slug} LIMIT 1
  `
  if (!species) return { title: 'Fish Not Found' }
  return {
    title: `${species.common_name} Health Problems & Symptoms`,
    description: `Browse all common health problems and symptoms for ${species.common_name} (${species.scientific_name}). Step-by-step diagnosis and treatment guides.`,
    alternates: { canonical: `${SITE_URL}/fish-health/fish/${params.slug}` },
  }
}

export default async function FishHealthListPage(
  { params }: { params: { slug: string } }
) {
  const [species] = await sql<{ common_name: string; scientific_name: string; slug: string }[]>`
    SELECT common_name, scientific_name, slug FROM species WHERE slug = ${params.slug} LIMIT 1
  `
  if (!species) notFound()

  const pages = await getHealthPagesByFish(params.slug)
  if (!pages.length) notFound()

  const canonical = `${SITE_URL}/fish-health/fish/${species.slug}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',                   item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Fish Health', item: `${SITE_URL}/fish-health/` },
      { '@type': 'ListItem', position: 3, name: `${species.common_name} Health Problems`, item: canonical },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="sp-hero" style={{ minHeight: 220 }}>
        <div className="sp-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(5,28,42,.92) 0%, rgba(11,50,80,.7) 100%)' }} />
        <div className="sp-hero-inner">
          <div className="breadcrumb">
            <a href={SITE_URL}>Home</a>
            <span>/</span>
            <a href="/fish-health/">Fish Health</a>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,.85)' }}>{species.common_name}</span>
          </div>
          <div className="sp-tag">Health Guides</div>
          <h1>{species.common_name} Health Problems</h1>
          <p className="sci-name">
            {species.scientific_name} — {pages.length} health guides
          </p>
        </div>
      </section>

      <div className="con" style={{ padding: '36px 22px 60px' }}>
        <div style={{ marginBottom: 24, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <a href={`/species/${species.slug}`} style={{ color: 'var(--p)', fontSize: '0.9rem' }}>
            ← View full {species.common_name} care guide
          </a>
          <a href="/fish-health/" style={{ color: 'var(--p)', fontSize: '0.9rem' }}>
            ← Fish Health Hub
          </a>
        </div>

        <h2 style={{ marginBottom: 10 }}>All {species.common_name} Health Problems</h2>
        <p style={{ marginBottom: 20, maxWidth: 760 }}>
          {pages.length} {species.common_name} health problems, each with the most likely causes, a
          step-by-step diagnosis, treatment steps and prevention advice. Start with the symptom you
          can see — colour, fins, breathing, appetite or behaviour — and check water parameters
          first, because poor water quality sits behind most {species.common_name} health problems.
        </p>

        <div className="guide-links" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {pages.map((p) => {
            const badge = URGENCY_BADGE[p.urgency] ?? URGENCY_BADGE.monitor
            return (
              <a
                key={p.slug}
                href={`/fish-health/${p.slug}`}
                style={{
                  display: 'block',
                  background: 'var(--bg)',
                  border: '1px solid var(--bd)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--tx)' }}>{p.problem_name}</strong>
                  <span className={badge.cls} style={{ flexShrink: 0 }}>{badge.label}</span>
                </div>
              </a>
            )
          })}
        </div>

        <div className="cta-box" style={{ marginTop: 48 }}>
          <h3>Browse All Fish Health Guides</h3>
          <p>See all 30 fish health problem categories with diagnosis and treatment guides for hundreds of species.</p>
          <a className="btn" href="/fish-health/">Fish Health Hub →</a>
        </div>
      </div>
    </>
  )
}
