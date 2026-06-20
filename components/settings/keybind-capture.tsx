'use client'

import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

function eventToBinding(e: React.KeyboardEvent): string | null {
  const key = e.key
  // Ignore lone modifier presses; wait for a real key.
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) return null

  const parts: string[] = []
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')

  let label = key
  if (key === ' ') label = 'Space'
  else if (key === 'Escape') label = 'Esc'
  else if (key === 'ArrowUp') label = '↑'
  else if (key === 'ArrowDown') label = '↓'
  else if (key.length === 1) label = key.toUpperCase()

  parts.push(label)
  return parts.join('+')
}

export function KeybindCapture({
  value,
  defaultValue,
  conflict,
  onChange,
}: {
  value: string
  defaultValue: string
  conflict?: boolean
  onChange: (binding: string) => void
}) {
  const [recording, setRecording] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setRecording((r) => !r)}
        onKeyDown={(e) => {
          if (!recording) return
          e.preventDefault()
          if (e.key === 'Escape') {
            setRecording(false)
            return
          }
          const binding = eventToBinding(e)
          if (binding) {
            onChange(binding)
            setRecording(false)
          }
        }}
        className={cn(
          'min-w-28 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors outline-none',
          recording
            ? 'border-gold/60 bg-accent text-gold animate-pulse-gold'
            : conflict
              ? 'border-danger/50 bg-danger/10 text-danger'
              : 'border-border bg-secondary/60 text-foreground hover:border-gold/30',
        )}
      >
        {recording ? 'Press keys…' : value}
      </button>
      {value !== defaultValue ? (
        <button
          type="button"
          onClick={() => onChange(defaultValue)}
          aria-label="Reset to default"
          className="text-faint transition-colors hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
}
