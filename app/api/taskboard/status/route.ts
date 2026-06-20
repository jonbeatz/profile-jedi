import { NextResponse } from 'next/server'
import { getStatus } from '@/lib/server/taskboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getStatus())
}
