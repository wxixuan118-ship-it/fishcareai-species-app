import { getAllSpecies } from '@/lib/species'
import SpeciesGrid from '@/components/SpeciesGrid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aquarium Fish Encyclopedia A–Z | FishCareAI',
  description: 'Browse 48+ freshwater and saltwater fish species profiles. Filter A–Z, find water parameters, tank size, diet, and care difficulty for every species.',
}

export default async function SpeciesIndexPage() {
  const species = await getAllSpecies()

  return (
    <main>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#0B3250 0%,#1B5E8B 65%,#2E84C0 100%)',
        padding: '60px 24px 40px',
        minHeight: 220,
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <nav style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.6)', marginBottom: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
            <a href="/" style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Home</a>
            <span style={{ color: 'rgba(255,255,255,.35)' }}>›</span>
            <span style={{ color: 'rgba(255,255,255,.9)' }}>Encyclopedia</span>
          </nav>
          <div style={{
            display: 'inline-block', padding: '3px 11px', borderRadius: 20,
            fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
            background: 'rgba(255,255,255,.18)', color: 'rgba(255,255,255,.92)', marginBottom: 10,
          }}>Fish Encyclopedia</div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, marginBottom: 10 }}>
            Aquarium Species A–Z
          </h1>
          <p style={{ color: 'rgba(255,255,255,.75)', maxWidth: 560, fontSize: '1rem', margin: 0 }}>
            {species.length}+ freshwater and saltwater species profiles — water parameters, tank size, diet, compatibility, and care difficulty.
          </p>
        </div>
      </div>

      {/* A-Z Grid (client component) */}
      {species.length > 0 ? (
        <SpeciesGrid species={species} />
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: '#5A7A94' }}>
          <p>No species profiles available yet. Check back soon.</p>
        </div>
      )}
    </main>
  )
}
