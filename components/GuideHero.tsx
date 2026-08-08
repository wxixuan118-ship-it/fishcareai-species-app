'use client'

import type { Species } from '@/types/species'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

interface Props {
  species: Species
}

export default function GuideHero({ species }: Props) {
  const imgSrc = `${SITE_URL}/assets/encyclopedia/real/${species.slug}-wikimedia-real.jpg`
  const fallbackSrc = `${SITE_URL}/assets/encyclopedia/generated-species/${species.slug}-fishcare-ai-fallback.svg`

  return (
    <section className="sp-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="sp-hero-img"
        src={imgSrc}
        alt={`${species.common_name} care guide — aquarium setup and tank requirements`}
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
          <a href={`${SITE_URL}/guides/`}>Guides</a>
          <span>/</span>
          <a href={`/species/${species.slug}`}>{species.common_name}</a>
          <span>/</span>
          <span style={{ color: 'rgba(255,255,255,.85)' }}>Care Guide</span>
        </div>

        <div className="sp-tag">🐟 Care Guide</div>

        <h1>{species.common_name} Care Guide</h1>
        <div className="sci-name">{species.scientific_name}</div>

        <div className="sp-meta-row">
          {species.environment?.min_tank_liters && (
            <div className="sp-meta-item">
              🪣 <strong>Min tank:</strong>&nbsp;
              {species.environment.min_tank_liters}L ({Math.round(species.environment.min_tank_liters * 0.264)} gal)
            </div>
          )}
          {species.environment && (
            <div className="sp-meta-item">
              🌡️ <strong>Temp:</strong>&nbsp;
              {species.environment.temp_min_c}–{species.environment.temp_max_c}°C
            </div>
          )}
          {species.environment && (
            <div className="sp-meta-item">
              ⚗️ <strong>pH:</strong>&nbsp;
              {species.environment.ph_min}–{species.environment.ph_max}
            </div>
          )}
          {species.difficulty_level && (
            <div className="sp-meta-item">
              ⭐ <strong>Care level:</strong>&nbsp;
              {species.difficulty_level.charAt(0).toUpperCase() + species.difficulty_level.slice(1)}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
