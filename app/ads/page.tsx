import { createServerSupabase } from '@/lib/supabase'
import NavTabs from '@/components/NavTabs'
import CalTable, { ColDef } from '@/components/CalTable'

export const dynamic = 'force-dynamic'

const COLUMNS: ColDef[] = [
  { key: 'campaign_name', label: 'Campaign Name', width: 200 },
  { key: 'ad_group_name', label: 'Ad Group', width: 180 },
  { key: 'platform', label: 'Platform', width: 110 },
  { key: 'target_audience', label: 'Target Audience', width: 150 },
  { key: 'objective', label: 'Objective', width: 140 },
  {
    key: 'status', label: 'Status', type: 'status', width: 120,
    statuses: ['Planned', 'In Progress', 'In ClickUp', 'Completed'],
  },
  { key: 'daily_budget', label: 'Daily Budget', type: 'number', width: 110 },
  { key: 'percentage', label: '%', type: 'number', width: 80 },
  { key: 'link_to_content', label: 'Link', type: 'link', width: 140 },
  { key: 'notes', label: 'Notes', width: 200 },
]

const ADD_FIELDS = [
  { key: 'campaign_name', label: 'Campaign Name', required: true },
  { key: 'ad_group_name', label: 'Ad Group Name' },
  { key: 'platform', label: 'Platform', type: 'select' as const, options: ['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'TikTok Ads', 'Display', 'YouTube'] },
  { key: 'target_audience', label: 'Target Audience' },
  { key: 'objective', label: 'Objective' },
  { key: 'status', label: 'Status', type: 'select' as const, options: ['Planned', 'In Progress', 'In ClickUp', 'Completed'] },
  { key: 'daily_budget', label: 'Daily Budget ($)', type: 'number' as const },
  { key: 'percentage', label: 'Percentage (%)', type: 'number' as const },
  { key: 'link_to_content', label: 'Link to Content' },
  { key: 'notes', label: 'Notes' },
]

export default async function AdsPage() {
  const supabase = createServerSupabase()
  const { data: rows } = await supabase
    .from('cal_ads')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F1F1F1' }}>
      <NavTabs />
      <main style={{ padding: '28px 32px', maxWidth: 1600, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#1B1918', margin: 0 }}>
            Ads
          </h1>
          <p style={{ color: '#888', fontSize: '0.875rem', marginTop: 4 }}>Paid advertising campaigns and ad groups</p>
        </div>
        <CalTable
          tableName="Ads"
          apiPath="/api/cal/ads"
          columns={COLUMNS}
          addFields={ADD_FIELDS}
          initialRows={rows ?? []}
        />
      </main>
    </div>
  )
}
