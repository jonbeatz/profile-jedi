import { NextResponse } from 'next/server'
import { start } from '@/lib/server/google-api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  start()
  return NextResponse.json({ ok: true })
}
