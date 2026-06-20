import { NextResponse } from 'next/server'
import { stopStack } from '@/lib/server/taskboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  stopStack()
  return NextResponse.json({ ok: true })
}
