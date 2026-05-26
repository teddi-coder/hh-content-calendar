'use client'

import { useMemo } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DateFilters {
  year: string      // '' = All | '2024' | '2025' | '2026' …
  quarter: string   // '' = All | 'Q1' | 'Q2' | 'Q3' | 'Q4'
  fy: string        // '' = All | 'FY25' | 'FY26' | 'FY27' …
  month: string     // '' = All | 'YYYY-MM'
}

export const DEFAULT_FILTERS: DateFilters = {
  year: '',
  quarter: '',
  fy: '',
  month: '',
}

interface DateFilterBarProps {
  rows: Record<string, unknown>[]
  dateKey: string
  filters: DateFilters
  onChange: (f: DateFilters) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return the FY label for a given month string 'YYYY-MM' (Jul = start of new FY) */
function fyLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number)
  // FY starts in July.  Jul 2024 → FY25 (ends Jun 2025)
  const fyEnd = m >= 7 ? y + 1 : y
  return `FY${String(fyEnd).slice(-2)}`
}

/** Months included in a given FY label, e.g. 'FY25' → Jul 2024 – Jun 2025 */
function fyMonthRange(fy: string): { start: string; end: string } {
  const fyEnd = 2000 + Number(fy.replace('FY', ''))
  const fyStart = fyEnd - 1
  return {
    start: `${fyStart}-07`,
    end: `${fyEnd}-06`,
  }
}

/** Month range for a quarter label */
function quarterMonthRange(q: string): [number, number] {
  switch (q) {
    case 'Q1': return [1, 3]
    case 'Q2': return [4, 6]
    case 'Q3': return [7, 9]
    default:   return [10, 12]
  }
}

// ── Filter logic (exported so CalTable can use it) ────────────────────────────

export function applyDateFilters(
  rows: Record<string, unknown>[],
  dateKey: string,
  filters: DateFilters,
): Record<string, unknown>[] {
  const { year, quarter, fy, month } = filters
  const hasAnyFilter = year || quarter || fy || month

  if (!hasAnyFilter) return rows

  return rows.filter((row) => {
    const raw = row[dateKey] as string | null | undefined
    if (!raw) return false

    const ym = raw.slice(0, 7) // 'YYYY-MM'
    const [rowY, rowM] = ym.split('-').map(Number)

    // Month is most specific — if set, just match it
    if (month) return ym === month

    // FY overrides year + quarter
    if (fy) {
      const { start, end } = fyMonthRange(fy)
      return ym >= start && ym <= end
    }

    // Year + quarter are additive
    if (year && quarter) {
      const [qMin, qMax] = quarterMonthRange(quarter)
      return rowY === Number(year) && rowM >= qMin && rowM <= qMax
    }
    if (year) return rowY === Number(year)
    if (quarter) {
      const [qMin, qMax] = quarterMonthRange(quarter)
      return rowM >= qMin && rowM <= qMax
    }

    return true
  })
}

// ── Shared dropdown style ─────────────────────────────────────────────────────

function dropdownStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 10px',
    borderRadius: 6,
    border: active ? '1.5px solid #7DD3FC' : '1px solid #d4d4d4',
    background: active ? '#EAF7FE' : '#f8f8f8',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '0.875rem',
    color: '#1B1918',
    width: 110,
    cursor: 'pointer',
    outline: 'none',
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DateFilterBar({
  rows,
  dateKey,
  filters,
  onChange,
}: DateFilterBarProps) {
  const { year, quarter, fy, month } = filters

  // Derive available options from the data
  const { years, fyOptions, months } = useMemo(() => {
    const ymSet = new Set<string>()
    const ySet = new Set<string>()
    const fySet = new Set<string>()

    rows.forEach((row) => {
      const raw = row[dateKey] as string | null | undefined
      if (!raw) return
      const ym = raw.slice(0, 7)
      ymSet.add(ym)
      ySet.add(ym.slice(0, 4))
      fySet.add(fyLabel(ym))
    })

    const sortedYMs = Array.from(ymSet).sort()

    // Filter available months based on active year/quarter/fy
    let filteredYMs = sortedYMs
    if (fy) {
      const { start, end } = fyMonthRange(fy)
      filteredYMs = sortedYMs.filter((ym) => ym >= start && ym <= end)
    } else if (year && quarter) {
      const [qMin, qMax] = quarterMonthRange(quarter)
      filteredYMs = sortedYMs.filter((ym) => {
        const [y, m] = ym.split('-').map(Number)
        return y === Number(year) && m >= qMin && m <= qMax
      })
    } else if (year) {
      filteredYMs = sortedYMs.filter((ym) => ym.startsWith(year))
    } else if (quarter) {
      const [qMin, qMax] = quarterMonthRange(quarter)
      filteredYMs = sortedYMs.filter((ym) => {
        const m = Number(ym.split('-')[1])
        return m >= qMin && m <= qMax
      })
    }

    return {
      years: Array.from(ySet).sort(),
      fyOptions: Array.from(fySet).sort(),
      months: filteredYMs,
    }
  }, [rows, dateKey, year, quarter, fy])

  // FY is selected → year/quarter are disabled
  const fyActive = Boolean(fy)

  function set(key: keyof DateFilters, val: string) {
    const next = { ...filters, [key]: val }

    // Selecting FY clears year + quarter
    if (key === 'fy' && val) {
      next.year = ''
      next.quarter = ''
      next.month = ''
    }
    // Selecting year or quarter clears FY
    if ((key === 'year' || key === 'quarter') && val) {
      next.fy = ''
      next.month = ''
    }
    // Selecting month clears the others (month is most specific)
    if (key === 'month' && val) {
      next.year = ''
      next.quarter = ''
      next.fy = ''
    }
    // Clearing FY/year/quarter: also clear month to avoid stale mismatch
    if ((key === 'fy' || key === 'year' || key === 'quarter') && !val) {
      next.month = ''
    }

    onChange(next)
  }

  return (
    <>
      {/* Year */}
      <select
        value={year}
        onChange={(e) => set('year', e.target.value)}
        disabled={fyActive}
        style={dropdownStyle(Boolean(year))}
        aria-label="Filter by year"
      >
        <option value="">All years</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* Quarter */}
      <select
        value={quarter}
        onChange={(e) => set('quarter', e.target.value)}
        disabled={fyActive}
        style={dropdownStyle(Boolean(quarter))}
        aria-label="Filter by quarter"
      >
        <option value="">All quarters</option>
        <option value="Q1">Q1 (Jan–Mar)</option>
        <option value="Q2">Q2 (Apr–Jun)</option>
        <option value="Q3">Q3 (Jul–Sep)</option>
        <option value="Q4">Q4 (Oct–Dec)</option>
      </select>

      {/* FY */}
      <select
        value={fy}
        onChange={(e) => set('fy', e.target.value)}
        style={dropdownStyle(Boolean(fy))}
        aria-label="Filter by financial year"
      >
        <option value="">All FY</option>
        {fyOptions.map((f) => {
          const { start, end } = fyMonthRange(f)
          const startYear = start.slice(0, 4)
          const endYear = end.slice(0, 4)
          return (
            <option key={f} value={f}>
              {f} ({startYear}/{endYear.slice(-2)})
            </option>
          )
        })}
      </select>

      {/* Month */}
      <select
        value={month}
        onChange={(e) => set('month', e.target.value)}
        style={dropdownStyle(Boolean(month))}
        aria-label="Filter by month"
      >
        <option value="">All months</option>
        {months.map((ym) => (
          <option key={ym} value={ym}>
            {new Date(ym + '-02').toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
          </option>
        ))}
      </select>
    </>
  )
}
