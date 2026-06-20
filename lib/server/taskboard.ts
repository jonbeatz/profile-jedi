// Server-only TaskBoard / Kanban stack control.
//   TaskBoardAI   -> :3001  (per-project board via ?board=<id>)
//   Hermes Kanban -> :3005
//   Hermes Dash   -> :9119
// We probe the ports, auto-start the stack (start-kanban-stack.ps1) when it's
// down, and resolve the URL to open for the active profile.

import net from 'node:net'
import { SERVER_CONFIG } from './config'
import { spawnDetached } from './ps'

export type TaskboardTarget = 'taskboard' | 'kanban' | 'dashboard'

export type TaskboardStatus = {
  taskboard: boolean
  kanban: boolean
  dashboard: boolean
}

const { taskboardPort, kanbanPort, dashboardPort } = SERVER_CONFIG.kanban

function probePort(port: number, timeout = 1200): Promise<boolean> {
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
    socket.connect(port, '127.0.0.1')
  })
}

export async function getStatus(): Promise<TaskboardStatus> {
  const [taskboard, kanban, dashboard] = await Promise.all([
    probePort(taskboardPort),
    probePort(kanbanPort),
    probePort(dashboardPort),
  ])
  return { taskboard, kanban, dashboard }
}

/** Start the whole stack if TaskBoardAI (3001) isn't already listening. */
export async function ensureStack(): Promise<boolean> {
  if (await probePort(taskboardPort)) return true
  spawnDetached(SERVER_CONFIG.kanban.startScript, 'kanban stack start')
  return false
}

export function stopStack(): void {
  spawnDetached(SERVER_CONFIG.kanban.stopScript, 'kanban stack stop')
}

export function urlFor(target: TaskboardTarget, boardId?: string): string {
  switch (target) {
    case 'kanban':
      return `http://localhost:${kanbanPort}`
    case 'dashboard':
      return `http://localhost:${dashboardPort}`
    default: {
      const base = `http://localhost:${taskboardPort}`
      return boardId ? `${base}/?board=${encodeURIComponent(boardId)}` : base
    }
  }
}
