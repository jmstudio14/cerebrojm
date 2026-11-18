@echo off
rem Escanea tus carpetas de proyectos y crea/actualiza las notas del cerebro.
rem La primera vez te pregunta que carpetas escanear y lo guarda en _sistema\config\escaner.local.json
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Necesitas Node.js 18 o superior: https://nodejs.org
  pause
  exit /b 1
)
node "_sistema\scripts\escanear.mjs" %*
echo.
pause
