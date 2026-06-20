// Client helpers for the Profile Jedi tray supervisor (separate process on
// port 7781) plus the in-app self-destruct. The supervisor survives the main
// app being stopped, so it (not the app) owns Start/Restart. All calls are
// wrapped so a missing supervisor degrades gracefully.

const SUPERVISOR_BASE = 'http://localhost:7781'

export type SupervisorStatus = {
  /** The supervisor process itself answered. */
  reachable: boolean
  /** The main app (port 7780) is up, per the supervisor's probe. */
  appUp: boolean
}

async function supervisorGet(
  path: string,
  timeoutMs = 1500,
): Promise<Response | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    return await fetch(`${SUPERVISOR_BASE}${path}`, { signal: ctrl.signal })
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

export async function getSupervisorStatus(): Promise<SupervisorStatus> {
  const res = await supervisorGet('/status')
  if (!res || !res.ok) return { reachable: false, appUp: true }
  try {
    const body = (await res.json()) as { appUp?: boolean }
    return { reachable: true, appUp: Boolean(body.appUp) }
  } catch {
    return { reachable: true, appUp: true }
  }
}

export async function supervisorStart(): Promise<boolean> {
  return Boolean(await supervisorGet('/start', 4000))
}

export async function supervisorStop(): Promise<boolean> {
  return Boolean(await supervisorGet('/stop', 4000))
}

export async function supervisorRestart(): Promise<boolean> {
  return Boolean(await supervisorGet('/restart', 4000))
}

/** In-app self-destruct: stops the app's own dev server (this page will die). */
export async function shutdownApp(): Promise<boolean> {
  try {
    const res = await fetch('/api/system/shutdown', { method: 'POST' })
    return res.ok
  } catch {
    // The server may die before the response returns — treat as success.
    return true
  }
}
