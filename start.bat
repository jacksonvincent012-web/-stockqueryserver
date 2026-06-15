@echo off
echo Starting Stock Query Server...
echo.

echo [1/2] Starting Flask backend on http://localhost:5000
start "Flask Backend" cmd /c "cd /d "%~dp0backend" && python server.py"

echo [2/2] Starting React frontend on http://localhost:3000
start "React Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers starting in separate windows.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
