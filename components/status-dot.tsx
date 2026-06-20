'use client'

import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

export type DotTone = 'gray' | 'gold' | 'green' | 'amber'

const TONE: Record<DotTone, string> = {
  gray: 'var(--text-muted-2)',
  gold: 'var(--gold)',
  green: 'var(--success)',
  amber: 'var(--warning)',
}

type Props = {
  tone?: DotTone
  /** Animated pulse — used for transient STARTING / STOPPING states. */
  pulse?: boolean
  /** Diameter in px. */
  size?: number
  className?: string
}

/**
 * A single status indicator dot. Pulses for transient states and honors
 * prefers-reduced-motion (falls back to a steady dot when motion is reduced).
 */
export function StatusDot({ tone = 'gray', pulse = false, size = 8, className }: Props) {
  const reduce = useReducedMotion()
  const color = TONE[tone]
  const animated = pulse && !reduce

  return (
    <motion.span
      className={cn('inline-block shrink-0 rounded-full', className)}
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: tone === 'gray' ? 'none' : `0 0 8px ${color}`,
      }}
      animate={
        animated
          ? { opacity: [0.4, 1, 0.4], scale: [0.82, 1, 0.82] }
          : { opacity: tone === 'gray' ? 0.6 : 1, scale: 1 }
      }
      transition={
        animated
          ? { duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }
          : { duration: 0.25 }
      }
      aria-hidden
    />
  )
}
