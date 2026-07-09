# profile-jedi-tray.ps1 - always-on system tray supervisor for Profile Jedi.
# Provides Start / Stop / Restart / Open from a tray icon AND a tiny local HTTP
# control server on port 7781 so the dashboard (port 7780) can trigger restart.
# The supervisor survives the main app being stopped, which is what makes
# "restart after stop" possible.
#
# Run:  powershell -NoProfile -ExecutionPolicy Bypass -STA -File profile-jedi-tray.ps1

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$AppRoot = $PSScriptRoot
$Port = 7780
$CtrlPort = 7781
$Url = "http://localhost:$Port"
$StartScript = Join-Path $AppRoot 'start-profile-jedi.ps1'
$StopScript = Join-Path $AppRoot 'stop-profile-jedi.ps1'
$PowerShell = (Get-Command powershell.exe).Source
$HermesExe = Join-Path $env:LOCALAPPDATA 'hermes\hermes-agent\apps\desktop\release\win-unpacked\Hermes.exe'

# --- Single instance: bail if the control port is already bound. ---
if (Get-NetTCPConnection -LocalPort $CtrlPort -State Listen -ErrorAction SilentlyContinue) {
    [System.Windows.Forms.MessageBox]::Show(
        "Profile Jedi tray is already running (port $CtrlPort in use).",
        'Profile Jedi') | Out-Null
    return
}

# --- Action helpers (main thread / menu) ---
function Invoke-Start {
    Start-Process -FilePath $PowerShell `
        -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $StartScript `
        -WindowStyle Hidden
}
function Invoke-Stop {
    Start-Process -FilePath $PowerShell `
        -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $StopScript `
        -WindowStyle Hidden
}
function Invoke-Restart {
    $cmd = "& `"$StopScript`"; Start-Sleep -Seconds 2; & `"$StartScript`""
    Start-Process -FilePath $PowerShell `
        -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $cmd `
        -WindowStyle Hidden
}
function Open-Dashboard { Start-Process $Url }

# --- HTTP control server (background runspace) ---
# Shared state passed into the runspace; it re-spawns the same scripts.
$shared = [hashtable]::Synchronized(@{
        PowerShell  = $PowerShell
        StartScript = $StartScript
        StopScript  = $StopScript
        Port        = $Port
        CtrlPort    = $CtrlPort
        Url         = $Url
        Listener    = $null
    })

$listenerScript = {
    param($s)
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$($s.CtrlPort)/")
    try { $listener.Start() } catch { return }
    $s.Listener = $listener

    while ($listener.IsListening) {
        try { $ctx = $listener.GetContext() } catch { break }
        try {
            $path = $ctx.Request.Url.AbsolutePath.ToLower()
            $resp = $ctx.Response
            $origin = [string]$ctx.Request.Headers['Origin']
            $allowed = @(
                "http://localhost:$($s.Port)"
                "http://127.0.0.1:$($s.Port)"
            )
            if ($origin -and ($allowed -contains $origin)) {
                $resp.AddHeader('Access-Control-Allow-Origin', $origin)
            } else {
                $resp.AddHeader('Access-Control-Allow-Origin', "http://localhost:$($s.Port)")
            }
            $resp.AddHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
            $payload = '{"ok":true}'

            switch ($path) {
                '/ping' { $payload = '{"ok":true}' }
                '/status' {
                    $up = [bool](Get-NetTCPConnection -LocalPort $s.Port -State Listen -ErrorAction SilentlyContinue)
                    $payload = '{"ok":true,"appUp":' + $up.ToString().ToLower() + '}'
                }
                '/start' {
                    Start-Process -FilePath $s.PowerShell -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $s.StartScript -WindowStyle Hidden
                    $payload = '{"ok":true,"action":"start"}'
                }
                '/stop' {
                    Start-Process -FilePath $s.PowerShell -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $s.StopScript -WindowStyle Hidden
                    $payload = '{"ok":true,"action":"stop"}'
                }
                '/restart' {
                    $c = "& `"$($s.StopScript)`"; Start-Sleep -Seconds 2; & `"$($s.StartScript)`""
                    Start-Process -FilePath $s.PowerShell -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $c -WindowStyle Hidden
                    $payload = '{"ok":true,"action":"restart"}'
                }
                '/open' { Start-Process $s.Url; $payload = '{"ok":true,"action":"open"}' }
                default { $resp.StatusCode = 404; $payload = '{"ok":false}' }
            }

            $buf = [System.Text.Encoding]::UTF8.GetBytes($payload)
            $resp.ContentType = 'application/json'
            $resp.ContentLength64 = $buf.Length
            $resp.OutputStream.Write($buf, 0, $buf.Length)
            $resp.OutputStream.Close()
        } catch {}
    }
}

$rs = [runspacefactory]::CreateRunspace()
$rs.ApartmentState = 'MTA'
$rs.Open()
$psListener = [PowerShell]::Create()
$psListener.Runspace = $rs
$psListener.AddScript($listenerScript).AddArgument($shared) | Out-Null
$psListener.BeginInvoke() | Out-Null

# --- Tray icon + menu (main thread) ---
$icon = New-Object System.Windows.Forms.NotifyIcon
try {
    if (Test-Path $HermesExe) {
        $icon.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon($HermesExe)
    } else {
        $icon.Icon = [System.Drawing.SystemIcons]::Application
    }
} catch { $icon.Icon = [System.Drawing.SystemIcons]::Application }
$icon.Text = 'Profile Jedi'
$icon.Visible = $true

$menu = New-Object System.Windows.Forms.ContextMenuStrip

$miOpen = $menu.Items.Add('Open Dashboard')
$miOpen.add_Click({ Open-Dashboard })

$menu.Items.Add('-') | Out-Null

$miStart = $menu.Items.Add('Start Profile Jedi')
$miStart.add_Click({
        Invoke-Start
        $icon.ShowBalloonTip(2000, 'Profile Jedi', 'Starting...', [System.Windows.Forms.ToolTipIcon]::Info)
    })

$miStop = $menu.Items.Add('Stop Profile Jedi')
$miStop.add_Click({
        Invoke-Stop
        $icon.ShowBalloonTip(2000, 'Profile Jedi', 'Stopping...', [System.Windows.Forms.ToolTipIcon]::Info)
    })

$miRestart = $menu.Items.Add('Restart Profile Jedi')
$miRestart.add_Click({
        Invoke-Restart
        $icon.ShowBalloonTip(2000, 'Profile Jedi', 'Restarting...', [System.Windows.Forms.ToolTipIcon]::Info)
    })

$menu.Items.Add('-') | Out-Null

$miExit = $menu.Items.Add('Exit Supervisor')
$miExit.add_Click({
        try { if ($shared.Listener) { $shared.Listener.Stop(); $shared.Listener.Close() } } catch {}
        try { $psListener.Dispose() } catch {}
        $icon.Visible = $false
        $icon.Dispose()
        [System.Windows.Forms.Application]::Exit()
    })

$icon.ContextMenuStrip = $menu
$icon.add_MouseDoubleClick({ Open-Dashboard })
$icon.ShowBalloonTip(2500, 'Profile Jedi', "Tray supervisor running (control port $CtrlPort).", [System.Windows.Forms.ToolTipIcon]::Info)

[System.Windows.Forms.Application]::EnableVisualStyles()
[System.Windows.Forms.Application]::Run()

# Cleanup if the loop ever exits without the menu handler.
try { if ($shared.Listener) { $shared.Listener.Stop() } } catch {}
try { $icon.Dispose() } catch {}
