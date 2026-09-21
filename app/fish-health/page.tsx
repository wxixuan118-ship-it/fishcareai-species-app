import type { Metadata } from 'next'
import {
  getAllHealthProblems,
  getHealthSpeciesList,
  getHealthExamplesByProblem,
  type HealthExample,
} from '@/lib/fish-health'
import type { ProblemCategory, Urgency } from '@/types/fish-health'
import SpeciesSearch from '@/components/SpeciesSearch'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'
const CANONICAL = `${SITE_URL}/fish-health`
const HERO_IMAGE = `${SITE_URL}/assets/fish-health/fish-diseases-symptom-map.svg`

const PAGE_TITLE = 'Fish Diseases: Symptoms, Causes & Treatment'
const PAGE_DESCRIPTION =
  'Fish diseases guide: match 30 symptoms to ich, fin rot, fungus, dropsy, velvet and more, ' +
  'then open a diagnosis and treatment guide written for your species.'

// The layout template appends " | FishCare AI" (14 chars); keep the whole title ≤ 60.
export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: CANONICAL,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: CANONICAL,
    type: 'website',
    images: [{ url: HERO_IMAGE, width: 1200, height: 640 }],
  },
}

// The DB isn't reachable during the platform's Docker build step, so this
// page must render per-request rather than being statically generated.
export const dynamic = 'force-dynamic'

// Popular species whose leaf guides are linked from every symptom card.
const EXAMPLE_FISH = ['betta-fish', 'goldfish', 'guppy']

const CATEGORY_META: Record<ProblemCategory, { heading: string; icon: string; intro: string }> = {
  behavioral: {
    heading: 'Behavioral Signs of Fish Disease',
    icon:    '🐟',
    intro:
      'A change in how a fish acts — hiding, hovering at the surface, darting, refusing food or ' +
      'picking fights — is usually the first warning, and it often shows up a day or two before any ' +
      'physical symptom. Most behavior changes trace back to water quality, temperature or tank ' +
      'mates rather than a pathogen, so test the water before you reach for medication.',
  },
  physical: {
    heading: 'Physical Signs of Fish Disease',
    icon:    '🔍',
    intro:
      'Visible changes to the body or fins — fading colour, swelling, clamped or torn fins, a curved ' +
      'spine, trouble staying upright — narrow the diagnosis fast because each one has a short list ' +
      'of likely causes. These symptoms can be early signs of fish diseases or the result of injury, ' +
      'diet or poor water; the guides work through that list from most to least likely.',
  },
  disease: {
    heading: 'Infectious Fish Diseases',
    icon:    '🧫',
    intro:
      'Parasites, bacteria, fungi and viruses each leave a recognisable signature: white salt-grain ' +
      'spots, red streaks, cotton-like growth, rot at the fin edges, bulging or cloudy eyes. These ' +
      'are the classic fish diseases hobbyists ask about most, and every one of them spreads ' +
      'through a tank if it is not treated, so isolate the fish while you read the guide.',
  },
}

const URGENCY_BADGE: Record<Urgency, { label: string; cls: string }> = {
  monitor:   { label: 'Monitor',   cls: 'bdg bgood' },
  urgent:    { label: 'Urgent',    cls: 'bdg bwarn' },
  emergency: { label: 'Emergency', cls: 'bdg bdng' },
}

type ProblemRow = {
  id:           string
  slug:         string
  problem_name: string
  category:     ProblemCategory
  description:  string | null
  urgency:      Urgency
}

