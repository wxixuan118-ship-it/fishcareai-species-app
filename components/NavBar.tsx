'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

type NavItem = {
  label: string
  href: string
  internal?: boolean
  activePath?: string
  extraClass?: string
}

const NAV: NavItem[] = [
  { label: 'Home',          href: SITE_URL },
  { label: 'Guides',        href: `${SITE_URL}/guides/` },
  { label: 'Tools',         href: `${SITE_URL}/tools/` },
  { label: 'Encyclopedia',  href: `${SITE_URL}/species/`,   activePath: '/species' },
  { label: 'Fish Diseases', href: `${SITE_URL}/aquarium-fish-diseases/`, activePath: '/fish-health' },
  { label: 'Fish Identify', href: 'https://identify.fishcareai.com/' },
  { label: 'About',         href: `${SITE_URL}/about/` },
  { label: '📱 App',        href: `${SITE_URL}/app/`,       extraClass: 'nl-app-btn' },
]

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)

  const isActive = (item: NavItem) => {
    const checkPath = item.activePath ?? (item.internal ? item.href.split('?')[0] : null)
    return checkPath ? pathname.startsWith(checkPath) : false
  }

  const close = () => setMenuOpen(false)
  const toggle = () => setMenuOpen((v) => !v)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <nav className="nb" id="navbar" ref={navRef}>
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
        {NAV.map((item) => {
          const active = isActive(item)
          const cls = `nl${active ? ' act' : ''}${item.extraClass ? ' ' + item.extraClass : ''}`
          const ariaCurrent = active ? ('page' as const) : undefined
          return item.internal ? (
            <Link
              key={item.label}
              href={item.href}
              className={cls}
              onClick={close}
              aria-current={ariaCurrent}
            >
              {item.label}
            </Link>
          ) : (
            <a
              key={item.label}
              href={item.href}
              className={cls}
              onClick={close}
              aria-current={ariaCurrent}
            >
              {item.label}
            </a>
          )
        })}
      </div>

      <button
        className={`hbg${menuOpen ? ' hbg-open' : ''}`}
        onClick={toggle}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls="nlinks"
        type="button"
      >
        <span /><span /><span />
      </button>
    </nav>
  )
}
