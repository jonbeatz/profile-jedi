'use client'

import { Check, Copy, Terminal } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function CommandPreview({
  command,
  label = 'Command preview',
  className,
}: {
  command: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-[#08080b]',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-gold" aria-hidden />
          <span className="eyebrow font-mono text-[10px] text-muted-foreground">
            {label}
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Copy command"
        >
          {copied ? (
            <Check className="size-3 text-success" />
          ) : (
            <Copy className="size-3" />
          )}
        </button>
      </div>
      <div className="flex items-start gap-2 px-3 py-3 font-mono text-[12.5px] leading-relaxed">
        <span className="select-none text-muted-foreground">{'>'}</span>
        <code className="whitespace-pre-wrap break-all text-foreground/90">
          {command}
        </code>
        <span className="ml-0.5 inline-block h-[15px] w-[7px] animate-pulse bg-muted-foreground align-middle" />
      </div>
    </div>
  )
}
