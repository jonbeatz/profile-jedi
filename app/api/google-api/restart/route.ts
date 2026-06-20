import { NextResponse } from 'next/server'
import { restart } from '@/lib/server/google-api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  restart()
  return NextResponse.json({ ok: true })
}
