import { NextResponse } from 'next/server'
import { runScript } from '@/lib/server/ps'
import { SERVER_CONFIG } from '@/lib/server/config'
import type { ActionResult } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Install Profile Jedi Tray shortcut into the Windows Startup folder. */
export async function POST() {
  const res = await runScript(
    SERVER_CONFIG.shortcutsScript,
    ['-Startup'],
    'tray startup shortcut',
  )
  return NextResponse.json<ActionResult>({
    ok: res.ok,
    message: res.ok
      ? 'Tray will auto-start on login (Startup folder shortcut created)'
      : res.stderr.trim() || 'Could not create Startup shortcut',
  })
}
