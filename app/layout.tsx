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
      </body>
    </html>
  )
}
