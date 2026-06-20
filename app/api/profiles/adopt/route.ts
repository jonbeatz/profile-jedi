import { NextResponse } from 'next/server'
import { runSwitcherJson } from '@/lib/server/ps'
import type { ActionResult } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type AdoptResult = { name?: string; slug?: string; path?: string }

export async function POST(req: Request) {
  const { location, name, description } = (await req.json()) as {
    location?: string
    name?: string
    description?: string
  }
  if (!location?.trim()) {
    return NextResponse.json<ActionResult>(
      { ok: false, message: 'Folder path is required' },
      { status: 400 },
    )
  }
  const args = ['-Action', 'adopt', '-Location', location]
  if (name?.trim()) args.push('-Name', name)
  if (description?.trim()) args.push('-Description', description)

  const result = await runSwitcherJson<AdoptResult>(args)
  if (result?.slug) {
    return NextResponse.json<ActionResult>({
      ok: true,
      message: `Adopted project as ${result.name ?? name ?? 'profile'}`,
    })
  }
  return NextResponse.json<ActionResult>({
    ok: false,
    message: `Could not adopt "${location}"`,
  })
}
