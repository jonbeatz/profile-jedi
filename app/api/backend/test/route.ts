import { NextResponse } from 'next/server'
import { runSwitcherJson } from '@/lib/server/ps'
import type { ActionResult, Profile } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const list = await runSwitcherJson<Profile | Profile[]>(['-Action', 'list'])
  const profiles = Array.isArray(list) ? list : list ? [list] : []
  if (list === null) {
    return NextResponse.json<ActionResult>({
      ok: false,
      message: 'Backend unreachable — could not run Switch-Hermes-Profile.ps1',
    })
  }
  return NextResponse.json<ActionResult>({
    ok: true,
    message: `Backend reachable — resolved ${profiles.length} profiles`,
  })
}
