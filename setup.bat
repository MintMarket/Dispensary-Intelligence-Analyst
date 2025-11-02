@echo off
REM Setup script for Dispensary Intelligence Analyst
REM For Windows users

echo =========================================
echo Dispensary Intelligence Analyst - Setup
echo =========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo Visit: https://nodejs.org
    echo.
    echo Download and run the installer, then run this script again.
    pause
    exit /b 1
)

echo + Node.js found
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X npm is not installed!
    echo npm should come with Node.js. Please reinstall Node.js.
    pause
    exit /b 1
)

echo + npm found
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
echo This may take a few minutes...
echo.

call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo X Failed to install dependencies
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo + Dependencies installed successfully!

REM Build the project
echo.
echo Building the project...
echo.

call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo X Build failed
    pause
    exit /b 1
)

echo.
echo + Build successful!

REM Create .env file if it doesn't exist
if not exist .env (
    echo.
    echo Creating configuration file...
    copy .env.example .env
    echo + Configuration file created (.env)
    echo   You can edit this file to customize settings
)

echo.
echo =========================================
echo + Setup Complete!
echo =========================================
echo.
echo Next steps:
echo 1. Run your first report:
echo    Double-click run-report.bat
echo.
echo 2. Try other reports:
echo    run-ptl-verification.bat
echo    run-vendor-tracker.bat
echo    run-alerts-demo.bat
echo.
echo 3. Customize settings:
echo    Edit the .env file
echo.
echo For more help, see SETUP_GUIDE.md
echo.
pause
