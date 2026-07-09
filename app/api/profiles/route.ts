import { NextResponse } from 'next/server'
import { readActiveSlug } from '@/lib/server/active-profile'
import { runSwitcherJson } from '@/lib/server/ps'
import type { Profile } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const list = await runSwitcherJson<Profile | Profile[]>(['-Action', 'list'])
  const profiles = Array.isArray(list) ? list : list ? [list] : []
  const active = readActiveSlug()
  const withActive = profiles.map((p) => ({
    ...p,
    active: active != null && p.slug === active,
  }))
  return NextResponse.json(withActive)
}
