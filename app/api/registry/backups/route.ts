import { NextResponse } from 'next/server'
import { listRegistryBackups } from '@/lib/server/registry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ backups: listRegistryBackups() })
}
