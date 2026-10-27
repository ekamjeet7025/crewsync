@echo off
setlocal
cd /d "%~dp0"
if not exist artifacts mkdir artifacts
if not exist node_modules (
  echo Installing dependencies...
  call npm ci
  if errorlevel 1 goto failed
)
echo Running checks. Results are saved in artifacts\verification.log
call npm run check > artifacts\verification.log 2>&1
if errorlevel 1 goto failed
call npm test >> artifacts\verification.log 2>&1
if errorlevel 1 goto failed
call npm run build >> artifacts\verification.log 2>&1
if errorlevel 1 goto failed
echo All automated checks passed. Starting CrewSync...
echo Open http://127.0.0.1:3100 after the server reports it is ready.
call npm run demo
if errorlevel 1 goto failed
exit /b 0
:failed
echo A check or startup failed. Leave this window open and share the error.
if exist artifacts\verification.log type artifacts\verification.log
pause
exit /b 1
