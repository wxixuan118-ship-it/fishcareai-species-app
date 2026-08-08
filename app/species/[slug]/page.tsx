import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSpeciesBySlug } from '@/lib/species'
import SpeciesHero from '@/components/SpeciesHero'
import QuickFactsCard from '@/components/QuickFactsCard'
import TableOfContents from '@/components/TableOfContents'
import WaterParamsTable from '@/components/WaterParamsTable'
import CalloutBox from '@/components/CalloutBox'
import RelatedSpeciesLinks from '@/components/RelatedSpeciesLinks'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

// The DB isn't reachable during the platform's Docker build step, so these
// pages must render per-request rather than being statically generated.
export const dynamic = 'force-dynamic'

const TOC_ITEMS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'classification',  label: 'Classification' },
  { id: 'habitat',         label: 'Natural Habitat' },
  { id: 'appearance',      label: 'Appearance' },
  { id: 'behavior',        label: 'Behavior' },
  { id: 'water',           label: 'Water Requirements' },
  { id: 'facts',           label: 'Interesting Facts' },
  { id: 'related',         label: 'Related Species' },
]

// ── Dynamic metadata ──────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const species = await getSpeciesBySlug(params.slug)
  if (!species) return { title: 'Species Not Found' }

  const title       = species.meta_title       ?? `${species.common_name} (${species.scientific_name}) — Species Profile | FishCare AI`
  const description = species.meta_description ?? `Full ${species.common_name} species profile: classification, natural habitat, water requirements, behavior, and care overview for ${species.scientific_name}.`
  const canonical   = `${SITE_URL}/species/${species.slug}`

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
          alt: `${species.common_name} — ${species.scientific_name}`,
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
export default async function SpeciesEncyclopediaPage(
  { params }: { params: { slug: string } }
) {
  const species = await getSpeciesBySlug(params.slug)
  if (!species) notFound()

  const canonical   = `${SITE_URL}/species/${species.slug}`
  const guideUrl    = `/species/${species.slug}/care-guide`

  // Schema.org JSON-LD
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Encyclopedia', item: `${SITE_URL}/wiki/` },
      { '@type': 'ListItem', position: 3, name: species.common_name, item: canonical },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${species.common_name} (${species.scientific_name}) — Complete Species Profile`,
    description: species.meta_description ?? '',
    url: canonical,
    image: `${SITE_URL}/assets/encyclopedia/real/${species.slug}-wikimedia-real.jpg`,
    datePublished: species.created_at,
    dateModified:  species.updated_at,
    author:    { '@type': 'Organization', name: 'FishCare AI Editorial Team' },
    publisher: { '@type': 'Organization', name: 'FishCare AI', url: SITE_URL },
    mainEntityOfPage: canonical,
  }

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Hero */}
      <SpeciesHero species={species} />

      {/* Body */}
      <div className="con">
        <div className="sp-layout">
          {/* ── Main content ────────────────────────────── */}
          <article className="artc" id="article">

            {/* Overview */}
            <h2 id="overview">Overview</h2>
            <p>{species.sections.overview}</p>

            <CalloutBox>
              <strong>Quick fact:</strong>{' '}
              {species.scientific_name} belongs to the family{' '}
              <em>{species.family}</em>. Care level:{' '}
              <strong>{species.difficulty_level}</strong>.
            </CalloutBox>

            {/* Classification */}
            <h2 id="classification">Scientific Classification</h2>
            <table className="ptbl">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Classification</th>
                </tr>
              </thead>
              <tbody>
                {species.family && (
                  <tr><td>Family</td><td>{species.family}</td></tr>
                )}
                {species.genus && (
                  <tr><td>Genus</td><td><em>{species.genus}</em></td></tr>
                )}
                <tr><td>Species</td><td><em>{species.scientific_name}</em></td></tr>
                {species.water_type && (
                  <tr>
                    <td>Water type</td>
                    <td style={{ textTransform: 'capitalize' }}>{species.water_type}</td>
                  </tr>
                )}
                {species.origin && (
                  <tr><td>Native range</td><td>{species.origin}</td></tr>
                )}
              </tbody>
            </table>

            {/* Habitat */}
            <h2 id="habitat">Natural Habitat</h2>
            <p>{species.sections.habitat}</p>

            {/* Appearance */}
            <h2 id="appearance">Appearance</h2>
            <p>{species.sections.appearance}</p>
            {species.physical?.color && (
              <CalloutBox>
                <strong>Coloration:</strong> {species.physical.color}
              </CalloutBox>
            )}

            {/* Behavior */}
            <h2 id="behavior">Behavior</h2>
            <p>{species.sections.behavior_detail}</p>
            {species.behavior && (
              <table className="ptbl">
                <thead>
                  <tr>
                    <th>Trait</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {species.behavior.temperament && (
                    <tr><td>Temperament</td><td>{species.behavior.temperament}</td></tr>
                  )}
                  <tr>
                    <td>Schooling</td>
                    <td>{species.behavior.schooling ? 'Yes' : 'No'}</td>
                  </tr>
                  {species.behavior.activity_level && (
                    <tr>
                      <td>Activity level</td>
                      <td style={{ textTransform: 'capitalize' }}>{species.behavior.activity_level}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            {species.behavior?.notes && (
              <CalloutBox variant="warn">
                <strong>Important:</strong> {species.behavior.notes}
              </CalloutBox>
            )}

            {/* Water requirements */}
            <h2 id="water">Water Requirements</h2>
            {species.environment && <WaterParamsTable env={species.environment} />}
            <CalloutBox variant="warn">
              <strong>Important:</strong> Always dechlorinate tap water before adding it to the tank. Chlorine and chloramines damage a fish&apos;s gills and reduce life expectancy.
            </CalloutBox>

            {/* Interesting facts */}
            {species.sections.interesting_facts?.length > 0 && (
              <>
                <h2 id="facts">Interesting Facts</h2>
                <ul>
                  {species.sections.interesting_facts.map((fact, i) => (
                    <li key={i}>{fact}</li>
                  ))}
                </ul>
              </>
            )}

            {/* CTA */}
            <div className="cta-box">
              <h4>📋 Full Care Guide</h4>
              <p>
                Ready to set up a tank for your {species.common_name}? The complete care guide covers
                tank setup, feeding schedule, common diseases, tank mates, and breeding.
              </p>
              <a className="btn" href={guideUrl}>
                Read {species.common_name} Care Guide →
              </a>
            </div>

            {/* Related */}
            <h2 id="related">Related Species</h2>
            <RelatedSpeciesLinks
              currentSlug={species.slug}
              relatedSlugs={species.related_species}
              speciesName={species.common_name}
            />

            {/* Editorial note */}
            <div className="abox" style={{ marginTop: 32 }}>
              <div className="aav">✓</div>
              <div>
                <strong>Editorial review</strong>
                <p>
                  This species profile was reviewed for biological accuracy and practical aquarium care guidance.
                  For suspected illness or disease, test your water parameters first and consult an aquatic
                  veterinarian if symptoms persist.
                </p>
              </div>
            </div>

          </article>

          {/* ── Sidebar ─────────────────────────────────── */}
          <aside className="sp-sidebar">
            <QuickFactsCard species={species} />
            <TableOfContents items={TOC_ITEMS} />
          </aside>
        </div>
      </div>
    </>
  )
}
