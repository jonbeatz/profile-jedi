# pick-folder.ps1 — native Windows folder picker for Profile Jedi settings.
param(
    [string]$InitialPath = '',
    [string]$Description = 'Select a folder'
)

Add-Type -AssemblyName System.Windows.Forms
$fb = New-Object System.Windows.Forms.FolderBrowserDialog
$fb.Description = $Description
$fb.ShowNewFolderButton = $true
if ($InitialPath -and (Test-Path $InitialPath)) {
    $fb.SelectedPath = $InitialPath
}
if ($fb.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output $fb.SelectedPath
}
