import { NextResponse } from 'next/server'
import { supervisorHttpGet } from '@/lib/server/supervisor'
import type { ActionResult } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const res = await supervisorHttpGet('/restart')
  return NextResponse.json<ActionResult>({
    ok: res.ok,
    message: res.ok
      ? 'Restarting Profile Jedi via tray supervisor'
      : 'Tray supervisor not reachable on port 7781',
  })
}
