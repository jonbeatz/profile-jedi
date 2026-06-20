# start-profile-jedi.ps1 - launch Profile Jedi (dev) DETACHED on a dedicated port.
# The dev server is spawned as an independent, hidden process so this window can
# close immediately. Use stop-profile-jedi.ps1 (or the "Stop Profile Jedi"
# shortcut) to shut it down when you're done.
$ErrorActionPreference = 'Stop'

$AppRoot = $PSScriptRoot
$Port = 7780
$Url = "http://localhost:$Port"

function Test-PortUp {
    param([int]$P)
    try {
        Invoke-WebRequest -Uri "http://localhost:$P" -TimeoutSec 3 -UseBasicParsing | Out-Null
        return $true
    } catch {
        if ($_.Exception.Response) { return $true }  # 404/500 still means listening
        return $false
    }
}

Write-Host '----------------------------------------------------------------' -ForegroundColor DarkCyan
Write-Host ' PROFILE JEDI' -ForegroundColor Yellow
Write-Host '----------------------------------------------------------------' -ForegroundColor DarkCyan
Write-Host "App:  $AppRoot" -ForegroundColor DarkGray
Write-Host "URL:  $Url" -ForegroundColor DarkGray
Write-Host ''

if (Test-PortUp -P $Port) {
    Write-Host "[Profile Jedi] Already running on port $Port - opening browser." -ForegroundColor Green
    Start-Process $Url
    return
}

# Spawn the dev server as a detached, hidden process that outlives this window.
# Go through cmd.exe /c so the pnpm/npm .CMD shim resolves from PATH reliably.
Write-Host "[Profile Jedi] Starting dev server (detached) on port $Port..." -ForegroundColor Cyan
$runner = if (Get-Command pnpm -ErrorAction SilentlyContinue) { 'pnpm dev' } else { 'npm run dev' }
Start-Process -FilePath $env:ComSpec -ArgumentList '/c', $runner -WorkingDirectory $AppRoot -WindowStyle Hidden

# Wait until it answers, then open the browser. This window closes on its own.
Write-Host '[Profile Jedi] Waiting for the server to come up...' -ForegroundColor DarkGray
for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 1
    if (Test-PortUp -P $Port) {
        Start-Process $Url
        Write-Host "[Profile Jedi] Online. Opened $Url" -ForegroundColor Green
        Write-Host '[Profile Jedi] You can close this window - the app keeps running.' -ForegroundColor DarkGray
        return
    }
}

Write-Host "[Profile Jedi] Server did not respond within 60s. Check 'npm run dev' in $AppRoot." -ForegroundColor Red
