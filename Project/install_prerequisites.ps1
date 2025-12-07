# Giant Bomb App - Prerequisites & Setup Script

Write-Host "Checking System Prerequisites..." -ForegroundColor Cyan

# 1. Check for Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node -v
    Write-Host "✔ Node.js is installed ($nodeVersion)" -ForegroundColor Green
} else {
    Write-Host "✘ Node.js is NOT installed." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 2. Check for npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm -v
    Write-Host "✔ npm is installed ($npmVersion)" -ForegroundColor Green
} else {
    Write-Host "✘ npm is NOT installed." -ForegroundColor Red
    exit 1
}

# 3. Install Project Dependencies
Write-Host "`nInstalling Project Dependencies (React, Firebase, TailwindCSS, etc.)..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✔ Dependencies installed successfully!" -ForegroundColor Green
    
    # 4. Create .env if not exists
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Host "⚠ Created .env file from .env.example. Please update it with your API keys." -ForegroundColor Yellow
        } else {
            Write-Host "⚠ .env.example not found. Please create .env manually." -ForegroundColor Yellow
        }
    }

    Write-Host "`nSetup Complete! 🚀" -ForegroundColor Green
    Write-Host "To start the application, run:" -ForegroundColor Cyan
    Write-Host "npm run dev" -NoNewline
} else {
    Write-Host "`n✘ Failed to install dependencies." -ForegroundColor Red
}
