import { NextResponse } from 'next/server'
import { SERVER_CONFIG } from '@/lib/server/config'
import { runStaScript } from '@/lib/server/ps'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Body = { initialPath?: string; description?: string }

/** Native Windows FolderBrowserDialog — returns full path or cancelled. */
export async function POST(req: Request) {
  let initialPath = ''
  let description = 'Select default profile location'
  try {
    const body = (await req.json()) as Body
    initialPath = body.initialPath?.trim() ?? ''
    description = body.description?.trim() || description
  } catch {
    /* defaults */
  }

  const res = await runStaScript(
    SERVER_CONFIG.pickFolderScript,
    ['-InitialPath', initialPath, '-Description', description],
    'pick folder',
  )

  const chosen = res.stdout.trim()
  if (!chosen) {
    return NextResponse.json({ ok: false, cancelled: true, path: null })
  }

  return NextResponse.json({ ok: true, cancelled: false, path: chosen })
}
