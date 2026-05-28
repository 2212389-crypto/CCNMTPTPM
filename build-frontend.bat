@echo off
echo 🚀 Building Expense Manager Frontend for Deployment...
echo =================================================

REM Check if we're in the right directory
if not exist "apps\web\package.json" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)

REM Navigate to web app
cd apps\web

echo 📦 Installing dependencies...
call npm install

echo 🔍 Running type check...
call npx tsc --noEmit

echo 🧹 Running linter...
call npm run lint

echo 🏗️ Building for production...
call npm run build

echo 📊 Build statistics:
echo ===================
dir dist

echo.
echo ✅ Build completed successfully!
echo 📁 Output directory: apps\web\dist
echo 🌐 Ready for Netlify deployment!
echo.
echo 🚀 Deploy commands:
echo 1. Manual: Drag ^& drop 'dist' folder to netlify.com
echo 2. CLI: netlify deploy --prod --dir=dist
echo 3. GitHub: Push to repository connected to Netlify

pause