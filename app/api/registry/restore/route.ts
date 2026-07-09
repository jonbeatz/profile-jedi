import { NextResponse } from 'next/server'
import { restoreRegistryBackup } from '@/lib/server/registry'
import type { ActionResult } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Body = { filename?: string }

/** Restore profiles.json from the latest (or named) backup snapshot. */
export async function POST(req: Request) {
  let filename: string | undefined
  try {
    const body = (await req.json()) as Body
    filename = body.filename
  } catch {
    /* empty body → latest backup */
  }

  const result = restoreRegistryBackup(filename)
  return NextResponse.json<ActionResult>(result, { status: result.ok ? 200 : 400 })
}
