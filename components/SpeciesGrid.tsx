'use client'

import { useState } from 'react'

interface SpeciesRow {
  slug: string
  common_name: string
  scientific_name: string
  water_type: string | null
  difficulty_level: string | null
  family: string | null
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function difficultyBadge(level: string | null) {
  const map: Record<string, { label: string; color: string }> = {
    beginner:     { label: 'Beginner',     color: '#27AE60' },
    intermediate: { label: 'Intermediate', color: '#F39C12' },
    advanced:     { label: 'Advanced',     color: '#E74C3C' },
  }
  const d = map[level ?? ''] ?? { label: 'Beginner', color: '#27AE60' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: '.7rem', fontWeight: 700, color: '#fff',
      background: d.color, letterSpacing: '.03em',
    }}>{d.label}</span>
  )
}

function waterBadge(wtype: string | null) {
  const label = wtype === 'saltwater' ? 'Marine'
    : wtype === 'brackish' ? 'Brackish' : 'Freshwater'
  return (
    <span style={{
      position: 'absolute', top: 10, left: 10,
      background: 'rgba(15,61,110,.85)', color: '#fff',
      fontSize: '.65rem', fontWeight: 700, letterSpacing: '.08em',
      textTransform: 'uppercase', padding: '3px 9px', borderRadius: 50,
    }}>{label}</span>
  )
}

export default function SpeciesGrid({ species }: { species: SpeciesRow[] }) {
  const [active, setActive] = useState('all')

  const letters = Array.from(
    new Set(species.map(s => s.common_name[0].toUpperCase()))
  ).sort()

  const filtered = active === 'all'
    ? species
    : species.filter(s => s.common_name[0].toUpperCase() === active)

  return (
    <>
      {/* A-Z filter */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 0' }}>
        <div style={{ fontSize: '.78rem', fontWeight: 800, color: '#0F3D5E', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Species A–Z
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} role="group" aria-label="Filter by letter">
          {['all', ...letters].map(l => (
            <button
              key={l}
              onClick={() => setActive(l)}
              aria-pressed={active === l}
              style={{
                border: `1.5px solid ${active === l ? '#1B5E8B' : '#D0E4F0'}`,
                background: active === l ? '#1B5E8B' : 'rgba(255,255,255,.82)',
                color: active === l ? '#fff' : '#5A7A94',
                borderRadius: 9, padding: '5px 12px',
                fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
                transition: 'all .15s',
                textTransform: l === 'all' ? 'none' : 'uppercase',
              }}
            >
              {l === 'all' ? 'All' : l}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: '.8rem', color: '#5A7A94' }}>
          {filtered.length} {filtered.length === 1 ? 'species' : 'species'}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 22,
        maxWidth: 1200, margin: '24px auto 70px',
        padding: '0 24px',
      }}>
        {filtered.map(sp => (
          <a
            key={sp.slug}
            href={`/species/${sp.slug}`}
            title={`${sp.common_name} Care Profile`}
            style={{
              textDecoration: 'none',
              background: 'rgba(255,255,255,.9)',
              border: '1.5px solid rgba(191,228,246,.95)',
              borderRadius: 20, overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 14px 34px rgba(15,61,110,.09)',
              transition: 'transform .2s, box-shadow .2s, border-color .2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-5px)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 24px 48px rgba(15,61,110,.16)'
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(70,182,232,.95)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = ''
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 14px 34px rgba(15,61,110,.09)'
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(191,228,246,.95)'
            }}
          >
            {/* Image placeholder with water type badge */}
            <div style={{ position: 'relative', height: 160, background: 'linear-gradient(135deg,#0B3250,#1B5E8B)', overflow: 'hidden' }}>
              <img
                src={`/assets/encyclopedia/real/${sp.slug}-wikimedia-real.jpg`}
                alt={sp.common_name}
                width={400} height={260}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
              {waterBadge(sp.water_type)}
            </div>

            {/* Body */}
            <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <strong style={{ fontSize: '1rem', color: '#1A2B3C', fontWeight: 700 }}>{sp.common_name}</strong>
              <em style={{ fontSize: '.82rem', color: '#5A7A94' }}>{sp.scientific_name}</em>
              {sp.family && (
                <span style={{ fontSize: '.75rem', color: '#8AABB8' }}>Family: {sp.family}</span>
              )}
              <div style={{ marginTop: 8 }}>
                {difficultyBadge(sp.difficulty_level)}
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  )
}
