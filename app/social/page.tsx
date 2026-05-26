import { createServerSupabase } from '@/lib/supabase'
import NavTabs from '@/components/NavTabs'
import CalTable, { ColDef } from '@/components/CalTable'

export const dynamic = 'force-dynamic'

const COLUMNS: ColDef[] = [
  { key: 'week_label', label: 'Week', width: 80 },
  { key: 'publish_date', label: 'Date', type: 'date', width: 120 },
  { key: 'asset_name', label: 'Asset Name', width: 200 },
  { key: 'platform', label: 'Platform', width: 110 },
  { key: 'content_type', label: 'Content Type', width: 120 },
  { key: 'target_audience', label: 'Audience', width: 130 },
  { key: 'objective', label: 'Objective', width: 130 },
  { key: 'responsible', label: 'Responsible', width: 120 },
  {
    key: 'status', label: 'Status', type: 'status', width: 130,
    statuses: ['In Progress', 'In ClickUp', 'Needs Review', 'Completed'],
  },
  { key: 'creative_done', label: 'Creative', type: 'boolean', width: 75, sortable: false },
  { key: 'scheduled', label: 'Scheduled', type: 'boolean', width: 85, sortable: false },
  { key: 'colour', label: 'Colour', type: 'colour', width: 140, sortable: false },
  { key: 'link_to_content', label: 'Link', type: 'link', width: 140 },
  { key: 'notes', label: 'Notes', width: 180 },
]

const ADD_FIELDS = [
  { key: 'asset_name', label: 'Asset Name', required: true },
  { key: 'week_label', label: 'Week Label' },
  { key: 'publish_date', label: 'Publish Date', type: 'date' as const },
  { key: 'platform', label: 'Platform', type: 'select' as const, options: ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'X / Twitter', 'YouTube'] },
  { key: 'content_type', label: 'Content Type', type: 'select' as const, options: ['Static', 'Reel', 'Story', 'Carousel', 'Video', 'Article'] },
  { key: 'target_audience', label: 'Target Audience' },
  { key: 'objective', label: 'Objective' },
  { key: 'responsible', label: 'Responsible' },
  { key: 'status', label: 'Status', type: 'select' as const, options: ['In Progress', 'In ClickUp', 'Needs Review', 'Completed'] },
  { key: 'link_to_content', label: 'Link to Content' },
  { key: 'notes', label: 'Notes' },
]

export default async function SocialPage() {
  const supabase = createServerSupabase()
  const { data: rows } = await supabase
    .from('cal_social_posts')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F1F1F1' }}>
      <NavTabs />
      <main style={{ padding: '28px 32px', maxWidth: 1600, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#1B1918', margin: 0 }}>
            Social
          </h1>
          <p style={{ color: '#888', fontSize: '0.875rem', marginTop: 4 }}>Social media posts across all platforms</p>
        </div>
        <CalTable
          tableName="Social"
          apiPath="/api/cal/social"
          columns={COLUMNS}
          addFields={ADD_FIELDS}
          initialRows={rows ?? []}
          showMonthFilter
          dateKey="publish_date"
        />
      </main>
    </div>
  )
}
