'use client'

import type { Species } from '@/types/species'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

interface Props {
  species: Species
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

const WATER_TYPE_LABEL: Record<string, string> = {
  freshwater: 'Freshwater',
  saltwater: 'Saltwater',
  brackish: 'Brackish',
}

export default function SpeciesHero({ species }: Props) {
  const imgSrc = `/assets/encyclopedia/real/${species.slug}-wikimedia-real.jpg`
  const fallbackSrc = `/assets/encyclopedia/generated-species/${species.slug}-fishcare-ai-fallback.svg`

  const waterLabel = species.water_type ? WATER_TYPE_LABEL[species.water_type] : 'Freshwater'
  const diffLabel  = species.difficulty_level ? DIFFICULTY_LABEL[species.difficulty_level] : ''

  return (
    <section className="sp-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="sp-hero-img"
        src={imgSrc}
        alt={`${species.common_name} (${species.scientific_name}) in aquarium`}
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
          <a href={`${SITE_URL}/wiki/`}>Encyclopedia</a>
          <span>/</span>
          <span style={{ color: 'rgba(255,255,255,.85)' }}>{species.common_name}</span>
        </div>

        <div className="sp-tag">
          🌿 {waterLabel} · {species.origin?.split('(')[0].trim() ?? 'Tropical'}
        </div>

        <h1>{species.common_name}</h1>
        <div className="sci-name">
          {species.scientific_name}
          {species.family ? ` — ${species.family}` : ''}
        </div>

        <div className="sp-meta-row">
          {species.origin && (
            <div className="sp-meta-item">
              🏠 <strong>Origin:</strong>&nbsp;{species.origin.split('(')[0].trim()}
            </div>
          )}
          {species.physical?.size_cm && (
            <div className="sp-meta-item">
              📏 <strong>Size:</strong>&nbsp;{species.physical.size_cm}
            </div>
          )}
          {species.physical?.lifespan_years && (
            <div className="sp-meta-item">
              ⏳ <strong>Lifespan:</strong>&nbsp;{species.physical.lifespan_years}
            </div>
          )}
          {diffLabel && (
            <div className="sp-meta-item">
              ⭐ <strong>Care level:</strong>&nbsp;{diffLabel}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
