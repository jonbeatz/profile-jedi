'use client'

import { Loader2, Power, RotateCw, Server } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { StatusDot } from '@/components/status-dot'
import {
  getSupervisorStatus,
  shutdownApp,
  startTraySupervisor,
  supervisorRestart,
} from '@/lib/supervisor'

const iconBtn =
  'flex size-9 items-center justify-center rounded-lg border border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-gold/30 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-not-allowed disabled:opacity-40'

/**
 * Footer "Profile Jedi" lifecycle cluster.
 * - Stop is a self-destruct (kills this app's own dev server).
 * - Restart is delegated to the tray supervisor (port 7781), which survives the
 *   app going down; disabled when the supervisor isn't running.
 */
export function AppControl() {
  const { data: sup, mutate } = useSWR('supervisor-status', getSupervisorStatus, {
    refreshInterval: 8000,
    revalidateOnFocus: true,
  })
  const [confirm, setConfirm] = useState<'stop' | 'restart' | null>(null)
  const [busy, setBusy] = useState(false)

  const supervisorUp = Boolean(sup?.reachable)

  const doStop = async () => {
    setBusy(true)
    toast.message('Stopping Profile Jedi…', {
      description: 'The dashboard will go offline. Restart from the tray or shortcut.',
    })
    await shutdownApp()
    // The server is exiting; nothing else to do here.
  }

  const doRestart = async () => {
    setBusy(true)
    try {
      const ok = await supervisorRestart()
      if (ok) {
        toast.message('Restarting via supervisor…', {
          description: 'The page will drop briefly — refresh in a few seconds.',
        })
      } else {
        toast.error('Supervisor not reachable on port 7781')
      }
    } finally {
      setBusy(false)
    }
  }

  const doStartTray = async () => {
    setBusy(true)
    try {
      const result = await startTraySupervisor()
      await mutate()
      if (result.ok) {
        toast.success(result.message, {
          description: 'Restart is now available after Stop.',
        })
      } else {
        toast.error(result.message)
      }
    } finally {
      setBusy(false)
    }
  }

  const confirmCopy =
    confirm === 'restart'
      ? {
          title: 'Restart Profile Jedi?',
          description:
            'The tray supervisor will stop and start the app. This page will drop for a few seconds, then you can refresh.',
          confirmLabel: 'Restart',
          danger: false,
        }
      : {
          title: 'Stop Profile Jedi?',
          description:
            'This stops the app server. The dashboard will become unavailable until you restart it from the tray icon or the desktop shortcut.',
          confirmLabel: 'Stop app',
          danger: true,
        }

  return (
    <div
      role="group"
      aria-label="Profile Jedi app"
      className="flex items-center gap-2 rounded-full border border-border bg-secondary/60 py-1 pl-3 pr-1.5"
    >
      <StatusDot tone={supervisorUp ? 'green' : 'gray'} />
      <span className="font-mono text-[11px] tracking-wide text-foreground/90">
        Profile Jedi
      </span>
      <span
        className="font-mono text-[11px] text-muted-foreground"
        aria-live="polite"
      >
        {supervisorUp ? 'Tray on' : 'Tray off'}
      </span>
      {busy ? (
        <Loader2 className="size-3 animate-spin text-gold" aria-hidden />
      ) : null}

      <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />

      <button
        type="button"
        onClick={() => setConfirm('stop')}
        disabled={busy}
        aria-label="Stop Profile Jedi app"
        className="flex h-9 items-center gap-1.5 rounded-lg border border-transparent px-2.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Power className="size-3.5" /> Stop
      </button>

      <button
        type="button"
        onClick={() => (supervisorUp ? setConfirm('restart') : void doStartTray())}
        disabled={busy}
        aria-label={
          supervisorUp
            ? 'Restart Profile Jedi via tray supervisor'
            : 'Start tray supervisor'
        }
        title={
          supervisorUp
            ? 'Restart via tray supervisor'
            : 'Start the tray supervisor (enables restart after stop)'
        }
        className={iconBtn}
      >
        {supervisorUp ? (
          <RotateCw className="size-3.5" />
        ) : (
          <Server className="size-3.5" />
        )}
      </button>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => {
          if (!o) setConfirm(null)
        }}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={confirmCopy.confirmLabel}
        danger={confirmCopy.danger}
        onConfirm={() => {
          const action = confirm
          setConfirm(null)
          if (action === 'stop') void doStop()
          else if (action === 'restart') void doRestart()
        }}
      />
    </div>
  )
}
