# start-all.ps1
# Opens two new PowerShell windows (or pwsh) to run backend and frontend each in their own terminal
# Usage: .\scripts\start-all.ps1

$repo = Split-Path -Parent $PSScriptRoot

$backendCmd = "cd '$repo'; .\scripts\start-backend.ps1"
$frontendCmd = "cd '$repo\frontend'; npm run dev"

# Prefer pwsh (PowerShell Core) if available
$pwsh = Get-Command pwsh -ErrorAction SilentlyContinue
$ps = Get-Command powershell -ErrorAction SilentlyContinue

if ($pwsh) {
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", $backendCmd
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", $frontendCmd
} elseif ($ps) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
} else {
    Write-Error "No PowerShell executable found to start processes in new windows. Run scripts individually instead."
}
