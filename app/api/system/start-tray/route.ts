import { NextResponse } from 'next/server'
import { ensureTrayRunning } from '@/lib/server/supervisor'
import type { ActionResult } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Spawn profile-jedi-tray.ps1 and wait until port 7781 answers. */
export async function POST() {
  const result = await ensureTrayRunning()
  return NextResponse.json<ActionResult>(
    { ok: result.ok, message: result.message },
    { status: result.ok ? 200 : 503 },
  )
}
