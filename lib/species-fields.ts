import type { Species } from '@/types/species'

/**
 * Display-time cleanup for species fields whose DB values were imported raw.
 * The DB is left as is; every template that prints these fields goes through here.
 */

// The `origin` column holds pipe-joined GBIF/OBIS distribution areas that mix
// the native range with every country the fish was introduced to (guppy lists
// Réunion and Martinique, dwarf gourami lists Colombian river basins). For the
// species that carry such a list, show the native range instead.
const NATIVE_RANGE: Record<string, string> = {
  'angelfish': 'Amazon basin (Peru, Colombia, Brazil)',
  'badis': 'South Asia (India, Bangladesh, Nepal)',
  'black-skirt-tetra': 'Paraguay and Guaporé river basins, South America',
  'boesemans-rainbowfish': 'Ajamaru Lakes, West Papua (New Guinea)',
  'bristlenose-pleco': 'Amazon basin, South America',
  'bronze-cory': 'South America east of the Andes',
  'cardinal-tetra': 'Upper Orinoco and Rio Negro, South America',
  'chinese-algae-eater': 'Southeast Asia (Mekong and Chao Phraya basins)',
  'clown-loach': 'Borneo and Sumatra, Indonesia',
  'cockatoo-cichlid': 'Amazon basin (Peru, Colombia, Brazil)',
  'common-pleco': 'Northern South America',
  'congo-tetra': 'Congo River basin, Central Africa',
  'discus': 'Amazon basin, South America',
  'dwarf-chain-loach': 'Thailand and Myanmar',
  'dwarf-gourami': 'South Asia (India, Bangladesh, Pakistan)',
  'fairy-cichlid': 'Lake Tanganyika, East Africa',
  'forktail-blue-eye': 'Papua New Guinea',
  'frontosa-cichlid': 'Lake Tanganyika, East Africa',
  'german-blue-ram': 'Orinoco basin (Venezuela, Colombia)',
  'glowlight-tetra': 'Essequibo River, Guyana',
  'goldfish': 'China (domesticated from wild carp)',
  'guppy': 'Northeastern South America and Trinidad',
  'jack-dempsey': 'Central America (southern Mexico to Honduras)',
  'koi': 'Japan (domesticated from Amur carp)',
  'kribensis': 'West Africa (Nigeria, Cameroon)',
  'lemon-tetra': 'Tapajós basin, Brazil',
  'leopard-pleco': 'Amazon and Orinoco basins, South America',
  'molly': 'Mexico and Central America',
  'neon-tetra': 'Upper Amazon basin (Peru, Colombia, Brazil)',
  'ocellaris-clownfish': 'Eastern Indian Ocean and western Pacific',
  'oscar': 'Amazon basin, South America',
  'pacific-blue-tang': 'Indo-Pacific reefs (East Africa to the central Pacific)',
  'paradise-fish': 'East Asia (southern China, Taiwan, Vietnam)',
  'platy': 'Atlantic slope of Mexico and Central America',
  'pristella-tetra': 'Coastal rivers of Guyana, Venezuela and northern Brazil',
  'rachows-notho': 'Mozambique (seasonal pools)',
  'serpae-tetra': 'Amazon, Guaporé and Paraguay basins, South America',
  'sterbas-cory': 'Guaporé basin (Brazil, Bolivia)',
  'swordtail': 'Atlantic slope of Mexico to Honduras',
  'three-spot-gourami': 'Southeast Asia (Mekong basin to Indonesia)',
  'true-percula-clownfish': 'Western Pacific (northern Australia to Melanesia)',
  'yellow-tang': 'Hawaii and the central Pacific',
  'zebra-danio': 'South Asia (India, Bangladesh, Nepal)',
}

const REALM_LABEL: Record<string, string> = {
  'neotropical': 'South and Central America',
  'afrotropical': 'Sub-Saharan Africa',
  'australasian': 'Australia and New Guinea',
  'oriental (indomalaya)': 'South and Southeast Asia',
  'palaearctic': 'Europe and northern Asia',
  'nearctic': 'North America',
}

/** Native range for display, or null. Never contains raw pipe separators. */
export function cleanOrigin(slug: string, raw: string | null | undefined): string | null {
  if (NATIVE_RANGE[slug]) return NATIVE_RANGE[slug]
  if (!raw) return null
  const parts: string[] = []
  for (const piece of raw.split('|')) {
    const p = piece.trim()
    if (!p || /exclusive economic zone/i.test(p)) continue
    const label = REALM_LABEL[p.toLowerCase()] ?? p
    if (!parts.includes(label)) parts.push(label)
  }
  if (parts.length === 0) return null
  return parts.slice(0, 3).join(', ')
}

/** Short form for the hero tag line: drop the parenthetical. */
export function shortOrigin(origin: string | null): string | null {
  return origin ? origin.split('(')[0].trim().replace(/,$/, '') : null
}

// Fallback generator text: "Adults reach X in length. The body is freshwater and
// the species displays characteristic coloration suited to its environment."
// (body_shape was filled with the water type.)
const FILLER_RE = /^Adults reach (.+?) in length\.\s*The body is [^.]*?characteristic coloration suited to its environment\.?\s*$/i
const WATER_WORD_RE = /^(fresh|salt|brackish|marine)\s*water$/i

/** Appearance paragraph with the generated filler sentence replaced. */
export function cleanAppearance(species: Species): string {
  const text = species.sections?.appearance ?? ''
  const m = text.match(FILLER_RE)
  if (!m) return text
  // "Males 3–5 cm; females 5–6 cm" → "males 3–5 cm; females 5–6 cm"
  const size = m[1].trim().replace(/^(Males|Females)\b/, w => w.toLowerCase())
  const shape = species.physical?.body_shape?.trim()
  const out = [`Adult size: ${size}.`]
  if (shape && !WATER_WORD_RE.test(shape)) {
    out.push(`Body shape: ${shape.replace(/\.$/, '')}.`)
  }
  return out.join(' ')
}

export interface Hardness {
  value: string
  note: string
  isKh: boolean
}

/** Hardness value with exactly one unit, plus a note derived from the range. */
export function formatHardness(raw: string | null | undefined): Hardness | null {
  if (!raw || !raw.trim()) return null
  let v = raw.trim().replace(/(\d)\s*-\s*(\d)/g, '$1–$2')
  const isKh = /dKH/i.test(v)
  const hasUnit = /\bd[GK]H\b/i.test(v)
  const nums = (v.match(/\d+(\.\d+)?/g) ?? []).map(Number)

  if (!hasUnit && nums.length > 0) v = `${v} dGH`
  if (nums.length === 0) v = v.charAt(0).toUpperCase() + v.slice(1)

  let note: string
  if (isKh) {
    note = 'Carbonate hardness (KH); keep it stable'
  } else if (nums.length > 0) {
    const min = Math.min(...nums)
    const max = Math.max(...nums)
    const mid = (min + max) / 2
    note = max - min >= 12 ? 'Adapts to a wide range; avoid sudden changes'
      : mid <= 6 ? 'Soft water'
      : mid <= 12 ? 'Soft to moderately hard'
      : mid <= 20 ? 'Moderately hard to hard'
      : 'Hard, mineral-rich water'
  } else {
    note = 'Match your tap water gradually'
  }
  return { value: v, note, isKh }
}
