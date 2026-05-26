import { NextRequest, NextResponse } from 'next/server'
import { sha256 } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const envPassword = process.env.CALENDAR_PASSWORD || ''

  if (!envPassword) {
    return NextResponse.json({ error: 'No password configured' }, { status: 500 })
  }

  if (password !== envPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const hash = await sha256(envPassword)

  const res = NextResponse.json({ ok: true })
  res.cookies.set('cal_session', hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  return res
}
