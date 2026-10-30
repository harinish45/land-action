@echo off
npm install --global rea-agents > "%TEMP%\rea-install.log" 2>&1
echo EXITCODE=%ERRORLEVEL%>> "%TEMP%\rea-install.log"
