@echo off
echo ==================================================
echo 🚀 Starting QuantPulse India Backend
echo 🐍 Using Python 3.13 (Required for CrewAI)
echo ==================================================

REM Check if py launcher is available
where py >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Python Launcher 'py' not found.
    echo Please install Python 3.13 and ensure it is added to PATH.
    pause
    exit /b
)

REM Run the backend specifically with Python 3.13
py -3.13 run.py

if %errorlevel% neq 0 (
    echo.
    echo ❌ Backend crashed or stopped with error code %errorlevel%.
    pause
)
