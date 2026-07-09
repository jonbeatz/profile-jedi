// Server-only backend configuration. These paths mirror lib/settings.ts
// defaults and point at the real Hermes profile-switcher + deepseek-api stack.
// Override via environment variables if the layout ever moves.

import path from 'node:path'

const HERMES_ROOT = process.env.HERMES_ROOT ?? 'D:\\Hermes'
const SWITCHER_DIR = path.join(
  HERMES_ROOT,
  'projects',
  '_core-scripts',
  'profile-switcher',
)

const DEEPSEEK_API_DIR = path.join(
  HERMES_ROOT,
  'projects',
  '_core-scripts',
  'deepseek-api',
)

// The Kanban/TaskBoard stack lives in the central _core-scripts folder.
const KANBAN_ROOT = path.join(
  HERMES_ROOT,
  'projects',
  '_core-scripts',
  'kanban-stack',
)

const PROFILE_JEDI_ROOT =
  process.env.PJ_APP_ROOT ?? path.join(HERMES_ROOT, 'apps', 'profile-jedi')

export const SERVER_CONFIG = {
  hermesRoot: HERMES_ROOT,
  profileJediRoot: PROFILE_JEDI_ROOT,
  switcherScript:
    process.env.PJ_SWITCHER_SCRIPT ??
    path.join(SWITCHER_DIR, 'Switch-Hermes-Profile.ps1'),
  registryPath: path.join(SWITCHER_DIR, 'profiles.json'),
  registryDir: SWITCHER_DIR,
  trayScript:
    process.env.PJ_TRAY_SCRIPT ??
    path.join(PROFILE_JEDI_ROOT, 'profile-jedi-tray.ps1'),
  pickFolderScript:
    process.env.PJ_PICK_FOLDER_SCRIPT ??
    path.join(PROFILE_JEDI_ROOT, 'pick-folder.ps1'),
  shortcutsScript:
    process.env.PJ_SHORTCUTS_SCRIPT ??
    path.join(PROFILE_JEDI_ROOT, 'create-profile-jedi-shortcuts.ps1'),
  googleApi: {
    dir: DEEPSEEK_API_DIR,
    scriptsDir: path.join(DEEPSEEK_API_DIR, 'scripts'),
    start: path.join(DEEPSEEK_API_DIR, 'scripts', 'start-deepseek.ps1'),
    stop: path.join(DEEPSEEK_API_DIR, 'scripts', 'stop-deepseek.ps1'),
    restart: path.join(
      DEEPSEEK_API_DIR,
      'scripts',
      'restart-deepseek.ps1',
    ),
    envLocal: path.join(DEEPSEEK_API_DIR, '.env.local'),
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
