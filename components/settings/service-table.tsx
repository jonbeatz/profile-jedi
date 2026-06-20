'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { MonitoredService } from '@/lib/types'

export function ServiceTable({
  services,
  onChange,
}: {
  services: MonitoredService[]
  onChange: (services: MonitoredService[]) => void
}) {
  const update = (id: string, patch: Partial<MonitoredService>) =>
    onChange(services.map((s) => (s.id === id ? { ...s, ...patch } : s)))

  const remove = (id: string) => onChange(services.filter((s) => s.id !== id))

  const add = () =>
    onChange([
      ...services,
      {
        id: `svc-${Date.now()}`,
        name: 'New Service',
        host: '127.0.0.1',
        port: 8000,
        enabled: true,
      },
    ])

  return (
    <div className="glass overflow-hidden rounded-xl">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-10 text-muted-foreground">On</TableHead>
            <TableHead className="text-muted-foreground">Name</TableHead>
            <TableHead className="text-muted-foreground">Host</TableHead>
            <TableHead className="w-24 text-muted-foreground">Port</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((s) => (
            <TableRow key={s.id} className="border-border">
              <TableCell>
                <Switch
                  checked={s.enabled}
                  onCheckedChange={(v) => update(s.id, { enabled: v })}
                  aria-label={`Toggle ${s.name}`}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={s.name}
                  onChange={(e) => update(s.id, { name: e.target.value })}
                  className="h-8 bg-secondary/40 text-sm"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={s.host}
                  onChange={(e) => update(s.id, { host: e.target.value })}
                  placeholder="label only"
                  className="h-8 bg-secondary/40 font-mono text-xs"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={s.port ?? ''}
                  inputMode="numeric"
                  onChange={(e) =>
                    update(s.id, {
                      port: e.target.value
                        ? Number(e.target.value.replace(/\D/g, ''))
                        : undefined,
                    })
                  }
                  className="h-8 bg-secondary/40 font-mono text-xs"
                />
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  aria-label={`Remove ${s.name}`}
                  className="text-faint transition-colors hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="border-t border-border px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          onClick={add}
          className="gap-1.5 border-border bg-secondary/40 text-xs hover:border-gold/30 hover:text-gold"
        >
          <Plus className="size-3.5" /> Add Service
        </Button>
      </div>
    </div>
  )
}
