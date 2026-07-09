# Hermes Profile Switcher — "Profile Jedi"

> Master reference for the Hermes profile launcher/switcher app and its backend.
> Single source of truth for **what it is, what it does, how it's wired, how to
> run it, and how to extend it.** Read this first before touching the project.

- **App name:** Profile Jedi
- **GitHub:** https://github.com/jonbeatz/profile-jedi
- **App root:** `D:\Hermes\apps\profile-jedi`
- **Backend root:** `D:\Hermes\projects\_core-scripts\` (profile-switcher + google-api)
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/Base UI · Motion · SWR · sonner
- **Runs at:** `http://localhost:7780` (bound to `127.0.0.1` only)
- **Version:** `1.0.0` (`lib/settings.ts → APP_VERSION`)

---

## 1. Executive summary (what this whole thing does)

**Profile Jedi is a local desktop control panel for managing "Hermes" AI-agent
profiles.** A Hermes profile is a self-contained workspace (its own folder,
description, CLI profile, mem0 memory collection, and desktop launcher) that the
Hermes desktop agent can boot into. Historically you switched profiles by hand
with a PowerShell script (`Switch-Hermes-Profile.ps1`). Profile Jedi is a
premium web UI wrapped around that script plus a few sibling stacks, so the whole
thing is point-and-click.

It does five jobs:

1. **Profile management** — list, switch, create, adopt (import an existing
   folder), and edit profiles. Each card shows workspace path, CLI profile home,
   mem0 collection, and desktop shortcut, with quick actions (Launch Hermes, Sync
   CLI, Open Folder, Reveal Shortcut, Edit in Cursor). Every action shows the
   exact PowerShell command it will run ("Jedi transparency"), and a global
   **Dry-Run** mode prints commands instead of executing them.

2. **Service health monitoring** — a J.A.R.V.I.S.-style footer polls local
   services over TCP (LiteLLM 4000, ngrok 4040, LM Studio 1234, Hermes Gateway,
   etc.) and shows live status capsules.

3. **Google API stack control** — start / stop / restart the LiteLLM + ngrok +
   Vertex proxy stack and see its real status (including the public ngrok URL),
   right from the footer.

4. **TaskBoard / Kanban integration** — the "Extras" menu opens the project's
   TaskBoardAI board (deep-linked per profile via `boardId`), the Hermes Kanban,
   and the Hermes Dashboard, auto-starting the Kanban stack if it isn't running.

5. **App lifecycle control** — three independent ways to Start/Stop/Restart the
   Profile Jedi app itself: a **system-tray supervisor** (primary), **desktop
   shortcuts** (fallback), and an **in-app Stop button** (self-destruct). See §9.

Everything is **local-only and safe-by-default**: the Next.js server binds to
`127.0.0.1`, PowerShell is invoked with `execFile` (no shell-string injection),
and destructive actions are gated behind confirm dialogs and Dry-Run.

---

## 2. Capabilities at a glance

