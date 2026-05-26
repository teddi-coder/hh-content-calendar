/**
 * migrate-from-sheets.ts
 *
 * Migrate content calendar data from Google Sheets into Supabase.
 *
 * Usage:
 *   npx ts-node scripts/migrate-from-sheets.ts [--dry-run]
 *
 * Required env vars:
 *   GOOGLE_SERVICE_ACCOUNT_JSON   - JSON string of service account credentials
 *   SUPABASE_SERVICE_ROLE_KEY     - Supabase service role key
 *   NEXT_PUBLIC_SUPABASE_URL      - Supabase project URL
 */

import { createClient } from '@supabase/supabase-js'

const SHEET_ID = '1diqbYPTBU2RGS2OvC2EQDb2E-iieb6rIv0G388Mj_0o'
const DRY_RUN = process.argv.includes('--dry-run')

// Tab names in the Google Sheet
const TABS = {
  blog: 'Blog',
  social: 'Social',
  email: 'Email',
  ads: 'Ads',
}

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson)
  const now = Math.floor(Date.now() / 1000)

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  ).toString('base64url')

  // Sign with private key using Node.js crypto
  const { createSign } = await import('crypto')
  const sign = createSign('SHA256')
  sign.update(`${header}.${payload}`)
  const signature = sign.sign(sa.private_key, 'base64url')

  const jwt = `${header}.${payload}.${signature}`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const tokenData = await tokenRes.json() as { access_token: string }
  return tokenData.access_token
}

