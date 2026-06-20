'use client'

import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { CommandPreview } from '@/components/command-preview'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createCommand, memCollection } from '@/lib/commands'
import type { CreateProfileInput } from '@/lib/types'
import { slugify } from '@/lib/api'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateProfileInput) => Promise<void> | void
}

export function CreateProfileDialog({ open, onOpenChange, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [useDefault, setUseDefault] = useState(true)
  const [customLocation, setCustomLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const defaultLocation = `D:\\Hermes\\${name || '<Name>'}`
  const location = useDefault ? defaultLocation : customLocation
  const slug = useMemo(() => slugify(name), [name])

  useEffect(() => {
    if (!open) {
      setName('')
      setDescription('')
      setUseDefault(true)
      setCustomLocation('')
      setSubmitting(false)
    }
  }, [open])

  const submit = async () => {
    if (!name.trim()) return
    setSubmitting(true)
    await onSubmit({
      name: name.trim(),
      description,
      location: useDefault ? `D:\\Hermes\\${name.trim()}` : customLocation,
    })
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="glass-strong max-w-lg gap-0 border-border p-0"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <DialogHeader className="border-b border-border px-6 py-5 text-left">
            <DialogTitle className="text-lg tracking-tight">
              Create New Profile
            </DialogTitle>
            <DialogDescription>
              Spin up a fresh Hermes workspace with its own CLI profile and
              memory store.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="cp-name">
                Name <span className="text-gold">*</span>
              </Label>
              <Input
                id="cp-name"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                placeholder="JonBeatz"
              />
              <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
                <span>
                  slug:{' '}
                  <span className="text-gold">{slug || '—'}</span>
                </span>
                <span>
                  mem0:{' '}
                  <span className="text-gold">
                    {slug ? memCollection(slug) : '—'}
                  </span>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cp-desc">Description</Label>
              <Textarea
                id="cp-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Personal AI command center"
                rows={2}
              />
            </div>

            <div className="space-y-2 rounded-xl border border-border bg-secondary/30 p-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="cp-default" className="text-xs">
                  Use default location
                </Label>
                <Switch
                  id="cp-default"
                  checked={useDefault}
                  onCheckedChange={setUseDefault}
                />
              </div>
              <Input
                value={location}
                disabled={useDefault}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="D:\Hermes\Custom"
                className="font-mono text-xs"
              />
            </div>

            <CommandPreview
              command={createCommand(name, location, description)}
            />
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={!name.trim() || submitting}
              className="gap-2 bg-gold font-medium text-primary-foreground hover:bg-gold/90"
            >
              {submitting ? 'Creating…' : 'Create Profile'}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
