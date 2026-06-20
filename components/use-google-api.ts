'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import { useSettings } from '@/components/settings-provider'
import type { DotTone } from '@/components/status-dot'
import {
  getGoogleApiStatus,
  restartGoogleApi,
  startGoogleApi,
  stopGoogleApi,
  type GoogleApiState,
  type GoogleApiStatus,
} from '@/lib/api'
import { GOOGLE_API_SCRIPTS } from '@/lib/commands'

const OFFLINE: GoogleApiStatus = {
  state: 'offline',
  litellm: false,
  ngrok: false,
  vertex: false,
  publicUrl: null,
  port: 4000,
}

type Action = 'start' | 'stop' | 'restart'

/** Visual metadata for each lifecycle state (dot tone, pulse, label). */
export const GOOGLE_STATE_META: Record<
  GoogleApiState,
  { tone: DotTone; pulse: boolean; label: string }
> = {
  offline: { tone: 'gray', pulse: false, label: 'Offline' },
  starting: { tone: 'gold', pulse: true, label: 'Starting…' },
  online: { tone: 'green', pulse: false, label: 'Online' },
  degraded: { tone: 'amber', pulse: false, label: 'Degraded' },
  stopping: { tone: 'gold', pulse: true, label: 'Stopping…' },
}

/**
 * Shared controller for the local LiteLLM + ngrok ("Google API") stack.
 * Polls status on the configured interval and exposes start/stop/restart with
 * dry-run awareness and Sonner toasts. SWR dedupes by key so the footer cluster
 * and the settings card stay perfectly in sync from one source of truth.
 */
export function useGoogleApi() {
  const { settings } = useSettings()
  const dryRun = settings.advanced.dryRun
  const { data, mutate } = useSWR('google-api', getGoogleApiStatus, {
    refreshInterval: settings.console.pollIntervalMs,
    revalidateOnFocus: false,
  })
  const status = data ?? OFFLINE
  const [busy, setBusy] = useState(false)

  // Catch the mocked lifecycle transitions promptly, independent of the poll.
  const nudge = () => {
    const beats = [300, 1700, 2300, 3800]
    for (const ms of beats) setTimeout(() => void mutate(), ms)
  }

  const dispatch = async (
    action: Action,
    run: () => Promise<void>,
    okMsg: string,
  ) => {
    console.log(JSON.stringify({ action: `google-api:${action}` }))
    if (dryRun) {
      toast.message('Dry-Run', {
        description: `> ${GOOGLE_API_SCRIPTS[action]}`,
      })
      return
    }
    setBusy(true)
    try {
      await run()
      await mutate()
      nudge()
      toast.success(okMsg)
    } catch {
      toast.error(`Could not ${action} the Google API stack`)
    } finally {
      setBusy(false)
    }
  }

  return {
    status,
    dryRun,
    busy,
    meta: GOOGLE_STATE_META[status.state],
    start: () =>
      dispatch('start', startGoogleApi, 'Starting Google API stack'),
    stop: () => dispatch('stop', stopGoogleApi, 'Stopping Google API stack'),
    restart: () =>
      dispatch('restart', restartGoogleApi, 'Restarting Google API stack'),
    copyUrl: async () => {
      if (!status.publicUrl) {
        toast.error('No public URL yet — stack is offline')
        return
      }
      try {
        await navigator.clipboard.writeText(status.publicUrl)
        toast.success('Copied ngrok public URL')
      } catch {
        toast.error('Could not copy URL')
      }
    },
  }
}
