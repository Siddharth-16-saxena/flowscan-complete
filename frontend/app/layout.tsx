import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PureScan - AI Food Product Analyzer',
  description: 'Scan packaged food products and understand nutrition, additives, allergens, and personal health fit.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ink-900 text-ink-50 antialiased">
        {children}
      </body>
    </html>
  )
}
