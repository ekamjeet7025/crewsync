@echo off
cd /d "%~dp0"
if not exist node_modules call npm ci
if errorlevel 1 goto failed
call npm run build
if errorlevel 1 goto failed
call npm run demo
:failed
pause
