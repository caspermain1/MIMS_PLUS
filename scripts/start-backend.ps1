# start-backend.ps1
# Creates/activates venv (if needed), installs requirements, runs migrations and starts Django dev server.
# Usage: .\scripts\start-backend.ps1

# Ensure script runs from repo root
Push-Location $PSScriptRoot\.. 

if (-not (Test-Path .\venv\Scripts\python.exe)) {
    Write-Host "Virtualenv not found — creating venv..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate venv
try {
    . .\venv\Scripts\Activate.ps1
} catch {
    Write-Warning "Failed to run Activate.ps1 automatically. You can activate manually with: .\venv\Scripts\Activate.ps1"
}

$python = Join-Path $PWD "venv\Scripts\python.exe"
if (-not (Test-Path $python)) { $python = "python" }

Write-Host "Upgrading pip and installing requirements..." -ForegroundColor Green
& $python -m pip install --upgrade pip
& $python -m pip install -r requirements.txt

Write-Host "Applying migrations..." -ForegroundColor Green
& $python manage.py migrate

Write-Host "Starting Django development server (127.0.0.1:8000) — press Ctrl+C to stop" -ForegroundColor Cyan
& $python manage.py runserver

Pop-Location
