// Server-only PowerShell runner. Executes the Hermes scripts with execFile
// (no shell string interpolation -> safe argument passing) and captures the
// last command output so the Advanced > "View Last Command Output" drawer can
// surface it. Detached spawns are used for long-lived stacks (LiteLLM + ngrok).

import { execFile, spawn } from 'node:child_process'
import { SERVER_CONFIG } from './config'

export type PsResult = {
  ok: boolean
  code: number
  stdout: string
  stderr: string
}

let lastOutput =
  'No commands run yet this session. Actions you take will be logged here.'

export function getLastOutput(): string {
  return lastOutput
}

function record(label: string, res: PsResult) {
  const ts = new Date().toISOString()
  lastOutput =
    `[${ts}] ${label}\n` +
    `exit=${res.code}\n` +
    (res.stdout ? `--- stdout ---\n${res.stdout.trim()}\n` : '') +
    (res.stderr ? `--- stderr ---\n${res.stderr.trim()}\n` : '')
}

/** Run a .ps1 file with arguments and wait for completion. */
export function runScript(
  scriptPath: string,
  args: string[] = [],
  label = scriptPath,
  timeoutMs = 120_000,
): Promise<PsResult> {
  const fullArgs = [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    SERVER_CONFIG.executionPolicy,
    '-File',
    scriptPath,
    ...args,
  ]
  return new Promise((resolve) => {
    execFile(
      'powershell.exe',
      fullArgs,
      { windowsHide: true, maxBuffer: 10 * 1024 * 1024, timeout: timeoutMs },
      (error, stdout, stderr) => {
        const code =
          error && typeof (error as { code?: number }).code === 'number'
            ? ((error as { code?: number }).code as number)
            : error
              ? 1
              : 0
        const res: PsResult = {
          ok: code === 0,
          code,
          stdout: stdout ?? '',
          stderr: stderr ?? '',
        }
        record(label, res)
        resolve(res)
      },
    )
  })
}

/** Run an inline PowerShell command (used for open-folder / cursor helpers). */
export function runCommand(
  command: string,
  label = command,
): Promise<PsResult> {
  const fullArgs = [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    SERVER_CONFIG.executionPolicy,
    '-Command',
    command,
  ]
  return new Promise((resolve) => {
    execFile(
      'powershell.exe',
      fullArgs,
      { windowsHide: true, maxBuffer: 4 * 1024 * 1024, timeout: 30_000 },
      (error, stdout, stderr) => {
        const code = error ? 1 : 0
        const res: PsResult = {
          ok: code === 0,
          code,
          stdout: stdout ?? '',
          stderr: stderr ?? '',
        }
        record(label, res)
        resolve(res)
      },
    )
  })
}

/** Run a .ps1 file on an STA thread (WinForms dialogs, NotifyIcon). */
export function runStaScript(
  scriptPath: string,
  args: string[] = [],
  label = scriptPath,
  timeoutMs = 120_000,
): Promise<PsResult> {
  const fullArgs = [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    SERVER_CONFIG.executionPolicy,
    '-STA',
    '-File',
    scriptPath,
    ...args,
  ]
  return new Promise((resolve) => {
    execFile(
      'powershell.exe',
      fullArgs,
      { windowsHide: false, maxBuffer: 4 * 1024 * 1024, timeout: timeoutMs },
      (error, stdout, stderr) => {
        const code =
          error && typeof (error as { code?: number }).code === 'number'
            ? ((error as { code?: number }).code as number)
            : error
              ? 1
              : 0
        const res: PsResult = {
          ok: code === 0,
          code,
          stdout: stdout ?? '',
          stderr: stderr ?? '',
        }
        record(label, res)
        resolve(res)
      },
    )
  })
}

/**
 * Launch a long-lived .ps1 detached so it keeps running after the request
 * returns (used for the Google API start/restart, which hold LiteLLM open).
 */
export function spawnDetached(scriptPath: string, label = scriptPath): void {
  const child = spawn(
    'powershell.exe',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      SERVER_CONFIG.executionPolicy,
      '-File',
      scriptPath,
    ],
    { detached: true, stdio: 'ignore', windowsHide: false },
  )
  child.unref()
  record(`spawn (detached): ${label}`, {
    ok: true,
    code: 0,
    stdout: `Spawned ${scriptPath} detached (pid ${child.pid ?? 'n/a'})`,
    stderr: '',
  })
}

/** Launch the tray supervisor (-STA required for WinForms NotifyIcon). */
export function spawnTraySupervisor(): void {
  const child = spawn(
    'powershell.exe',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      SERVER_CONFIG.executionPolicy,
      '-STA',
      '-File',
      SERVER_CONFIG.trayScript,
    ],
    { detached: true, stdio: 'ignore', windowsHide: true },
  )
  child.unref()
  record('spawn (tray supervisor)', {
    ok: true,
    code: 0,
    stdout: `Spawned tray supervisor (pid ${child.pid ?? 'n/a'})`,
    stderr: '',
  })
}

/** Run the Switch-Hermes-Profile.ps1 with -Json and parse the result. */
export async function runSwitcherJson<T>(
  args: string[],
  timeoutMs = 120_000,
): Promise<T | null> {
  const res = await runScript(
    SERVER_CONFIG.switcherScript,
    [...args, '-Json'],
    `switcher ${args.join(' ')}`,
    timeoutMs,
  )
  const text = res.stdout.trim()
  if (!text) return null
  // The script may print status lines before JSON; grab the JSON payload.
  const start = text.search(/[[{]/)
  if (start === -1) return null
  try {
    return JSON.parse(text.slice(start)) as T
  } catch {
    return null
  }
}
