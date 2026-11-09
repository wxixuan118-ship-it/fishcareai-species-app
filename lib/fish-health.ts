import sql from './db'
import { RETIRED_HEALTH_SLUGS, isRetiredHealth, consolidatedFishUrl } from './consolidated'
import type {
  FishHealthPage,
  FishHealthContent,
  HealthProblem,
  SpeciesBrief,
  HealthPageSummary,
} from '@/types/fish-health'

// Retired slugs are excluded in SQL rather than filtered afterwards, so the
// per-species counts on the hub stay consistent with the links beneath them.
const RETIRED = RETIRED_HEALTH_SLUGS as string[]

export async function getFishHealthPage(slug: string): Promise<FishHealthPage | null> {
  // Returning null here makes both the route and its generateMetadata 404.
  if (isRetiredHealth(slug)) return null

  const [content] = await sql`
    SELECT * FROM fish_health_content WHERE slug = ${slug} AND published = true LIMIT 1
  `
  if (!content) return null

  const [species] = await sql`
    SELECT id, slug, common_name, scientific_name, family, water_type, difficulty_level, environment
    FROM species WHERE id = ${content.fish_id} LIMIT 1
  `
  if (!species) return null

  const [problem] = await sql`
    SELECT * FROM health_problems WHERE id = ${content.problem_id} LIMIT 1
  `
  if (!problem) return null

  return {
    content: content as FishHealthContent,
    species: species as SpeciesBrief,
    problem: problem as HealthProblem,
  }
}

export async function getAllHealthSlugs(): Promise<string[]> {
  const rows = await sql<{ slug: string }[]>`
    SELECT slug FROM fish_health_content
    WHERE published = true AND slug <> ALL(${RETIRED})
    ORDER BY slug
  `
  return rows.map(r => r.slug)
}

export async function getRelatedHealthPages(slugs: string[]): Promise<HealthPageSummary[]> {
  if (!slugs.length) return []

  const rows = await sql`
    SELECT
      fhc.slug,
      s.common_name AS fish_name,
      hp.problem_name,
      hp.urgency
    FROM fish_health_content fhc
    JOIN species s ON fhc.fish_id = s.id
    JOIN health_problems hp ON fhc.problem_id = hp.id
    WHERE fhc.slug = ANY(${slugs}) AND fhc.published = true
      AND fhc.slug <> ALL(${RETIRED})
  `
  return rows.map(r => ({
    slug:         r.slug as string,
    fish_name:    r.fish_name as string,
    problem_name: r.problem_name as string,
    urgency:      r.urgency as 'monitor' | 'urgent' | 'emergency',
  }))
}

export async function getHealthPagesByFish(fishSlug: string): Promise<HealthPageSummary[]> {
  const rows = await sql`
    SELECT
      fhc.slug,
      s.common_name AS fish_name,
      hp.problem_name,
      hp.urgency,
      hp.category
    FROM fish_health_content fhc
    JOIN species s ON fhc.fish_id = s.id
    JOIN health_problems hp ON fhc.problem_id = hp.id
    WHERE s.slug = ${fishSlug} AND fhc.published = true
      AND fhc.slug <> ALL(${RETIRED})
    ORDER BY fhc.slug
  `
  return rows.map(r => ({
    slug:         r.slug as string,
    fish_name:    r.fish_name as string,
    problem_name: r.problem_name as string,
    urgency:      r.urgency as 'monitor' | 'urgent' | 'emergency',
    category:     r.category as 'behavioral' | 'physical' | 'disease',
  }))
}

type HealthProblemSummary = Pick<
  HealthProblem,
  'id' | 'slug' | 'problem_name' | 'category' | 'description' | 'urgency'
>

export async function getAllHealthProblems(): Promise<HealthProblemSummary[]> {
  return await sql<HealthProblemSummary[]>`
    SELECT id, slug, problem_name, category, description, urgency
    FROM health_problems
    WHERE published = true
    ORDER BY category, problem_name
  `
}

export type HealthSpeciesSummary = {
  slug: string
  common_name: string
  scientific_name: string
  health_page_count: number
  first_health_slug: string
}

export async function getHealthSpeciesList(): Promise<HealthSpeciesSummary[]> {
  const rows = await sql<HealthSpeciesSummary[]>`
    SELECT
      s.slug,
      s.common_name,
      s.scientific_name,
      COUNT(fhc.id)::int AS health_page_count,
      MIN(fhc.slug)      AS first_health_slug
    FROM fish_health_content fhc
    JOIN species s ON fhc.fish_id = s.id
    WHERE fhc.published = true AND fhc.slug <> ALL(${RETIRED})
    GROUP BY s.slug, s.common_name, s.scientific_name
    ORDER BY s.common_name
  `
  // Two species rows can resolve to the same consolidated guide — Percula and
  // "True Percula" both point at /aquarium-fish-diseases/percula-.../ — so keep
  // only the first entry alphabetically instead of listing the same page twice.
  const seen = new Set<string>()
  return rows.filter((row) => {
    const target = consolidatedFishUrl(row.slug) ?? row.slug
    if (seen.has(target)) return false
    seen.add(target)
    return true
  })
}

export type HealthExample = {
  problem_id: string
  fish_slug:  string
  fish_name:  string
  slug:       string
}

// Example guide per problem for a handful of popular species, so the hub can
// link straight into leaf pages instead of only into the per-species listings.
export async function getHealthExamplesByProblem(fishSlugs: string[]): Promise<HealthExample[]> {
  if (!fishSlugs.length) return []
  const rows = await sql<HealthExample[]>`
    SELECT
      fhc.problem_id,
      s.slug        AS fish_slug,
      s.common_name AS fish_name,
      fhc.slug
    FROM fish_health_content fhc
    JOIN species s ON fhc.fish_id = s.id
    WHERE s.slug = ANY(${fishSlugs}) AND fhc.published = true
      AND fhc.slug <> ALL(${RETIRED})
    ORDER BY array_position(${fishSlugs}::text[], s.slug)
  `
  return rows
}
