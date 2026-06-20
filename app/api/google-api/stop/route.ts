import { NextResponse } from 'next/server'
import { stop } from '@/lib/server/google-api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  stop()
  return NextResponse.json({ ok: true })
}
