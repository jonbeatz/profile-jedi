import path from 'node:path'
import { NextResponse } from 'next/server'
import { SERVER_CONFIG } from '@/lib/server/config'
import { runCommand, runScript } from '@/lib/server/ps'
import type { ActionResult } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Body = {
  action?: 'launch' | 'sync' | 'open' | 'shortcut' | 'cursor'
  slug?: string
  path?: string
  name?: string
}

export async function POST(req: Request) {
  const { action, slug, path: wsPath, name } = (await req.json()) as Body

  const fail = (message: string, status = 400) =>
    NextResponse.json<ActionResult>({ ok: false, message }, { status })

  switch (action) {
    case 'launch': {
      if (!slug) return fail('Missing profile slug')
      const res = await runScript(
        SERVER_CONFIG.switcherScript,
        ['-Action', 'launch', '-Profile', slug],
        `launch ${slug}`,
      )
      return NextResponse.json<ActionResult>({
        ok: res.ok,
        message: res.ok ? 'Launching Hermes' : 'Launch failed',
      })
    }
    case 'sync': {
      if (!slug) return fail('Missing profile slug')
      const res = await runScript(
        SERVER_CONFIG.switcherScript,
        ['-Action', 'sync', '-Profile', slug],
        `sync ${slug}`,
      )
      return NextResponse.json<ActionResult>({
        ok: res.ok,
        message: res.ok ? 'CLI profile synced' : 'Sync failed',
      })
    }
    case 'open': {
      if (!wsPath) return fail('Missing path')
      const res = await runCommand(
        `Start-Process -FilePath "${wsPath}"`,
        `open ${wsPath}`,
      )
      return NextResponse.json<ActionResult>({
        ok: res.ok,
        message: res.ok ? 'Opened folder' : 'Could not open folder',
      })
    }
    case 'shortcut': {
      if (!name) return fail('Missing profile name')
      const lnk = path.join(
        process.env.USERPROFILE ?? '',
        'Desktop',
        `Hermes - ${name}.lnk`,
      )
      const res = await runCommand(
        `if (Test-Path "${lnk}") { Start-Process explorer.exe -ArgumentList '/select,"${lnk}"' } else { throw 'missing' }`,
        `reveal ${lnk}`,
      )
      return NextResponse.json<ActionResult>({
        ok: res.ok,
        message: res.ok ? 'Revealed shortcut' : 'Shortcut not found',
      })
    }
    case 'cursor': {
      if (!wsPath) return fail('Missing path')
      const res = await runCommand(
        `Start-Process cursor -ArgumentList "${wsPath}"`,
        `cursor ${wsPath}`,
      )
      return NextResponse.json<ActionResult>({
        ok: res.ok,
        message: res.ok ? 'Opening in Cursor' : 'Could not open Cursor',
      })
    }
    default:
      return fail('Unknown action')
  }
}
