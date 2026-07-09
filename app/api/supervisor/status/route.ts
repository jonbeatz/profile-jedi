import { NextResponse } from 'next/server'
import { fetchSupervisorStatus } from '@/lib/server/supervisor'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const status = await fetchSupervisorStatus()
  return NextResponse.json(status)
}
