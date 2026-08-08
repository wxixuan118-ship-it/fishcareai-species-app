import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSpeciesGuide, getAllGuidesSlugs } from '@/lib/species'
import GuideHero from '@/components/GuideHero'
import QuickFactsCard from '@/components/QuickFactsCard'
import TableOfContents from '@/components/TableOfContents'
import WaterParamsTable from '@/components/WaterParamsTable'
import CalloutBox from '@/components/CalloutBox'
import FaqAccordion from '@/components/FaqAccordion'
import RelatedSpeciesLinks from '@/components/RelatedSpeciesLinks'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

const TOC_ITEMS = [
  { id: 'beginner',     label: 'Beginner Overview' },
  { id: 'tank-setup',   label: 'Tank Setup' },
  { id: 'water',        label: 'Water Parameters' },
  { id: 'feeding',      label: 'Feeding Guide' },
  { id: 'tank-mates',   label: 'Tank Mates' },
  { id: 'diseases',     label: 'Common Diseases' },
  { id: 'breeding',     label: 'Breeding' },
  { id: 'maintenance',  label: 'Maintenance Schedule' },
  { id: 'mistakes',     label: 'Common Mistakes' },
  { id: 'faq',          label: 'FAQ' },
]

// ── Static params ─────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const slugs = await getAllGuidesSlugs()
  return slugs.map((slug) => ({ slug }))
}

