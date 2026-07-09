'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import { AdoptProfileDialog } from '@/components/adopt-profile-dialog'
import { CreateProfileDialog } from '@/components/create-profile-dialog'
import { DryRunBanner } from '@/components/dry-run-banner'
import { EditProfileDialog } from '@/components/edit-profile-dialog'
import { JarvisFooter } from '@/components/jarvis-footer'
import { ProfileCommandPalette } from '@/components/profile-command-palette'
import { ProfileDetail } from '@/components/profile-detail'
import { ProfileList } from '@/components/profile-list'
import { useSettings } from '@/components/settings-provider'
import { SettingsDialog } from '@/components/settings/settings-dialog'
import { SwitchProfileDialog } from '@/components/switch-profile-dialog'
import { TopBar } from '@/components/top-bar'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  adoptProfile,
  createProfile,
  listProfiles,
  type ProfileAction,
  probeServices,
  repairAllCliProfiles,
  runProfileAction,
  switchProfile,
  updateProfile,
} from '@/lib/api'
import { quickActionCommand } from '@/lib/commands'
import { matchesShortcut } from '@/lib/settings'
import type {
  AdoptProfileInput,
  CreateProfileInput,
  Profile,
  UpdateProfileInput,
} from '@/lib/types'

export default function Page() {
  const { settings } = useSettings()

  const { data: profiles = [], mutate: mutateProfiles } = useSWR(
    'profiles',
    listProfiles,
    { revalidateOnFocus: false },
  )

  const enabledServices = settings.console.services
  const { data: services = [] } = useSWR(
    ['health', enabledServices],
    () => probeServices(enabledServices),
    { refreshInterval: settings.console.pollIntervalMs },
  )

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [adoptOpen, setAdoptOpen] = useState(false)
  const [switchOpen, setSwitchOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editProfile, setEditProfile] = useState<Profile | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [repairingCli, setRepairingCli] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const activeProfile = useMemo(
    () => profiles.find((p) => p.active) ?? null,
    [profiles],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return profiles
    return profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q),
    )
  }, [profiles, query])

  // Default selection: active profile, else first.
  useEffect(() => {
    if (selectedSlug && profiles.some((p) => p.slug === selectedSlug)) return
    const fallback = activeProfile?.slug ?? profiles[0]?.slug ?? null
    setSelectedSlug(fallback)
  }, [profiles, activeProfile, selectedSlug])

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.slug === selectedSlug) ?? null,
    [profiles, selectedSlug],
  )

  const dryRun = settings.advanced.dryRun

  const handleSwitch = useCallback(
    async (slug: string) => {
      setSelectedSlug(slug)
      if (dryRun) {
        const cmd = `.\\Switch-Hermes-Profile.ps1 -Action switch -Profile ${slug}`
        console.log(JSON.stringify({ action: 'switch', command: cmd }))
        toast.message('Dry-Run: Switch Profile', { description: cmd })
        return
      }
      const res = await switchProfile(slug)
      await mutateProfiles()
      if (res.ok) toast.success(res.message)
      else toast.error(res.message)
    },
    [mutateProfiles, dryRun],
  )

  const handleAction = useCallback(
    async (action: ProfileAction, profile: Profile) => {
      const command = quickActionCommand(action, profile)
      console.log(JSON.stringify({ action, command }))
      if (dryRun) {
        toast.message(`Dry-Run: ${action}`, { description: command })
        return
      }
      const res = await runProfileAction(action, profile)
      if (res.ok) toast.success(res.message, { description: command })
      else toast.error(res.message)
    },
    [dryRun],
  )

  const handleCreate = useCallback(
    async (input: CreateProfileInput) => {
      const res = await createProfile(input)
      await mutateProfiles()
      if (res.ok) {
        toast.success(res.message)
        setCreateOpen(false)
      } else {
        toast.error(res.message)
      }
    },
    [mutateProfiles],
  )

  const handleEdit = useCallback((profile: Profile) => {
    setEditProfile(profile)
    setEditOpen(true)
  }, [])

  const handleEditSubmit = useCallback(
    async (input: UpdateProfileInput) => {
      const res = await updateProfile(input)
      await mutateProfiles()
      if (res.ok) {
        toast.success(res.message)
        setEditOpen(false)
      } else {
        toast.error(res.message)
      }
    },
    [mutateProfiles],
  )

  const handleAdopt = useCallback(
    async (input: AdoptProfileInput) => {
      const res = await adoptProfile(input)
      await mutateProfiles()
      if (res.ok) {
        toast.success(res.message)
        setAdoptOpen(false)
      } else {
        toast.error(res.message)
      }
    },
    [mutateProfiles],
  )

  const handleRepairCli = useCallback(async () => {
    if (dryRun) {
      toast.message('Dry-Run: Repair CLI', {
        description:
          '.\\Switch-Hermes-Profile.ps1 -Action repair-cli-all',
      })
      return
    }
    setRepairingCli(true)
    try {
      const res = await repairAllCliProfiles()
      await mutateProfiles()
      if (res.ok) toast.success(res.message)
      else toast.error(res.message)
    } finally {
      setRepairingCli(false)
    }
  }, [dryRun, mutateProfiles])

  // Keyboard shortcuts driven by the configurable bindings in settings.
  useEffect(() => {
    const sc = settings.shortcuts
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      if (matchesShortcut(e, sc.palette)) {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      } else if (matchesShortcut(e, sc.new)) {
        e.preventDefault()
        setCreateOpen(true)
      } else if (matchesShortcut(e, sc.settings)) {
        e.preventDefault()
        setSettingsOpen(true)
      } else if (!typing && matchesShortcut(e, sc.search)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [settings.shortcuts])

  const showFooter = settings.console.showFooter

  return (
    <TooltipProvider delay={250}>
      <div aria-hidden className="app-bg-image" />
      <div aria-hidden className="app-bg-overlay" />
      <div aria-hidden className="app-bg-vignette" />
      <div aria-hidden className="app-vignette" />
      <div aria-hidden className="app-grain" />
      <div className="relative z-10 flex h-[100dvh] flex-col gap-3 overflow-hidden p-3 sm:p-4">
        <TopBar
          ref={searchRef}
          query={query}
          onQueryChange={setQuery}
          onSearchFocus={() => {}}
          activeProfile={activeProfile}
          selectedProfile={selectedProfile}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <DryRunBanner />

        <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[38fr_62fr]">
          <div className="min-h-0">
            <ProfileList
              profiles={filtered}
              selectedSlug={selectedSlug}
              onSelect={setSelectedSlug}
              onSwitch={handleSwitch}
              onCreate={() => setCreateOpen(true)}
              onAdopt={() => setAdoptOpen(true)}
              onRepairCli={handleRepairCli}
              repairingCli={repairingCli}
            />
          </div>
          <div className="min-h-0">
            <ProfileDetail
              profile={selectedProfile}
              onSwitch={handleSwitch}
              onAction={handleAction}
              onEdit={handleEdit}
            />
          </div>
        </main>

        {showFooter ? (
          <JarvisFooter
            services={services}
            onSwitch={() => setSwitchOpen(true)}
            onCreate={() => setCreateOpen(true)}
            onAdopt={() => setAdoptOpen(true)}
          />
        ) : null}

        <ProfileCommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          profiles={profiles}
          onSwitch={(slug) => {
            setPaletteOpen(false)
            handleSwitch(slug)
          }}
          onCreate={() => {
            setPaletteOpen(false)
            setCreateOpen(true)
          }}
          onAdopt={() => {
            setPaletteOpen(false)
            setAdoptOpen(true)
          }}
        />

        <CreateProfileDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={handleCreate}
        />
        <AdoptProfileDialog
          open={adoptOpen}
          onOpenChange={setAdoptOpen}
          onSubmit={handleAdopt}
        />
        <SwitchProfileDialog
          open={switchOpen}
          onOpenChange={setSwitchOpen}
          profiles={profiles}
          activeProfile={activeProfile}
          dryRun={dryRun}
          onConfirm={handleSwitch}
        />
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={editProfile}
          onSubmit={handleEditSubmit}
        />
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </TooltipProvider>
  )
}
