'use client'

import { useState } from 'react'

interface Field {
  key: string
  label: string
  type?: 'text' | 'date' | 'number' | 'select'
  options?: string[]
  required?: boolean
}

interface AddRowModalProps {
  fields: Field[]
  onClose: () => void
  onSave: (data: Record<string, string | number | boolean>) => Promise<void>
  title: string
}

export default function AddRowModal({ fields, onClose, onSave, title }: AddRowModalProps) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    fields.forEach((f) => { init[f.key] = '' })
    return init
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(form)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(27,25,24,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#F1F1F1',
          borderRadius: 12,
          padding: '32px',
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.4rem', color: '#1B1918' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#888', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4, color: '#1B1918', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {field.label}{field.required && ' *'}
              </label>
              {field.type === 'select' ? (
                <select
                  value={form[field.key]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  required={field.required}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 6,
                    border: '1px solid #d4d4d4', background: '#f8f8f8',
                    fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: '#1B1918',
                  }}
                >
                  <option value="">Select…</option>
                  {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={form[field.key]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  required={field.required}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 6,
                    border: '1px solid #d4d4d4', background: '#f8f8f8',
                    fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: '#1B1918',
                  }}
                />
              )}
            </div>
          ))}

          {error && (
            <p style={{ color: '#e55', fontSize: '0.85rem', margin: '12px 0' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 20px', borderRadius: 6, border: '1px solid #d4d4d4',
                background: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                fontSize: '0.875rem', color: '#1B1918',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '9px 24px', borderRadius: 6, border: 'none',
                background: '#1B1918', color: '#F1F1F1', cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', fontWeight: 600,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Add Row'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
