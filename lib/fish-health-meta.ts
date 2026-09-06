type Cause = {
  title?: string | null
}

type FishHealthMetaInput = {
  fishName: string
  problemName: string
  causes?: Cause[] | null
  treatmentStepCount?: number
}

const MAX_DESCRIPTION_LENGTH = 160

function clean(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function clipAtWord(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value

  const clipped = value.slice(0, Math.max(0, maxLength + 1)).trimEnd()
  const lastSpace = clipped.lastIndexOf(' ')
  return (lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).replace(/[,:;.-]+$/, '')
}

export function buildFishHealthTitle(problemName: string, fishName: string): string {
  return `${clean(problemName)} in ${clean(fishName)}? Causes & Fast Fixes`
}

export function buildFishHealthDescription({
  fishName,
  problemName,
  causes,
  treatmentStepCount = 3,
}: FishHealthMetaInput): string {
  const fish = clean(fishName)
  const symptom = clean(problemName)
  const steps = Math.max(3, treatmentStepCount)
  const suffix = ` Follow ${steps} fixes; see a fish vet if it persists or worsens.`
  const lead = `${symptom} in ${fish} is usually caused by `
  const fallbackCause = 'stress or poor water quality'
  const rawCause = clean(causes?.[0]?.title || fallbackCause).replace(/[.!?]+$/, '').toLowerCase()
  const causeBudget = MAX_DESCRIPTION_LENGTH - lead.length - suffix.length - 1
  const cause = clipAtWord(rawCause, Math.max(12, causeBudget)) || fallbackCause

  return `${lead}${cause}.${suffix}`
}
