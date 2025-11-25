# start-frontend.ps1
# Instala dependencias (opcional) y arranca Vite (dev server) para la carpeta frontend
# Usage: .\scripts\start-frontend.ps1  [-Install]

param(
    [switch]$Install
)

Push-Location $PSScriptRoot\..\frontend

if ($Install) {
    Write-Host "Running npm install..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting frontend (vite) — press Ctrl+C to stop" -ForegroundColor Cyan
npm run dev

Pop-Location