// ── Dynamic metadata ──────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const result = await getSpeciesGuide(params.slug)
  if (!result) return { title: 'Care Guide Not Found' }

  const { species, guide } = result
  const title       = guide.meta_title       ?? species.meta_title       ?? `${species.common_name} Care Guide: Tank Setup, Feeding & Disease | FishCare AI`
  const description = guide.meta_description ?? species.meta_description ?? `Complete ${species.common_name} care guide covering tank setup, water parameters, feeding schedule, tank mates, common diseases, and breeding for ${species.scientific_name}.`
  const canonical   = `${SITE_URL}/species/${species.slug}/care-guide`

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
      images: [
        {
          url: `${SITE_URL}/assets/encyclopedia/real/${species.slug}-wikimedia-real.jpg`,
          width: 1280,
          height: 640,
          alt: `${species.common_name} care guide`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// ── Page component ────────────────────────────────────────────────────────────
export default async function SpeciesCareGuidePage(
  { params }: { params: { slug: string } }
) {
  const result = await getSpeciesGuide(params.slug)
  if (!result) notFound()

  const { species, guide } = result
  const canonical    = `${SITE_URL}/species/${species.slug}/care-guide`
  const encyclopediaUrl = `/species/${species.slug}`

  // Schema.org JSON-LD
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides',      item: `${SITE_URL}/guides/` },
      { '@type': 'ListItem', position: 3, name: species.common_name, item: encyclopediaUrl },
      { '@type': 'ListItem', position: 4, name: `${species.common_name} Care Guide`, item: canonical },
    ],
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Care for ${species.common_name} (${species.scientific_name})`,
    description: guide.meta_description ?? '',
    step: [
      guide.tank_setup?.min_size_liters && {
        '@type': 'HowToStep',
        name: 'Set up the tank',
        text: `Use a minimum ${guide.tank_setup.min_size_liters}L (${guide.tank_setup.min_size_gallons} gal) tank. ${guide.tank_setup.filtration}`,
      },
      species.environment?.temp_min_c != null && {
        '@type': 'HowToStep',
        name: 'Set water parameters',
        text: `Maintain temperature ${species.environment.temp_min_c}–${species.environment.temp_max_c}°C, pH ${species.environment.ph_min}–${species.environment.ph_max}.`,
      },
      guide.feeding_guide?.frequency && {
        '@type': 'HowToStep',
        name: 'Feed correctly',
        text: `Feed ${guide.feeding_guide.frequency}. Staple: ${guide.feeding_guide.staple}`,
      },
    ].filter(Boolean),
  }

  const faqSchema = guide.faq?.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: guide.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }
    : null

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${species.common_name} Care Guide`,
    description: guide.meta_description ?? species.meta_description ?? '',
    url: canonical,
    image: `${SITE_URL}/assets/encyclopedia/real/${species.slug}-wikimedia-real.jpg`,
    datePublished: guide.created_at,
    dateModified:  guide.updated_at,
    author:    { '@type': 'Organization', name: 'FishCare AI Editorial Team' },
    publisher: { '@type': 'Organization', name: 'FishCare AI', url: SITE_URL },
  }

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {/* Hero */}
      <GuideHero species={species} />

      {/* Body */}
      <div className="con">
        <div className="sp-layout">
          {/* ── Main content ────────────────────────────── */}
          <article className="artc" id="article">

            {/* Beginner overview */}
            {guide.beginner_overview && (
              <>
                <h2 id="beginner">Beginner Overview</h2>
                <p>{guide.beginner_overview}</p>
              </>
            )}

            {/* Tank setup */}
            {guide.tank_setup && (
              <>
                <h2 id="tank-setup">Tank Setup</h2>
                <table className="ptbl">
                  <thead>
                    <tr><th>Element</th><th>Recommendation</th></tr>
                  </thead>
                  <tbody>
                    {guide.tank_setup.min_size_liters && (
                      <tr>
                        <td>Minimum tank size</td>
                        <td>{guide.tank_setup.min_size_liters}L ({guide.tank_setup.min_size_gallons} gal)</td>
                      </tr>
                    )}
                    {guide.tank_setup.substrate && (
                      <tr><td>Substrate</td><td>{guide.tank_setup.substrate}</td></tr>
                    )}
                    {guide.tank_setup.filtration && (
                      <tr><td>Filtration</td><td>{guide.tank_setup.filtration}</td></tr>
                    )}
                    {guide.tank_setup.plants && (
                      <tr><td>Plants</td><td>{guide.tank_setup.plants}</td></tr>
                    )}
                    {guide.tank_setup.decor && (
                      <tr><td>Décor</td><td>{guide.tank_setup.decor}</td></tr>
                    )}
                    {guide.tank_setup.lighting && (
                      <tr><td>Lighting</td><td>{guide.tank_setup.lighting}</td></tr>
                    )}
                    {guide.tank_setup.lid && (
                      <tr><td>Lid</td><td>{guide.tank_setup.lid}</td></tr>
                    )}
                  </tbody>
                </table>
              </>
            )}

            {/* Water parameters */}
            <h2 id="water">Water Parameters</h2>
            {species.environment && <WaterParamsTable env={species.environment} />}
            {guide.water_parameters?.dechlorination && (
              <CalloutBox variant="warn">
                <strong>Important:</strong> {guide.water_parameters.dechlorination}
              </CalloutBox>
            )}

            {/* Feeding */}
            {guide.feeding_guide && (
              <>
                <h2 id="feeding">Feeding Guide</h2>
                <table className="ptbl">
                  <thead>
                    <tr><th>Topic</th><th>Details</th></tr>
                  </thead>
                  <tbody>
                    {guide.feeding_guide.diet_type && (
                      <tr><td>Diet type</td><td>{guide.feeding_guide.diet_type}</td></tr>
                    )}
                    {guide.feeding_guide.frequency && (
                      <tr><td>Frequency</td><td>{guide.feeding_guide.frequency}</td></tr>
                    )}
                    {guide.feeding_guide.portion && (
                      <tr><td>Portion size</td><td>{guide.feeding_guide.portion}</td></tr>
                    )}
                    {guide.feeding_guide.staple && (
                      <tr><td>Staple food</td><td>{guide.feeding_guide.staple}</td></tr>
                    )}
                    {guide.feeding_guide.treats?.length > 0 && (
                      <tr><td>Treats</td><td>{guide.feeding_guide.treats.join(', ')}</td></tr>
                    )}
                  </tbody>
                </table>
                {guide.feeding_guide.avoid?.length > 0 && (
                  <CalloutBox variant="warn">
                    <strong>Avoid:</strong> {guide.feeding_guide.avoid.join('. ')}
                  </CalloutBox>
                )}
                {guide.feeding_guide.fasting && (
                  <CalloutBox variant="ok">
                    <strong>Tip:</strong> {guide.feeding_guide.fasting}
                  </CalloutBox>
                )}
              </>
            )}

            {/* Tank mates */}
            {guide.tank_mates && (
              <>
                <h2 id="tank-mates">Tank Mates</h2>
                {guide.tank_mates.notes && <p>{guide.tank_mates.notes}</p>}
                <div className="mates-grid">
                  {guide.tank_mates.compatible?.length > 0 && (
                    <div className="mates-card good">
                      <h4>✅ Compatible</h4>
                      <ul>
                        {guide.tank_mates.compatible.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {guide.tank_mates.incompatible?.length > 0 && (
                    <div className="mates-card bad">
                      <h4>❌ Incompatible</h4>
                      <ul>
                        {guide.tank_mates.incompatible.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {guide.tank_mates.min_tank_for_community && (
                  <CalloutBox>
                    <strong>Community tank:</strong> For community setups, use at least{' '}
                    {guide.tank_mates.min_tank_for_community}L ({Math.round(guide.tank_mates.min_tank_for_community * 0.264)} gal)
                    with dense planting.
                  </CalloutBox>
                )}
              </>
            )}

            {/* Compatibility tool CTA */}
            <div className="cta-box">
              <h4>🔬 Check Fish Compatibility</h4>
              <p>
                Use the FishCare AI compatibility checker to instantly see whether your{' '}
                {species.common_name} can safely share a tank with other fish you&apos;re considering.
              </p>
              <a className="btn" href={`${SITE_URL}/tools/fish-compatibility-checker/`}>
                Open Compatibility Checker
              </a>
            </div>

            {/* Common diseases */}
            {guide.common_diseases?.length > 0 && (
              <>
                <h2 id="diseases">Common Diseases</h2>
                <CalloutBox variant="ok">
                  <strong>Rule of thumb:</strong> Most fish illnesses begin with poor water quality.
                  Before reaching for medication, test your water — ammonia and nitrite problems
                  are almost always the root cause.
                </CalloutBox>
                {guide.common_diseases.map((disease, i) => (
                  <div key={i} className="disease-card">
                    <h4>{disease.name}</h4>
                    <div className="disease-row">
                      <span className="disease-label">Symptoms</span>
                      <span className="disease-value">{disease.symptoms}</span>
                    </div>
                    <div className="disease-row">
                      <span className="disease-label">Cause</span>
                      <span className="disease-value">{disease.cause}</span>
                    </div>
                    <div className="disease-row">
                      <span className="disease-label">Treatment</span>
                      <span className="disease-value">{disease.treatment}</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Breeding */}
            {guide.breeding && (
              <>
                <h2 id="breeding">Breeding</h2>
                {guide.breeding.difficulty && (
                  <p><strong>Difficulty:</strong> {guide.breeding.difficulty}</p>
                )}
                {guide.breeding.process    && <p>{guide.breeding.process}</p>}
                {guide.breeding.separation && (
                  <CalloutBox variant="warn">
                    <strong>Important:</strong> {guide.breeding.separation}
                  </CalloutBox>
                )}
                {guide.breeding.egg_care && <p>{guide.breeding.egg_care}</p>}
                {guide.breeding.fry_care && <p>{guide.breeding.fry_care}</p>}
                {guide.breeding.setup && (
                  <CalloutBox>
                    <strong>Setup:</strong> {guide.breeding.setup}
                  </CalloutBox>
                )}
              </>
            )}

            {/* Maintenance schedule */}
            {guide.maintenance_schedule && (
              <>
                <h2 id="maintenance">Maintenance Schedule</h2>
                <div className="maint-block">{guide.maintenance_schedule}</div>
              </>
            )}

            {/* Common mistakes */}
            {guide.common_mistakes?.length > 0 && (
              <>
                <h2 id="mistakes">Common Mistakes to Avoid</h2>
                <div>
                  {guide.common_mistakes.map((mistake, i) => (
                    <div key={i} className="mistake-item">
                      <span className="mistake-icon">✕</span>
                      <span>{mistake}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* FAQ */}
            {guide.faq?.length > 0 && (
              <>
                <h2 id="faq">Frequently Asked Questions</h2>
                <FaqAccordion items={guide.faq} />
              </>
            )}

            {/* Related */}
            <RelatedSpeciesLinks
              currentSlug={species.slug}
              relatedSlugs={species.related_species}
              speciesName={species.common_name}
            />

            {/* Editorial note */}
            <div className="abox">
              <div className="aav">✓</div>
              <div>
                <strong>Editorial review</strong>
                <p>
                  This care guide was reviewed for biological accuracy and practical aquarium guidance.
                  For suspected illness or disease, test your water parameters first and consult an
                  aquatic veterinarian if symptoms persist.
                </p>
              </div>
            </div>

          </article>

          {/* ── Sidebar ─────────────────────────────────── */}
          <aside className="sp-sidebar">
            <QuickFactsCard species={species} />
            <TableOfContents items={TOC_ITEMS} />
            {/* Link back to encyclopedia */}
            <div style={{ marginTop: 16 }}>
              <a
                href={encyclopediaUrl}
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
          </aside>
        </div>
      </div>
    </>
  )
}
