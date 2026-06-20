import { NextResponse } from 'next/server'
import { SERVER_CONFIG } from '@/lib/server/config'
import { runScript } from '@/lib/server/ps'
import type { ActionResult } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { slug, noKill } = (await req.json()) as {
    slug?: string
    noKill?: boolean
  }
  if (!slug) {
    return NextResponse.json<ActionResult>(
      { ok: false, message: 'Missing profile slug' },
      { status: 400 },
    )
  }
  const args = ['-Action', 'switch', '-Profile', slug]
  if (noKill) args.push('-NoKill')
  const res = await runScript(SERVER_CONFIG.switcherScript, args, `switch ${slug}`)
  return NextResponse.json<ActionResult>({
    ok: res.ok,
    message: res.ok
      ? `Switched to ${slug}`
      : res.stderr.trim() || res.stdout.trim() || 'Switch failed',
  })
}
