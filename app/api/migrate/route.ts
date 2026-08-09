import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS species (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        NOT NULL UNIQUE,
  common_name      TEXT        NOT NULL,
  scientific_name  TEXT        NOT NULL,
  family           TEXT,
  genus            TEXT,
  origin           TEXT,
  water_type       TEXT,
  difficulty_level TEXT,
  physical         JSONB       NOT NULL DEFAULT '{}',
  behavior         JSONB       NOT NULL DEFAULT '{}',
  environment      JSONB       NOT NULL DEFAULT '{}',
  sections         JSONB       NOT NULL DEFAULT '{}',
  related_species  TEXT[]      NOT NULL DEFAULT '{}',
  meta_title       TEXT,
  meta_description TEXT,
  schema_data      JSONB       NOT NULL DEFAULT '[]',
  published        BOOLEAN     NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_species_slug       ON species (slug);
CREATE INDEX IF NOT EXISTS idx_species_water_type ON species (water_type);
CREATE INDEX IF NOT EXISTS idx_species_difficulty ON species (difficulty_level);
CREATE INDEX IF NOT EXISTS idx_species_published  ON species (published);

CREATE TABLE IF NOT EXISTS species_guides (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id           UUID        NOT NULL UNIQUE REFERENCES species(id) ON DELETE CASCADE,
  beginner_overview    TEXT,
  tank_setup           JSONB       NOT NULL DEFAULT '{}',
  water_parameters     JSONB       NOT NULL DEFAULT '{}',
  feeding_guide        JSONB       NOT NULL DEFAULT '{}',
  tank_mates           JSONB       NOT NULL DEFAULT '{}',
  common_diseases      JSONB       NOT NULL DEFAULT '[]',
  breeding             JSONB       NOT NULL DEFAULT '{}',
  maintenance_schedule TEXT,
  common_mistakes      TEXT[]      NOT NULL DEFAULT '{}',
  faq                  JSONB       NOT NULL DEFAULT '[]',
  meta_title           TEXT,
  meta_description     TEXT,
  published            BOOLEAN     NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_species_guides_species_id ON species_guides (species_id);

CREATE TABLE IF NOT EXISTS health_problems (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT        NOT NULL UNIQUE,
  problem_name TEXT        NOT NULL,
  category     TEXT,
  description  TEXT,
  urgency      TEXT,
  published    BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_problems_slug ON health_problems (slug);

CREATE TABLE IF NOT EXISTS fish_health_content (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  fish_id           UUID        REFERENCES species(id),
  problem_id        UUID        REFERENCES health_problems(id),
  slug              TEXT        NOT NULL UNIQUE,
  intro             TEXT,
  common_causes     JSONB       NOT NULL DEFAULT '[]',
  diagnosis_steps   JSONB       NOT NULL DEFAULT '[]',
  treatment_steps   JSONB       NOT NULL DEFAULT '[]',
  prevention        TEXT,
  when_to_seek_help TEXT,
  related_slugs     TEXT[]      NOT NULL DEFAULT '{}',
  faq               JSONB       NOT NULL DEFAULT '[]',
  meta_title        TEXT,
  meta_description  TEXT,
  published         BOOLEAN     NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fish_health_slug       ON fish_health_content (slug);
CREATE INDEX IF NOT EXISTS idx_fish_health_fish_id    ON fish_health_content (fish_id);
CREATE INDEX IF NOT EXISTS idx_fish_health_problem_id ON fish_health_content (problem_id);
`

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-migrate-secret')
  if (!secret || secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const srcUrl = process.env.SUPABASE_DATABASE_URL
  if (!srcUrl) {
    return NextResponse.json({ error: 'SUPABASE_DATABASE_URL not set' }, { status: 500 })
  }

  // Parse URL manually so special chars in password (e.g. *) aren't lost by URL encoding
  const parsedSrc = new URL(srcUrl)
  const src = postgres({
    host:     parsedSrc.hostname,
    port:     Number(parsedSrc.port) || 5432,
    database: parsedSrc.pathname.replace(/^\//, ''),
    user:     decodeURIComponent(parsedSrc.username),
    password: decodeURIComponent(parsedSrc.password),
    ssl: 'require',
    max: 2,
    prepare: false,
    idle_timeout: 30,
  })

  const dstRaw = process.env.DATABASE_URL!
  const parsedDst = new URL(dstRaw)
  parsedDst.searchParams.delete('pgbouncer')
  const dst = postgres(parsedDst.toString(), { ssl: 'require', max: 2, prepare: false, idle_timeout: 30 })

  const log: string[] = []

  try {
    log.push('Creating schema...')
    await dst.unsafe(SCHEMA)
    log.push('Schema ready')

    // Clear existing data (FK order: guides first, then species)
    await dst.unsafe('TRUNCATE TABLE fish_health_content, species_guides, species RESTART IDENTITY CASCADE')
    log.push('Cleared existing data')

    // ── species ────────────────────────────────────────────────────────────────
    log.push('Reading species from Supabase...')
    const speciesRows = await src`SELECT * FROM species ORDER BY created_at`
    log.push(`Found ${speciesRows.length} species rows`)

    let speciesOk = 0
    for (const r of speciesRows) {
      await dst`
        INSERT INTO species (
          id, slug, common_name, scientific_name, family, genus, origin,
          water_type, difficulty_level, physical, behavior, environment,
          sections, related_species, meta_title, meta_description,
          schema_data, published, created_at, updated_at
        ) VALUES (
          ${r.id}, ${r.slug}, ${r.common_name}, ${r.scientific_name},
          ${r.family ?? null}, ${r.genus ?? null}, ${r.origin ?? null},
          ${r.water_type ?? null}, ${r.difficulty_level ?? null},
          ${dst.json(r.physical ?? {})}, ${dst.json(r.behavior ?? {})},
          ${dst.json(r.environment ?? {})}, ${dst.json(r.sections ?? {})},
          ${r.related_species ?? []}, ${r.meta_title ?? null},
          ${r.meta_description ?? null}, ${dst.json(r.schema_data ?? [])},
          ${r.published}, ${r.created_at}, ${r.updated_at}
        )
        ON CONFLICT (id) DO UPDATE SET
          slug             = EXCLUDED.slug,
          common_name      = EXCLUDED.common_name,
          scientific_name  = EXCLUDED.scientific_name,
          family           = EXCLUDED.family,
          genus            = EXCLUDED.genus,
          origin           = EXCLUDED.origin,
          water_type       = EXCLUDED.water_type,
          difficulty_level = EXCLUDED.difficulty_level,
          physical         = EXCLUDED.physical,
          behavior         = EXCLUDED.behavior,
          environment      = EXCLUDED.environment,
          sections         = EXCLUDED.sections,
          related_species  = EXCLUDED.related_species,
          meta_title       = EXCLUDED.meta_title,
          meta_description = EXCLUDED.meta_description,
          schema_data      = EXCLUDED.schema_data,
          published        = EXCLUDED.published,
          updated_at       = EXCLUDED.updated_at
      `
      speciesOk++
    }
    log.push(`Migrated ${speciesOk} species`)

    // ── species_guides ─────────────────────────────────────────────────────────
    const guideRows = await src`SELECT * FROM species_guides ORDER BY created_at`
    log.push(`Found ${guideRows.length} species_guide rows`)

    let guidesOk = 0
    for (const r of guideRows) {
      await dst`
        INSERT INTO species_guides (
          id, species_id, beginner_overview, tank_setup, water_parameters,
          feeding_guide, tank_mates, common_diseases, breeding,
          maintenance_schedule, common_mistakes, faq,
          meta_title, meta_description, published, created_at, updated_at
        ) VALUES (
          ${r.id}, ${r.species_id}, ${r.beginner_overview ?? null},
          ${dst.json(r.tank_setup ?? {})}, ${dst.json(r.water_parameters ?? {})},
          ${dst.json(r.feeding_guide ?? {})}, ${dst.json(r.tank_mates ?? {})},
          ${dst.json(r.common_diseases ?? [])}, ${dst.json(r.breeding ?? {})},
          ${r.maintenance_schedule ?? null}, ${r.common_mistakes ?? []},
          ${dst.json(r.faq ?? [])}, ${r.meta_title ?? null},
          ${r.meta_description ?? null}, ${r.published}, ${r.created_at}, ${r.updated_at}
        )
        ON CONFLICT (id) DO UPDATE SET
          beginner_overview    = EXCLUDED.beginner_overview,
          tank_setup           = EXCLUDED.tank_setup,
          water_parameters     = EXCLUDED.water_parameters,
          feeding_guide        = EXCLUDED.feeding_guide,
          tank_mates           = EXCLUDED.tank_mates,
          common_diseases      = EXCLUDED.common_diseases,
          breeding             = EXCLUDED.breeding,
          maintenance_schedule = EXCLUDED.maintenance_schedule,
          common_mistakes      = EXCLUDED.common_mistakes,
          faq                  = EXCLUDED.faq,
          meta_title           = EXCLUDED.meta_title,
          meta_description     = EXCLUDED.meta_description,
          published            = EXCLUDED.published,
          updated_at           = EXCLUDED.updated_at
      `
      guidesOk++
    }
    log.push(`Migrated ${guidesOk} species_guides`)

    // ── health_problems (may not exist in Supabase) ────────────────────────────
    let problemsOk = 0
    try {
      const problemRows = await src`SELECT * FROM health_problems ORDER BY created_at`
      log.push(`Found ${problemRows.length} health_problem rows`)
      for (const r of problemRows) {
        await dst`
          INSERT INTO health_problems (
            id, slug, problem_name, category, description, urgency,
            published, created_at, updated_at
          ) VALUES (
            ${r.id}, ${r.slug}, ${r.problem_name}, ${r.category ?? null},
            ${r.description ?? null}, ${r.urgency ?? null},
            ${r.published}, ${r.created_at}, ${r.updated_at}
          )
          ON CONFLICT (id) DO UPDATE SET
            slug         = EXCLUDED.slug,
            problem_name = EXCLUDED.problem_name,
            category     = EXCLUDED.category,
            description  = EXCLUDED.description,
            urgency      = EXCLUDED.urgency,
            published    = EXCLUDED.published,
            updated_at   = EXCLUDED.updated_at
        `
        problemsOk++
      }
      log.push(`Migrated ${problemsOk} health_problems`)
    } catch (e) {
      log.push(`health_problems skipped: ${String(e).slice(0, 120)}`)
    }

    // ── fish_health_content (may not exist in Supabase) ────────────────────────
    let healthOk = 0
    try {
      const healthRows = await src`SELECT * FROM fish_health_content ORDER BY created_at`
      log.push(`Found ${healthRows.length} fish_health_content rows`)
      for (const r of healthRows) {
        await dst`
          INSERT INTO fish_health_content (
            id, fish_id, problem_id, slug, intro, common_causes,
            diagnosis_steps, treatment_steps, prevention, when_to_seek_help,
            related_slugs, faq, meta_title, meta_description,
            published, created_at, updated_at
          ) VALUES (
            ${r.id}, ${r.fish_id ?? null}, ${r.problem_id ?? null},
            ${r.slug}, ${r.intro ?? null},
            ${dst.json(r.common_causes ?? [])}, ${dst.json(r.diagnosis_steps ?? [])},
            ${dst.json(r.treatment_steps ?? [])}, ${r.prevention ?? null},
            ${r.when_to_seek_help ?? null}, ${r.related_slugs ?? []},
            ${dst.json(r.faq ?? [])}, ${r.meta_title ?? null},
            ${r.meta_description ?? null}, ${r.published}, ${r.created_at}, ${r.updated_at}
          )
          ON CONFLICT (id) DO UPDATE SET
            slug              = EXCLUDED.slug,
            intro             = EXCLUDED.intro,
            common_causes     = EXCLUDED.common_causes,
            diagnosis_steps   = EXCLUDED.diagnosis_steps,
            treatment_steps   = EXCLUDED.treatment_steps,
            prevention        = EXCLUDED.prevention,
            when_to_seek_help = EXCLUDED.when_to_seek_help,
            related_slugs     = EXCLUDED.related_slugs,
            faq               = EXCLUDED.faq,
            meta_title        = EXCLUDED.meta_title,
            meta_description  = EXCLUDED.meta_description,
            published         = EXCLUDED.published,
            updated_at        = EXCLUDED.updated_at
        `
        healthOk++
      }
      log.push(`Migrated ${healthOk} fish_health_content`)
    } catch (e) {
      log.push(`fish_health_content skipped: ${String(e).slice(0, 120)}`)
    }

    return NextResponse.json({
      success: true,
      counts: { species: speciesOk, guides: guidesOk, health_problems: problemsOk, fish_health_content: healthOk },
      log,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err), log }, { status: 500 })
  } finally {
    await src.end()
    await dst.end()
  }
}
