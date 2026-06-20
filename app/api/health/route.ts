import net from 'node:net'
import { NextResponse } from 'next/server'
import type { MonitoredService, Service } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function probePort(host: string, port: number, timeout = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let done = false
    const finish = (up: boolean) => {
      if (done) return
      done = true
      socket.destroy()
      resolve(up)
    }
    socket.setTimeout(timeout)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
    socket.connect(port, host || '127.0.0.1')
  })
}

export async function POST(req: Request) {
  const { services } = (await req.json()) as { services?: MonitoredService[] }
  const list = (services ?? []).filter((s) => s.enabled)

  const result: Service[] = await Promise.all(
    list.map(async (s) => {
      let status: Service['status'] = 'checking'
      if (s.port) {
        status = (await probePort(s.host || '127.0.0.1', s.port))
          ? 'online'
          : 'offline'
      } else {
        // No port (e.g. Hermes gateway) — mark online as a soft default.
        status = 'online'
      }
      return {
        id: s.id,
        label: s.name.toUpperCase(),
        port: s.port ? String(s.port) : undefined,
        status,
      }
    }),
  )

  return NextResponse.json(result)
}