| Area | Abilities |
|------|-----------|
| Profiles | List · Switch · Create (from template) · Adopt (existing folder) · Edit (name/description/path/boardId) · Launch · Sync CLI |
| Identity | `slug` is the **read-only** internal id; display **name** is editable |
| Transparency | Live command preview · Dry-Run mode (print, don't run) · "Last Command Output" drawer |
| Health | TCP probes for configurable services · adjustable poll interval |
| Google API | Status (LiteLLM/ngrok/Vertex + public URL) · Start · Stop · Restart |
| TaskBoard | Open TaskBoardAI (per-board), Kanban, Dashboard · auto-start stack · stop stack |
| Lifecycle | Tray supervisor (7781) · desktop shortcuts · in-app self-destruct · restart |
| Settings | General · Appearance (themes/backgrounds/glass/grain) · Console · Shortcuts · Integrations · Data · Advanced — persisted to `localStorage` |
| Command palette | `Ctrl+K` fuzzy switch/create/adopt |

---

## 3. Architecture

```
            ┌────────────────────────────────────────────────────────────┐
            │  Browser  →  http://localhost:7780  (Profile Jedi UI)        │
            │  React 19 client · SWR polling · sonner toasts               │
            └───────────────┬───────────────────────────┬────────────────┘
                            │ fetch /api/**             │ fetch http://localhost:7781/*
                            ▼                            ▼
      ┌──────────────────────────────────┐   ┌──────────────────────────────┐
      │ Next.js Route Handlers (nodejs)  │   │ Tray Supervisor (PowerShell)  │
      │ app/api/**/route.ts              │   │ profile-jedi-tray.ps1         │
      │ lib/server/{ps,config,           │   │ NotifyIcon + HttpListener:7781│
      │   google-api,taskboard}.ts       │   │ Start/Stop/Restart/Open       │
      └───────────────┬──────────────────┘   └───────────────┬──────────────┘
                      │ execFile / spawn(detached) powershell.exe
                      ▼                                       │ spawns
      ┌──────────────────────────────────────────────────────▼──────────────┐
      │ Backend PowerShell + Node scripts                                     │
      │  • D:\Hermes\projects\_core-scripts\profile-switcher\Switch-Hermes-Profile.ps1│
      │  • D:\Hermes\projects\_core-scripts\google-api\scripts\*-google-api-desktop.ps1│
      │  • D:\Cursor_Projectz\MyStudioChannel\scripts\{start,stop}-kanban-stack.ps1
      └──────────────────────────────────────────────────────────────────────┘
                      │ reads/writes
                      ▼
      profiles.json (registry) · %APPDATA%\Hermes\active-profile.json · profile folders
```

**Key idea:** the browser never runs PowerShell directly. The UI calls a local
Route Handler, which shells out to a script via `lib/server/ps.ts`. The **tray
supervisor is a separate process on 7781** so it can start/restart the app even
when 7780 is down (the app can't restart itself once its own server exits).

---

## 4. Ports & processes

| Port | Process | Owner | Notes |
|------|---------|-------|-------|
| 7780 | Profile Jedi (Next.js dev/start) | `start-profile-jedi.ps1` | bound to `127.0.0.1` |
| 7781 | Tray supervisor HTTP control | `profile-jedi-tray.ps1` | CORS allows `http://localhost:7780` |
| 4000 | LiteLLM | google-api stack | probed at `/v1/models` |
| 4040 | ngrok inspector | google-api stack | probed at `/api/tunnels` |
| 1234 | LM Studio | external | health capsule only |
| 3001 | TaskBoardAI | kanban stack | deep-link `/?board=<id>` |
| 3005 | Hermes Kanban | kanban stack | |
| 9119 | Hermes Dashboard | kanban stack | |

---

## 5. File map

### App (`D:\Hermes\apps\profile-jedi`)

```
app/
  layout.tsx                 Root layout (fonts, Toaster, suppressHydrationWarning)
  page.tsx                   Main page: state, SWR, dialogs, keyboard shortcuts
  globals.css                Theme tokens, glass, background layers
  api/                       Route Handlers (all runtime='nodejs', force-dynamic)
    profiles/route.ts        GET   list profiles (+ active flag)
    profiles/switch/route.ts POST  switch active profile
    profiles/new/route.ts    POST  create from template
    profiles/adopt/route.ts  POST  adopt existing folder
    profiles/update/route.ts POST  edit name/description/path/boardId
    profiles/action/route.ts POST  launch | sync | open | shortcut | cursor
    health/route.ts          POST  TCP probe monitored services
    google-api/status|start|stop|restart/route.ts
    taskboard/status|open|stop/route.ts
    system/shutdown/route.ts POST  in-app self-destruct (process.exit)
    last-output/route.ts     GET   last PowerShell output (Advanced drawer)
    backend/test/route.ts    GET   backend reachability check
    registry/backup/route.ts POST  timestamped profiles.json backup
lib/
  api.ts                     Client API (browser → /api/**). Stable signatures.
  supervisor.ts              Client helpers for tray (7781) + shutdownApp()
  types.ts                   Profile, Settings, ActionResult, inputs
  settings.ts                DEFAULT_SETTINGS, presets, shortcut matcher, color utils
  commands.ts                quickActionCommand() — builds preview strings
  utils.ts                   cn() etc.
  server/
    config.ts                SERVER_CONFIG: all backend paths + ports (env-overridable)
    ps.ts                    runScript / runCommand / spawnDetached / runSwitcherJson
    google-api.ts            probe + start/stop/restart LiteLLM+ngrok
    taskboard.ts             probe + ensureStack/stopStack + urlFor
components/
  top-bar.tsx, profile-list.tsx, profile-card.tsx, profile-detail.tsx
  create/adopt/edit/switch-profile-dialog.tsx, profile-command-palette.tsx
  jarvis-footer.tsx          Footer: AppControl + GoogleApiControl + service capsules
  app-control.tsx            Stop (self-destruct) + Restart (via supervisor) + tray status
  google-api-control.tsx, google-api-card.tsx, use-google-api.ts
  extras-menu.tsx            TaskBoard/Kanban/Dashboard launcher (boardId-aware)
  status-dot.tsx, service-capsule.tsx, command-preview.tsx, confirm-dialog.tsx
  settings/*                 Settings dialog, rail, tabs, tables, keybind capture
  settings-provider.tsx      Context + applies appearance to CSS vars
PowerShell (app lifecycle):
  start-profile-jedi.ps1     Start dev server DETACHED on 7780, open browser, exit
  stop-profile-jedi.ps1      Kill whatever listens on 7780 (tree kill)
  profile-jedi-tray.ps1      Tray supervisor: NotifyIcon menu + HTTP control 7781
  create-profile-jedi-shortcuts.ps1   Desktop + (optional) Startup shortcuts
package.json                 dev/build/start scripts bind -H 127.0.0.1 -p 7780
```

### Backend (outside the app)

```
D:\Hermes\projects\_core-scripts\profile-switcher\
  Switch-Hermes-Profile.ps1  Core engine: list/switch/new/adopt/launch/sync/update
  create-profile-template.ps1  Scaffolds a new self-contained profile
  create-switcher-shortcut.ps1
  profiles.json              Registry (the source of truth for profiles)
  README.md

D:\Hermes\projects\_core-scripts\google-api\scripts\
  start|stop|restart-google-api-desktop.ps1   Lifecycle wrappers
  msc-litellm-*.mjs           LiteLLM/ngrok helpers (install, start, status, verify)
  .env.local                  MSC_LITELLM_MASTER_KEY (read for Vertex probe)

D:\Cursor_Projectz\MyStudioChannel\scripts\
  start-kanban-stack.ps1 / stop-kanban-stack.ps1   TaskBoardAI + Kanban + Dashboard
```

---

## 6. Backend engine — `Switch-Hermes-Profile.ps1`

The single PowerShell entry point the app drives. Invoked headless with `-Json`
for reads.

**Parameters:**
`-Action <menu|list|switch|new|adopt|launch|sync|update>` `-Profile <slug>`
`-Name <display>` `-Location <path>` `-Description <text>` `-Slug <targetSlug>`
`-BoardId <taskboard-id>` `-NoKill` `-Json`

**Actions the app uses:**

| Action | Trigger (UI) | What it does |
|--------|--------------|--------------|
| `list` | page load / refresh | Emits JSON of all registered + auto-discovered profiles (each with `boardId`) |
| `switch -Profile <slug>` | "Switch to this" | Sets active profile; `-NoKill` keeps a running Hermes open |
| `new -Name -Location -Description` | New dialog | Scaffolds a self-contained profile from the template |
| `adopt -Location -Name -Description` | Adopt dialog | Registers an existing folder as a profile |
| `update -Slug -Name -Description -BoardId [-Location]` | Edit dialog | Edits registry metadata; **slug never changes** |
| `launch -Profile <slug>` | "Launch Hermes" | Runs that profile's desktop launcher |
| `sync -Profile <slug>` | "Sync CLI Profile" | Scaffolds missing CLI files if needed, then re-syncs |
| `repair-cli-all` | "Repair CLI" banner | Scaffolds + syncs every profile showing CLI missing |

**Identity rule:** `slug` is the immutable key (used by CLI profile home and the
mem0 collection). The UI only edits the **display name** to avoid orphaning
linked artifacts. A slug migration tool can be built later if ever needed.

---

## 7. App internals (server side)

### `lib/server/config.ts` — `SERVER_CONFIG`
Central path/port map. **All overridable via env vars** so the layout can move:

| Env var | Default | Used for |
|---------|---------|----------|
| `HERMES_ROOT` | `D:\Hermes` | switcher + google-api roots |
| `MSC_ROOT` | `D:\Cursor_Projectz\MyStudioChannel` | kanban scripts |
| `PJ_SWITCHER_SCRIPT` | `<switcher>\Switch-Hermes-Profile.ps1` | engine path |
| `PJ_EXEC_POLICY` | `Bypass` | `-ExecutionPolicy` for spawned PS |

Also defines: `registryPath`, `activeProfileFile`
(`%APPDATA%\Hermes\active-profile.json`), google-api script paths + ports,
kanban script paths + ports.

### `lib/server/ps.ts` — PowerShell runner
- `runScript(path, args, label)` — `execFile` a `.ps1`, wait, capture stdout/stderr
  (120s timeout, 10MB buffer). **No shell string** → args passed safely.
- `runCommand(cmd, label)` — inline `-Command` (30s) for open-folder/cursor helpers.
- `spawnDetached(path, label)` — fire-and-forget for long-lived stacks (Google API).
- `runSwitcherJson<T>(args)` — runs the switcher with `-Json` and parses the JSON
  payload (tolerates leading status lines).
- `getLastOutput()` — last command transcript (timestamp + exit + stdout/stderr),
  surfaced by `/api/last-output`.

### `lib/server/google-api.ts`
Derives real state from probes: LiteLLM `/v1/models` (200 or 401 = listening; 200
with master key = Vertex OK), ngrok `/api/tunnels` (→ `publicUrl`). State machine:
`offline | starting | online | degraded | stopping`, with a short-lived "pending"
hint after start/stop so the UI feels responsive before ports flip.

### `lib/server/taskboard.ts`
`probePort` 3001/3005/9119 → `getStatus()`. `ensureStack()` spawns
`start-kanban-stack.ps1` if 3001 is down. `urlFor(target, boardId)` builds the
deep-link (`/?board=<id>` for TaskBoardAI).

### API routes
All `export const runtime = 'nodejs'` and `dynamic = 'force-dynamic'`. They are
thin: parse JSON body → call a `lib/server` helper → return `ActionResult`
(`{ ok, message }`) or data. See the file map in §5 for the full list.

---

## 8. Frontend & client API

- **`lib/api.ts`** is the only thing components call. Signatures are intentionally
  stable (they predate the real backend — they used to return mock data). If you
  change a route, keep the `api.ts` signature and just swap the fetch.
- **`page.tsx`** owns app state: SWR for `listProfiles` + `probeServices`,
  selection, all dialogs, and global keyboard shortcuts (`matchesShortcut`).
- **Dry-Run** (`settings.advanced.dryRun`): switch/quick-actions print the command
  via toast + `console.log` instead of hitting the backend.
- **Settings** live in `localStorage` (`profile-jedi:settings`), deep-merged over
  `DEFAULT_SETTINGS` so new keys always resolve. `settings-provider.tsx` maps
  appearance values to CSS variables (accent, background, glass, grain, vignette).

---

## 9. App lifecycle control (Start / Stop / Restart)

Three cooperating mechanisms — use any of them.

### A. System Tray Supervisor — `profile-jedi-tray.ps1` (primary)
An always-on tray app that **survives the main app going down**, which is what
makes "restart after stop" possible.
- **Tray menu:** Open Dashboard · Start · Stop · Restart Profile Jedi · Exit
  Supervisor. Double-click the icon = Open Dashboard.
- **HTTP control server** on `http://localhost:7781` (background runspace so the
  tray UI never blocks):

  | Endpoint | Action |
  |----------|--------|
  | `GET /ping` | `{"ok":true}` |
  | `GET /status` | `{"ok":true,"appUp":<bool>}` (probes 7780) |
  | `GET /start` | spawn `start-profile-jedi.ps1` |
  | `GET /stop` | spawn `stop-profile-jedi.ps1` |
  | `GET /restart` | stop → wait 2s → start |
  | `GET /open` | open `http://localhost:7780` |

  CORS: `Access-Control-Allow-Origin: http://localhost:7780`.
- **Single-instance guard:** exits with a message box if 7781 is already bound.
- Must run **STA** for WinForms (`powershell -STA -File profile-jedi-tray.ps1`).
- Icon: pulled from `Hermes.exe` if present, else system default.

### B. Desktop / Startup shortcuts — `create-profile-jedi-shortcuts.ps1`
Creates on the Desktop: **Profile Jedi** (start detached + open), **Stop Profile
Jedi**, **Profile Jedi Tray**. Run with `-Startup` to also drop the tray shortcut
in the Startup folder (auto-launch on login). The script creates the Startup
folder if missing and falls back to `%APPDATA%\...\Startup` when
`GetFolderPath('Startup')` returns empty. All shortcuts use `WindowStyle 7`
(minimized) and `-NoProfile -ExecutionPolicy Bypass`; the tray one adds `-STA`.

### C. In-app Stop button (self-destruct)
In the footer (`components/app-control.tsx`):
- **Status:** green dot + "Tray on/off" (polls 7781 every 8s via `lib/supervisor.ts`).
- **Stop:** confirm dialog → `POST /api/system/shutdown` → route responds, then
  `process.exit(0)` ~350ms later (toast renders first). The dashboard goes
  offline until restarted via tray/shortcut.
- **Restart:** confirm → `GET 7781/restart`. **Disabled when the tray is off**
  (only the supervisor can bring the app back up).

---

## 10. How to use

### First-time setup
```powershell
# from D:\Hermes\apps\profile-jedi
pnpm install                                   # or npm install
.\create-profile-jedi-shortcuts.ps1 -Startup   # desktop + auto-start tray on login
```

### Daily
- Double-click **Profile Jedi Tray** (or it auto-starts on login) → tray icon.
- Tray → **Start Profile Jedi** (or double-click → Open) → browser at 7780.
- Or just double-click the **Profile Jedi** desktop shortcut.
- Stop from: tray menu, **Stop Profile Jedi** shortcut, or the footer **Stop**.
- Restart from: tray menu, or the footer **Restart** (needs tray running).

### Manual dev
```powershell
pnpm dev        # next dev -H 127.0.0.1 -p 7780
pnpm build
pnpm start
```

---

## 11. Data model

### `Profile` (`lib/types.ts`)
```ts
type Profile = {
  name: string          // editable display name
  slug: string          // immutable internal id (CLI home, mem0 collection)
  path: string          // workspace folder
  description: string
  cliProfile: boolean   // has a synced CLI profile
  active?: boolean       // computed from active-profile.json
  boardId?: string      // TaskBoardAI deep-link id
}
```

### Sources of truth
- **`profiles.json`** (registry) — `D:\Hermes\projects\_core-scripts\profile-switcher\profiles.json`.
  Backed up via `POST /api/registry/backup` → `profiles.backup-<timestamp>.json`.
- **`active-profile.json`** — `%APPDATA%\Hermes\active-profile.json`, written by the
  Hermes desktop backend; read by `app/api/profiles/route.ts` to flag `active`.
- **Auto-discovery** — the switcher also surfaces profiles found on disk that
  aren't yet in the registry (`update` adds them when edited).

---

## 12. How to extend (recipes)

**Add a new profile action (e.g. "Open logs"):**
1. `lib/api.ts` → add `'logs'` to `ProfileAction`.
2. `app/api/profiles/action/route.ts` → add a `case 'logs'` calling `runCommand`/`runScript`.
3. `lib/commands.ts` → add a preview string for `logs`.
4. `components/profile-detail.tsx` → add the quick-action button.

**Add a monitored service capsule:** add an entry to
`DEFAULT_SETTINGS.console.services` (`{ id, name, host, port, enabled }`) — the
footer + `/api/health` pick it up automatically.

**Add a new backend stack (like google-api):**
1. Add paths/ports to `SERVER_CONFIG` (env-overridable).
2. Add a `lib/server/<stack>.ts` with probe + `spawnDetached` start/stop.
3. Add `app/api/<stack>/{status,start,stop}/route.ts`.
4. Add a control component modeled on `google-api-control.tsx` and drop it in the footer.

**Add a tray endpoint/menu item:** edit `profile-jedi-tray.ps1` — add a `switch`
case in `$listenerScript` and a `$menu.Items.Add(...)` with an `add_Click`
handler. Mirror it in `lib/supervisor.ts` if the UI should call it.

**Move the install to another machine/drive:** set `HERMES_ROOT`, `MSC_ROOT`
(and `PJ_SWITCHER_SCRIPT` if needed) as env vars before `pnpm dev`. Nothing else
is hardcoded server-side; client defaults live in `DEFAULT_SETTINGS`.

---

## 13. Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| Red hydration error mentioning `webcrx` (or similar attr) | Browser extension mutates `<html>`. Already handled with `suppressHydrationWarning` on `<html>`/`<body>` in `layout.tsx`. Reload. |
| Footer says "Tray off", Restart disabled | Click the **tray icon** in the footer lifecycle cluster to spawn the supervisor, or launch **Profile Jedi Tray** from Desktop. |
| `pnpm dev` won't spawn detached | Launcher goes through `cmd.exe /c pnpm dev` so the `.CMD` shim resolves; ensure pnpm/npm is on PATH. |
| Tray won't bind 7781 | Another tray instance is running (single-instance guard), or run it with `-STA`. |
| Google API stuck "starting" | Pending hint times out in ~30s; check LiteLLM on 4000 and ngrok on 4040. |
| Profiles list empty | `Switch-Hermes-Profile.ps1 -Action list -Json` failing — run it manually to see the error. |
| Quick action does nothing | Check **Advanced → View Last Command Output** (`/api/last-output`). |

---

## 14. Verification commands

```powershell
# App + tray smoke (from D:\Hermes\apps\profile-jedi)
Invoke-WebRequest http://127.0.0.1:7780/ -UseBasicParsing        # 200 = app up
Invoke-WebRequest http://localhost:7781/status -UseBasicParsing  # {"ok":true,"appUp":...}

# Typecheck (no emit)
npx tsc --noEmit

# Parse-check the PowerShell scripts
$e=$null; [System.Management.Automation.Language.Parser]::ParseFile(
  'D:\Hermes\apps\profile-jedi\profile-jedi-tray.ps1',[ref]$null,[ref]$e); $e

# Backend engine direct
& 'D:\Hermes\projects\_core-scripts\profile-switcher\Switch-Hermes-Profile.ps1' -Action list -Json
```

---

## 15. Agent quick reference

- **To read profiles programmatically:** `GET http://localhost:7780/api/profiles`.
- **To switch:** `POST /api/profiles/switch { slug, noKill }`.
- **To control the app:** hit the **tray** at `http://localhost:7781/{start,stop,restart,open,status}` (not the app itself — the app can't restart itself).
- **To control Google API:** `POST /api/google-api/{start,stop,restart}`, `GET /status`.
- **To open boards:** `POST /api/taskboard/open { target: 'taskboard'|'kanban'|'dashboard', boardId }`.
- **Never** change a profile `slug` from the UI path — it's the identity key.
- **All backend paths/ports** are in `lib/server/config.ts` (env-overridable).
- **Last command transcript:** `GET /api/last-output`.
- **Build gate:** `npx tsc --noEmit` then HTTP smoke 7780/7781.

---

_Last updated: 2026-06-19. Keep this file current when you add routes, scripts,
ports, or lifecycle behavior._
