'use client'

import { useState, useRef, useEffect } from 'react'

const STATUS_COLOURS: Record<string, string> = {
  'Completed': '#7DD3FC',
  'In Progress': '#65E499',
  'In ClickUp': '#F4F7A6',
  'Needs Review': '#FFA8D1',
  'Drafting': '#F4F7A6',
  'Planned': '#d4d4d4',
}

const ALL_STATUSES = Object.keys(STATUS_COLOURS)

interface StatusChipProps {
  value: string
  onChange: (newValue: string) => void
  statuses?: string[]
}

export default function StatusChip({ value, onChange, statuses = ALL_STATUSES }: StatusChipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const bg = STATUS_COLOURS[value] || '#d4d4d4'

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: bg,
          color: '#1B1918',
          border: 'none',
          borderRadius: '999px',
          padding: '3px 10px',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        {value || 'Select…'}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            zIndex: 100,
            background: '#F1F1F1',
            border: '1px solid #d4d4d4',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            minWidth: '140px',
            overflow: 'hidden',
          }}
        >
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false) }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '7px 12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontFamily: 'inherit',
                color: '#1B1918',
                borderBottom: '1px solid #e8e8e8',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e8e8e8')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: STATUS_COLOURS[s] || '#d4d4d4',
                  marginRight: 8,
                }}
              />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
