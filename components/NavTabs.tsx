'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/blog', label: 'Blog' },
  { href: '/social', label: 'Social' },
  { href: '/email', label: 'Email' },
  { href: '/ads', label: 'Ads' },
]

export default function NavTabs() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        backgroundColor: '#1B1918',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        borderBottom: '2px solid #2d2a28',
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#7DD3FC',
          marginRight: 32,
          padding: '14px 0',
          letterSpacing: '-0.01em',
        }}
      >
        HH Content
      </span>

      {/* Tabs */}
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: 'inline-block',
              padding: '16px 20px',
              fontSize: '0.875rem',
              fontWeight: active ? 600 : 400,
              fontFamily: 'Poppins, Inter, Arial, sans-serif',
              color: active ? '#7DD3FC' : '#d4d4d4',
              textDecoration: 'none',
              borderBottom: active ? '3px solid #7DD3FC' : '3px solid transparent',
              marginBottom: -2,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.color = '#F1F1F1'
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.color = '#d4d4d4'
            }}
          >
            {tab.label}
          </Link>
        )
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Logout */}
      <a
        href="/api/auth/logout"
        style={{
          fontSize: '0.8rem',
          color: '#888',
          textDecoration: 'none',
          padding: '6px 12px',
          borderRadius: 4,
          border: '1px solid #444',
          fontFamily: 'Poppins, Inter, Arial, sans-serif',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#F1F1F1'; e.currentTarget.style.borderColor = '#888' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#444' }}
      >
        Log out
      </a>
    </nav>
  )
}
