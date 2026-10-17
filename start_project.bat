@echo off
title BurnCare AI - Launching Project
echo ===================================================
echo   BurnCare AI - Burn Triage Clinical System
echo   Extending Rangaiah et al. (BSPC 2025) Algorithm
echo   MongoDB Database: 6,500+ Patient Cohort
echo ===================================================
echo.

echo [1/3] Checking MongoDB...
sc query MongoDB | findstr /i "STATE"
echo.

echo [2/3] Starting FastAPI Backend on port 8000...
start "BurnCare Backend" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"
timeout /t 3 /nobreak >nul

echo [3/3] Starting React Frontend on port 3000...
cd frontend
start "BurnCare Frontend" cmd /k "npm run dev -- --host 127.0.0.1"
timeout /t 3 /nobreak >nul

echo.
echo Launching Web Browser at http://localhost:3000...
start http://localhost:3000

echo.
echo ===================================================
echo   BurnCare AI is now running!
echo   Dashboard:  http://localhost:3000
echo   API Docs:   http://localhost:8000/docs
echo   Live Stats: http://localhost:8000/api/database/stats
echo ===================================================
pause
