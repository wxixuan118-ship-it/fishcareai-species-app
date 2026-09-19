import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getHealthPagesByFish } from '@/lib/fish-health'
import type { HealthPageSummary, ProblemCategory } from '@/types/fish-health'
import sql from '@/lib/db'

// Rendered on first request, then served from the ISR cache (see ../../[slug]/page.tsx
// for why generateStaticParams must exist and return nothing).
export const revalidate = 3600
export const dynamicParams = true
export function generateStaticParams(): { slug: string }[] {
  return []
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

const URGENCY_BADGE: Record<string, { label: string; cls: string }> = {
  monitor:   { label: 'Monitor',   cls: 'bdg bgood' },
  urgent:    { label: 'Urgent',    cls: 'bdg bwarn' },
  emergency: { label: 'Emergency', cls: 'bdg bdng' },
}

// One section per problem category. The copy names what the group has in
// common — what to check first and how fast to act — so the page reads as a
// guide rather than a bare link list.
const CATEGORY_SECTIONS: Array<{
  key: ProblemCategory
  heading: (fish: string) => string
  intro: (fish: string) => string
}> = [
  {
    key: 'behavioral',
    heading: (fish) => `${fish} Behavior Problems`,
    intro: (fish) =>
      `A change in how your ${fish} acts — hiding, hovering at the surface, darting, refusing food or ` +
      `picking fights — is usually the first sign that something is wrong, and it often shows up a day ` +
      `or two before any physical symptom. Most behavior changes trace back to water quality, ` +
      `temperature, tank mates or stocking, so test the water before assuming disease.`,
  },
  {
    key: 'physical',
    heading: (fish) => `${fish} Physical Symptoms`,
    intro: (fish) =>
      `Visible changes to the body or fins of a ${fish} — colour fading, swelling, clamped or torn fins, ` +
      `bulging eyes, a curved spine — narrow the diagnosis quickly because each has a short list of ` +
      `likely causes. These guides walk through that list, from the most common cause to the rarest, ` +
      `and say when a symptom means the fish should be isolated.`,
  },
  {
    key: 'disease',
    heading: (fish) => `${fish} Diseases`,
    intro: (fish) =>
      `Parasites, bacterial infections and fungus each leave a recognisable signature on a ${fish}: ` +
      `white spots, red streaks, fuzzy growth, rot at the fin edges. These guides identify the ` +
      `pathogen from what you can see, give the treatment that works for that species and water type, ` +
      `and explain how long recovery normally takes.`,
  },
]

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const [species] = await sql<{ common_name: string; scientific_name: string }[]>`
    SELECT common_name, scientific_name FROM species WHERE slug = ${params.slug} LIMIT 1
  `
  if (!species) return { title: 'Fish Not Found' }
  return {
    title: `${species.common_name} Health Problems & Symptoms`,
    description: `All the common ${species.common_name} health problems (${species.scientific_name}) grouped by behavior, physical symptoms and disease — causes, diagnosis and treatment for each.`,
    alternates: { canonical: `${SITE_URL}/fish-health/fish/${params.slug}` },
  }
}

