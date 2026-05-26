import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase env vars not set')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

export function makeCollectionHandlers(table: string, orderBy = 'sort_order') {
  async function GET() {
    const supabase = getServerSupabase()
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  async function POST(req: NextRequest) {
    const supabase = getServerSupabase()
    const body = await req.json()
    const { data, error } = await supabase
      .from(table)
      .insert(body)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  }

  return { GET, POST }
}

export function makeItemHandlers(table: string) {
  async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = getServerSupabase()
    const body = await req.json()
    const { data, error } = await supabase
      .from(table)
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = getServerSupabase()
    const { error } = await supabase.from(table).delete().eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return { PUT, DELETE }
}
