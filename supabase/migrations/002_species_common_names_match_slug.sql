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

-- 2. Editorial copy on the 30 health pages per species that names the fish.
UPDATE fish_health_content c
SET intro             = replace(c.intro,             r.old_name, r.new_name),
    prevention        = replace(c.prevention,        r.old_name, r.new_name),
    when_to_seek_help = replace(c.when_to_seek_help, r.old_name, r.new_name),
    common_causes     = replace(c.common_causes::text,   r.old_name, r.new_name)::jsonb,
    diagnosis_steps   = replace(c.diagnosis_steps::text, r.old_name, r.new_name)::jsonb,
    treatment_steps   = replace(c.treatment_steps::text, r.old_name, r.new_name)::jsonb,
    faq               = replace(c.faq::text,             r.old_name, r.new_name)::jsonb,
    meta_title        = replace(c.meta_title,        r.old_name, r.new_name),
    meta_description  = replace(c.meta_description,  r.old_name, r.new_name),
    updated_at        = NOW()
FROM rename r
JOIN species s ON s.slug = r.slug
WHERE c.fish_id = s.id
  AND (c.intro LIKE '%' || r.old_name || '%'
       OR c.prevention LIKE '%' || r.old_name || '%'
       OR c.when_to_seek_help LIKE '%' || r.old_name || '%'
       OR c.common_causes::text LIKE '%' || r.old_name || '%'
       OR c.diagnosis_steps::text LIKE '%' || r.old_name || '%'
       OR c.treatment_steps::text LIKE '%' || r.old_name || '%'
       OR c.faq::text LIKE '%' || r.old_name || '%'
       OR c.meta_title LIKE '%' || r.old_name || '%'
       OR c.meta_description LIKE '%' || r.old_name || '%');

-- What changed.
SELECT s.slug, s.common_name,
       (SELECT count(*) FROM fish_health_content c WHERE c.fish_id = s.id AND c.updated_at > NOW() - interval '1 minute') AS health_pages_touched
FROM species s JOIN rename r ON r.slug = s.slug
ORDER BY s.slug;

COMMIT;
