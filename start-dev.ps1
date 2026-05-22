# Start Development Environment for AI Assessment Creator

Write-Host "=== AI Assessment Creator - Dev Startup ===" -ForegroundColor Cyan

# Check if Docker is available
$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerAvailable) {
    Write-Host "Docker not found. Please install Docker Desktop for Windows." -ForegroundColor Yellow
    Write-Host "Starting services individually..." -ForegroundColor Yellow
} else {
    Write-Host "Starting MongoDB and Redis via Docker Compose..." -ForegroundColor Green
    docker-compose up -d
    Write-Host "Waiting for services to be ready..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

# Install dependencies if needed
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Green
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Green
    Set-Location frontend
    npm install
    Set-Location ..
}

# Start backend
Write-Host "Starting backend server (port 5000)..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    npm run dev
}

Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend dev server (port 3000)..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    npm run dev
}

Write-Host ""
Write-Host "=== Services Starting ===" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "MongoDB:  mongodb://localhost:27017" -ForegroundColor Green
Write-Host "Redis:    localhost:6379" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

# Wait and cleanup on exit
try {
    while ($true) {
        Start-Sleep -Seconds 10
        Receive-Job $backendJob -ErrorAction SilentlyContinue
        Receive-Job $frontendJob -ErrorAction SilentlyContinue
    }
} finally {
    Write-Host "Shutting down..." -ForegroundColor Yellow
    Stop-Job $backendJob
    Stop-Job $frontendJob
    Remove-Job $backendJob
    Remove-Job $frontendJob
}
