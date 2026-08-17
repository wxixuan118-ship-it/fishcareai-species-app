'use client'

import { useState, useMemo } from 'react'
import type { HealthSpeciesSummary } from '@/lib/fish-health'

interface Props {
  speciesList: HealthSpeciesSummary[]
}

export default function SpeciesSearch({ speciesList }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return speciesList
    return speciesList.filter(
      (s) =>
        s.common_name.toLowerCase().includes(q) ||
        s.scientific_name.toLowerCase().includes(q)
    )
  }, [query, speciesList])

  return (
    <>
      {/* Search input */}
      <div style={{ marginBottom: 20, position: 'relative', maxWidth: 420 }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--tx2)', fontSize: '1rem', pointerEvents: 'none',
        }}>
          🔍
        </span>
        <input
          type="search"
          placeholder="Search fish species…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px 10px 38px',
            border: '1px solid var(--bd)',
            borderRadius: 8,
            fontSize: '0.9rem',
            background: 'var(--bg)',
            color: 'var(--tx)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            type="button"
            aria-label="Clear search"
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--tx2)', fontSize: '1.1rem', lineHeight: 1, padding: 2,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Result count when filtering */}
      {query && (
        <p style={{ fontSize: '0.82rem', color: 'var(--tx2)', marginBottom: 14 }}>
          {filtered.length === 0
            ? 'No species found.'
            : `Showing ${filtered.length} of ${speciesList.length} species`}
        </p>
      )}

      {/* Species grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 10,
      }}>
        {filtered.map((s) => (
          <a
            key={s.slug}
            href={`/fish-health/fish/${s.slug}`}
            style={{
              display: 'block',
              background: 'var(--bg)',
              border: '1px solid var(--bd)',
              borderRadius: 8,
              padding: '10px 14px',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--tx)', marginBottom: 2 }}>
              {s.common_name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--tx2)', fontStyle: 'italic', marginBottom: 4 }}>
              {s.scientific_name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--p)' }}>
              {s.health_page_count} guides →
            </div>
          </a>
        ))}
      </div>
    </>
  )
}
