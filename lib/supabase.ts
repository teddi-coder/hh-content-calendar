import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client (anon key) — safe to call at module level
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

// Server-side Supabase client (service role key — never expose to browser)
// Called at request time, not at module init
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase server env vars not configured')
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
