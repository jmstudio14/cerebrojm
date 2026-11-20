@echo off
rem Actualiza en cada proyecto con repo de GitHub el ultimo push y los issues abiertos.
rem Necesita la CLI de GitHub (gh) con la sesion iniciada: gh auth login
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Necesitas Node.js 18 o superior: https://nodejs.org
  pause
  exit /b 1
)
node "_sistema\scripts\repos.mjs" %*
echo.
pause
