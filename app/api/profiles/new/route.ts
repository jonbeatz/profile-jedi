import { NextResponse } from 'next/server'
import { runSwitcherJson } from '@/lib/server/ps'
import type { ActionResult } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type NewResult = { name?: string; slug?: string; path?: string }

export async function POST(req: Request) {
  const { name, location, description } = (await req.json()) as {
    name?: string
    location?: string
    description?: string
  }
  if (!name?.trim()) {
    return NextResponse.json<ActionResult>(
      { ok: false, message: 'Name is required' },
      { status: 400 },
    )
  }
  const args = ['-Action', 'new', '-Name', name]
  if (location?.trim()) args.push('-Location', location)
  if (description?.trim()) args.push('-Description', description)

  const result = await runSwitcherJson<NewResult>(args)
  if (result?.slug) {
    return NextResponse.json<ActionResult>({
      ok: true,
      message: `Created profile ${result.name ?? name}`,
    })
  }
  return NextResponse.json<ActionResult>({
    ok: false,
    message: `Could not create "${name}" (it may already exist)`,
  })
}
