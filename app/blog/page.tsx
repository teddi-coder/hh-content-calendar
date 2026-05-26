import { createServerSupabase } from '@/lib/supabase'
import NavTabs from '@/components/NavTabs'
import CalTable, { ColDef } from '@/components/CalTable'

export const dynamic = 'force-dynamic'

const COLUMNS: ColDef[] = [
  { key: 'week_label', label: 'Week', width: 80 },
  { key: 'publish_date', label: 'Date', type: 'date', width: 120 },
  { key: 'content_type', label: 'Content Type', width: 110 },
  { key: 'asset_name', label: 'Asset Name', width: 220 },
  { key: 'platform', label: 'Platform', width: 110 },
  { key: 'responsible', label: 'Responsible', width: 120 },
  {
    key: 'status', label: 'Status', type: 'status', width: 130,
    statuses: ['In Progress', 'In ClickUp', 'Needs Review', 'Completed'],
  },
  { key: 'uploaded', label: 'Uploaded', type: 'boolean', width: 80, sortable: false },
  { key: 'images_included', label: 'Images', type: 'boolean', width: 70, sortable: false },
  { key: 'resources_included', label: 'Resources', type: 'boolean', width: 85, sortable: false },
  { key: 'link_to_content', label: 'Link', type: 'link', width: 160 },
  { key: 'google_doc', label: 'Google Doc', type: 'link', width: 140 },
]

const ADD_FIELDS = [
  { key: 'asset_name', label: 'Asset Name', required: true },
  { key: 'week_label', label: 'Week Label' },
  { key: 'publish_date', label: 'Publish Date', type: 'date' as const },
  { key: 'content_type', label: 'Content Type', type: 'select' as const, options: ['Blog', 'Case Study', 'Guide', 'Landing Page', 'Newsletter'] },
  { key: 'platform', label: 'Platform' },
  { key: 'responsible', label: 'Responsible' },
  { key: 'status', label: 'Status', type: 'select' as const, options: ['In Progress', 'In ClickUp', 'Needs Review', 'Completed'] },
  { key: 'link_to_content', label: 'Link to Content' },
  { key: 'google_doc', label: 'Google Doc URL' },
]

export default async function BlogPage() {
  const supabase = createServerSupabase()
  const { data: rows } = await supabase
    .from('cal_blog_posts')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F1F1F1' }}>
      <NavTabs />
      <main style={{ padding: '28px 32px', maxWidth: 1600, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#1B1918', margin: 0 }}>
            Blog
          </h1>
          <p style={{ color: '#888', fontSize: '0.875rem', marginTop: 4 }}>Blog posts, case studies, and long-form content</p>
        </div>
        <CalTable
          tableName="Blog"
          apiPath="/api/cal/blog"
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
