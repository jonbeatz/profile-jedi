# Agent Instructions — Profile Jedi

## First time here?

1. Read **`TRUTH.md`** — constitution (final authority).
2. Read **`Hermes-Profile-Switcher.md`** — master reference (architecture, API, ports, extension recipes).
3. Read **`README.md`** — quick start and status table.

## Core rules

- **Local only:** App binds to `127.0.0.1:7780`. Tray control is proxied via `/api/supervisor/*` (raw port `7781`).
- **Never rename profile slugs** from the UI path — display name only.
- **PowerShell backend:** All profile actions go through `lib/server/ps.ts` → `Switch-Hermes-Profile.ps1`.
- **Restart after stop:** Use tray supervisor (`lib/supervisor.ts` → `/api/supervisor/restart`), not the app itself.
- **No secrets in git:** Do not commit `.env*`, API keys, or `%APPDATA%` paths with credentials.

## Verify before finishing

```powershell
pnpm run build
Invoke-WebRequest http://127.0.0.1:7780/ -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:7780/api/supervisor/status -UseBasicParsing
```

If you changed lifecycle scripts, also probe `http://localhost:7781/status` when the tray is running.

## Key paths (defaults)

| What | Path |
|------|------|
| App root | `D:\Hermes\apps\profile-jedi` |
| Switcher script | `D:\Hermes\projects\_core-scripts\profile-switcher\Switch-Hermes-Profile.ps1` |
| Registry | `D:\Hermes\projects\_core-scripts\profile-switcher\profiles.json` |
| LiteLLM + ngrok stack | `D:\Hermes\projects\_core-scripts\deepseek-api\scripts\` |
| Kanban stack | `D:\Hermes\projects\_core-scripts\kanban-stack\` |
| Server config | `lib/server/config.ts` (env-overridable) |

## API quick reference

| Action | Endpoint |
|--------|----------|
| List profiles | `GET /api/profiles` |
| Switch | `POST /api/profiles/switch` |
| Repair all CLI | `POST /api/profiles/repair-cli` |
| Create / adopt / update | `POST /api/profiles/{new,adopt,update}` |
| Quick actions | `POST /api/profiles/action` |
| Supervisor status | `GET /api/supervisor/status` |
| Restart app | `POST /api/supervisor/restart` |
| Start tray | `POST /api/system/start-tray` |
| Tray login shortcut | `POST /api/system/tray-startup` |
| Pick folder (native) | `POST /api/system/pick-folder` |
| Registry restore | `POST /api/registry/restore` |
| Google API (legacy routes) | `GET/POST /api/google-api/*` |
| TaskBoard | `GET/POST /api/taskboard/*` |
| Self-destruct | `POST /api/system/shutdown` |

## Feature planning

Use **`specs/_template/`** for new features. Summarize completed milestones in **`CHANGELOG.md`**.

## UI taste

NovaMira Studio Gold `#F5B841`, obsidian base, glassmorphism, **DRAVEN footer** (service capsules + lifecycle cluster). No generic purple-gradient SaaS slop.
