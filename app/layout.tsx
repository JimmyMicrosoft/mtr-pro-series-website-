import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'MTR Pro Series — AV Integrator Training for Microsoft Teams Rooms',
    template: '%s | MTR Pro Series',
  },
  description:
    'The complete, role-based training platform for AV integrators deploying Microsoft Teams Rooms. 12 tracks, 159 lessons, 74–94 hours of professional-grade content.',
  keywords: [
    'Microsoft Teams Rooms',
    'MTR training',
    'AV integrator',
    'Teams Rooms certification',
    'MTR deployment',
    'AV professional training',
  ],
  authors: [{ name: 'Jimmy Vaughan' }],
  creator: 'MTR Pro Series',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mtrproseries.com',
    siteName: 'MTR Pro Series',
    title: 'MTR Pro Series — AV Integrator Training for Microsoft Teams Rooms',
    description:
      'The complete, role-based training platform for AV integrators deploying Microsoft Teams Rooms.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MTR Pro Series',
    description: 'Professional MTR training for AV integrators.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] flex flex-col">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
