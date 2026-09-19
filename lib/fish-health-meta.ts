type Cause = {
  title?: string | null
}

type FishHealthMetaInput = {
  subject: string
  causes?: Cause[] | null
  treatmentStepCount?: number
}

const MAX_DESCRIPTION_LENGTH = 160
const MAX_TITLE_LENGTH = 60

function clean(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function clipAtWord(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value

  const clipped = value.slice(0, Math.max(0, maxLength + 1)).trimEnd()
  const lastSpace = clipped.lastIndexOf(' ')
  return (lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).replace(/[,:;.-]+$/, '')
}

function titleCase(value: string): string {
  return value
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

/**
 * The phrase people actually type: species name followed by the short problem
 * slug ("Neon Tetra Hiding", "Guppy Pale Color"). The URL is built from the same
 * two slugs, so this is the one phrase that can sit in the title, H1, headings
 * and slug at once.
 */
export function buildSearchPhrase(fishName: string, problemSlug: string): string {
  return clean(`${fishName} ${titleCase(problemSlug.replace(/-/g, ' '))}`)
}

/**
 * The subject every heading names. Keep the full editorial problem name when
 * it starts with the search phrase ("Hiding Constantly" for "hiding"), so the
 * phrase stays contiguous; otherwise fall back to the short form ("Torn Fins"
 * rather than "Torn or Ragged Fins", which splits the phrase).
 */
export function buildSubject(fishName: string, problemSlug: string, problemName: string): string {
  const short = titleCase(problemSlug.replace(/-/g, ' '))
  const full = clean(problemName)
  const useFull = full.toLowerCase().startsWith(short.toLowerCase())
  return clean(`${fishName} ${useFull ? full : short}`)
}

/**
 * Lead with the subject — that is the query — and let the promise trail. Long
 * species and problem names push past the SERP limit, so fall back to tighter
 * phrasings, and finally to the short search phrase alone.
 */
export function buildFishHealthTitle(subject: string, searchPhrase: string): string {
  const variants = [
    `${subject}? Causes & Fast Fixes`,
    `${subject}: Causes & Fixes`,
    `${searchPhrase}? Causes & Fast Fixes`,
    `${searchPhrase}: Causes & Fixes`,
    searchPhrase,
  ]

  return variants.find((variant) => variant.length <= MAX_TITLE_LENGTH) ?? variants[variants.length - 1]
}

export function buildFishHealthDescription({
  subject,
  causes,
  treatmentStepCount = 3,
}: FishHealthMetaInput): string {
  const steps = Math.max(3, treatmentStepCount)
  const suffix = ` Follow ${steps} fixes; see a fish vet if it persists or worsens.`
  const lead = `${subject} is usually caused by `
  const fallbackCause = 'stress or poor water quality'
  const rawCause = clean(causes?.[0]?.title || fallbackCause).replace(/[.!?]+$/, '').toLowerCase()
  const causeBudget = MAX_DESCRIPTION_LENGTH - lead.length - suffix.length - 1
  const cause = clipAtWord(rawCause, Math.max(12, causeBudget)) || fallbackCause

  return `${lead}${cause}.${suffix}`
}
