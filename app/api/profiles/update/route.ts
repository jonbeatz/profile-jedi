import { NextResponse } from 'next/server'
import { SERVER_CONFIG } from '@/lib/server/config'
import { runScript } from '@/lib/server/ps'
import type { ActionResult } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { slug, name, description, location, boardId } =
    (await req.json()) as {
      slug?: string
      name?: string
      description?: string
      location?: string
      boardId?: string
    }

  if (!slug) {
    return NextResponse.json<ActionResult>(
      { ok: false, message: 'Missing profile slug' },
      { status: 400 },
    )
  }
  if (!name?.trim()) {
    return NextResponse.json<ActionResult>(
      { ok: false, message: 'Name is required' },
      { status: 400 },
    )
  }

  const args = ['-Action', 'update', '-Slug', slug, '-Name', name]
  // Always pass these so the registry reflects the edited values (incl. clears).
  args.push('-Description', description ?? '')
  args.push('-BoardId', boardId ?? '')
  if (location?.trim()) args.push('-Location', location)

  const res = await runScript(
    SERVER_CONFIG.switcherScript,
    args,
    `update ${slug}`,
  )
  return NextResponse.json<ActionResult>({
    ok: res.ok,
    message: res.ok
      ? `Updated ${name}`
      : res.stderr.trim() || res.stdout.trim() || 'Update failed',
  })
}
