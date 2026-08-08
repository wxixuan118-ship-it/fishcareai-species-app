// ─── Physical characteristics ────────────────────────────────────────────────
export interface SpeciesPhysical {
  size_cm: string
  lifespan_years: string
  color: string
  body_shape: string
}

// ─── Behavior traits ─────────────────────────────────────────────────────────
export interface SpeciesBehavior {
  temperament: string
  aggression_level: 'low' | 'medium' | 'high'
  schooling: boolean
  activity_level: 'low' | 'moderate' | 'high'
  notes?: string
}

// ─── Environment requirements ─────────────────────────────────────────────────
export interface SpeciesEnvironment {
  min_tank_liters: number
  temp_min_c: number
  temp_max_c: number
  ph_min: number
  ph_max: number
  hardness_dgh: string
  ammonia_ppm: number
  nitrite_ppm: number
  nitrate_ppm_max: number
}

// ─── Content sections for Encyclopedia page ──────────────────────────────────
export interface SpeciesSections {
  overview: string
  habitat: string
  appearance: string
  behavior_detail: string
  interesting_facts: string[]
}

// ─── Main species record ──────────────────────────────────────────────────────
export interface Species {
  id: string
  slug: string
  common_name: string
  scientific_name: string
  family: string | null
  genus: string | null
  origin: string | null
  water_type: 'freshwater' | 'saltwater' | 'brackish' | null
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null
  physical: SpeciesPhysical
  behavior: SpeciesBehavior
  environment: SpeciesEnvironment
  sections: SpeciesSections
  related_species: string[]
  meta_title: string | null
  meta_description: string | null
  schema_data: Record<string, unknown>[]
  published: boolean
  created_at: string
  updated_at: string
}

// ─── Tank setup ───────────────────────────────────────────────────────────────
export interface TankSetup {
  min_size_liters: number
  min_size_gallons: number
  substrate: string
  plants: string
  decor: string
  filtration: string
  lighting: string
  lid: string
}

// ─── Water parameters ─────────────────────────────────────────────────────────
export interface WaterParameters {
  temp: string
  temp_note?: string
  ph: string
  ph_note?: string
  hardness: string
  ammonia: string
  nitrite: string
  nitrate: string
  nitrate_note?: string
  dechlorination?: string
}

// ─── Feeding guide ────────────────────────────────────────────────────────────
export interface FeedingGuide {
  diet_type: string
  frequency: string
  portion: string
  staple: string
  treats: string[]
  avoid: string[]
  fasting?: string
}

// ─── Tank mates ───────────────────────────────────────────────────────────────
export interface TankMates {
  compatible: string[]
  incompatible: string[]
  notes: string
  min_tank_for_community?: number
}

// ─── Disease entry ────────────────────────────────────────────────────────────
export interface Disease {
  name: string
  symptoms: string
  cause: string
  treatment: string
}

// ─── Breeding info ────────────────────────────────────────────────────────────
export interface BreedingInfo {
  difficulty: string
  process: string
  separation?: string
  egg_care?: string
  fry_care?: string
  setup?: string
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
export interface FaqItem {
  q: string
  a: string
}

// ─── Species guide record ─────────────────────────────────────────────────────
export interface SpeciesGuide {
  id: string
  species_id: string
  beginner_overview: string | null
  tank_setup: TankSetup
  water_parameters: WaterParameters
  feeding_guide: FeedingGuide
  tank_mates: TankMates
  common_diseases: Disease[]
  breeding: BreedingInfo
  maintenance_schedule: string | null
  common_mistakes: string[]
  faq: FaqItem[]
  meta_title: string | null
  meta_description: string | null
  published: boolean
  created_at: string
  updated_at: string
}

// ─── Combined response types ──────────────────────────────────────────────────
export interface SpeciesWithGuide {
  species: Species
  guide: SpeciesGuide
}