// The eight fish diseases behind most of the symptoms above, explained once
// here so a reader who already recognises the disease does not have to go
// through the symptom cards. `symptomSlug` is the health_problems.slug of the
// card each entry points back to.
const COMMON_DISEASES: Array<{
  heading:     string
  symptomSlug: string
  signs:       string
  cause:       string
  treatment:   string
}> = [
  {
    heading:     'White Spot Disease (Ich)',
    symptomSlug: 'white-spots',
    signs:       'Tiny white dots like grains of salt on the body and fins, flashing against objects, clamped fins and rapid breathing as the parasite reaches the gills.',
    cause:       'The ciliate parasite Ichthyophthirius multifiliis, almost always brought in on a new fish or plant and triggered by a temperature drop or stress.',
    treatment:   'Raise the temperature gradually to 28–30 °C (82–86 °F) to speed up the parasite\'s life cycle, add aquarium salt or a malachite-green/formalin medication, and keep treating for at least a week after the last spot disappears — the free-swimming stage is the only one medication can reach.',
  },
  {
    heading:     'Fin Rot in Fish',
    symptomSlug: 'fin-rot',
    signs:       'Fin edges turn milky, ragged or black and recede toward the body; in advanced cases the base of the fin reddens and the rot reaches the body.',
    cause:       'Opportunistic bacteria (Aeromonas, Pseudomonas, Flavobacterium) that take hold when ammonia, nitrite or nitrate is high, or after fin-nipping from tank mates.',
    treatment:   'Test the water and do a 30–50 % water change first — mild fin rot heals on clean water alone. Persistent cases need a broad-spectrum antibacterial in a hospital tank, and the nipping tank mate has to go.',
  },
  {
    heading:     'Fungal Fish Diseases (Saprolegnia)',
    symptomSlug: 'fuzzy-growth',
    signs:       'Cotton-wool tufts, white or grey, on the body, mouth or fins, usually growing over an existing wound or patch of missing scales.',
    cause:       'Water moulds that are always present in the tank and only colonise damaged tissue — so a fungal outbreak means something injured or weakened the fish first.',
    treatment:   'Move the fish to a hospital tank, treat with an antifungal (methylene blue or a malachite-green product) and fix the original injury or water problem. Cotton-mouth that does not respond is usually columnaris, a bacterium, and needs an antibacterial instead.',
  },
  {
    heading:     'Dropsy in Fish',
    symptomSlug: 'bloated',
    signs:       'A swollen abdomen with scales standing out like a pinecone, often with bulging eyes, pale gills and lethargy.',
    cause:       'Not one disease but a symptom of internal organ failure, most often a bacterial infection of the kidneys after long-term poor water quality or an internal parasite load.',
    treatment:   'Isolate immediately, add Epsom salt (1 tsp per 5 gallons) to draw off fluid, keep the water pristine and try a medicated food or antibacterial. Once the pinecone effect is obvious the prognosis is poor, so this is a disease to prevent rather than cure.',
  },
  {
    heading:     'Velvet Disease (Oodinium)',
    symptomSlug: 'spots-on-fins',
    signs:       'A gold or rust-coloured dust over the body and fins that is easiest to see with a torch in a dark room; fish flash, clamp their fins and breathe hard.',
    cause:       'The dinoflagellate parasite Oodinium (Piscinoodinium in freshwater, Amyloodinium in marine tanks). It spreads faster than ich and kills small fish quickly.',
    treatment:   'Dim the tank — the parasite photosynthesises — raise the temperature, and treat with copper or a malachite-green/acriflavine medication for the full course. Remove carbon from the filter while medicating.',
  },
  {
    heading:     'Popeye in Fish',
    symptomSlug: 'bulging-eyes',
    signs:       'One or both eyes swell outward from the socket; the eye may cloud over and the fish stops eating.',
    cause:       'One bulging eye is usually an injury; both eyes point to a systemic bacterial infection or poor water quality, and it is a common companion of dropsy.',
    treatment:   'Clean water and Epsom salt resolve most injury cases in a week or two. Bilateral popeye needs an antibacterial in a hospital tank and a hard look at nitrate levels.',
  },
  {
    heading:     'Swim Bladder Disease',
    symptomSlug: 'swimming-sideways',
    signs:       'The fish floats at the surface, sinks to the bottom or swims sideways and cannot hold a normal position, but otherwise looks alert.',
    cause:       'Usually constipation or gulped air from overfeeding dry food, especially in round-bodied goldfish and bettas; less often an infection, injury or a birth defect.',
    treatment:   'Fast the fish for two or three days, then feed a shelled, blanched pea or daphnia to clear the gut, and soak dry food before feeding from then on. If a fast does not help within a week, treat as a bacterial infection.',
  },
  {
    heading:     'Columnaris Disease in Fish',
    symptomSlug: 'mucus-coating',
    signs:       'A white or grey saddle-shaped patch across the back, fuzzy lips, excess slime coat, frayed fins and rapid gill movement — it looks like fungus but moves much faster.',
    cause:       'The bacterium Flavobacterium columnare, which thrives in warm, hard water with a high organic load and attacks stressed or overcrowded fish.',
    treatment:   'Lower the temperature a few degrees if the species allows, do large water changes and treat with an antibacterial that targets gram-negative bacteria (nitrofurazone, kanamycin) in a hospital tank. Fast-moving cases can kill within 48 hours, so start the same day.',
  },
]

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'What are the most common fish diseases in aquariums?',
    a: 'White spot disease (ich), fin rot, fungal infections, velvet, dropsy, popeye, columnaris and swim bladder disorder account for the large majority of cases hobbyists see. Ich and fin rot alone are behind most of the questions submitted to the FishCare AI symptom checker.',
  },
  {
    q: 'Is my fish sick or just stressed?',
    a: 'Stress shows as behaviour — hiding, clamped fins, faded colour, refusing food — with nothing visibly growing on the fish, and it improves within a day or two of fixing the cause. Fish diseases add physical signs that get worse over time: spots, fuzz, rot, swelling or red streaks. Test the water first; if it is fine and the sign is spreading, treat it as disease.',
  },
  {
    q: 'Can fish diseases spread to other fish in the tank?',
    a: 'Most infectious fish diseases — ich, velvet, columnaris, fin rot bacteria, fungus — spread through the water and will reach every fish in the tank. Move the sick fish to a hospital tank as soon as you spot a symptom, and treat the main tank too if the disease is parasitic.',
  },
  {
    q: 'Can aquarium fish diseases infect humans?',
    a: 'Very few. Fish tuberculosis (Mycobacterium marinum) can cause a skin infection through a cut on your hand, and Aeromonas can infect open wounds. Wear gloves if you have a cut, wash your hands after tank work, and never start a siphon with your mouth.',
  },
  {
    q: 'How long do fish diseases take to cure?',
    a: 'Mild fin rot and stress-related symptoms clear within a week of clean water. Ich needs 10–14 days of treatment to cover the parasite\'s full life cycle. Bacterial infections typically need a 5–10 day course of medication. Dropsy and advanced columnaris are often fatal even when treated, which is why prevention matters more than any medicine.',
  },
  {
    q: 'Which fish diseases does aquarium salt treat?',
    a: 'Salt at 1–3 teaspoons per gallon helps with ich, mild fungus, fin rot and external parasites, and Epsom salt helps with dropsy, popeye and constipation. Salt does not treat internal bacterial infections, and scaleless fish such as corydoras, loaches and plecos tolerate it poorly — use half strength or a medication instead.',
  },
]

