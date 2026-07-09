import { runCommand } from './ps'
import { SERVER_CONFIG } from './config'

export type SupervisorProbe = {
  reachable: boolean
  appUp: boolean
}

const SUPERVISOR_BASE = 'http://localhost:7781'

/** Server-side probe — avoids browser CORS / 127.0.0.1 vs localhost mismatches. */
export async function fetchSupervisorStatus(): Promise<SupervisorProbe> {
  try {
    const res = await fetch(`${SUPERVISOR_BASE}/status`, {
      signal: AbortSignal.timeout(2500),
      cache: 'no-store',
    })
    if (!res.ok) return { reachable: false, appUp: false }
    const body = (await res.json()) as { appUp?: boolean }
    return { reachable: true, appUp: Boolean(body.appUp) }
  } catch {
    return { reachable: false, appUp: false }
  }
}

async function isTrayPortListening(): Promise<boolean> {
  const res = await runCommand(
    "if (Get-NetTCPConnection -LocalPort 7781 -State Listen -ErrorAction SilentlyContinue) { 'yes' } else { 'no' }",
    'tray port probe',
  )
  return res.stdout.trim() === 'yes'
}

/** Start profile-jedi-tray.ps1 via Start-Process (more reliable than Node spawn on Windows). */
export async function spawnTraySupervisorProcess(): Promise<void> {
  const tray = SERVER_CONFIG.trayScript.replace(/'/g, "''")
  await runCommand(
    `Start-Process -FilePath powershell.exe -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-STA','-File','${tray}' -WindowStyle Hidden`,
    'start tray supervisor',
  )
}

/** Wait until the tray HTTP API answers or timeout. */
export async function waitForSupervisor(
  attempts = 15,
  intervalMs = 1000,
): Promise<SupervisorProbe> {
  for (let i = 0; i < attempts; i++) {
    const status = await fetchSupervisorStatus()
    if (status.reachable) return status
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  return fetchSupervisorStatus()
}

export async function ensureTrayRunning(): Promise<{
  ok: boolean
  message: string
  status: SupervisorProbe
}> {
  let status = await fetchSupervisorStatus()
  if (status.reachable) {
    return {
      ok: true,
      message: 'Tray supervisor already running',
      status,
    }
  }

  if (await isTrayPortListening()) {
    // Port bound but HTTP not ready yet — give it a moment.
    status = await waitForSupervisor(8, 500)
    if (status.reachable) {
      return { ok: true, message: 'Tray supervisor ready', status }
    }
  }

  await spawnTraySupervisorProcess()
  status = await waitForSupervisor()

  if (status.reachable) {
    return { ok: true, message: 'Tray supervisor started', status }
  }

  return {
    ok: false,
    message:
      'Tray supervisor did not respond on port 7781. Try the Desktop shortcut "Profile Jedi Tray".',
    status,
  }
}

export async function supervisorHttpGet(
  path: string,
): Promise<{ ok: boolean; body?: unknown }> {
  try {
    const res = await fetch(`${SUPERVISOR_BASE}${path}`, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    })
    if (!res.ok) return { ok: false }
    const body = await res.json()
    return { ok: true, body }
  } catch {
    return { ok: false }
  }
}
