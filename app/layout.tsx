import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'),
  title: {
    default: 'Fish Species Database | FishCare AI',
    template: '%s | FishCare AI',
  },
  description: 'Comprehensive fish species profiles and care guides for freshwater and saltwater aquarium fish.',
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-global-chrome="false">
      <head>
        {/* Shared navbar look, served by the www site (same file as every static page). */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link id="fishcare-nav-styles" rel="stylesheet" href="/assets/site-navigation.css?v=20261122b" />
      </head>
      <body>
        <NavBar />
        <main>{children}</main>
        <Footer />
        {/* GA4 + Clarity + cookie consent, shared with the static site.
            data-global-chrome="false" keeps this app's own NavBar/Footer. */}
        <Script
          src="/assets/site-compliance.js?v=20260923-analytics"
          strategy="afterInteractive"
        />
        <Script src="/assets/app-cta.js?v=20261107" strategy="afterInteractive" />
      </body>
    </html>
  )
}
