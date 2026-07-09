// Client helpers for the Profile Jedi tray supervisor (separate process on
// port 7781) plus the in-app self-destruct. Browser calls go through Next.js
// API routes so CORS and localhost vs 127.0.0.1 mismatches never block status.

export type SupervisorStatus = {
  reachable: boolean
  appUp: boolean
}

export async function getSupervisorStatus(): Promise<SupervisorStatus> {
  try {
    const res = await fetch('/api/supervisor/status', { cache: 'no-store' })
    if (!res.ok) return { reachable: false, appUp: true }
    return (await res.json()) as SupervisorStatus
  } catch {
    return { reachable: false, appUp: true }
  }
}

export async function supervisorRestart(): Promise<boolean> {
  try {
    const res = await fetch('/api/supervisor/restart', { method: 'POST' })
    const body = (await res.json()) as { ok?: boolean }
    return Boolean(body.ok)
  } catch {
    return false
  }
}

/** Start tray via server-side spawn + poll (waits until 7781 is up). */
export async function startTraySupervisor(): Promise<{
  ok: boolean
  message: string
}> {
  try {
    const res = await fetch('/api/system/start-tray', { method: 'POST' })
    const body = (await res.json()) as { ok?: boolean; message?: string }
    return {
      ok: Boolean(body.ok),
      message: body.message ?? (body.ok ? 'Tray started' : 'Tray start failed'),
    }
  } catch {
    return { ok: false, message: 'Tray start request failed' }
  }
}

/** In-app self-destruct: stops the app's own dev server (this page will die). */
export async function shutdownApp(): Promise<boolean> {
  try {
    const res = await fetch('/api/system/shutdown', { method: 'POST' })
    return res.ok
  } catch {
    return true
  }
}
