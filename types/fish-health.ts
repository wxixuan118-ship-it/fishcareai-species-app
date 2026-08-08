import type { Species } from './species'

// ─── Problem-level types ──────────────────────────────────────────────────────

export type Urgency = 'monitor' | 'urgent' | 'emergency'
export type ProblemCategory = 'behavioral' | 'physical' | 'disease'
export type Likelihood = 'high' | 'medium' | 'low'

// ─── JSONB field shapes ───────────────────────────────────────────────────────

export interface HealthCause {
  title:       string
  detail:      string
  likelihood:  Likelihood
}

export interface DiagnosisStep {
  step:   number
  action: string
  detail: string
  tool?:  string
}

export interface TreatmentStep {
  step:   number
  action: string
  detail: string
}

// ─── Database row types ───────────────────────────────────────────────────────

export interface HealthProblem {
  id:           string
  slug:         string
  problem_name: string
  category:     ProblemCategory
  description:  string | null
  urgency:      Urgency
  published:    boolean
}

export interface FishHealthContent {
  id:                string
  fish_id:           string
  problem_id:        string
  slug:              string
  intro:             string | null
  common_causes:     HealthCause[]
  diagnosis_steps:   DiagnosisStep[]
  treatment_steps:   TreatmentStep[]
  prevention:        string | null
  when_to_seek_help: string | null
  related_slugs:     string[]
  faq:               Array<{ q: string; a: string }>
  meta_title:        string | null
  meta_description:  string | null
  published:         boolean
  created_at:        string
  updated_at:        string
}

// ─── Species subset used on health pages ─────────────────────────────────────

export type SpeciesBrief = Pick<Species,
  | 'id'
  | 'slug'
  | 'common_name'
  | 'scientific_name'
  | 'family'
  | 'water_type'
  | 'difficulty_level'
  | 'environment'
>

// ─── Composed page type (content + species + problem joined) ──────────────────

export interface FishHealthPage {
  content: FishHealthContent
  species: SpeciesBrief
  problem: HealthProblem
}

// ─── Slim type for listing / related links ────────────────────────────────────

export interface HealthPageSummary {
  slug:         string
  fish_name:    string
  problem_name: string
  urgency:      Urgency
}
