@echo off
rem Copia de seguridad cifrada de tus datos personales (ver README, "Copias de seguridad").
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Necesitas Node.js 18 o superior: https://nodejs.org
  pause
  exit /b 1
)
node "_sistema\scripts\respaldar.mjs" %*
echo.
pause
