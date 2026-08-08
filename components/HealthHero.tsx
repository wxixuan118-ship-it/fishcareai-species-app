'use client'

import type { Urgency } from '@/types/fish-health'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

interface Props {
  fishName:       string
  fishSlug:       string
  scientificName: string
  problemName:    string
  urgency:        Urgency
  category:       string
}

const URGENCY_LABEL: Record<Urgency, string> = {
  monitor:   '🔍 Monitor',
  urgent:    '⚠️ Urgent',
  emergency: '🚨 Emergency',
}

export default function HealthHero({
  fishName,
  fishSlug,
  scientificName,
  problemName,
  urgency,
  category,
}: Props) {
  const imgSrc     = `${SITE_URL}/assets/encyclopedia/real/${fishSlug}-wikimedia-real.jpg`
  const fallbackSrc = `${SITE_URL}/assets/encyclopedia/generated-species/${fishSlug}-fishcare-ai-fallback.svg`

  return (
    <section className="sp-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="sp-hero-img"
        src={imgSrc}
        alt={`${fishName} — ${problemName}`}
        onError={(e) => {
          const img = e.currentTarget
          if (img.src !== fallbackSrc) img.src = fallbackSrc
        }}
        width={1280}
        height={340}
      />
      <div className="sp-hero-overlay" />
      <div className="sp-hero-inner">
        <div className="breadcrumb">
          <a href={SITE_URL}>Home</a>
          <span>/</span>
          <a href={`${SITE_URL}/fish-health/`}>Fish Health</a>
          <span>/</span>
          <span style={{ color: 'rgba(255,255,255,.85)' }}>
            {fishName} — {problemName}
          </span>
        </div>

        <div className="sp-tag" style={{ textTransform: 'capitalize' }}>
          {URGENCY_LABEL[urgency]} · {category}
        </div>

        <h1>Why Is My {fishName} {problemName}?</h1>
        <div className="sci-name">{scientificName}</div>

        <div className="sp-meta-row">
          <div className="sp-meta-item">
            🐟 <strong>Species:</strong>&nbsp;{fishName}
          </div>
          <div className="sp-meta-item">
            🔬 <strong>Problem:</strong>&nbsp;{problemName}
          </div>
          <div className="sp-meta-item" style={{ textTransform: 'capitalize' }}>
            📋 <strong>Category:</strong>&nbsp;{category}
          </div>
          <div className="sp-meta-item" style={{ textTransform: 'capitalize' }}>
            ⚡ <strong>Urgency:</strong>&nbsp;{urgency}
          </div>
        </div>
      </div>
    </section>
  )
}
