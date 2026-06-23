# Start-Profile-Jedi.ps1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host "Waking up Profile Jedi..." -ForegroundColor Gold
Start-Process "http://localhost:7780"
npm run dev
