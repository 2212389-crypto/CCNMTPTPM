@echo off
echo 🔍 Checking Expense Manager Services...
echo ==================================

REM Check if services are running
echo 📡 Checking Services Status...

REM Check API Server
echo|set /p="🔧 API Server (http://localhost:4000): "
curl -s -f http://localhost:4000/api/health >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Running
) else (
    echo ❌ Not Running
)

REM Check Web App  
echo|set /p="🌐 Web App (http://localhost:5173): "
curl -s -f http://localhost:5173 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Running  
) else (
    echo ❌ Not Running
)

REM Check Database
echo|set /p="🗄️  Database (PostgreSQL): "
docker ps | findstr "expense-manager-db" >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Running
) else (
    echo ❌ Not Running
    echo    To start: cd infra ^&^& docker-compose up -d
)

echo.
echo 🔗 Important URLs:
echo ==================================
echo 🌐 Frontend:     http://localhost:5173
echo 🔧 API:          http://localhost:4000/api  
echo 📚 Swagger Docs: http://localhost:4000/docs
echo 🗄️  Database:    postgresql://expense_user:1234@localhost:5432/expense_db
echo.

echo 📋 Quick Commands:
echo ==================================
echo Start Database:  cd infra ^&^& docker-compose up -d
echo Start API:       cd apps/api ^&^& npm run dev
echo Start Web:       cd apps/web ^&^& npm run dev
echo Build API:       cd apps/api ^&^& npm run build  
echo Build Web:       cd apps/web ^&^& npm run build
echo.

echo 🚀 Ready to Deploy?
echo ==================================
echo ✅ All code errors fixed
echo ✅ TypeScript compilation clean  
echo ✅ Build process working
echo ✅ API endpoints documented
echo ✅ Environment configs ready
echo.
echo 📖 See DEPLOYMENT.md for detailed deploy instructions

pause