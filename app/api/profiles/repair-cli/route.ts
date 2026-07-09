import { NextResponse } from 'next/server'
import { SERVER_CONFIG } from '@/lib/server/config'
import { runScript, runSwitcherJson } from '@/lib/server/ps'
import type { ActionResult } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Scaffold missing CLI files and sync every profile showing CLI missing. */
export async function POST() {
  const body = await runSwitcherJson<{ ok?: boolean; fixed?: number; total?: number }>(
    ['-Action', 'repair-cli-all'],
    300_000,
  )

  if (body) {
    const fixed = body.fixed ?? 0
    const total = body.total ?? 0
    const ok = Boolean(body.ok)
    return NextResponse.json<ActionResult>(
      {
        ok,
        message:
          total === 0
            ? 'All profiles already have CLI homes'
            : `Repaired ${fixed}/${total} CLI profile(s)`,
      },
      { status: ok ? 200 : 500 },
    )
  }

  const res = await runScript(
    SERVER_CONFIG.switcherScript,
    ['-Action', 'repair-cli-all'],
    'repair-cli-all',
    300_000,
  )

  return NextResponse.json<ActionResult>(
    {
      ok: res.ok,
      message: res.ok
        ? 'CLI repair finished'
        : res.stderr.trim() || 'CLI repair failed',
    },
    { status: res.ok ? 200 : 500 },
  )
}
