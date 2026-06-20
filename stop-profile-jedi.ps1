# stop-profile-jedi.ps1 - stop the Profile Jedi dev server (whatever is
# listening on its port). Safe to run whether or not it is running.
$ErrorActionPreference = 'SilentlyContinue'

$Port = 7780

Write-Host "[Profile Jedi] Stopping anything listening on port $Port..." -ForegroundColor Cyan

$conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
$pids = @($conns | Select-Object -ExpandProperty OwningProcess -Unique)

if (-not $pids -or $pids.Count -eq 0) {
    Write-Host "[Profile Jedi] Nothing was running on port $Port." -ForegroundColor DarkGray
    return
}

foreach ($processId in $pids) {
    try {
        $p = Get-Process -Id $processId -ErrorAction SilentlyContinue
        # Kill the whole tree so pnpm/node child workers go down too.
        Start-Process -FilePath 'taskkill.exe' -ArgumentList '/PID', $processId, '/T', '/F' -NoNewWindow -Wait
        Write-Host "[Profile Jedi] Stopped PID $processId ($($p.ProcessName))." -ForegroundColor Green
    } catch {
        Write-Host "[Profile Jedi] Could not stop PID $processId." -ForegroundColor Yellow
    }
}

Write-Host '[Profile Jedi] Done.' -ForegroundColor Green
