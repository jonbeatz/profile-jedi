'use client'

import { useMemo } from 'react'
import { KeybindCapture } from '@/components/settings/keybind-capture'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SHORTCUT_DEFS } from '@/lib/settings'

// These bindings are fixed list-navigation keys and not user-rebindable.
const FIXED = new Set(['search', 'switch', 'navigate'])

export function ShortcutTable({
  shortcuts,
  onChange,
  onResetAll,
}: {
  shortcuts: Record<string, string>
  onChange: (id: string, binding: string) => void
  onResetAll: () => void
}) {
  // Detect duplicate bindings (conflicts) across editable rows.
  const conflicts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const def of SHORTCUT_DEFS) {
      const b = shortcuts[def.id]
      counts[b] = (counts[b] ?? 0) + 1
    }
    const set = new Set<string>()
    for (const [b, n] of Object.entries(counts)) if (n > 1) set.add(b)
    return set
  }, [shortcuts])

  return (
    <div className="glass overflow-hidden rounded-xl">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Action</TableHead>
            <TableHead className="text-muted-foreground">Keybinding</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SHORTCUT_DEFS.map((def) => {
            const binding = shortcuts[def.id] ?? def.default
            const isConflict = conflicts.has(binding) && !FIXED.has(def.id)
            return (
              <TableRow key={def.id} className="border-border">
                <TableCell className="font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    {def.action}
                    {isConflict ? (
                      <Badge variant="destructive" className="h-4 px-1.5">
                        conflict
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  {FIXED.has(def.id) ? (
                    <span className="inline-block min-w-28 rounded-md border border-border bg-secondary/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                      {binding}
                    </span>
                  ) : (
                    <KeybindCapture
                      value={binding}
                      defaultValue={def.default}
                      conflict={isConflict}
                      onChange={(b) => onChange(def.id, b)}
                    />
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <div className="flex justify-end border-t border-border px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onResetAll}
          className="border-border bg-secondary/40 text-xs hover:border-gold/30 hover:text-gold"
        >
          Reset all shortcuts
        </Button>
      </div>
    </div>
  )
}
