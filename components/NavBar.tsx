'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

type DropItem = { label: string; href: string; icon: string; internal?: boolean }
type NavEntry =
  | { type: 'link'; label: string; href: string; internal?: boolean }
  | { type: 'dropdown'; label: string; items: DropItem[] }

const NAV: NavEntry[] = [
  { type: 'link', label: 'Home', href: SITE_URL },
  {
    type: 'dropdown', label: 'Fish Species',
    items: [
      { label: 'Freshwater Fish',  href: `${SITE_URL}/guides/freshwater-fish-care/`,           icon: '🌿' },
      { label: 'Saltwater Fish',   href: `${SITE_URL}/wiki/clownfish/`,                        icon: '🌊' },
      { label: 'Beginner Fish',    href: `${SITE_URL}/guides/best-freshwater-fish-for-beginners/`, icon: '🐟' },
      { label: 'Shrimp & Snails',  href: `${SITE_URL}/wiki/cherry-shrimp/`,                   icon: '🦐' },
      { label: 'Amphibians',       href: `${SITE_URL}/wiki/african-dwarf-frog/`,               icon: '🐸' },
      { label: 'Fish Database',    href: '/species/',                                           icon: '🔍', internal: true },
    ],
  },
  {
    type: 'dropdown', label: 'Care Guides',
    items: [
      { label: 'Beginner Fish Care', href: `${SITE_URL}/guides/fish-care-for-beginners/`,  icon: '📖' },
      { label: 'Tank Setup',         href: `${SITE_URL}/guides/how-to-set-up-a-fish-tank/`, icon: '🏠' },
      { label: 'Feeding Guide',      href: `${SITE_URL}/guides/`,                           icon: '🍽️' },
      { label: 'Water Quality',      href: `${SITE_URL}/guides/aquarium-water-parameters/`, icon: '💧' },
      { label: 'Fish Care Checklist',href: `${SITE_URL}/guides/beginner-fish-care-checklist/`, icon: '📋' },
    ],
  },
  {
    type: 'dropdown', label: 'Fish Health',
    items: [
      { label: 'Behavioral Problems', href: '/fish-health/#behavioral', icon: '🐠', internal: true },
      { label: 'Physical Symptoms',  href: '/fish-health/#physical',   icon: '🔬', internal: true },
      { label: 'Disease & Infection',href: '/fish-health/#disease',    icon: '🦠', internal: true },
      { label: 'AI Health Checker',    href: `${SITE_URL}/#symptom-checker`, icon: '✅' },
    ],
  },
  {
    type: 'dropdown', label: 'Aquarium',
    items: [
      { label: 'Aquarium Setup',   href: `${SITE_URL}/guides/how-to-set-up-a-fish-tank/`, icon: '🏗️' },
      { label: 'Driftwood & Decor',href: `${SITE_URL}/wiki/aquarium-driftwood/`,          icon: '🌿' },
      { label: 'Algae Control',    href: `${SITE_URL}/wiki/black-beard-algae/`,            icon: '🟢' },
      { label: 'Live Rock',        href: `${SITE_URL}/wiki/live-rock/`,                    icon: '🪨' },
      { label: 'Water Parameters', href: `${SITE_URL}/guides/aquarium-water-parameters/`, icon: '💧' },
    ],
  },
  {
    type: 'dropdown', label: 'Tools',
    items: [
      { label: 'Compatibility Checker',   href: `${SITE_URL}/tools/fish-compatibility-checker/`, icon: '🔄' },
      { label: 'Tank Size Calculator',    href: `${SITE_URL}/tools/tank-size-calculator/`,       icon: '📐' },
      { label: 'Water Parameter Checker', href: `${SITE_URL}/tools/water-parameter-checker/`,    icon: '💧' },
      { label: 'Feeding Calculator',      href: `${SITE_URL}/tools/fish-feeding-calculator/`,    icon: '🍽️' },
      { label: 'Aquarium Planner',        href: `${SITE_URL}/tools/aquarium-planner/`,           icon: '🗓️' },
    ],
  },
  { type: 'link', label: 'About', href: `${SITE_URL}/about/` },
]

const Caret = () => (
  <svg className="nb-caret" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDrop, setActiveDrop] = useState<string | null>(null)
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)

  // Close active dropdown when clicking outside the navbar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDrop(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleDrop = (label: string) =>
    setActiveDrop((v) => (v === label ? null : label))

  const closeAll = () => {
    setMenuOpen(false)
    setActiveDrop(null)
  }

  const isActive = (entry: NavEntry) => {
    if (entry.type === 'link') {
      if (entry.internal) return pathname === entry.href
      return false
    }
    return entry.items.some((it) => it.internal && pathname.startsWith(it.href.split('?')[0]))
  }

  return (
    <nav className="nb" ref={navRef}>
      {/* Logo */}
      <a className="brand" href={SITE_URL} title="FishCare AI" onClick={closeAll}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${SITE_URL}/assets/fishcare-logo.svg`}
          alt="FishCare AI"
          width={142}
          height={36}
          className="fishcare-logo-img"
        />
      </a>

      {/* Links */}
      <div className={`nlinks${menuOpen ? ' open' : ''}`}>
        {NAV.map((entry) => {
          if (entry.type === 'link') {
            const cls = `nl${isActive(entry) ? ' act' : ''}`
            return entry.internal ? (
              <Link key={entry.label} className={cls} href={entry.href} onClick={closeAll}>
                {entry.label}
              </Link>
            ) : (
              <a key={entry.label} className={cls} href={entry.href}>
                {entry.label}
              </a>
            )
          }

          const open = activeDrop === entry.label
          const active = isActive(entry)

          return (
            <div key={entry.label} className={`nb-group${open ? ' open' : ''}`}>
              <button
                className={`nl nb-trigger${active ? ' act' : ''}`}
                onClick={() => toggleDrop(entry.label)}
                aria-haspopup="true"
                aria-expanded={open}
              >
                {entry.label}
                <Caret />
              </button>

              <div className="nb-dropdown" role="menu">
                {entry.items.map((it) =>
                  it.internal ? (
                    <Link
                      key={it.label}
                      className="nd-item"
                      href={it.href}
                      role="menuitem"
                      onClick={closeAll}
                    >
                      <span className="nd-icon">{it.icon}</span>
                      {it.label}
                    </Link>
                  ) : (
                    <a
                      key={it.label}
                      className="nd-item"
                      href={it.href}
                      role="menuitem"
                    >
                      <span className="nd-icon">{it.icon}</span>
                      {it.label}
                    </a>
                  )
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Hamburger */}
      <button
        className={`hbg${menuOpen ? ' hbg-open' : ''}`}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  )
}
