'use client'

import { Copy, Loader2, Play, RotateCw, Square } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { StatusDot } from '@/components/status-dot'
import { useGoogleApi } from '@/components/use-google-api'
import { cn } from '@/lib/utils'

const iconBtn =
  'flex size-9 items-center justify-center rounded-lg border border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-gold/30 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-not-allowed disabled:opacity-40'

/**
 * Footer "Google API" cluster — replaces the old LiteLLM 4000 / ngrok 4040
 * capsules with a combined, status-aware control.
 */
export function GoogleApiControl() {
  const { status, meta, busy, start, stop, restart, copyUrl } = useGoogleApi()
  const [confirm, setConfirm] = useState<'stop' | 'restart' | null>(null)

  const transitioning = status.state === 'starting' || status.state === 'stopping'
  const isUp = status.state === 'online' || status.state === 'degraded'
  const disabled = busy || transitioning

  const confirmCopy =
    confirm === 'restart'
      ? {
          title: 'Restart the Google API stack?',
          description:
            'This will stop the local LiteLLM + ngrok stack and start it again. In-flight requests may fail.',
          confirmLabel: 'Restart',
        }
      : {
          title: 'Stop the Google API stack?',
          description:
            'This will stop the local LiteLLM + ngrok stack. In-flight requests may fail.',
          confirmLabel: 'Stop',
        }

  return (
    <div
      role="group"
      aria-label="Google API stack"
      className="flex items-center gap-2 rounded-full border border-border bg-secondary/60 py-1 pl-3 pr-1.5"
    >
      <StatusDot tone={meta.tone} pulse={meta.pulse} />
      <span className="font-mono text-[11px] tracking-wide text-foreground/90">
        Google API
      </span>
      <span
        className="font-mono text-[11px] text-muted-foreground"
        aria-live="polite"
      >
        {meta.label}
      </span>
      {transitioning ? (
        <Loader2 className="size-3 animate-spin text-gold" aria-hidden />
      ) : null}

      <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />

      {isUp ? (
        <button
          type="button"
          onClick={() => setConfirm('stop')}
          disabled={disabled}
          aria-label="Stop Google API stack"
          className="flex h-9 items-center gap-1.5 rounded-lg border border-transparent px-2.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Square className="size-3.5" /> Stop
        </button>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={disabled}
          aria-label="Start Google API stack"
          className="flex h-9 items-center gap-1.5 rounded-lg bg-gold px-2.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play className="size-3.5" /> Start
        </button>
      )}

      <button
        type="button"
        onClick={() => setConfirm('restart')}
        disabled={disabled || !isUp}
        aria-label="Restart Google API stack"
        className={iconBtn}
      >
        <RotateCw className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={copyUrl}
        disabled={!status.publicUrl}
        aria-label="Copy ngrok public URL"
        className={cn(iconBtn)}
      >
        <Copy className="size-3.5" />
      </button>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => {
          if (!o) setConfirm(null)
        }}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={confirmCopy.confirmLabel}
        onConfirm={() => {
          const action = confirm
          setConfirm(null)
          if (action === 'stop') stop()
          else if (action === 'restart') restart()
        }}
      />
    </div>
  )
}
