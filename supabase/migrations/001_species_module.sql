-- ============================================================
-- FishCareAI · Species Module
-- Migration: 001_species_module.sql
-- Creates:   species, species_guides
-- Safe:      Does NOT touch cms_pages or any existing tables
-- Run in:    Supabase Dashboard → SQL Editor
-- ============================================================


-- ──────────────────────────────────────────────────────────
-- TABLE: species
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS species (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        NOT NULL UNIQUE,
  common_name      TEXT        NOT NULL,
  scientific_name  TEXT        NOT NULL,
  family           TEXT,
  genus            TEXT,
  origin           TEXT,
  water_type       TEXT        CHECK (water_type IN ('freshwater', 'saltwater', 'brackish')),
  difficulty_level TEXT        CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),

  -- Structured data (JSONB)
  -- physical: { "size_cm": "5–7", "lifespan_years": "2–4", "color": "varies", "body_shape": "..." }
  physical         JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- behavior: { "temperament": "aggressive", "aggression_level": "high", "schooling": false, "activity_level": "moderate", "notes": "..." }
  behavior         JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- environment: { "min_tank_liters": 19, "temp_min_c": 24, "temp_max_c": 28, "ph_min": 6.5, "ph_max": 7.5, "hardness_dgh": "3–12", "ammonia_ppm": 0, "nitrite_ppm": 0, "nitrate_ppm_max": 20 }
  environment      JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- sections: { "overview": "...", "habitat": "...", "appearance": "...", "behavior_detail": "...", "interesting_facts": [...] }
  sections         JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- related_species: array of slugs e.g. ['neon-tetra', 'corydoras']
  related_species  TEXT[]      NOT NULL DEFAULT '{}',

  -- SEO
  meta_title       TEXT,
  meta_description TEXT,
  schema_data      JSONB       NOT NULL DEFAULT '[]'::jsonb,

  -- Status
  published        BOOLEAN     NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_species_slug        ON species (slug);
CREATE INDEX IF NOT EXISTS idx_species_water_type  ON species (water_type);
CREATE INDEX IF NOT EXISTS idx_species_difficulty  ON species (difficulty_level);
CREATE INDEX IF NOT EXISTS idx_species_published   ON species (published);


