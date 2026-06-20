# Tasks: Profile Jedi v1.0

## Core UI & profiles

- [x] v0.dev design → Next.js app scaffold (NovaMira gold, glass, bento)
- [x] Profile list, detail panel, command palette (`Ctrl+K`)
- [x] Create, adopt, switch, edit profile dialogs
- [x] Wire `lib/api.ts` to real Route Handlers (replace mocks)

## Backend integration

- [x] `lib/server/ps.ts` — execFile + spawnDetached PowerShell runner
- [x] `lib/server/config.ts` — paths/ports with env overrides
- [x] Profile routes: list, switch, new, adopt, update, action
- [x] Google API routes + real probes (`lib/server/google-api.ts`)
- [x] TaskBoard routes + kanban stack control (`lib/server/taskboard.ts`)
- [x] Health probes, registry backup, last-output drawer

## Lifecycle & launcher

- [x] Detached `start-profile-jedi.ps1` (cmd.exe /c pnpm dev)
- [x] `stop-profile-jedi.ps1` (port 7780 tree kill)
- [x] `profile-jedi-tray.ps1` (NotifyIcon + HttpListener 7781)
- [x] `create-profile-jedi-shortcuts.ps1` (+ Startup folder fix)
- [x] In-app `AppControl` — Stop + Restart via supervisor
- [x] `POST /api/system/shutdown` self-destruct route

## Documentation & release

- [x] `Hermes-Profile-Switcher.md` master reference (15 sections)
- [x] README, TRUTH, AGENTS, CHANGELOG, LICENSE, specs/
- [x] GitHub repo + initial commit
- [x] Tag `v1.0.0` + GitHub Release
