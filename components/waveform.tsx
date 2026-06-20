'use client'

import { motion, useReducedMotion } from 'motion/react'

const BARS = [0.4, 0.75, 1, 0.6, 0.9, 0.5, 0.8]

type WaveColor = 'gold' | 'white' | 'gradient'

function barBackground(color: WaveColor, peak: number): string {
  if (color === 'white') return 'var(--foreground)'
  if (color === 'gradient')
    return `linear-gradient(to top, var(--gold), color-mix(in oklch, var(--gold) ${
      40 + peak * 50
    }%, var(--foreground)))`
  return 'var(--gold)'
}

export function Waveform({
  active = true,
  color = 'gold',
}: {
  active?: boolean
  color?: WaveColor
}) {
  const reduce = useReducedMotion()
  const animate = active && !reduce
  const glow =
    color === 'white'
      ? '0 0 8px rgba(255,255,255,0.45)'
      : '0 0 8px rgba(var(--accent-rgb), 0.6)'

  return (
    <div
      className="flex h-6 items-center gap-[3px]"
      role="img"
      aria-label="J.A.R.V.I.S. voice activity"
    >
      {BARS.map((peak, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{
            background: barBackground(color, peak),
            boxShadow: animate ? glow : 'none',
          }}
          initial={{ height: 4 }}
          animate={animate ? { height: [4, 6 + peak * 18, 4] } : { height: 8 + peak * 6 }}
          transition={{
            duration: 1 + peak * 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.09,
          }}
        />
      ))}
    </div>
  )
}
