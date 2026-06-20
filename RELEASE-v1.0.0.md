# Profile Jedi v1.0.0 — Initial Release

**Profile Jedi** is a local-first control panel for managing Hermes AI-agent profiles. This is the first public release.

## Highlights

### Profile management
- List, switch, create, adopt, and edit Hermes profiles
- Quick actions: Launch Hermes, Sync CLI, Open Folder, Reveal Shortcut, Edit in Cursor
- Live command preview and Dry-Run mode
- Immutable `slug` identity; editable display name, description, path, and TaskBoard `boardId`

### Service control
- **Google API stack** — start/stop/restart LiteLLM + ngrok with real status probes
- **TaskBoard / Kanban** — Extras menu with per-project board deep-links
- **J.A.R.V.I.S. footer** — TCP health capsules for LiteLLM, ngrok, LM Studio, Gateway

### Lifecycle
- **Tray supervisor** (port 7781) — Start / Stop / Restart / Open from system tray + HTTP API
- **Desktop shortcuts** — launch, stop, tray (optional login auto-start)
- **In-app controls** — Stop (self-destruct) + Restart (via supervisor)

### Architecture
- Next.js 16 App Router + React 19 + TypeScript + Tailwind v4
- 15 API Route Handlers; PowerShell via safe `execFile` wrapper
- Bound to `127.0.0.1:7780` only

## Documentation

| File | Purpose |
|------|---------|
| `README.md` | Onboarding, badges, quick start |
| `Hermes-Profile-Switcher.md` | Master reference (15 sections) |
| `TRUTH.md` | Project constitution |
| `AGENTS.md` | Agent instructions |
| `specs/profile-jedi-v1/` | Shipped v1 feature spec |

## Quick start

```powershell
git clone https://github.com/jonbeatz/profile-jedi.git
cd profile-jedi
pnpm install
pnpm dev
# → http://localhost:7780
```

Desktop shortcuts:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\create-profile-jedi-shortcuts.ps1 -Startup
```

## Requirements

- Windows 10/11, Node.js 20+, pnpm
- Hermes profile-switcher backend (`Switch-Hermes-Profile.ps1`)
- Optional: Google API stack, Kanban stack scripts (MSC repo)

---

**Full changelog:** [CHANGELOG.md](https://github.com/jonbeatz/profile-jedi/blob/main/CHANGELOG.md)