-- ──────────────────────────────────────────────────────────
-- TABLE: species_guides
-- One-to-one with species via species_id FK
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS species_guides (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id           UUID        NOT NULL UNIQUE REFERENCES species(id) ON DELETE CASCADE,

  beginner_overview    TEXT,

  -- tank_setup: { "min_size_liters": 19, "min_size_gallons": 5, "substrate": "...", "plants": "...", "decor": "...", "filtration": "...", "lighting": "...", "lid": "..." }
  tank_setup           JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- water_parameters: { "temp": "24–28°C", "ph": "6.5–7.5", "hardness": "3–12 dGH", "ammonia": "0", "nitrite": "0", "nitrate": "<20 ppm" }
  water_parameters     JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- feeding_guide: { "diet_type": "carnivore", "frequency": "...", "staple": "...", "treats": [...], "avoid": [...], "fasting": "..." }
  feeding_guide        JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- tank_mates: { "compatible": [...], "incompatible": [...], "notes": "...", "min_tank_for_community": 57 }
  tank_mates           JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- common_diseases: [{ "name": "...", "symptoms": "...", "cause": "...", "treatment": "..." }]
  common_diseases      JSONB       NOT NULL DEFAULT '[]'::jsonb,

  -- breeding: { "difficulty": "...", "process": "...", "separation": "...", "egg_care": "...", "fry_care": "...", "setup": "..." }
  breeding             JSONB       NOT NULL DEFAULT '{}'::jsonb,

  maintenance_schedule TEXT,

  -- common_mistakes: plain text array
  common_mistakes      TEXT[]      NOT NULL DEFAULT '{}',

  -- faq: [{ "q": "...", "a": "..." }]
  faq                  JSONB       NOT NULL DEFAULT '[]'::jsonb,

  -- SEO overrides (optional; falls back to species.meta_title / meta_description)
  meta_title           TEXT,
  meta_description     TEXT,

  published            BOOLEAN     NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_species_guides_species_id ON species_guides (species_id);


-- ──────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at trigger
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_species_updated_at       ON species;
DROP TRIGGER IF EXISTS trg_species_guides_updated_at ON species_guides;

CREATE TRIGGER trg_species_updated_at
  BEFORE UPDATE ON species
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_species_guides_updated_at
  BEFORE UPDATE ON species_guides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ──────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────
ALTER TABLE species        ENABLE ROW LEVEL SECURITY;
ALTER TABLE species_guides ENABLE ROW LEVEL SECURITY;

-- Public read (anon key): published rows only
DROP POLICY IF EXISTS "anon can read published species" ON species;
CREATE POLICY "anon can read published species"
  ON species FOR SELECT TO anon
  USING (published = true);

DROP POLICY IF EXISTS "anon can read published guides" ON species_guides;
CREATE POLICY "anon can read published guides"
  ON species_guides FOR SELECT TO anon
  USING (published = true);

-- Authenticated (admin dashboard): full access
DROP POLICY IF EXISTS "authenticated full access species" ON species;
CREATE POLICY "authenticated full access species"
  ON species FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated full access guides" ON species_guides;
CREATE POLICY "authenticated full access guides"
  ON species_guides FOR ALL TO authenticated
  USING (true) WITH CHECK (true);


-- ──────────────────────────────────────────────────────────
-- SEED DATA: Betta Fish
-- ──────────────────────────────────────────────────────────
INSERT INTO species (
  slug, common_name, scientific_name,
  family, genus, origin, water_type, difficulty_level,
  physical, behavior, environment, sections, related_species,
  meta_title, meta_description, published
) VALUES (
  'betta-fish',
  'Betta Fish',
  'Betta splendens',
  'Osphronemidae',
  'Betta',
  'Southeast Asia (Thailand, Cambodia, Vietnam, Laos)',
  'freshwater',
  'beginner',
  '{"size_cm": "5–7 cm (2–3 in)", "lifespan_years": "2–4 years", "color": "Highly variable — red, blue, green, purple, white, marble, dragon scale", "body_shape": "Laterally compressed; elongated finnage in males"}',
  '{"temperament": "Aggressive toward conspecific males", "aggression_level": "high", "schooling": false, "activity_level": "moderate", "notes": "Males must never share a tank. Peaceful toward most non-similar species."}',
  '{"min_tank_liters": 19, "temp_min_c": 24, "temp_max_c": 28, "ph_min": 6.5, "ph_max": 7.5, "hardness_dgh": "3–12", "ammonia_ppm": 0, "nitrite_ppm": 0, "nitrate_ppm_max": 20}',
  '{
    "overview": "The betta fish — also called the Siamese fighting fish — is one of the most recognisable freshwater fish in the world. Males display spectacular finnage in nearly every color imaginable. Despite their reputation as fighters, bettas are complex, curious animals that respond to their keepers and can build bubble nests even in a basic aquarium.",
    "habitat": "Wild bettas inhabit rice paddies, slow-moving streams, roadside ditches, and shallow ponds across Thailand, Cambodia, Vietnam, and Laos. These environments are warm (25–30°C), often oxygen-poor, and heavily vegetated. Bettas evolved remarkable tolerance for fluctuating conditions, and their labyrinth organ allows them to breathe surface air directly.",
    "appearance": "Aquarium bettas show extraordinary variation in fin shape and color pattern. Common tail types include: Veil tail (most common, long flowing fins), Halfmoon (180° caudal spread), Crowntail (spiky crown effect), Double tail (split caudal fin), and Plakat (short-finned, closer to wild-type). Female bettas are smaller with shorter fins and less intense coloration.",
    "behavior_detail": "Male bettas are highly territorial toward other males and toward fish with long, flowing fins that resemble rival bettas. They establish territories and flare aggressively at perceived threats — even their own reflection. Despite this, many individual bettas coexist peacefully with suitable tank mates in sufficiently large, well-planted tanks.",
    "interesting_facts": [
      "Bettas are labyrinth fish — a specialized organ lets them breathe oxygen directly from surface air.",
      "Male bettas build bubble nests at the water surface using saliva, even without a mate present.",
      "Bettas can recognize their owners and often swim to the front of the tank when a familiar person approaches.",
      "The genus Betta contains over 70 recognized species; most are smaller and drabber than the aquarium betta.",
      "In Thailand, bettas were originally selectively bred for fighting, not for their spectacular appearance."
    ]
  }',
  ARRAY['neon-tetra', 'corydoras', 'guppy', 'dwarf-gourami'],
  'Betta Fish (Betta splendens) — Complete Species Profile | FishCare AI',
  'Full Betta Fish species profile: scientific classification, natural habitat, water requirements, behavior, tank setup, diet, and lifespan for Betta splendens.',
  true
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO species_guides (
  species_id,
  beginner_overview,
  tank_setup,
  water_parameters,
  feeding_guide,
  tank_mates,
  common_diseases,
  breeding,
  maintenance_schedule,
  common_mistakes,
  faq,
  meta_title,
  meta_description,
  published
)
SELECT
  id,
  'Betta fish are an excellent choice for beginners — hardy, forgiving of minor husbandry mistakes, and rewarding to observe. The most important factors for a healthy betta are warm, stable water (a heater is non-negotiable), a gentle filter, and a tank of at least 5 gallons. Get these right and your betta will thrive.',
  '{"min_size_liters": 19, "min_size_gallons": 5, "substrate": "Fine gravel or sand — dark substrates enhance betta coloration", "plants": "Live or silk plants: Java fern, Anubias, Amazon sword. Avoid sharp plastic plants that tear fins.", "decor": "Caves, coconut shell hides, broad leaves for resting near the surface", "filtration": "Sponge filter or baffle-equipped HOB filter — bettas dislike strong current", "lighting": "Moderate; 8–10 hours/day on a timer", "lid": "Tight-fitting lid essential — bettas are skilled jumpers"}',
  '{"temp": "24–28°C (76–82°F)", "temp_note": "Use a reliable adjustable heater — cold water suppresses immunity", "ph": "6.5–7.5", "ph_note": "Tolerates a wide range; avoid sudden swings", "hardness": "3–12 dGH", "ammonia": "0 ppm", "nitrite": "0 ppm", "nitrate": "<20 ppm", "nitrate_note": "Manage with 20–30% weekly water changes", "dechlorination": "Always dechlorinate tap water before adding to the tank"}',
  '{"diet_type": "Carnivore", "frequency": "Once or twice daily", "portion": "Only what the fish can eat in ~90 seconds", "staple": "High-protein betta pellets (whole fish or fish meal as the first ingredient)", "treats": ["Frozen bloodworms", "Frozen brine shrimp", "Freeze-dried daphnia"], "avoid": ["Flake food (poor protein density)", "Overfeeding — causes bloat and pollutes water"], "fasting": "Fast one day per week to prevent constipation"}',
  '{"compatible": ["Corydoras catfish (bottom-dwellers — different level)", "Harlequin rasboras or ember tetras (small, fast, drab-colored)", "Nerite snails", "Mystery snails", "Amano shrimp (some bettas may hunt shrimp — monitor closely)"], "incompatible": ["Other male bettas", "Tiger barbs (fin-nippers)", "Other gourami species", "Fish with long flowing fins that resemble rival bettas"], "notes": "Individual temperament varies significantly — always have a backup plan. Use a tank of 15+ gallons for community setups with dense planting.", "min_tank_for_community": 57}',
  '[{"name": "Fin Rot", "symptoms": "Frayed, darkening, or melting fin edges", "cause": "Bacterial infection, usually from poor water quality", "treatment": "Improve water quality first; antibacterial medication if no improvement after 3–5 days"}, {"name": "Ich (White Spot Disease)", "symptoms": "Tiny white cysts on fins and body; fish scratches against objects", "cause": "Parasitic infection (Ichthyophthirius multifiliis)", "treatment": "Raise temperature gradually to 30°C + aquarium salt or dedicated ich medication"}, {"name": "Velvet", "symptoms": "Golden or rust-colored dust on skin, clamped fins, scratching", "cause": "Parasitic (Oodinium) — often overlooked early", "treatment": "Copper-based medication in a quarantine tank; dim lights during treatment"}, {"name": "Bloat / Dropsy", "symptoms": "Swollen abdomen, raised scales (pinecone appearance)", "cause": "Organ failure, often bacterial; triggered by poor conditions", "treatment": "Quarantine immediately; Epsom salt baths; antibiotic treatment — often fatal if caught late"}, {"name": "Swim Bladder Disorder", "symptoms": "Floating sideways, sinking, or struggling to maintain depth", "cause": "Overfeeding, constipation, or bacterial infection", "treatment": "Fast for 3 days, then offer a blanched skinless pea; maintain pristine water"}]',
  '{"difficulty": "Intermediate", "process": "The male builds a bubble nest at the surface. Introduce a conditioned female briefly — the male courts with flaring and displays. After spawning, the male fertilizes eggs as the female releases them.", "separation": "Remove the female immediately after spawning — the male becomes aggressive toward her.", "egg_care": "Male guards the nest; eggs hatch in 24–48 hours. Fry become free-swimming within 2–3 days.", "fry_care": "Remove the male once fry are free-swimming. Feed infusoria or commercial fry food for the first week, then transition to baby brine shrimp.", "setup": "Separate 10-gallon breeding tank, 4–6 inches of water, gentle sponge filter, floating plants, temperature 26–28°C"}',
  'Weekly: 20–30% water change with dechlorinated, temperature-matched water. Test ammonia, nitrite, and nitrate. Clean glass if algae is visible. Remove uneaten food daily. Monthly: Rinse filter media in old tank water (never tap water). Check heater calibration with a separate thermometer. Prune plants if overgrown.',
  ARRAY[
    'Housing in too small a tank (under 5 gallons) — water quality crashes quickly',
    'No heater — bettas need consistent warmth; cool temperatures cause illness',
    'Using tap water without dechlorination — chlorine damages gills and the labyrinth organ',
    'Overfeeding — uneaten food decays and spikes ammonia',
    'Keeping two male bettas together — they will fight to the death',
    'Using decorations with sharp edges — fin tears lead to bacterial infection',
    'Adding the fish before cycling the tank (establishing the nitrogen cycle)',
    'Placing the tank in direct sunlight — causes temperature spikes and algae blooms'
  ],
  '[{"q": "How long do betta fish live?", "a": "In well-maintained aquariums, bettas typically live 2–4 years. Some individuals reach 5 years with consistently excellent water quality and a varied diet. Note that pet store bettas are often already 6–12 months old at purchase."}, {"q": "Can two betta fish live together?", "a": "Two males must never share a tank — they will fight, often fatally. A male and female can coexist briefly for breeding but must be separated immediately after spawning. Female bettas can sometimes live together in a carefully managed sorority tank (5+ females, 20+ gallons, dense planting), but conflicts still occur."}, {"q": "What do betta fish eat?", "a": "Bettas are obligate carnivores. High-quality betta pellets should form the core diet, supplemented 2–3 times per week with frozen bloodworms, brine shrimp, or daphnia. Never use flake food as a primary diet — it lacks the protein density bettas need."}, {"q": "Do betta fish need a heater?", "a": "Yes, always. Bettas are tropical fish from Southeast Asia and require water between 24–28°C (76–82°F). Without a heater, room temperature is typically too cool and causes immune suppression, lethargy, and shortened lifespan."}, {"q": "Do betta fish need a filter?", "a": "Yes. A gentle filter maintains the nitrogen cycle and keeps ammonia and nitrite at zero. Use a sponge filter or baffle a hang-on-back filter to reduce flow — bettas dislike strong current and become exhausted fighting it."}, {"q": "Can betta fish live in a bowl?", "a": "A bowl is not a suitable permanent home. Bowls cannot be properly heated or filtered, water quality crashes quickly, and ammonia spikes are common. A minimum 5-gallon heated, filtered tank is required for a healthy betta."}]',
  'Betta Fish Care Guide: Tank Setup, Feeding & Common Diseases | FishCare AI',
  'Complete Betta Fish care guide covering tank size, heater setup, water parameters, feeding schedule, compatible tank mates, common diseases, and breeding for Betta splendens.',
  true
FROM species WHERE slug = 'betta-fish'
ON CONFLICT (species_id) DO NOTHING;
