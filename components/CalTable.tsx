'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { SortableRow, DragHandleIcon } from './DragHandle'
import InlineCell from './InlineCell'
import StatusChip from './StatusChip'
import AddRowModal from './AddRowModal'
import DateFilterBar, { DateFilters, DEFAULT_FILTERS, applyDateFilters } from './DateFilterBar'

export interface ColDef {
  key: string
  label: string
  type?: 'text' | 'date' | 'number' | 'boolean' | 'status' | 'link' | 'colour'
  width?: number
  sortable?: boolean
  statuses?: string[]
}

interface CalTableProps {
  tableName: string
  apiPath: string
  columns: ColDef[]
  addFields: Array<{
    key: string
    label: string
    type?: 'text' | 'date' | 'number' | 'select'
    options?: string[]
    required?: boolean
  }>
  initialRows: Record<string, unknown>[]
  showMonthFilter?: boolean
  dateKey?: string
}

const HH_COLOURS = ['#7DD3FC', '#65E499', '#F4F7A6', '#FFA8D1', '#d4d4d4', '#e0c9ff', '#ffd6a5']

export default function CalTable({
  tableName,
  apiPath,
  columns,
  addFields,
  initialRows,
  showMonthFilter = false,
  dateKey = 'publish_date',
}: CalTableProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>(initialRows)
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')
  const [dateFilters, setDateFilters] = useState<DateFilters>(DEFAULT_FILTERS)
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Apply date filters first, then search
  const hasAnyDateFilter = Object.values(dateFilters).some(Boolean)
  const dateFiltered = showMonthFilter
    ? applyDateFilters(rows, dateKey, dateFilters)
    : rows

  let filtered = dateFiltered.filter((row) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      String(row.asset_name ?? row.campaign_name ?? '').toLowerCase().includes(q) ||
      String(row.responsible ?? '').toLowerCase().includes(q)
    return matchSearch
  })

  // Sort
  if (sortCol) {
    filtered = [...filtered].sort((a, b) => {
      const av = String(a[sortCol] ?? '')
      const bv = String(b[sortCol] ?? '')
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }

  function handleHeaderClick(key: string) {
    if (sortCol === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(key)
      setSortDir('asc')
    }
  }

  async function updateCell(id: string, key: string, value: unknown) {
    // Optimistic update
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } : r))
    )
    await fetch(`${apiPath}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    })
  }

  async function addRow(data: Record<string, unknown>) {
    const res = await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, sort_order: rows.length }),
    })
    if (!res.ok) throw new Error('Failed to add row')
    const created = await res.json()
    setRows((prev) => [...prev, created])
  }

  async function deleteRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id))
    await fetch(`${apiPath}/${id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = rows.findIndex((r) => r.id === active.id)
      const newIndex = rows.findIndex((r) => r.id === over.id)
      const newRows = arrayMove(rows, oldIndex, newIndex)
      setRows(newRows)

      // Update sort_order for affected rows
      await Promise.all(
        newRows.map((row, i) =>
          fetch(`${apiPath}/${row.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sort_order: i }),
          })
        )
      )
    },
    [rows, apiPath]
  )

  function renderCell(row: Record<string, unknown>, col: ColDef) {
    const id = row.id as string
    const val = row[col.key]

    if (col.type === 'boolean') {
      return (
        <input
          type="checkbox"
          checked={Boolean(val)}
          onChange={(e) => updateCell(id, col.key, e.target.checked)}
          style={{ cursor: 'pointer', width: 16, height: 16, accentColor: '#7DD3FC' }}
        />
      )
    }

    if (col.type === 'status') {
      return (
        <StatusChip
          value={String(val ?? '')}
          statuses={col.statuses}
          onChange={(v) => updateCell(id, col.key, v)}
        />
      )
    }

    if (col.type === 'link') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <InlineCell
            value={String(val ?? '')}
            onSave={(v) => updateCell(id, col.key, v)}
            placeholder="Add URL…"
          />
          {Boolean(val) && (
            <a
              href={String(val)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#7DD3FC', flexShrink: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      )
    }

    if (col.type === 'colour') {
      return (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          {HH_COLOURS.map((c) => (
            <button
              key={c}
              onClick={() => updateCell(id, col.key, c)}
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: c,
                border: val === c ? '2px solid #1B1918' : '1px solid #ccc',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      )
    }

    if (col.type === 'date') {
      return (
        <InlineCell
          value={String(val ?? '')}
          onSave={(v) => updateCell(id, col.key, v)}
          type="date"
        />
      )
    }

    if (col.type === 'number') {
      return (
        <InlineCell
          value={String(val ?? '')}
          onSave={(v) => updateCell(id, col.key, v === '' ? null : v)}
          type="number"
        />
      )
    }

    return (
      <InlineCell
        value={String(val ?? '')}
        onSave={(v) => updateCell(id, col.key, v)}
        placeholder="—"
      />
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #d4d4d4',
            background: '#f8f8f8',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.875rem',
            color: '#1B1918',
            width: 200,
          }}
        />
        {showMonthFilter && (
          <DateFilterBar
            rows={rows}
            dateKey={dateKey}
            filters={dateFilters}
            onChange={setDateFilters}
          />
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '9px 20px',
            borderRadius: 6,
            border: 'none',
            background: '#1B1918',
            color: '#F1F1F1',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Row
        </button>
      </div>

      {/* Table */}
      <div className="table-scroll-wrapper">
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.3rem', color: '#1B1918', marginBottom: 8 }}>
              No entries yet
            </p>
            <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: 20 }}>
              {search || hasAnyDateFilter ? 'No rows match your filters.' : 'Get started by adding your first row.'}
            </p>
            {!search && !hasAnyDateFilter && (
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: '10px 24px', borderRadius: 6, border: 'none',
                  background: '#1B1918', color: '#F1F1F1', cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', fontWeight: 600,
                }}
              >
                + Add First Row
              </button>
            )}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={rows.map((r) => r.id as string)} strategy={verticalListSortingStrategy}>
              <table className="cal-table">
                <thead>
                  <tr>
                    <th style={{ width: 32, padding: '10px 8px' }} />
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={col.sortable !== false ? 'sortable' : ''}
                        onClick={col.sortable !== false ? () => handleHeaderClick(col.key) : undefined}
                        style={{ width: col.width }}
                      >
                        {col.label}
                        {sortCol === col.key && (
                          <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    ))}
                    <th style={{ width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <SortableRow key={row.id as string} id={row.id as string}>
                      {(dragProps) => (
                        <>
                          <td style={{ padding: '8px 4px' }}>
                            <span className="drag-handle" {...dragProps}>
                              <DragHandleIcon />
                            </span>
                          </td>
                          {columns.map((col) => (
                            <td key={col.key} style={{ maxWidth: col.width || 200 }}>
                              {renderCell(row, col)}
                            </td>
                          ))}
                          <td style={{ padding: '8px 8px', textAlign: 'right' }}>
                            {deleteConfirm === (row.id as string) ? (
                              <span style={{ display: 'flex', gap: 4 }}>
                                <button
                                  onClick={() => deleteRow(row.id as string)}
                                  style={{ background: '#e55', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: '0.75rem' }}
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  style={{ background: '#d4d4d4', color: '#1B1918', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: '0.75rem' }}
                                >
                                  No
                                </button>
                              </span>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(row.id as string)}
                                title="Delete row"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4, opacity: 0 }}
                                className="delete-btn"
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#e55' }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0' }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </SortableRow>
                  ))}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <p style={{ marginTop: 8, fontSize: '0.78rem', color: '#999', fontFamily: 'Poppins, sans-serif' }}>
        {filtered.length} row{filtered.length !== 1 ? 's' : ''}
        {(search || hasAnyDateFilter) && ` (filtered from ${rows.length})`}
      </p>

      {showAddModal && (
        <AddRowModal
          title={`Add to ${tableName}`}
          fields={addFields}
          onClose={() => setShowAddModal(false)}
          onSave={addRow}
        />
      )}
    </div>
  )
}
