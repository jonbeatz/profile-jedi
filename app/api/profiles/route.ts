import { readFileSync } from 'node:fs'
import { NextResponse } from 'next/server'
import { SERVER_CONFIG } from '@/lib/server/config'
import { runSwitcherJson } from '@/lib/server/ps'
import type { Profile } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function activeSlug(): string | null {
  try {
    const raw = readFileSync(SERVER_CONFIG.activeProfileFile, 'utf8')
    const json = JSON.parse(raw) as { profile?: string }
    return json.profile ?? null
  } catch {
    return null
  }
}

export async function GET() {
  const list = await runSwitcherJson<Profile | Profile[]>(['-Action', 'list'])
  const profiles = Array.isArray(list) ? list : list ? [list] : []
  const active = activeSlug()
  const withActive = profiles.map((p) => ({
    ...p,
    active: active != null && p.slug === active,
  }))
  return NextResponse.json(withActive)
}
