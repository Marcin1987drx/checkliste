@echo off
title Checklist Manager
echo ================================================
echo   Starting Checklist Manager...
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed!
    echo Please install Python from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [OK] Python found
echo [INFO] Starting web server on http://localhost:8080
echo.
echo ================================================
echo   Open your browser and go to:
echo   http://localhost:8080
echo ================================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start server and open browser
start http://localhost:8080
python -m http.server 8080
