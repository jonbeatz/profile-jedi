'use client'

import { cn } from '@/lib/utils'

type Props = {
  name: string
  size?: 'sm' | 'lg'
  active?: boolean
  className?: string
}

const SIZES = {
  sm: 'size-9 text-sm',
  lg: 'size-12 text-lg',
} as const

export function Monogram({ name, size = 'sm', active = false, className }: Props) {
  const letter = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <span
      aria-hidden
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full font-semibold',
        active
          ? 'animate-pulse-active active-border active-bg active-text border'
          : 'border border-gold/40 bg-accent text-gold',
        SIZES[size],
        className,
      )}
    >
      <span
        className={cn(
          'absolute inset-[2px] rounded-full border',
          active ? 'active-border' : 'border-gold/15',
        )}
        aria-hidden
      />
      {letter}
    </span>
  )
}
