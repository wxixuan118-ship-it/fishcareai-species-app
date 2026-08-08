'use client'

import { useState } from 'react'
import type { FaqItem } from '@/types/species'

interface Props {
  items: FaqItem[]
}

export default function FaqAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="fqi">
          <button
            className="fqq"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
          >
            {item.q}
            <span aria-hidden="true">{openIndex === i ? '−' : '+'}</span>
          </button>
          {openIndex === i && (
            <div className="fqa">{item.a}</div>
          )}
        </div>
      ))}
    </div>
  )
}
