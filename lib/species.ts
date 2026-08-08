import sql from './db'
import type { Species, SpeciesGuide } from '@/types/species'

export async function getSpeciesBySlug(slug: string): Promise<Species | null> {
  const rows = await sql<Species[]>`
    SELECT * FROM species WHERE slug = ${slug} AND published = true LIMIT 1
  `
  return rows[0] ?? null
}

export async function getSpeciesGuide(slug: string): Promise<{ species: Species; guide: SpeciesGuide } | null> {
  const species = await getSpeciesBySlug(slug)
  if (!species) return null

  const rows = await sql<SpeciesGuide[]>`
    SELECT * FROM species_guides WHERE species_id = ${species.id} AND published = true LIMIT 1
  `
  const guide = rows[0]
  if (!guide) return null
  return { species, guide }
}

type SpeciesSummary = Pick<
  Species,
  'slug' | 'common_name' | 'scientific_name' | 'water_type' | 'difficulty_level' | 'family'
>

export async function getAllSpecies(): Promise<SpeciesSummary[]> {
  return await sql<SpeciesSummary[]>`
    SELECT slug, common_name, scientific_name, water_type, difficulty_level, family
    FROM species WHERE published = true ORDER BY common_name
  `
}

export async function getAllSpeciesSlugs(): Promise<string[]> {
  const rows = await sql<{ slug: string }[]>`
    SELECT slug FROM species WHERE published = true ORDER BY common_name
  `
  return rows.map(r => r.slug)
}

export async function getAllGuidesSlugs(): Promise<string[]> {
  const rows = await sql<{ slug: string }[]>`
    SELECT s.slug
    FROM species_guides sg
    JOIN species s ON sg.species_id = s.id
    WHERE sg.published = true AND s.published = true
  `
  return rows.map(r => r.slug)
}
