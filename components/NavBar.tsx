'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

type NavItem = {
  label: string
  href: string
  internal?: boolean
  accent?: boolean
}

const NAV: NavItem[] = [
  { label: 'Home',          href: SITE_URL },
  { label: 'Guides',        href: `${SITE_URL}/guides/` },
  { label: 'Encyclopedia',  href: '/species/', internal: true },
  { label: 'Fish Health',   href: '/fish-health/', internal: true },
  { label: 'Fish Identify', href: 'https://fish-identification-d558af.anysites.app/', accent: true },
  { label: 'Tools',         href: `${SITE_URL}/tools/` },
  { label: 'About Us',      href: `${SITE_URL}/about/` },
  { label: 'Contact',       href: `${SITE_URL}/contact/` },
]

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (item: NavItem) =>
    item.internal ? pathname.startsWith(item.href.split('?')[0]) : false

  const close = () => setMenuOpen(false)

  return (
    <nav className="nb" id="navbar">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <a className="brand" href={SITE_URL} title="FishCare AI" onClick={close}>
        <img
          src={`${SITE_URL}/assets/fishcare-logo.svg`}
          alt="FishCare AI"
          width={142}
          height={36}
          className="fishcare-logo-img"
        />
      </a>

      <div className={`nlinks${menuOpen ? ' open' : ''}`} id="nlinks">
        {NAV.map((item) =>
          item.internal ? (
            <Link
              key={item.label}
              href={item.href}
              className={`nl${isActive(item) ? ' act' : ''}`}
              onClick={close}
            >
              {item.label}
            </Link>
          ) : (
            <a
              key={item.label}
              href={item.href}
              className="nl"
              style={item.accent ? { color: '#67e8f9' } : undefined}
            >
              {item.label}
            </a>
          )
        )}
        <a href={`${SITE_URL}/tools/fish-compatibility-checker/`} className="nb-cta" title="Try AI Free">
          Try AI Free
        </a>
      </div>

      <button
        className={`hbg${menuOpen ? ' hbg-open' : ''}`}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        type="button"
      >
        <span /><span /><span />
      </button>
    </nav>
  )
}
