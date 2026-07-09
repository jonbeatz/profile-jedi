import { NextResponse } from 'next/server'
import { runCommand } from '@/lib/server/ps'
import { SERVER_CONFIG } from '@/lib/server/config'
import type { ActionResult } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const dir = SERVER_CONFIG.registryDir.replace(/'/g, "''")
  const res = await runCommand(
    `Start-Process explorer.exe -ArgumentList '${dir}'`,
    'open registry folder',
  )
  return NextResponse.json<ActionResult>({
    ok: res.ok,
    message: res.ok
      ? 'Opened profile-switcher folder in Explorer'
      : res.stderr.trim() || 'Could not open folder',
  })
}
