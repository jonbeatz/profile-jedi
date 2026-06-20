# Agent Instructions — Profile Jedi

## First time here?

1. Read **`TRUTH.md`** — constitution (final authority).
2. Read **`Hermes-Profile-Switcher.md`** — master reference (architecture, API, ports, extension recipes).
3. Read **`README.md`** — quick start and status table.

## Core rules

- **Local only:** App binds to `127.0.0.1:7780`. Tray control is `localhost:7781`.
- **Never rename profile slugs** from the UI path — display name only.
- **PowerShell backend:** All profile actions go through `lib/server/ps.ts` → `Switch-Hermes-Profile.ps1`.
- **Restart after stop:** Use tray supervisor (`lib/supervisor.ts` → port 7781), not the app itself.
- **No secrets in git:** Do not commit `.env*`, API keys, or `%APPDATA%` paths with credentials.

## Verify before finishing

```powershell
npx tsc --noEmit
Invoke-WebRequest http://127.0.0.1:7780/ -UseBasicParsing
```

If you changed lifecycle scripts, also probe `http://localhost:7781/status` when the tray is running.

## Key paths (defaults)

| What | Path |
|------|------|
| App root | `D:\Hermes\apps\profile-jedi` |
| Switcher script | `D:\Hermes\custom-scriptz\profile-switcher\Switch-Hermes-Profile.ps1` |
| Registry | `D:\Hermes\custom-scriptz\profile-switcher\profiles.json` |
| Google API scripts | `D:\Hermes\custom-scriptz\google-api\scripts\` |
| Kanban stack | `D:\Cursor_Projectz\MyStudioChannel\scripts\start-kanban-stack.ps1` |
| Server config | `lib/server/config.ts` (env-overridable) |

## API quick reference

| Action | Endpoint |
|--------|----------|
| List profiles | `GET /api/profiles` |
| Switch | `POST /api/profiles/switch` |
| Create / adopt / update | `POST /api/profiles/{new,adopt,update}` |
| Quick actions | `POST /api/profiles/action` |
| Google API | `GET/POST /api/google-api/*` |
| TaskBoard | `GET/POST /api/taskboard/*` |
| Self-destruct | `POST /api/system/shutdown` |
| Tray control | `GET http://localhost:7781/{status,start,stop,restart,open}` |

## Feature planning

Use **`specs/_template/`** for new features. Summarize completed milestones in **`CHANGELOG.md`**.

## UI taste

NovaMira Studio Gold `#F5B841`, obsidian base, glassmorphism, J.A.R.V.I.S. footer. No generic purple-gradient SaaS slop.