function anchorId(slug: string) {
  return `symptom-${slug}`
}

export default async function FishHealthHubPage() {
  const [problems, speciesList, examples] = await Promise.all([
    getAllHealthProblems(),
    getHealthSpeciesList(),
    getHealthExamplesByProblem(EXAMPLE_FISH),
  ])

  const grouped = problems.reduce<Record<ProblemCategory, ProblemRow[]>>(
    (acc, p) => {
      acc[p.category] = acc[p.category] ?? []
      acc[p.category].push(p)
      return acc
    },
    {} as Record<ProblemCategory, ProblemRow[]>
  )

  const examplesByProblem = examples.reduce<Record<string, HealthExample[]>>((acc, e) => {
    ;(acc[e.problem_id] = acc[e.problem_id] ?? []).push(e)
    return acc
  }, {})

  const problemBySlug = new Map(problems.map((p) => [p.slug, p]))

  const ORDER: ProblemCategory[] = ['behavioral', 'physical', 'disease']
  const guideCount = speciesList.reduce((n, s) => n + s.health_page_count, 0)
  const guideCountText = guideCount.toLocaleString('en-US')

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',          item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Fish Diseases', item: CANONICAL },
    ],
  }

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': CANONICAL,
    url: CANONICAL,
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: 'FishCare AI', url: SITE_URL },
    primaryImageOfPage: { '@type': 'ImageObject', url: HERO_IMAGE, width: 1200, height: 640 },
    about: { '@type': 'Thing', name: 'Fish diseases' },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Fish disease symptoms',
      numberOfItems: problems.length,
      itemListElement: problems.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.problem_name,
        url: `${CANONICAL}#${anchorId(p.slug)}`,
      })),
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="sp-hero" style={{ minHeight: 260 }}>
        <div className="sp-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(5,28,42,.92) 0%, rgba(11,50,80,.7) 100%)' }} />
        <div className="sp-hero-inner">
          <div className="breadcrumb">
            <a href={SITE_URL}>Home</a>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,.85)' }}>Fish Diseases</span>
          </div>
          <div className="sp-tag">Fish Disease Library</div>
          <h1>Fish Diseases: Symptoms, Causes &amp; Treatment</h1>
          <p className="sci-name" style={{ maxWidth: 620, fontStyle: 'normal' }}>
            Identify fish diseases from what you can see — {problems.length} symptoms grouped by
            behaviour, body and infection — then open one of {guideCountText} diagnosis and
            treatment guides written for the exact species in your tank.
          </p>
        </div>
      </section>

      <div className="con" style={{ padding: '36px 22px 60px' }}>

        {/* Intro */}
        <section className="artc hub-copy" style={{ maxWidth: 860 }}>
          <p>
            Most fish diseases announce themselves the same way: a fish that stops eating, hides, or
            rubs against the decor, followed a day or two later by something you can see — white
            spots, ragged fins, a swollen belly, a cottony patch. The trouble is that the same sign can
            have five different causes, and the right treatment for a betta is not always right for a
            goldfish or a marine tang. This library is organised so you start from the symptom, rule
            out the water first, and only then reach for medication.
          </p>
          <p>
            Every one of the {problems.length} symptom cards below links to species-specific guides —
            {' '}{speciesList.length} freshwater and saltwater species, {guideCountText} guides in
            total — each with the likely causes ranked by probability, a step-by-step diagnosis, a
            treatment plan and the point at which you should isolate the fish or ask a vet. If you
            already know the disease, jump to the{' '}
            <a href="/fish-health#common-fish-diseases">eight most common fish diseases</a>; if you only know what
            the fish looks like, start with the map.
          </p>
        </section>

        {/* Symptom map */}
        <figure style={{ margin: '28px 0 8px', maxWidth: 860 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt="Fish diseases symptom map: where ich, fin rot, fungus, dropsy, popeye and swim bladder problems show on a fish's eyes, gills, fins, skin, belly and spine"
            width={1200}
            height={640}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: 'auto', borderRadius: 12, border: '1px solid var(--bd)', display: 'block' }}
          />
          <figcaption style={{ fontSize: '0.82rem', color: 'var(--mu)', marginTop: 8 }}>
            Where the common fish diseases show first. Match the area to a symptom group below.
          </figcaption>
        </figure>

        {/* Symptom cards by category */}
        <section className="artc hub-copy" id="symptoms" style={{ marginBottom: 12 }}>
          <h2>Fish Diseases by Symptom</h2>
          <p style={{ maxWidth: 860 }}>
            The badge on each card is how fast to act. <strong style={{ color: 'var(--ok)' }}>Monitor</strong> means
            watch for 24–48 hours while you correct the water; <strong style={{ color: 'var(--wn)' }}>Urgent</strong> means
            isolate and start treatment today; <strong style={{ color: 'var(--er)' }}>Emergency</strong> means the fish
            can die within hours without an immediate water change or extra oxygen. The guide links open
            the page for three of the most-kept species — use the species search further down for any other fish.
          </p>
        </section>

        {ORDER.map((cat) => {
          const catProblems = grouped[cat] ?? []
          if (!catProblems.length) return null
          const meta = CATEGORY_META[cat]
          return (
            <section key={cat} id={cat} style={{ marginBottom: 44 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: '1.3rem' }} aria-hidden="true">{meta.icon}</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{meta.heading}</h3>
              </div>
              <p style={{ marginBottom: 18, maxWidth: 860, lineHeight: 1.75 }}>{meta.intro}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                {catProblems.map((p) => {
                  const badge = URGENCY_BADGE[p.urgency]
                  const ex = examplesByProblem[p.id] ?? []
                  return (
                    <div
                      key={p.id}
                      id={anchorId(p.slug)}
                      style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--bd)',
                        borderRadius: 10,
                        padding: '14px 16px',
                        scrollMarginTop: 80,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--tx)' }}>{p.problem_name}</strong>
                        <span className={badge.cls} style={{ flexShrink: 0, marginLeft: 6 }}>{badge.label}</span>
                      </div>
                      {p.description && (
                        <p style={{ fontSize: '0.82rem', margin: '0 0 8px', lineHeight: 1.6 }}>{p.description}</p>
                      )}
                      {ex.length > 0 && (
                        <p style={{ fontSize: '0.78rem', margin: 0, color: 'var(--mu)' }}>
                          Guides:{' '}
                          {ex.map((e, i) => (
                            <span key={e.slug}>
                              {i > 0 && ' · '}
                              <a
                                href={`/fish-health/${e.slug}`}
                                title={`${e.fish_name} ${p.problem_name.toLowerCase()}`}
                                style={{ fontWeight: 600 }}
                              >
                                {e.fish_name}
                              </a>
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {/* Common diseases explained */}
        <section className="artc hub-copy" id="common-fish-diseases" style={{ maxWidth: 860, scrollMarginTop: 80 }}>
          <h2>Common Fish Diseases Explained</h2>
          <p>
            These eight conditions cover the large majority of sick-fish cases in home
            aquariums. Each entry gives the signs to look for, what actually causes it, and the
            treatment that works — then points you to the symptom card so you can open a guide for
            your own species.
          </p>
          {COMMON_DISEASES.map((d) => {
            const card = problemBySlug.get(d.symptomSlug)
            return (
              <div key={d.symptomSlug} style={{ marginBottom: 6 }}>
                <h3>{d.heading}</h3>
                <p><strong>Signs:</strong> {d.signs}</p>
                <p><strong>Cause:</strong> {d.cause}</p>
                <p>
                  <strong>Treatment:</strong> {d.treatment}
                  {card && (
                    <>
                      {' '}<a href={`/fish-health#${anchorId(card.slug)}`}>Species guides for {card.problem_name.toLowerCase()} →</a>
                    </>
                  )}
                </p>
              </div>
            )
          })}
        </section>

        {/* Diagnosis */}
        <section className="artc hub-copy" id="diagnose" style={{ maxWidth: 860 }}>
          <h2>How to Diagnose Fish Diseases</h2>
          <p>
            Nine out of ten fish diseases are either caused or made worse by the water, so the
            diagnosis always starts there. Work through these steps in order before you medicate —
            treating a water problem with antibiotics wastes the medication and stresses the fish
            further.
          </p>
          <ol>
            <li>
              <strong>Test the water.</strong> Ammonia and nitrite should be 0 ppm, nitrate under 20–40 ppm,
              and pH and temperature inside the range for your species. Run your readings through the{' '}
              <a href={`${SITE_URL}/tools/water-parameter-checker/`}>water parameter checker</a> to
              see which value is out of range.
            </li>
            <li>
              <strong>Look at the whole tank.</strong> One sick fish points to injury, bullying or an
              individual weakness; several fish with the same sign points to water quality or a
              contagious disease. Check whether anything was added in the last two weeks — a new fish,
              plant or decoration is the usual route in for parasites.
            </li>
            <li>
              <strong>Match the symptom.</strong> Find the card above that best describes what you see.
              If the fish shows several signs, start with the most specific one — white spots beat
              &ldquo;lethargic&rdquo;, red streaks beat &ldquo;hiding&rdquo; — because the specific sign has fewer
              possible causes.
            </li>
            <li>
              <strong>Open the guide for your species.</strong> Causes are ranked differently for
              different fish: swim bladder trouble is almost always diet in a fancy goldfish but
              usually water in a tetra. The species guide lists the causes in the right order for
              that fish and gives the diagnosis checks for each.
            </li>
            <li>
              <strong>Isolate before you treat.</strong> A bare hospital tank with a heater, a sponge
              filter and daily water changes lets you dose accurately, protects the main tank&apos;s
              biofilter and plants from the medication, and stops an infectious disease reaching the
              other fish.
            </li>
          </ol>
          <div className="callout callout-warn">
            <strong>Not sure which card fits?</strong> Describe the fish to the{' '}
            <a href={`${SITE_URL}/#symptom-checker`}>FishCare AI symptom checker</a> — it asks the
            follow-up questions a vet would and points you to the most likely guide.
          </div>
        </section>

        {/* Causes */}
        <section className="artc hub-copy" id="causes" style={{ maxWidth: 860 }}>
          <h2>What Causes Fish Diseases</h2>
          <p>
            Almost every pathogen behind the common fish diseases is already in the tank, on the fish
            or in the tap water. Healthy fish with an intact slime coat and a working immune system
            shrug them off; disease breaks out when something weakens the fish. In practice that
            something is nearly always one of five things:
          </p>
          <ul>
            <li>
              <strong>Poor water quality.</strong> Ammonia and nitrite burn gills and skin, chronic
              nitrate suppresses the immune system, and both invite bacterial fish diseases such as
              fin rot, columnaris and dropsy. Weekly water changes and a cycled filter prevent more
              disease than any medication.
            </li>
            <li>
              <strong>New arrivals without quarantine.</strong> Ich, velvet, flukes and internal worms
              arrive on new fish and plants. Two to four weeks in a quarantine tank catches almost all
              of them before they reach the display tank.
            </li>
            <li>
              <strong>Stress from stocking and tank mates.</strong> An overstocked tank, an aggressive
              tank mate or a shoaling species kept alone keeps stress hormones high and the immune
              system low. The{' '}
              <a href={`${SITE_URL}/tools/fish-compatibility-checker/`}>fish compatibility checker</a> and{' '}
              <a href={`${SITE_URL}/tools/tank-size-calculator/`}>tank size calculator</a> flag both
              problems before they cause disease.
            </li>
            <li>
              <strong>Temperature swings.</strong> A heater failure or a cold water change is the
              classic trigger for an ich outbreak, and a tank that runs too warm for the species
              breeds columnaris. Keep a thermometer where you can see it every day.
            </li>
            <li>
              <strong>Diet.</strong> Overfeeding fouls the water and causes bloat and swim bladder
              trouble; a diet of one dry food for months causes deficiencies that show as faded colour
              and a sunken belly. The{' '}
              <a href={`${SITE_URL}/tools/fish-feeding-calculator/`}>fish feeding calculator</a> gives
              a portion size for your stocking.
            </li>
          </ul>
        </section>

        {/* Treatment */}
        <section className="artc hub-copy" id="treatment" style={{ maxWidth: 860 }}>
          <h2>Treating Fish Diseases</h2>
          <p>
            Fish diseases fall into four treatment groups, and using the right group matters more
            than the brand on the bottle. <strong>External parasites</strong> (ich, velvet, flukes)
            respond to heat, salt and malachite green, formalin or copper. <strong>Bacterial
            infections</strong> (fin rot, columnaris, red streaks, popeye, dropsy) need an
            antibacterial — nitrofurazone, kanamycin or erythromycin depending on whether the
            bacterium is gram-negative or gram-positive. <strong>Fungus</strong> responds to
            methylene blue or malachite green. <strong>Internal parasites</strong> (worms, hexamita)
            need medicated food containing praziquantel, levamisole or metronidazole.
          </p>
          <p>
            Whatever you use: remove activated carbon from the filter so it does not strip the
            medication, dose for the actual water volume rather than the tank&apos;s nominal size,
            run the full course even after the fish looks better, and add an airstone because most
            medications lower dissolved oxygen. If two courses of the correct medication do not help,
            or the fish is a valuable specimen, an aquatic veterinarian can take a skin scrape or gill
            biopsy and identify the pathogen under a microscope — the{' '}
            <a href="https://www.merckvetmanual.com/exotic-and-laboratory-animals/aquarium-fishes" rel="noopener" target="_blank">
              Merck Veterinary Manual&apos;s aquarium fish chapter
            </a>{' '}
            and the{' '}
            <a href="https://edis.ifas.ufl.edu/publication/FA004" rel="noopener" target="_blank">
              University of Florida&apos;s Introduction to Fish Health Management
            </a>{' '}
            are the references most fish vets work from.
          </p>
        </section>

        {/* Prevention */}
        <section className="artc hub-copy" id="prevention" style={{ maxWidth: 860 }}>
          <h2>Preventing Fish Diseases</h2>
          <p>
            Prevention is cheaper and far more reliable than treatment, and it comes down to a
            short routine: a 25–30 % water change every week with dechlorinated water at tank
            temperature; a filter that is rinsed in old tank water rather than replaced; feeding
            only what the fish finish in two minutes, with one fasting day a week; quarantine for
            every new fish and plant; and a compatible, correctly sized community planned with the{' '}
            <a href={`${SITE_URL}/tools/aquarium-planner/`}>aquarium planner</a> before the fish are
            bought. Watch the fish for a minute at every feeding — the behavioral signs at the top of
            this page are the earliest warning you will get, and fish diseases caught at that stage
            almost always recover.
          </p>
        </section>

        {/* Browse by Fish Species */}
        <section id="by-species" style={{ marginBottom: 52, scrollMarginTop: 80 }}>
          <h2 style={{ borderTop: 'none', paddingTop: 0, marginBottom: 8 }}>Fish Diseases by Species</h2>
          <p style={{ marginBottom: 20, maxWidth: 860, lineHeight: 1.75 }}>
            Every species page lists all {problems.length} symptom guides for that fish — the same
            fish diseases, with the causes, medication tolerances and water ranges adjusted for that
            species. Search by common or scientific name.
          </p>
          <SpeciesSearch speciesList={speciesList} />
        </section>

        {/* FAQ */}
        <section className="artc hub-copy" id="faq" style={{ maxWidth: 860 }}>
          <h2>Fish Diseases FAQ</h2>
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <div className="cta-box" style={{ maxWidth: 860 }}>
          <h3>🤖 Use the AI Fish Disease Symptom Checker</h3>
          <p>
            Not sure which fish disease you are looking at? Describe your fish&apos;s symptoms to
            FishCare AI and get an instant, species-specific diagnosis with treatment steps.
          </p>
          <a className="btn" href={`${SITE_URL}/#symptom-checker`}>
            Open Symptom Checker →
          </a>
        </div>

      </div>
    </>
  )
}
