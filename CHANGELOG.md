# Changelog

All notable changes to Profile Jedi are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- (nothing yet)

## [1.0.0] - 2026-06-19

### Added

- **Profile Jedi dashboard** — Next.js 16 App Router UI at `http://127.0.0.1:7780` with NovaMira glass aesthetic.
- **Profile management** — list, switch, create, adopt, edit (name, description, path, `boardId`); slug remains read-only identity key.
- **Quick actions** — Launch Hermes, Sync CLI, Open Folder, Reveal Shortcut, Edit in Cursor with live command preview.
- **15 API Route Handlers** — profiles, health, Google API, TaskBoard, registry backup, system shutdown, backend test, last output.
- **PowerShell backend** — `lib/server/ps.ts` (`execFile`, detached spawn) driving `Switch-Hermes-Profile.ps1`.
- **Google API control** — start/stop/restart LiteLLM + ngrok stack with real probes (LiteLLM `/v1/models`, ngrok `/api/tunnels`, Vertex auth).
- **TaskBoard / Kanban integration** — Extras menu with per-profile `boardId` deep-links; auto-start Kanban stack.
- **J.A.R.V.I.S. footer** — service health capsules, Google API cluster, Profile Jedi lifecycle cluster.
- **Settings panel** — General, Appearance, Console, Shortcuts, Integrations, Data, Advanced (localStorage).
- **System tray supervisor** — `profile-jedi-tray.ps1` on port 7781 (Start/Stop/Restart/Open + HTTP API + CORS).
- **Desktop shortcuts** — `create-profile-jedi-shortcuts.ps1` (launch, stop, tray; optional `-Startup`).
- **In-app lifecycle** — Stop (self-destruct via `/api/system/shutdown`) + Restart (via tray supervisor).
- **Detached launcher** — `start-profile-jedi.ps1` spawns dev server hidden; window can close.
- **Documentation** — `Hermes-Profile-Switcher.md` (15-section master reference), `TRUTH.md`, `AGENTS.md`, `specs/profile-jedi-v1/`.
- **GitHub release** — public repo [jonbeatz/profile-jedi](https://github.com/jonbeatz/profile-jedi), tag `v1.0.0`.

### Security

- Server bound to `127.0.0.1` only (`package.json` dev/start scripts).
- PowerShell invoked with safe argument passing (no shell interpolation).
- `suppressHydrationWarning` on root layout for browser-extension attribute mismatches.

[1.0.0]: https://github.com/jonbeatz/profile-jedi/releases/tag/v1.0.0
