'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export function SectionHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3
      className={cn(
        'eyebrow mb-1 mt-1 font-mono text-[10px] text-gold',
        className,
      )}
    >
      {children}
    </h3>
  )
}

export function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass divide-y divide-border overflow-hidden rounded-xl">
      {children}
    </div>
  )
}

export function SettingRow({
  label,
  helper,
  htmlFor,
  children,
  stacked,
}: {
  label: string
  helper?: string
  htmlFor?: string
  children: React.ReactNode
  stacked?: boolean
}) {
  return (
    <div
      className={cn(
        'compact-pad flex gap-4 px-4 py-3.5',
        stacked
          ? 'flex-col'
          : 'flex-col sm:flex-row sm:items-center sm:justify-between',
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
        {helper ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {helper}
          </p>
        ) : null}
      </div>
      <div className={cn('shrink-0', stacked && 'w-full')}>{children}</div>
    </div>
  )
}

type Option = { value: string; label: string }

export function SettingSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  className,
}: {
  value: string
  onValueChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(String(v))}>
      <SelectTrigger className={cn('min-w-44 bg-secondary/40', className)}>
        <SelectValue>
          {(val: unknown) =>
            options.find((o) => o.value === val)?.label ?? placeholder
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="glass-strong">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function CopyableValue({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }
  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2',
        className,
      )}
    >
      <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/80">
        {value}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy value"
        className="shrink-0 text-faint transition-colors hover:text-foreground"
      >
        {copied ? (
          <Check className="size-3.5 text-success" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>
    </div>
  )
}
