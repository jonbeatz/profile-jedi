# create-profile-jedi-shortcuts.ps1 - (re)create the Desktop shortcuts.
#   "Profile Jedi"       -> start detached + open browser, window auto-closes
#   "Stop Profile Jedi"  -> stop the dev server on port 7780
#   "Profile Jedi Tray"  -> always-on tray supervisor (Start/Stop/Restart/Open)
#
#   -Startup : also drop the Tray shortcut in the Startup folder so it launches
#             on login.
param([switch]$Startup)

$ErrorActionPreference = 'Stop'

$AppRoot = $PSScriptRoot
$Desktop = [Environment]::GetFolderPath('Desktop')
$StartupDir = [Environment]::GetFolderPath('Startup')
if ([string]::IsNullOrWhiteSpace($StartupDir)) {
    $StartupDir = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Startup'
}
$PowerShell = (Get-Command powershell.exe).Source
$HermesExe = Join-Path $env:LOCALAPPDATA 'hermes\hermes-agent\apps\desktop\release\win-unpacked\Hermes.exe'

function New-Lnk {
    param(
        [string]$Name,
        [string]$ScriptFile,
        [string]$Desc,
        [int]$IconIndex = 0,
        [string]$Dir = $Desktop,
        [string]$ExtraArgs = ''
    )
    if (-not (Test-Path $Dir)) { New-Item -ItemType Directory -Path $Dir -Force | Out-Null }
    $lnk = Join-Path $Dir "$Name.lnk"
    $sh = New-Object -ComObject WScript.Shell
    $sc = $sh.CreateShortcut($lnk)
    $sc.TargetPath = $PowerShell
    # No -NoExit: the window closes by itself once the script returns.
    $sc.Arguments = "-NoProfile -ExecutionPolicy Bypass $ExtraArgs -File `"$ScriptFile`""
    $sc.WorkingDirectory = $AppRoot
    $sc.Description = $Desc
    $sc.WindowStyle = 7  # minimized - flashes briefly then closes
    if (Test-Path $HermesExe) { $sc.IconLocation = "$HermesExe,$IconIndex" }
    $sc.Save()
    Write-Host "Created: $lnk" -ForegroundColor Green
}

New-Lnk -Name 'Profile Jedi' `
    -ScriptFile (Join-Path $AppRoot 'start-profile-jedi.ps1') `
    -Desc 'Launch Profile Jedi (detached) and open it in your browser'

New-Lnk -Name 'Stop Profile Jedi' `
    -ScriptFile (Join-Path $AppRoot 'stop-profile-jedi.ps1') `
    -Desc 'Stop the Profile Jedi dev server (port 7780)'

# Tray needs -STA for WinForms NotifyIcon.
New-Lnk -Name 'Profile Jedi Tray' `
    -ScriptFile (Join-Path $AppRoot 'profile-jedi-tray.ps1') `
    -Desc 'Profile Jedi tray supervisor (Start/Stop/Restart/Open, control port 7781)' `
    -ExtraArgs '-STA'

if ($Startup) {
    New-Lnk -Name 'Profile Jedi Tray' `
        -ScriptFile (Join-Path $AppRoot 'profile-jedi-tray.ps1') `
        -Desc 'Profile Jedi tray supervisor (auto-start on login)' `
        -ExtraArgs '-STA' `
        -Dir $StartupDir
    Write-Host "Startup entry created in: $StartupDir" -ForegroundColor Green
}

Write-Host ''
Write-Host 'Done. Shortcuts are on your Desktop (Profile Jedi, Stop Profile Jedi, Profile Jedi Tray).' -ForegroundColor Cyan
if (-not $Startup) {
    Write-Host 'Tip: re-run with -Startup to launch the tray automatically on login.' -ForegroundColor DarkGray
}
