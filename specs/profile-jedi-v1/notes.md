# Notes: Profile Jedi v1.0

## Technical Discoveries

### Detached dev server spawn

`Start-Process pnpm` fails on Windows when pnpm is a PATH shim. Fix: spawn via `cmd.exe /c pnpm dev` with `-WindowStyle Hidden`.

### Tray supervisor must survive app stop

The app on port 7780 cannot restart itself after `process.exit`. A separate tray process on **7781** owns Start/Stop/Restart. In-app Restart is disabled when tray is off.

### mem0 slug immutability

Renaming profile `slug` would orphan CLI profiles and mem0 collections. UI edits display name only; slug is read-only in Edit dialog.

### LM Studio context limit for mem0 infer

JonBeatz mem0 `infer=True` extraction failed at 8192 ctx. Seed script uses `infer=False` for direct storage of Profile Jedi knowledge.

### Hydration mismatch from browser extensions

Extensions inject attributes like `webcrx=""` on `<html>`. Fixed with `suppressHydrationWarning` on `<html>` and `<body>` in `app/layout.tsx`.

### Startup folder on Windows

`[Environment]::GetFolderPath('Startup')` returned empty on this machine. Shortcut script falls back to `%APPDATA%\...\Startup` and creates the folder if missing.

## Edge Cases

- **Google API "starting" state:** Short-lived pending hint in `google-api.ts` before ports flip (~30s).
- **Kanban stack:** `ensureStack()` only starts if TaskBoardAI (3001) is down.
- **CORS on tray:** `Access-Control-Allow-Origin: http://localhost:7780` only.
- **Single-instance tray:** Exits with message box if 7781 already bound.

## Backend paths (defaults)

| Resource | Path |
|----------|------|
| Switcher | `D:\Hermes\projects\_core-scripts\profile-switcher\Switch-Hermes-Profile.ps1` |
| Registry | `D:\Hermes\projects\_core-scripts\profile-switcher\profiles.json` |
| Google API | `D:\Hermes\projects\_core-scripts\google-api\scripts\` |
| Kanban | `D:\Cursor_Projectz\MyStudioChannel\scripts\start-kanban-stack.ps1` |

## Future (v1.1+)

- Registry import/restore from UI (currently manual)
- Postiz calendar placeholder in Extras menu
- Optional slug migration tool (explicitly deferred)
