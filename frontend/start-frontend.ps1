# NVM Setup and Frontend Start Script
# This script manually sets up NVM paths and starts the frontend

Write-Host "Setting up NVM environment..." -ForegroundColor Yellow

# Set NVM paths
$nvmHome = "C:\Users\91637\AppData\Roaming\nvm"
$nvmSymlink = "C:\Program Files\nodejs"

# Add to PATH for this session
$env:PATH = "$nvmSymlink;$nvmHome;$env:PATH"

# Verify Node is accessible
Write-Host "Checking Node version..." -ForegroundColor Yellow
& "$nvmSymlink\node.exe" --version

# Verify npm is accessible  
Write-Host "Checking npm version..." -ForegroundColor Yellow
& "$nvmSymlink\npm.cmd" --version

# Navigate to frontend
Set-Location "d:\buyerintentt-main\buyerintentt-main\frontend"

# Clean install
Write-Host "`nCleaning old dependencies..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

Write-Host "Clearing npm cache..." -ForegroundColor Yellow
& "$nvmSymlink\npm.cmd" cache clean --force

# Install dependencies
Write-Host "`nInstalling dependencies (this may take 2-3 minutes)..." -ForegroundColor Yellow
& "$nvmSymlink\npm.cmd" install --legacy-peer-deps

# Start frontend
Write-Host "`nStarting frontend server..." -ForegroundColor Green
& "$nvmSymlink\npm.cmd" start
