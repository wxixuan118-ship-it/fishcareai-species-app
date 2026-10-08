import type { HealthPageSummary } from '@/types/fish-health'
import { healthHref } from '@/lib/consolidated'

interface Props {
  links: HealthPageSummary[]
}

export default function RelatedHealthLinks({ links }: Props) {
  if (!links.length) return null

  return (
    <div className="related-health-grid">
      {links.map((link) => (
        <a key={link.slug} href={healthHref(link.slug)} className="related-health-card">
          <div className="related-health-fish">{link.fish_name}</div>
          <div className="related-health-prob">{link.problem_name}</div>
        </a>
      ))}
    </div>
  )
}
