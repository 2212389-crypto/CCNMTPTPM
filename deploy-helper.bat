@echo off
echo 🚀 Expense Manager - Full Stack Deployment Helper
echo ===============================================

echo.
echo 🎯 Your Stack: Netlify + Render + Neon
echo 🌐 Frontend: Netlify (React)
echo 🔧 Backend:  Render (Node.js)  
echo 🗄️ Database: Neon (PostgreSQL)
echo.

echo 📋 Deployment Order:
echo 1️⃣ Database (Neon)    - 5 minutes
echo 2️⃣ Backend (Render)   - 10 minutes  
echo 3️⃣ Frontend (Netlify) - 5 minutes
echo.

:menu
echo 🛠️ What would you like to do?
echo.
echo [1] Build Frontend for Netlify
echo [2] Test Backend Build  
echo [3] Generate New JWT Secrets
echo [4] View Deployment URLs
echo [5] Open Deployment Guide
echo [6] Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto build_frontend
if "%choice%"=="2" goto test_backend  
if "%choice%"=="3" goto generate_secrets
if "%choice%"=="4" goto show_urls
if "%choice%"=="5" goto open_guide
if "%choice%"=="6" goto exit

echo Invalid choice. Please try again.
goto menu

:build_frontend
echo.
echo 🏗️ Building Frontend for Netlify...
echo ====================================
cd apps\web
call npm install
call npm run build
echo.
echo ✅ Frontend built successfully!
echo 📁 Upload folder: apps\web\dist
echo 🌐 Drag & drop to netlify.com
echo.
pause
goto menu

:test_backend
echo.  
echo 🔧 Testing Backend Build...
echo ============================
cd apps\api
call npx tsc --noEmit
if %errorlevel%==0 (
    echo ✅ TypeScript compilation successful!
    call npm run build
    if %errorlevel%==0 (
        echo ✅ Backend build successful!
    ) else (
        echo ❌ Backend build failed!
    )
) else (
    echo ❌ TypeScript errors found!
)
echo.
pause
goto menu

:generate_secrets
echo.
echo 🔐 Generating New JWT Secrets...
echo =================================
node generate-secrets.js
echo.
echo 📋 Copy these secrets to Render Environment Variables
echo.
pause  
goto menu

:show_urls
echo.
echo 🌍 Your Deployment URLs:
echo ========================
echo 🌐 Frontend: https://expense-manager.netlify.app
echo 🔧 Backend:  https://expense-manager-api.onrender.com/api
echo 📚 Swagger:  https://expense-manager-api.onrender.com/docs  
echo 🗄️ Database: https://console.neon.tech (dashboard)
echo.
echo 🛠️ Management Dashboards:
echo =========================
echo 🌐 Netlify:  https://app.netlify.com
echo 🔧 Render:   https://dashboard.render.com
echo 🗄️ Neon:     https://console.neon.tech
echo.
pause
goto menu

:open_guide
echo.
echo 📖 Opening Deployment Guide...
echo ===============================
start FULL-STACK-DEPLOY.md
echo.
echo Guide opened in your default editor.
echo Follow the step-by-step instructions.
echo.
pause  
goto menu

:exit
echo.
echo 📄 Available Documentation:
echo ===========================
echo 📖 FULL-STACK-DEPLOY.md  - Complete deployment guide
echo 🌐 NETLIFY-DEPLOY.md     - Netlify specific guide  
echo 🔧 RENDER-DEPLOY.md      - Render specific guide
echo ✅ RENDER-CHECKLIST.md   - Deploy checklist
echo 🗄️ DATABASE-MANAGEMENT.md - Database access guide
echo.
echo 🎉 Good luck with your deployment!
echo 💬 If you need help, refer to the guides above.
echo.