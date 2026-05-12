@echo off
echo.
echo  IT Support — Command Center
echo  ===========================
echo.

echo  [1/2] Starting .NET API on http://localhost:5000 ...
start "IT Support API" cmd /k "cd /d %~dp0backend\ITSupport.Api && dotnet run"

timeout /t 3 /nobreak >nul

echo  [2/2] Starting React frontend on http://localhost:5173 ...
start "IT Support Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo.
echo  Both servers starting. Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo  Done!