async function fetchSheetTab(token: string, tabName: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tabName)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to fetch tab "${tabName}": ${err}`)
  }
  const data = await res.json() as { values?: string[][] }
  return data.values ?? []
}

function rowsToObjects(values: string[][]): Record<string, string>[] {
  if (values.length < 2) return []
  const [headers, ...dataRows] = values
  return dataRows.map((row) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h.trim()] = (row[i] ?? '').trim()
    })
    return obj
  })
}

function parseDate(val: string): string | null {
  if (!val) return null
  // Try parsing various date formats
  const d = new Date(val)
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  return null
}

function parseBool(val: string): boolean {
  return ['true', 'yes', '1', 'x', 'y', 'done', 'complete'].includes(val.toLowerCase())
}

async function migrateBlog(rows: Record<string, string>[], supabase: ReturnType<typeof createClient>) {
  console.log(`\nBlog: ${rows.length} rows`)
  const inserts = rows.map((r, i) => ({
    week_label: r['Week'] || r['week_label'] || null,
    publish_date: parseDate(r['Date'] || r['Publish Date'] || r['publish_date']),
    content_type: r['Content Type'] || r['content_type'] || 'Blog',
    asset_name: r['Asset Name'] || r['asset_name'] || `Blog Post ${i + 1}`,
    platform: r['Platform'] || r['platform'] || null,
    responsible: r['Responsible'] || r['responsible'] || null,
    status: r['Status'] || r['status'] || 'In Progress',
    uploaded: parseBool(r['Uploaded'] || r['uploaded'] || ''),
    images_included: parseBool(r['Images'] || r['images_included'] || ''),
    resources_included: parseBool(r['Resources'] || r['resources_included'] || ''),
    link_to_content: r['Link'] || r['link_to_content'] || null,
    google_doc: r['Google Doc'] || r['google_doc'] || null,
    sort_order: i,
  }))

  if (DRY_RUN) {
    console.log('  [DRY RUN] Would insert:', JSON.stringify(inserts[0], null, 2), '...')
    return
  }

  const { error } = await supabase.from('cal_blog_posts').insert(inserts)
  if (error) throw new Error(`Blog insert failed: ${error.message}`)
  console.log(`  ✓ Inserted ${inserts.length} blog posts`)
}

async function migrateSocial(rows: Record<string, string>[], supabase: ReturnType<typeof createClient>) {
  console.log(`\nSocial: ${rows.length} rows`)
  const inserts = rows.map((r, i) => ({
    week_label: r['Week'] || r['week_label'] || null,
    publish_date: parseDate(r['Date'] || r['Publish Date'] || r['publish_date']),
    asset_name: r['Asset Name'] || r['asset_name'] || `Social Post ${i + 1}`,
    platform: r['Platform'] || r['platform'] || null,
    content_type: r['Content Type'] || r['content_type'] || null,
    target_audience: r['Target Audience'] || r['target_audience'] || null,
    objective: r['Objective'] || r['objective'] || null,
    responsible: r['Responsible'] || r['responsible'] || null,
    status: r['Status'] || r['status'] || 'In Progress',
    creative_done: parseBool(r['Creative Done'] || r['creative_done'] || ''),
    scheduled: parseBool(r['Scheduled'] || r['scheduled'] || ''),
    colour: r['Colour'] || r['colour'] || null,
    link_to_content: r['Link'] || r['link_to_content'] || null,
    notes: r['Notes'] || r['notes'] || null,
    sort_order: i,
  }))

  if (DRY_RUN) {
    console.log('  [DRY RUN] Would insert:', JSON.stringify(inserts[0], null, 2), '...')
    return
  }

  const { error } = await supabase.from('cal_social_posts').insert(inserts)
  if (error) throw new Error(`Social insert failed: ${error.message}`)
  console.log(`  ✓ Inserted ${inserts.length} social posts`)
}

async function migrateEmail(rows: Record<string, string>[], supabase: ReturnType<typeof createClient>) {
  console.log(`\nEmail: ${rows.length} rows`)
  const inserts = rows.map((r, i) => ({
    week_label: r['Week'] || r['week_label'] || null,
    send_date: parseDate(r['Send Date'] || r['Date'] || r['send_date']),
    asset_name: r['Asset Name'] || r['asset_name'] || `Email ${i + 1}`,
    content_type: r['Content Type'] || r['content_type'] || null,
    objective: r['Objective'] || r['objective'] || null,
    status: r['Status'] || r['status'] || 'Drafting',
    budget: r['Budget'] || r['budget'] || null,
    link_to_content: r['Link'] || r['link_to_content'] || null,
    notes: r['Notes'] || r['notes'] || null,
    sort_order: i,
  }))

  if (DRY_RUN) {
    console.log('  [DRY RUN] Would insert:', JSON.stringify(inserts[0], null, 2), '...')
    return
  }

  const { error } = await supabase.from('cal_email_sends').insert(inserts)
  if (error) throw new Error(`Email insert failed: ${error.message}`)
  console.log(`  ✓ Inserted ${inserts.length} email sends`)
}

async function migrateAds(rows: Record<string, string>[], supabase: ReturnType<typeof createClient>) {
  console.log(`\nAds: ${rows.length} rows`)
  const inserts = rows.map((r, i) => ({
    campaign_name: r['Campaign Name'] || r['campaign_name'] || null,
    ad_group_name: r['Ad Group'] || r['ad_group_name'] || null,
    platform: r['Platform'] || r['platform'] || null,
    target_audience: r['Target Audience'] || r['target_audience'] || null,
    objective: r['Objective'] || r['objective'] || null,
    status: r['Status'] || r['status'] || 'Planned',
    daily_budget: parseFloat(r['Daily Budget'] || r['daily_budget'] || '0') || null,
    percentage: parseFloat(r['%'] || r['Percentage'] || r['percentage'] || '0') || null,
    link_to_content: r['Link'] || r['link_to_content'] || null,
    notes: r['Notes'] || r['notes'] || null,
    sort_order: i,
  }))

  if (DRY_RUN) {
    console.log('  [DRY RUN] Would insert:', JSON.stringify(inserts[0], null, 2), '...')
    return
  }

  const { error } = await supabase.from('cal_ads').insert(inserts)
  if (error) throw new Error(`Ads insert failed: ${error.message}`)
  console.log(`  ✓ Inserted ${inserts.length} ads`)
}

async function main() {
  console.log(`HH Content Calendar — Google Sheets Migration`)
  console.log(`Sheet ID: ${SHEET_ID}`)
  console.log(DRY_RUN ? '⚠️  DRY RUN — no data will be written' : '🚀 Live run — data will be inserted')

  const googleJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!googleJson) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON env var')
  if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL env var')
  if (!supabaseKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env var')

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

  console.log('\nFetching Google OAuth token…')
  const token = await getAccessToken(googleJson)
  console.log('Token obtained.')

  const [blogValues, socialValues, emailValues, adsValues] = await Promise.all([
    fetchSheetTab(token, TABS.blog),
    fetchSheetTab(token, TABS.social),
    fetchSheetTab(token, TABS.email),
    fetchSheetTab(token, TABS.ads),
  ])

  await migrateBlog(rowsToObjects(blogValues), supabase)
  await migrateSocial(rowsToObjects(socialValues), supabase)
  await migrateEmail(rowsToObjects(emailValues), supabase)
  await migrateAds(rowsToObjects(adsValues), supabase)

  console.log('\n✓ Migration complete')
}

main().catch((err) => {
  console.error('\n✗ Migration failed:', err.message)
  process.exit(1)
})
