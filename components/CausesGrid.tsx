import type { HealthCause, Likelihood } from '@/types/fish-health'

interface Props {
  causes: HealthCause[]
}

const LIKELIHOOD_LABEL: Record<Likelihood, string> = {
  high:   'Most Likely',
  medium: 'Possible',
  low:    'Less Common',
}

export default function CausesGrid({ causes }: Props) {
  if (!causes.length) return null

  return (
    <div className="causes-grid">
      {causes.map((cause, i) => (
        <div key={i} className="cause-card">
          <div className="cause-card-top">
            <h4>{cause.title}</h4>
            <span className={`likelihood-badge likelihood-${cause.likelihood}`}>
              {LIKELIHOOD_LABEL[cause.likelihood]}
            </span>
          </div>
          <p>{cause.detail}</p>
        </div>
      ))}
    </div>
  )
}
