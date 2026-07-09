import { DEFAULT_SETTINGS, mergeSettings } from './settings'
import type {
  ActionResult,
  AdoptProfileInput,
  CreateProfileInput,
  MonitoredService,
  Profile,
  Service,
  Settings,
  UpdateProfileInput,
} from './types'

// ---------------------------------------------------------------------------
// Real backend client. Every call hits a local Next.js Route Handler that
// shells out to the Hermes PowerShell scripts (see app/api/**). Settings stay
// in localStorage. The function signatures are unchanged from the mock so the
// UI components did not need to be rewritten.
// ---------------------------------------------------------------------------

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 32)
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`)
  return (await res.json()) as T
}

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return (await res.json()) as T
}

// Read switchBehavior synchronously from persisted settings (best-effort).
function noKillFromSettings(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS.general.switchBehavior === 'keep'
    const s = JSON.parse(raw) as Partial<Settings>
    return s.general?.switchBehavior === 'keep'
  } catch {
    return false
  }
}

// --- Profiles ---
export async function listProfiles(): Promise<Profile[]> {
  try {
    return await getJson<Profile[]>('/api/profiles')
  } catch {
    return []
  }
}

export async function getActiveProfile(): Promise<Profile | undefined> {
  const profiles = await listProfiles()
  return profiles.find((p) => p.active)
}

export async function switchProfile(slug: string): Promise<ActionResult> {
  return postJson<ActionResult>('/api/profiles/switch', {
    slug,
    noKill: noKillFromSettings(),
  })
}

export async function createProfile(
  input: CreateProfileInput,
): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, message: 'Name is required' }
  return postJson<ActionResult>('/api/profiles/new', input)
}

export async function adoptProfile(
  input: AdoptProfileInput,
): Promise<ActionResult> {
  if (!input.location.trim())
    return { ok: false, message: 'Folder path is required' }
  return postJson<ActionResult>('/api/profiles/adopt', input)
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, message: 'Name is required' }
  return postJson<ActionResult>('/api/profiles/update', input)
}

export type ProfileAction = 'launch' | 'sync' | 'open' | 'shortcut' | 'cursor'

export async function runProfileAction(
  action: ProfileAction,
  profile: Profile,
): Promise<ActionResult> {
  return postJson<ActionResult>('/api/profiles/action', {
    action,
    slug: profile.slug,
    path: profile.path,
    name: profile.name,
  })
}

// --- Service health (real TCP probes) ---
export async function probeServices(
  services: MonitoredService[],
): Promise<Service[]> {
  try {
    return await postJson<Service[]>('/api/health', { services })
  } catch {
    return services
      .filter((s) => s.enabled)
      .map((s) => ({
        id: s.id,
        label: s.name.toUpperCase(),
        port: s.port ? String(s.port) : undefined,
        status: 'checking' as const,
      }))
  }
}

// --- Settings persistence (localStorage; client-only) ---
const SETTINGS_KEY = 'profile-jedi:settings'

export async function getSettings(): Promise<Settings> {
  if (typeof window === 'undefined') return structuredClone(DEFAULT_SETTINGS)
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    return mergeSettings(raw ? JSON.parse(raw) : null)
  } catch {
    return structuredClone(DEFAULT_SETTINGS)
  }
}

export async function updateSettings(next: Settings): Promise<Settings> {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  }
  return next
}

export async function resetSettings(): Promise<Settings> {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SETTINGS_KEY)
  }
  return structuredClone(DEFAULT_SETTINGS)
}

// --- Backend utilities ---
export async function testBackend(): Promise<ActionResult> {
  try {
    return await getJson<ActionResult>('/api/backend/test')
  } catch {
    return { ok: false, message: 'Backend unreachable' }
  }
}

export async function exportRegistry(): Promise<ActionResult> {
  return postJson<ActionResult>('/api/registry/backup')
}

export async function backupNow(): Promise<ActionResult> {
  return postJson<ActionResult>('/api/registry/backup')
}

export async function restoreBackup(): Promise<ActionResult> {
  return postJson<ActionResult>('/api/registry/restore')
}

export async function importRegistry(): Promise<ActionResult> {
  return postJson<ActionResult>('/api/system/open-registry-folder')
}

export async function repairAllCliProfiles(): Promise<ActionResult> {
  return postJson<ActionResult>('/api/profiles/repair-cli')
}

export async function openHermesDataFolder(): Promise<ActionResult> {
  return postJson<ActionResult>('/api/system/open-data-folder')
}

export async function pickFolder(body?: {
  initialPath?: string
  description?: string
}): Promise<{ ok: boolean; cancelled?: boolean; path?: string | null }> {
  return postJson('/api/system/pick-folder', body ?? {})
}

export async function enableTrayStartupOnLogin(): Promise<ActionResult> {
  return postJson<ActionResult>('/api/system/tray-startup')
}

// --- Google API stack (LiteLLM + ngrok) ---
export type GoogleApiState =
  | 'offline'
  | 'starting'
  | 'online'
  | 'degraded'
  | 'stopping'

export type GoogleApiStatus = {
  state: GoogleApiState
  litellm: boolean
  ngrok: boolean
  vertex: boolean
  publicUrl: string | null
  port: number
}

const GOOGLE_OFFLINE: GoogleApiStatus = {
  state: 'offline',
  litellm: false,
  ngrok: false,
  vertex: false,
  publicUrl: null,
  port: 4000,
}

export async function getGoogleApiStatus(): Promise<GoogleApiStatus> {
  try {
    return await getJson<GoogleApiStatus>('/api/google-api/status')
  } catch {
    return { ...GOOGLE_OFFLINE }
  }
}

export async function startGoogleApi(): Promise<void> {
  await postJson('/api/google-api/start')
}

export async function stopGoogleApi(): Promise<void> {
  await postJson('/api/google-api/stop')
}

export async function restartGoogleApi(): Promise<void> {
  await postJson('/api/google-api/restart')
}

export async function toggleGoogleApi(on: boolean): Promise<ActionResult> {
  if (on) await startGoogleApi()
  else await stopGoogleApi()
  return {
    ok: true,
    message: on ? 'Google API stack starting' : 'Google API stack stopping',
  }
}

// --- TaskBoard / Kanban stack ---
export type TaskboardTarget = 'taskboard' | 'kanban' | 'dashboard'

export type TaskboardStatus = {
  taskboard: boolean
  kanban: boolean
  dashboard: boolean
}

export async function getTaskboardStatus(): Promise<TaskboardStatus> {
  try {
    return await getJson<TaskboardStatus>('/api/taskboard/status')
  } catch {
    return { taskboard: false, kanban: false, dashboard: false }
  }
}

export async function openTaskboard(
  target: TaskboardTarget,
  boardId?: string,
): Promise<{ ok: boolean; url: string; started: boolean }> {
  return postJson('/api/taskboard/open', { target, boardId })
}

export async function stopTaskboard(): Promise<void> {
  await postJson('/api/taskboard/stop')
}

export async function getLastCommandOutput(): Promise<string> {
  try {
    const { output } = await getJson<{ output: string }>('/api/last-output')
    return output
  } catch {
    return 'Could not read last command output.'
  }
}
