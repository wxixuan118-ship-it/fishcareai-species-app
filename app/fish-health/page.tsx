import type { Metadata } from 'next'
import { getAllHealthProblems } from '@/lib/fish-health'
import type { ProblemCategory, Urgency } from '@/types/fish-health'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

export const metadata: Metadata = {
  title: 'Fish Health Problem Diagnosis Guide | FishCare AI',
  description:
    'Identify and treat common fish health problems. Browse 30+ symptoms by category — behavioral, physical, and disease — with step-by-step diagnosis and treatment guides.',
  alternates: {
    canonical: `${SITE_URL}/fish-health/`,
  },
}

// The DB isn't reachable during the platform's Docker build step, so this
// page must render per-request rather than being statically generated.
export const dynamic = 'force-dynamic'

const CATEGORY_META: Record<ProblemCategory, { label: string; icon: string; desc: string }> = {
  behavioral: {
    label: 'Behavioral',
    icon:  '🐟',
    desc:  'Changes in swimming pattern, eating, activity, or social behavior.',
  },
  physical: {
    label: 'Physical',
    icon:  '🔍',
    desc:  'Visible changes to body shape, color, fins, or scales.',
  },
  disease: {
    label: 'Disease & Infection',
    icon:  '🧫',
    desc:  'Parasites, bacterial infections, fungal growths, and viral conditions.',
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

export default async function FishHealthHubPage() {
  const problems = await getAllHealthProblems()

  const grouped = problems.reduce<Record<ProblemCategory, ProblemRow[]>>(
    (acc, p) => {
      acc[p.category] = acc[p.category] ?? []
      acc[p.category].push(p)
      return acc
    },
    {} as Record<ProblemCategory, ProblemRow[]>
  )

  const ORDER: ProblemCategory[] = ['behavioral', 'physical', 'disease']

  return (
    <>
      {/* Hero */}
      <section className="sp-hero" style={{ minHeight: 240 }}>
        <div className="sp-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(5,28,42,.92) 0%, rgba(11,50,80,.7) 100%)' }} />
        <div className="sp-hero-inner">
          <div className="breadcrumb">
            <a href={SITE_URL}>Home</a>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,.85)' }}>Fish Health</span>
          </div>
          <div className="sp-tag">Diagnosis Library</div>
          <h1>Fish Health Problem Guide</h1>
          <p className="sci-name" style={{ maxWidth: 560 }}>
            Browse {problems.length} common fish health problems. Each guide includes species-specific
            causes, step-by-step diagnosis, and treatment instructions.
          </p>
        </div>
      </section>

      <div className="con" style={{ padding: '36px 22px 60px' }}>

        {/* Category sections */}
        {ORDER.map((cat) => {
          const catProblems = grouped[cat] ?? []
          if (!catProblems.length) return null
          const meta = CATEGORY_META[cat]
          return (
            <section key={cat} id={cat} style={{ marginBottom: 52 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: '1.4rem' }}>{meta.icon}</span>
                <h2 style={{ borderTop: 'none', paddingTop: 0, margin: 0 }}>
                  {meta.label} Problems
                </h2>
              </div>
              <p style={{ marginBottom: 20 }}>{meta.desc}</p>

              <div className="guide-links" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {catProblems.map((p) => {
                  const badge = URGENCY_BADGE[p.urgency]
                  return (
                    <div
                      key={p.id}
                      style={{
                        background: '#fff',
                        border: '1px solid var(--bd)',
                        borderRadius: 10,
                        padding: '14px 16px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--tx)' }}>{p.problem_name}</strong>
                        <span className={badge.cls} style={{ flexShrink: 0, marginLeft: 6 }}>{badge.label}</span>
                      </div>
                      {p.description && (
                        <p style={{ fontSize: '0.82rem', margin: 0 }}>{p.description}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {/* CTA */}
        <div className="cta-box">
          <h4>🤖 Use the AI Symptom Checker</h4>
          <p>
            Not sure which problem applies? Describe your fish&apos;s symptoms to the FishCare AI
            and get an instant, personalized diagnosis with treatment steps.
          </p>
          <a className="btn" href={`${SITE_URL}/#symptom-checker`}>
            Open Symptom Checker →
          </a>
        </div>

      </div>
    </>
  )
}
