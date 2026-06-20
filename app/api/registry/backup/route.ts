import { copyFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { SERVER_CONFIG } from '@/lib/server/config'
import type { ActionResult } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Snapshot profiles.json to a timestamped sibling file. Used by both
// "Export Registry" and "Backup Now".
export async function POST() {
  const src = SERVER_CONFIG.registryPath
  if (!existsSync(src)) {
    return NextResponse.json<ActionResult>(
      { ok: false, message: 'profiles.json not found' },
      { status: 404 },
    )
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const dest = path.join(path.dirname(src), `profiles.backup-${stamp}.json`)
  try {
    copyFileSync(src, dest)
    return NextResponse.json<ActionResult>({
      ok: true,
      message: `Registry backed up to ${path.basename(dest)}`,
    })
  } catch (e) {
    return NextResponse.json<ActionResult>(
      { ok: false, message: `Backup failed: ${(e as Error).message}` },
      { status: 500 },
    )
  }
}
