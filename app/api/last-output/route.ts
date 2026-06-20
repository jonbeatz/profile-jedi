import { NextResponse } from 'next/server'
import { getLastOutput } from '@/lib/server/ps'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ output: getLastOutput() })
}
