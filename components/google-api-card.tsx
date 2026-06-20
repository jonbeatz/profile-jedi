'use client'

import { Loader2, Play, RotateCw, Square } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { CopyableValue } from '@/components/settings/setting-row'
import { StatusDot, type DotTone } from '@/components/status-dot'
import { useGoogleApi } from '@/components/use-google-api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function HealthRow({
  label,
  detail,
  ok,
  pending,
}: {
  label: string
  detail: string
  ok: boolean
  pending?: boolean
}) {
  const tone: DotTone = pending ? 'gold' : ok ? 'green' : 'gray'
  return (
    <div className="compact-pad flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2.5">
        <StatusDot tone={tone} pulse={pending} />
        <span className="text-sm text-foreground">{label}</span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {detail}
        </span>
      </div>
      <span
        className={cn(
          'eyebrow text-[10px]',
          pending ? 'text-gold' : ok ? 'text-success' : 'text-muted-foreground',
        )}
      >
        {pending ? 'Checking' : ok ? 'Healthy' : 'Down'}
      </span>
    </div>
  )
}

/** Full "Google API Stack" control surface for Settings → Console. */
export function GoogleApiCard() {
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
    <div className="glass divide-y divide-border overflow-hidden rounded-xl">
      {/* Header: combined status + primary actions */}
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <StatusDot tone={meta.tone} pulse={meta.pulse} size={10} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Google API Stack
              </span>
              {transitioning ? (
                <Loader2 className="size-3.5 animate-spin text-gold" aria-hidden />
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              LiteLLM + ngrok — {meta.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={start}
            disabled={disabled || isUp}
            className="gap-1.5 bg-gold font-medium text-primary-foreground hover:bg-gold/90 disabled:opacity-40"
          >
            <Play className="size-3.5" /> Start
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirm('stop')}
            disabled={disabled || !isUp}
            className="gap-1.5 border-border bg-secondary/40 hover:border-danger/40 hover:text-danger disabled:opacity-40"
          >
            <Square className="size-3.5" /> Stop
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirm('restart')}
            disabled={disabled || !isUp}
            className="gap-1.5 border-border bg-secondary/40 hover:border-gold/30 hover:text-gold disabled:opacity-40"
          >
            <RotateCw className="size-3.5" /> Restart
          </Button>
        </div>
      </div>

      {/* Public URL */}
      <div className="flex flex-col gap-2 px-4 py-3.5">
        <span className="text-sm font-medium text-foreground">
          Public ngrok URL
        </span>
        {status.publicUrl ? (
          <CopyableValue value={status.publicUrl} />
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-secondary/30 px-3 py-2">
            <code className="font-mono text-[11px] text-muted-foreground">
              {transitioning ? 'Provisioning tunnel…' : 'Not available — stack offline'}
            </code>
            <button
              type="button"
              onClick={copyUrl}
              disabled
              aria-label="Copy ngrok public URL"
              className="text-faint disabled:opacity-40"
            >
              {/* placeholder copy affordance kept for layout parity */}
            </button>
          </div>
        )}
      </div>

      {/* Health rows */}
      <HealthRow
        label="LiteLLM"
        detail="127.0.0.1:4000"
        ok={status.litellm}
        pending={transitioning && !status.litellm}
      />
      <HealthRow
        label="ngrok tunnel"
        detail="127.0.0.1:4040"
        ok={status.ngrok}
        pending={transitioning && !status.ngrok}
      />
      <HealthRow
        label="Vertex reachability"
        detail="aiplatform.googleapis.com"
        ok={status.vertex}
        pending={transitioning && !status.vertex}
      />

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
