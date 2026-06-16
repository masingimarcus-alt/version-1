import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'E-Competition | Premium Esports Platform',
  description: 'The ultimate esports platform for competitive gaming. Join tournaments, track your stats, and compete for glory.',
  generator: 'E-Competition',
  keywords: ['esports', 'gaming', 'tournament', 'competitive', 'FIFA', 'PS5'],
  authors: [{ name: 'E-Competition' }],
}

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`}>
      <body className="font-sans antialiased bg-[#050505] text-foreground">
        {children}
      </body>
    </html>
  )
}
