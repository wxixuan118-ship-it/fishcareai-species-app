import type { Urgency } from '@/types/fish-health'

interface Props {
  urgency:  Urgency
  fishName: string
}

const CONFIG = {
  monitor: {
    icon:   '🔍',
    title:  'Monitor Closely',
    style:  'callout',
  },
  urgent: {
    icon:   '⚠️',
    title:  'Act Within 24 Hours',
    style:  'callout callout-warn',
  },
  emergency: {
    icon:   '🚨',
    title:  'Immediate Action Required',
    style:  'callout callout-warn urgency-emergency',
  },
} satisfies Record<Urgency, { icon: string; title: string; style: string }>

const BODY: Record<Urgency, (fishName: string) => string> = {
  monitor:   (n) => `This symptom in ${n} warrants attention but is not immediately life-threatening. Test water parameters first, then observe for changes over 24–48 hours.`,
  urgent:    (n) => `This condition in ${n} can deteriorate quickly. Begin diagnosis and treatment within 24 hours. Isolate the fish to a hospital tank if possible.`,
  emergency: (n) => `This is a life-threatening emergency for your ${n}. Act immediately — delay of even a few hours can be fatal. Check oxygen levels and water quality right now.`,
}

export default function UrgencyBanner({ urgency, fishName }: Props) {
  if (urgency === 'monitor') return null

  const cfg = CONFIG[urgency]
  return (
    <div className={cfg.style} role="alert">
      <strong>{cfg.icon} {cfg.title}:</strong> {BODY[urgency](fishName)}
    </div>
  )
}