function ProblemCard({ page }: { page: HealthPageSummary }) {
  const badge = URGENCY_BADGE[page.urgency] ?? URGENCY_BADGE.monitor
  return (
    <a
      href={`/fish-health/${page.slug}`}
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
        <strong style={{ fontSize: '0.9rem', color: 'var(--tx)' }}>{page.problem_name}</strong>
        <span className={badge.cls} style={{ flexShrink: 0 }}>{badge.label}</span>
      </div>
    </a>
  )
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

  const fish      = species.common_name
  const canonical = `${SITE_URL}/fish-health/fish/${species.slug}`
  const imgSrc    = `${SITE_URL}/assets/encyclopedia/real/${species.slug}-wikimedia-real.jpg`

  // Group by category; anything without one (older rows) falls into the last
  // section so every guide is still listed exactly once.
  const grouped = CATEGORY_SECTIONS.map((section) => ({
    ...section,
    pages: pages.filter((p) => (p.category ?? 'disease') === section.key),
  })).filter((section) => section.pages.length > 0)

  const emergencies = pages.filter((p) => p.urgency === 'emergency').length

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',                   item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Fish Health', item: `${SITE_URL}/fish-health/` },
      { '@type': 'ListItem', position: 3, name: `${fish} Health Problems`, item: canonical },
    ],
  }

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${fish} Health Problems & Symptoms`,
    url: canonical,
    image: imgSrc,
    about: { '@type': 'Thing', name: fish, alternateName: species.scientific_name },
    hasPart: pages.map((p) => ({
      '@type': 'Article',
      headline: `${fish} ${p.problem_name}`,
      url: `${SITE_URL}/fish-health/${p.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <section className="sp-hero" style={{ minHeight: 260 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="sp-hero-img"
          src={imgSrc}
          alt={`${fish} health problems — ${species.scientific_name}`}
          width={1280}
          height={340}
          fetchPriority="high"
          decoding="async"
        />
        <div className="sp-hero-overlay" />
        <div className="sp-hero-inner">
          <div className="breadcrumb">
            <a href={SITE_URL}>Home</a>
            <span>/</span>
            <a href="/fish-health/">Fish Health</a>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,.85)' }}>{fish}</span>
          </div>
          <div className="sp-tag">Health Guides</div>
          <h1>{fish} Health Problems</h1>
          <p className="sci-name">
            {species.scientific_name} — {pages.length} health guides
          </p>
        </div>
      </section>

      <div className="con" style={{ padding: '36px 22px 60px' }}>
        <div style={{ marginBottom: 24, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <a href={`/species/${species.slug}`} style={{ color: 'var(--p)', fontSize: '0.9rem' }}>
            ← View full {fish} care guide
          </a>
          <a href="/fish-health/" style={{ color: 'var(--p)', fontSize: '0.9rem' }}>
            ← Fish Health Hub
          </a>
        </div>

        <p style={{ marginBottom: 28, maxWidth: 760 }}>
          {pages.length} {fish} health problems, grouped by what you can see: a change in behaviour,
          a visible change to the body, or the signature of a specific disease.
          {emergencies > 0 && ` ${emergencies} of them are marked Emergency — those need action the same day.`}
          {' '}Each guide lists the likely causes in order, a step-by-step diagnosis, the treatment
          and how to stop it coming back, and says how urgent the symptom is for this species. Start with the symptom that matches, and test the water
          before treating anything — poor water quality sits behind most {fish} health problems.
        </p>

        {grouped.map((section) => (
          <section key={section.key} style={{ marginBottom: 36 }}>
            <h2 style={{ marginBottom: 8 }}>{section.heading(fish)}</h2>
            <p style={{ marginBottom: 16, maxWidth: 760 }}>{section.intro(fish)}</p>
            <div className="guide-links" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', marginTop: 0 }}>
              {section.pages.map((p) => <ProblemCard key={p.slug} page={p} />)}
            </div>
          </section>
        ))}

        <section style={{ marginBottom: 36, maxWidth: 760 }}>
          <h2 style={{ marginBottom: 8 }}>{fish} Health Problems: What to Do First</h2>
          <p style={{ marginBottom: 12 }}>
            Test ammonia, nitrite, nitrate, pH and temperature before you reach for any medication.
            A large share of {fish} health problems clear up within days once the water is corrected,
            and treating a healthy tank with medication only adds stress.
          </p>
          <p style={{ marginBottom: 12 }}>
            If the water tests clean, isolate the affected fish in a quarantine tank so you can
            observe it, feed it and medicate it without dosing the whole community. Then match what
            you see against the guides above.
          </p>
          <p>
            Anything marked <strong>Emergency</strong> — gasping, floating, sudden bloating — needs
            action today. For everything else, give a correct treatment 48 hours; if there is no
            improvement, consult an aquatic veterinarian.
          </p>
        </section>

        <div className="cta-box" style={{ marginTop: 48 }}>
          <h3>Browse All Fish Health Guides</h3>
          <p>See all 30 fish health problem categories with diagnosis and treatment guides for hundreds of species.</p>
          <a className="btn" href="/fish-health/">Fish Health Hub →</a>
        </div>
      </div>
    </>
  )
}
