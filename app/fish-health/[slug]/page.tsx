import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getFishHealthPage,
  getAllHealthSlugs,
  getRelatedHealthPages,
} from '@/lib/fish-health'
import HealthHero        from '@/components/HealthHero'
import UrgencyBanner     from '@/components/UrgencyBanner'
import CausesGrid        from '@/components/CausesGrid'
import NumberedSteps     from '@/components/NumberedSteps'
import RelatedHealthLinks from '@/components/RelatedHealthLinks'
import CalloutBox        from '@/components/CalloutBox'
import FaqAccordion      from '@/components/FaqAccordion'
import TableOfContents   from '@/components/TableOfContents'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

const TOC_ITEMS = [
  { id: 'causes',       label: 'Common Causes' },
  { id: 'diagnose',     label: 'How to Diagnose' },
  { id: 'fix',          label: 'How to Fix' },
  { id: 'prevention',   label: 'Prevention' },
  { id: 'seek-help',    label: 'When to Seek Help' },
  { id: 'related',      label: 'Related Problems' },
  { id: 'faq',          label: 'FAQ' },
]

// ── Static params (build-time pre-render) ─────────────────────────────────────
export async function generateStaticParams() {
  const slugs = await getAllHealthSlugs()
  return slugs.map((slug) => ({ slug }))
}

