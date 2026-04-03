@echo off
REM ViteCredit Health Tracking App - Local Development Start Script (Windows)

setlocal enabledelayedexpansion

echo.
echo 🚀 ViteCredit Health Tracking App - Starting Local Development
echo ===========================================================
echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo.
    echo ❌ Please configure your Firebase credentials in .env file
    echo.
    echo 📝 Required environment variables:
    echo    - VITE_FIREBASE_API_KEY
    echo    - VITE_FIREBASE_AUTH_DOMAIN
    echo    - VITE_FIREBASE_PROJECT_ID
    echo    - VITE_FIREBASE_STORAGE_BUCKET
    echo    - VITE_FIREBASE_MESSAGING_SENDER_ID
    echo    - VITE_FIREBASE_APP_ID
    echo    - VITE_GOOGLE_API_KEY
    exit /b 1
)

REM Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js version: %NODE_VERSION%

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo.
    echo 📦 Installing dependencies...
    call npm install
)

echo ✓ Dependencies installed
echo.
echo 📋 Available commands:
echo    npm run dev       - Start development server on http://localhost:3000
echo    npm run build     - Build for production
echo    npm run preview   - Preview production build
echo    npm run lint      - Run TypeScript linting
echo.
echo 🎯 Starting Vite development server...
echo 💡 Open http://localhost:3000 in your browser
echo.

call npm run dev
