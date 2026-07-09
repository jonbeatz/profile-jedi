# Start-Profile-Jedi.ps1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Ensure-TraySupervisor {
    if (Get-NetTCPConnection -LocalPort 7781 -State Listen -ErrorAction SilentlyContinue) {
        return
    }
    Write-Host 'Starting tray supervisor (port 7781)...' -ForegroundColor Cyan
    $tray = Join-Path $PSScriptRoot 'profile-jedi-tray.ps1'
    Start-Process -FilePath (Get-Command powershell.exe).Source `
        -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-STA', '-File', $tray `
        -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

Ensure-TraySupervisor

Write-Host "Waking up Profile Jedi..." -ForegroundColor Yellow
Start-Process "http://localhost:7780"
npm run dev