// ── Dynamic metadata ──────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const page = await getFishHealthPage(params.slug)
  if (!page) return { title: 'Health Guide Not Found' }

  const { content, species, problem } = page
  const fishName    = species.common_name
  const probName    = problem.problem_name
  const canonical   = `${SITE_URL}/fish-health/${content.slug}`

  const title = content.meta_title
    ?? `Why Is My ${fishName} ${probName}? Causes & Solutions`
  const description = content.meta_description
    ?? `Learn why your ${fishName} is ${probName.toLowerCase()}. Discover common causes, step-by-step diagnosis, and how to treat ${species.scientific_name} at home.`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      siteName: 'FishCare AI',
      images: [{
        url: `${SITE_URL}/assets/encyclopedia/real/${species.slug}-wikimedia-real.jpg`,
        width: 1280,
        height: 640,
        alt: `${fishName} — ${probName}`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// ── Page component ────────────────────────────────────────────────────────────
export default async function FishHealthDiagnosisPage(
  { params }: { params: { slug: string } }
) {
  const page = await getFishHealthPage(params.slug)
  if (!page) notFound()

  const { content, species, problem } = page
  const canonical = `${SITE_URL}/fish-health/${content.slug}`
  const fishName  = species.common_name
  const probName  = problem.problem_name

  // Fetch related pages (non-blocking — empty array on failure)
  const relatedLinks = await getRelatedHealthPages(content.related_slugs ?? [])

  // ── JSON-LD ─────────────────────────────────────────────────────────────────
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Fish Health',  item: `${SITE_URL}/fish-health/` },
      { '@type': 'ListItem', position: 3, name: `${fishName} ${probName}`, item: canonical },
    ],
  }

  const allSteps = [
    ...(content.diagnosis_steps  ?? []).map((s) => ({ ...s, action: `[Diagnose] ${s.action}` })),
    ...(content.treatment_steps  ?? []).map((s) => ({ ...s, action: `[Treat] ${s.action}` })),
  ]

  const howToSchema = allSteps.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to diagnose and treat ${fishName} ${probName.toLowerCase()}`,
    description: content.meta_description ?? '',
    step: allSteps.map((s) => ({
      '@type': 'HowToStep',
      name: s.action,
      text: s.detail,
    })),
  } : null

  const faqSchema = content.faq?.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  } : null

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Why Is My ${fishName} ${probName}?`,
    description: content.meta_description ?? '',
    url: canonical,
    image: `${SITE_URL}/assets/encyclopedia/real/${species.slug}-wikimedia-real.jpg`,
    datePublished: content.created_at,
    dateModified:  content.updated_at,
    author:    { '@type': 'Organization', name: 'FishCare AI Editorial Team' },
    publisher: { '@type': 'Organization', name: 'FishCare AI', url: SITE_URL },
  }

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {howToSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      )}
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {/* Hero */}
      <HealthHero
        fishName={fishName}
        fishSlug={species.slug}
        scientificName={species.scientific_name}
        problemName={probName}
        urgency={problem.urgency}
        category={problem.category}
      />

      {/* Body */}
      <div className="con">
        <div className="sp-layout">
          {/* ── Main article ─────────────────────────────── */}
          <article className="artc" id="article">

            {/* Introduction */}
            {content.intro && <p style={{ fontSize: '1rem', lineHeight: 1.8 }}>{content.intro}</p>}

            {/* Urgency banner (visible only for urgent/emergency) */}
            <UrgencyBanner urgency={problem.urgency} fishName={fishName} />

            {/* Common Causes */}
            {content.common_causes?.length > 0 && (
              <>
                <h2 id="causes">Common Causes of {probName} in {fishName}</h2>
                <CausesGrid causes={content.common_causes} />
              </>
            )}

            {/* How to Diagnose */}
            {content.diagnosis_steps?.length > 0 && (
              <>
                <h2 id="diagnose">How to Diagnose</h2>
                <p>Follow these steps in order. Stop when you identify a likely cause and move to treatment.</p>
                <NumberedSteps steps={content.diagnosis_steps} />
              </>
            )}

            {/* How to Fix */}
            {content.treatment_steps?.length > 0 && (
              <>
                <h2 id="fix">How to Fix It</h2>
                <NumberedSteps steps={content.treatment_steps} />
              </>
            )}

            {/* Prevention */}
            {content.prevention && (
              <>
                <h2 id="prevention">Prevention</h2>
                <CalloutBox variant="ok">
                  {content.prevention}
                </CalloutBox>
              </>
            )}

            {/* When to seek help */}
            {content.when_to_seek_help && (
              <>
                <h2 id="seek-help">When to Seek Expert Help</h2>
                <CalloutBox variant="warn">
                  <strong>See a vet if:</strong> {content.when_to_seek_help}
                </CalloutBox>
              </>
            )}

            {/* Internal CTAs */}
            <div className="cta-box">
              <h4>📖 Full Care Guide</h4>
              <p>
                Learn everything about keeping a healthy {fishName} — tank setup, water parameters,
                diet, tank mates, and disease prevention.
              </p>
              <a className="btn" href={`/species/${species.slug}/care-guide`}>
                {fishName} Care Guide →
              </a>
            </div>

            <div className="cta-box" style={{ background: 'linear-gradient(135deg, #0F3D5E, #2E9E7D)', marginTop: 0 }}>
              <h4>🔬 AI Symptom Checker</h4>
              <p>
                Not sure what&apos;s wrong? Describe your fish&apos;s symptoms to the FishCare AI
                and get an instant diagnosis.
              </p>
              <a className="btn" href={`${SITE_URL}/#symptom-checker`}>
                Check Symptoms →
              </a>
            </div>

            {/* Related problems */}
            {relatedLinks.length > 0 && (
              <>
                <h2 id="related">Related Problems</h2>
                <RelatedHealthLinks links={relatedLinks} />
              </>
            )}

            {/* FAQ */}
            {content.faq?.length > 0 && (
              <>
                <h2 id="faq">Frequently Asked Questions</h2>
                <FaqAccordion items={content.faq} />
              </>
            )}

            {/* Editorial note */}
            <div className="abox" style={{ marginTop: 32 }}>
              <div className="aav">✓</div>
              <div>
                <strong>Editorial review</strong>
                <p>
                  This guide was reviewed for biological accuracy and practical aquarium care guidance.
                  Always test water parameters before treating a sick fish — poor water quality is the
                  most common root cause. Consult an aquatic veterinarian if symptoms persist after
                  48 hours of correct treatment.
                </p>
              </div>
            </div>

          </article>

          {/* ── Sidebar ──────────────────────────────────── */}
          <aside className="sp-sidebar">
            <div className="qf-card">
              <div className="qf-head">Fish Profile</div>
              <table className="qf-table">
                <tbody>
                  <tr><td>Species</td><td>{fishName}</td></tr>
                  <tr><td>Scientific</td><td><em>{species.scientific_name}</em></td></tr>
                  {species.water_type && (
                    <tr><td>Water</td><td style={{ textTransform: 'capitalize' }}>{species.water_type}</td></tr>
                  )}
                  {species.environment?.temp_min_c != null && (
                    <tr>
                      <td>Temp</td>
                      <td>{species.environment.temp_min_c}–{species.environment.temp_max_c}°C</td>
                    </tr>
                  )}
                  {species.environment?.ph_min != null && (
                    <tr>
                      <td>pH</td>
                      <td>{species.environment.ph_min}–{species.environment.ph_max}</td>
                    </tr>
                  )}
                  {species.difficulty_level && (
                    <tr>
                      <td>Care level</td>
                      <td style={{ textTransform: 'capitalize' }}>{species.difficulty_level}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: 16 }}>
              <a
                href={`/species/${species.slug}`}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '10px',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--bd)',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  color: 'var(--p)',
                  fontWeight: 600,
                }}
              >
                📖 View Species Profile
              </a>
            </div>

            <TableOfContents items={TOC_ITEMS} />
          </aside>
        </div>
      </div>
    </>
  )
}
