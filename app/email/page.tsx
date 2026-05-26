import { createServerSupabase } from '@/lib/supabase'
import NavTabs from '@/components/NavTabs'
import CalTable, { ColDef } from '@/components/CalTable'

export const dynamic = 'force-dynamic'

const COLUMNS: ColDef[] = [
  { key: 'week_label', label: 'Week', width: 80 },
  { key: 'send_date', label: 'Send Date', type: 'date', width: 120 },
  { key: 'asset_name', label: 'Asset Name', width: 220 },
  { key: 'content_type', label: 'Content Type', width: 130 },
  { key: 'objective', label: 'Objective', width: 150 },
  {
    key: 'status', label: 'Status', type: 'status', width: 130,
    statuses: ['Drafting', 'In Progress', 'In ClickUp', 'Needs Review', 'Completed'],
  },
  { key: 'budget', label: 'Budget', width: 100 },
  { key: 'link_to_content', label: 'Link', type: 'link', width: 140 },
  { key: 'notes', label: 'Notes', width: 200 },
]

const ADD_FIELDS = [
  { key: 'asset_name', label: 'Asset Name', required: true },
  { key: 'week_label', label: 'Week Label' },
  { key: 'send_date', label: 'Send Date', type: 'date' as const },
  { key: 'content_type', label: 'Content Type', type: 'select' as const, options: ['Newsletter', 'Promotional', 'Nurture', 'Onboarding', 'Re-engagement', 'Transactional'] },
  { key: 'objective', label: 'Objective' },
  { key: 'status', label: 'Status', type: 'select' as const, options: ['Drafting', 'In Progress', 'In ClickUp', 'Needs Review', 'Completed'] },
  { key: 'budget', label: 'Budget' },
  { key: 'link_to_content', label: 'Link to Content' },
  { key: 'notes', label: 'Notes' },
]

export default async function EmailPage() {
  const supabase = createServerSupabase()
  const { data: rows } = await supabase
    .from('cal_email_sends')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F1F1F1' }}>
      <NavTabs />
      <main style={{ padding: '28px 32px', maxWidth: 1600, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#1B1918', margin: 0 }}>
            Email
          </h1>
          <p style={{ color: '#888', fontSize: '0.875rem', marginTop: 4 }}>Email campaigns, newsletters, and sends</p>
        </div>
        <CalTable
          tableName="Email"
          apiPath="/api/cal/email"
          columns={COLUMNS}
          addFields={ADD_FIELDS}
          initialRows={rows ?? []}
          showMonthFilter
          dateKey="send_date"
        />
      </main>
    </div>
  )
}
