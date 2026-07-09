import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { NextResponse } from 'next/server'
import type { ActionResult } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const dir = path.join(process.env.APPDATA ?? '', 'Hermes')
  try {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    spawn('explorer.exe', [dir], { detached: true, stdio: 'ignore' }).unref()
    return NextResponse.json<ActionResult>({
      ok: true,
      message: `Opened ${dir}`,
    })
  } catch (e) {
    return NextResponse.json<ActionResult>(
      { ok: false, message: `Could not open folder: ${(e as Error).message}` },
      { status: 500 },
    )
  }
}
