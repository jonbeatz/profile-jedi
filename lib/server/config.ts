// Server-only backend configuration. These paths mirror lib/settings.ts
// defaults and point at the real Hermes profile-switcher + google-api stack.
// Override via environment variables if the layout ever moves.

import path from 'node:path'

const HERMES_ROOT = process.env.HERMES_ROOT ?? 'D:\\Hermes'
const SWITCHER_DIR = path.join(
  HERMES_ROOT,
  'projects',
  '_core-scripts',
  'profile-switcher',
)

const GOOGLE_API_DIR = path.join(
  HERMES_ROOT,
  'projects',
  '_core-scripts',
  'google-api',
)

// The Kanban/TaskBoard stack lives in the central _core-scripts folder.
const KANBAN_ROOT = path.join(
  HERMES_ROOT,
  'projects',
  '_core-scripts',
  'kanban-stack',
)

export const SERVER_CONFIG = {
  hermesRoot: HERMES_ROOT,
  switcherScript:
    process.env.PJ_SWITCHER_SCRIPT ??
    path.join(SWITCHER_DIR, 'Switch-Hermes-Profile.ps1'),
  registryPath: path.join(SWITCHER_DIR, 'profiles.json'),
  googleApi: {
    dir: GOOGLE_API_DIR,
    scriptsDir: path.join(GOOGLE_API_DIR, 'scripts'),
    start: path.join(GOOGLE_API_DIR, 'scripts', 'start-google-api-desktop.ps1'),
    stop: path.join(GOOGLE_API_DIR, 'scripts', 'stop-google-api-desktop.ps1'),
    restart: path.join(
      GOOGLE_API_DIR,
      'scripts',
      'restart-google-api-desktop.ps1',
    ),
    envLocal: path.join(GOOGLE_API_DIR, '.env.local'),
    litellmPort: 4000,
    ngrokInspectorPort: 4040,
  },
  kanban: {
    startScript: path.join(KANBAN_ROOT, 'start-kanban-stack.ps1'),
    stopScript: path.join(KANBAN_ROOT, 'stop-kanban-stack.ps1'),
    taskboardPort: 3001,
    kanbanPort: 3005,
    dashboardPort: 9119,
  },

  activeProfileFile: path.join(
    process.env.APPDATA ?? '',
    'Hermes',
    'active-profile.json',
  ),
  executionPolicy: process.env.PJ_EXEC_POLICY ?? 'Bypass',
} as const
