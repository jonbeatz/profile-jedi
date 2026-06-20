import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// In-app self-destruct. Responds first, then exits the dev server process a
// moment later so the client toast can render before the page goes down.
// Restart afterwards via the tray supervisor (port 7781) or a desktop shortcut.
export async function POST() {
  setTimeout(() => process.exit(0), 350)
  return NextResponse.json({
    ok: true,
    message: 'Profile Jedi is shutting down',
  })
}
