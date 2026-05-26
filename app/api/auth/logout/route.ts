import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  const res = NextResponse.redirect(url)
  res.cookies.delete('cal_session')
  return res
}
