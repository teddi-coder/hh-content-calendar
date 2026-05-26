'use client'

import { useState, useRef } from 'react'

interface InlineCellProps {
  value: string | null | undefined
  onSave: (val: string) => void
  type?: 'text' | 'date' | 'number'
  placeholder?: string
}

export default function InlineCell({ value, onSave, type = 'text', placeholder = '' }: InlineCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setDraft(value ?? '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function commit() {
    setEditing(false)
    if (draft !== (value ?? '')) {
      onSave(draft)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') { setEditing(false); setDraft(value ?? '') }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="cal-cell-input"
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        placeholder={placeholder}
      />
    )
  }

  return (
    <span
      onClick={startEdit}
      style={{
        display: 'block',
        cursor: 'text',
        minWidth: 60,
        minHeight: 20,
        color: value ? '#1B1918' : '#aaa',
      }}
    >
      {value || placeholder || <em style={{ color: '#bbb' }}>—</em>}
    </span>
  )
}
