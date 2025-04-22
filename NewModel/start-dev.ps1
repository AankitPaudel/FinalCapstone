# PowerShell script to start development servers
# This script starts both frontend and backend servers in development mode

Write-Host "Starting Virtual Teacher Development Environment" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Function to check if a process is running on a port
function Test-PortInUse {
    param($port)
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    return $connections.Count -gt 0
}

# Check if ports are already in use
if (Test-PortInUse -port 8000) {
    Write-Host "Warning: Port 8000 is already in use. Backend may not start correctly." -ForegroundColor Yellow
}
if (Test-PortInUse -port 3001) {
    Write-Host "Warning: Port 3001 is already in use. Frontend may not start correctly." -ForegroundColor Yellow
}

# Start Backend Server
Write-Host "`nStarting Backend Server..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-Command cd '$PSScriptRoot\backend'; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -NoNewWindow

# Wait a moment for backend to initialize
Start-Sleep -Seconds 5

# Start Frontend Server
Write-Host "`nStarting Frontend Server..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-Command cd '$PSScriptRoot\frontend'; npm run dev" -NoNewWindow

Write-Host "`nDevelopment servers started!" -ForegroundColor Green
Write-Host "Backend available at: http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend available at: http://localhost:3001" -ForegroundColor Green
Write-Host "`nPress Ctrl+C to stop the servers" -ForegroundColor Yellow

# Keep script running
try {
    Wait-Event -Timeout ([int]::MaxValue)
} catch {
    Write-Host "`nStopping development environment..." -ForegroundColor Red
} 