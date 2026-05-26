'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/blog')
    } else {
      const data = await res.json()
      setError(data.error || 'Incorrect password')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F1F1F1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#e8e8e8',
          borderRadius: 16,
          padding: '48px 40px',
          boxShadow: '0 8px 40px rgba(27,25,24,0.1)',
          border: '1px solid #d4d4d4',
        }}
      >
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: 12,
              background: '#1B1918',
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: '1.6rem' }}>🦔</span>
          </div>
          <h1
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#1B1918',
              margin: 0,
              marginBottom: 4,
            }}
          >
            HH Content Calendar
          </h1>
          <p style={{ color: '#888', fontSize: '0.875rem', margin: 0 }}>
            Internal tool — enter the team password
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                marginBottom: 6,
                color: '#1B1918',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              placeholder="Enter team password"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                border: error ? '1.5px solid #e55' : '1.5px solid #d4d4d4',
                background: '#F1F1F1',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1rem',
                color: '#1B1918',
                outline: 'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#7DD3FC' }}
              onBlur={(e) => { e.target.style.borderColor = error ? '#e55' : '#d4d4d4' }}
            />
          </div>

          {error && (
            <p
              style={{
                color: '#c0392b',
                fontSize: '0.85rem',
                marginBottom: 16,
                padding: '8px 12px',
                background: '#fde8e8',
                borderRadius: 6,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 8,
              border: 'none',
              background: '#1B1918',
              color: '#F1F1F1',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
