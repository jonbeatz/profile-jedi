import { NextResponse } from 'next/server'
import {
  ensureStack,
  type TaskboardTarget,
  urlFor,
} from '@/lib/server/taskboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { target, boardId } = (await req.json()) as {
    target?: TaskboardTarget
    boardId?: string
  }
  const t: TaskboardTarget = target ?? 'taskboard'

  const wasUp = await ensureStack()
  return NextResponse.json({
    ok: true,
    url: urlFor(t, boardId),
    started: !wasUp,
  })
}
