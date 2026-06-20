// Server-only Google API (LiteLLM + ngrok) probing + lifecycle.
// Status is derived from real probes:
//   litellm = HTTP /v1/models reachable on port 4000
//   ngrok   = inspector /api/tunnels returns an https tunnel (-> publicUrl)
//   vertex  = /v1/models returns 200 with the master key
// A short-lived pending hint makes start/stop feel responsive (starting/stopping)
// before the ports actually flip.

import { readFileSync } from 'node:fs'
import { SERVER_CONFIG } from './config'
import { spawnDetached } from './ps'

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

const { litellmPort, ngrokInspectorPort } = SERVER_CONFIG.googleApi

// Pending lifecycle hint set by start/stop; cleared once reality catches up
// or after the deadline.
let pending: { state: 'starting' | 'stopping'; until: number } | null = null

function readMasterKey(): string | null {
  try {
    const raw = readFileSync(SERVER_CONFIG.googleApi.envLocal, 'utf8')
    const m = raw.match(/^\s*MSC_LITELLM_MASTER_KEY\s*=\s*(.+)\s*$/m)
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null
  } catch {
    return null
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  ms = 3000,
): Promise<Response | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

async function probeLitellm(): Promise<{ up: boolean; vertex: boolean }> {
  const key = readMasterKey()
  const res = await fetchWithTimeout(
    `http://127.0.0.1:${litellmPort}/v1/models`,
    key ? { headers: { Authorization: `Bearer ${key}` } } : {},
  )
  if (!res) return { up: false, vertex: false }
  // A 401 still proves LiteLLM is listening (just unauthenticated).
  const up = res.status === 200 || res.status === 401
  const vertex = res.status === 200
  return { up, vertex }
}

async function probeNgrok(): Promise<{ up: boolean; publicUrl: string | null }> {
  const res = await fetchWithTimeout(
    `http://127.0.0.1:${ngrokInspectorPort}/api/tunnels`,
  )
  if (!res || !res.ok) return { up: false, publicUrl: null }
  try {
    const body = (await res.json()) as {
      tunnels?: { public_url?: string }[]
    }
    const https = body.tunnels?.find((t) =>
      t.public_url?.startsWith('https://'),
    )
    return {
      up: !!body.tunnels && body.tunnels.length > 0,
      publicUrl: https?.public_url?.replace(/\/$/, '') ?? null,
    }
  } catch {
    return { up: true, publicUrl: null }
  }
}

export async function getStatus(): Promise<GoogleApiStatus> {
  const [litellm, ngrok] = await Promise.all([probeLitellm(), probeNgrok()])

  let state: GoogleApiState
  if (litellm.up && ngrok.up) state = 'online'
  else if (litellm.up && !ngrok.up) state = 'degraded'
  else state = 'offline'

  // Honor a recent start/stop hint until reality agrees or it times out.
  if (pending && Date.now() < pending.until) {
    if (pending.state === 'starting' && state !== 'online') {
      state = 'starting'
    } else if (pending.state === 'stopping' && state !== 'offline') {
      state = 'stopping'
    } else {
      pending = null
    }
  } else if (pending) {
    pending = null
  }

  return {
    state,
    litellm: litellm.up,
    ngrok: ngrok.up,
    vertex: litellm.vertex,
    publicUrl: ngrok.publicUrl,
    port: litellmPort,
  }
}

export function start(): void {
  pending = { state: 'starting', until: Date.now() + 30_000 }
  spawnDetached(SERVER_CONFIG.googleApi.start, 'google-api start')
}

export function stop(): void {
  pending = { state: 'stopping', until: Date.now() + 15_000 }
  spawnDetached(SERVER_CONFIG.googleApi.stop, 'google-api stop')
}

export function restart(): void {
  pending = { state: 'starting', until: Date.now() + 35_000 }
  spawnDetached(SERVER_CONFIG.googleApi.restart, 'google-api restart')
}
