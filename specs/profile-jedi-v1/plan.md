# Plan: Profile Jedi v1.0 — Hermes Profile Switcher

## Problem / Goal

Hermes AI-agent profiles (self-contained workspaces with CLI profile, mem0 collection, and desktop launcher) were managed exclusively via PowerShell (`Switch-Hermes-Profile.ps1`). Operators needed a **local desktop control panel** that:

- Makes profile switching point-and-click while preserving command transparency
- Monitors sibling stacks (Google API, Kanban, local services)
- Controls Profile Jedi's own lifecycle (start/stop/restart) reliably
- Stays localhost-only and safe for PowerShell execution

## Proposed Solution

Build **Profile Jedi** — a Next.js 16 dashboard at port **7780** that:

1. Calls Route Handlers which shell out to existing Hermes PowerShell scripts
2. Uses a **tray supervisor** on port **7781** that survives app shutdown (enables restart)
3. Provides desktop shortcuts as a fallback control path
4. Documents everything in `Hermes-Profile-Switcher.md` for agents and future upgrades

## Tech Stack & Impact

| Layer | Technology |
|-------|------------|
| UI | Next.js 16, React 19, Tailwind v4, shadcn/Base UI, Motion, SWR, sonner |
| Server | 15 Route Handlers, `lib/server/{ps,config,google-api,taskboard}.ts` |
| Lifecycle | `profile-jedi-tray.ps1`, `start/stop-profile-jedi.ps1`, shortcut creator |
| Backend (external) | `Switch-Hermes-Profile.ps1`, google-api scripts, kanban stack scripts |

## Acceptance Criteria

- [x] List, switch, create, adopt, edit profiles from UI
- [x] Quick actions: launch, sync, open folder, reveal shortcut, edit in Cursor
- [x] Live command preview + Dry-Run mode
- [x] Google API start/stop/restart with real status probes
- [x] TaskBoard/Kanban integration with per-profile `boardId`
- [x] J.A.R.V.I.S. footer with service health capsules
- [x] Settings panel (7 sections, localStorage persistence)
- [x] Tray supervisor on 7781 with HTTP API + NotifyIcon menu
- [x] Desktop shortcuts (launch, stop, tray; optional startup)
- [x] In-app Stop (self-destruct) + Restart (via supervisor)
- [x] Bound to 127.0.0.1 only
- [x] Master documentation (`Hermes-Profile-Switcher.md`)
- [x] Public GitHub repo with README, specs, v1.0.0 release

## Release

- **Version:** 1.0.0
- **Tag:** `v1.0.0`
- **Repo:** https://github.com/jonbeatz/profile-jedi
