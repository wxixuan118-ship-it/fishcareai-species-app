-- Species whose common_name does not end with the URL slug phrase.
--
-- Fish-health titles are built as "<common_name> <problem>" and the URL as
-- "<slug>-<problem>", so a name like "Southern Platyfish" means the page for
-- /fish-health/platy-rubbing never contains the phrase "platy rubbing" anywhere
-- (audit 2026-09-20: these species score 58–62, the rest of the template 87+).
-- Names that only differ by an apostrophe or a spelling variant (Adolfo's Cory,
-- Boeseman's Rainbowfish, Colombian Tetra, Rachov's Notho) are left alone —
-- search engines normalise those; renaming them would make the name wrong.
--
-- Every UPDATE is keyed on the current value, so re-running is a no-op.
-- Applied to Supabase via the SQL editor and synced to the app DB with
-- POST /api/migrate on 2026-09-20.
-- Run:  psql "$DATABASE_URL" -f supabase/migrations/002_species_common_names_match_slug.sql

BEGIN;

CREATE TEMP TABLE rename (slug TEXT, old_name TEXT, new_name TEXT) ON COMMIT DROP;
INSERT INTO rename VALUES
  ('archer-fish',      'Archerfish',             'Archer Fish'),
  ('coral-beauty',     'Coral Beauty Angelfish', 'Coral Beauty'),
  ('betta-imbellis',   'Crescent Betta',         'Betta Imbellis'),
  ('betta-smaragdina', 'Emerald Betta',          'Betta Smaragdina'),
  -- Misgurnus fossilis is the European weatherfish, not the dojo loach
  -- (M. anguillicaudatus), so the old name was also the wrong species.
  ('weather-fish',     'Dojo Loach',             'Weather Fish'),
  ('otocinclus',       'Otocinclus Catfish',     'Otocinclus'),
  ('rainbow-fish',     'Rainbowfish',            'Rainbow Fish'),
  ('snowflake-moray',  'Snowflake Moray Eel',    'Snowflake Moray'),
  ('platy',            'Southern Platyfish',     'Platy');

-- 1. The name itself, plus the hand-written metadata that repeats it.
UPDATE species s
SET common_name      = r.new_name,
    meta_title       = replace(s.meta_title,       r.old_name, r.new_name),
    meta_description = replace(s.meta_description, r.old_name, r.new_name),
    updated_at       = NOW()
FROM rename r
WHERE s.slug = r.slug AND s.common_name = r.old_name;

-- 2. Editorial copy on the health pages that names the fish. The list columns
--    are jsonb on the app DB but jsonb[] on Supabase, so read each column's
--    actual type from the catalogue and cast back to it.
DO $$
DECLARE
  r   record;
  col record;
BEGIN
  FOR r IN SELECT * FROM rename LOOP
    FOR col IN
      SELECT a.attname AS name, format_type(a.atttypid, a.atttypmod) AS typ
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'fish_health_content'
        AND a.attnum > 0 AND NOT a.attisdropped
        AND a.attname IN ('intro', 'prevention', 'when_to_seek_help', 'common_causes',
                          'diagnosis_steps', 'treatment_steps', 'faq',
                          'meta_title', 'meta_description')
    LOOP
      EXECUTE format(
        'UPDATE fish_health_content c
            SET %1$I = replace(c.%1$I::text, $1, $2)::%2$s, updated_at = NOW()
           FROM species s
          WHERE c.fish_id = s.id AND s.slug = $3 AND c.%1$I::text LIKE $4',
        col.name, col.typ)
      USING r.old_name, r.new_name, r.slug, '%' || r.old_name || '%';
    END LOOP;
  END LOOP;
END $$;

-- What changed.
SELECT s.slug, s.common_name,
       (SELECT count(*) FROM fish_health_content c WHERE c.fish_id = s.id AND c.updated_at > NOW() - interval '1 minute') AS health_pages_touched
FROM species s JOIN rename r ON r.slug = s.slug
ORDER BY s.slug;

COMMIT;
