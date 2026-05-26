import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HH Content Calendar',
  description: 'Hedgehog Marketing internal content calendar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ backgroundColor: 'var(--hh-grey-white)', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
