@echo off
REM Run Vendor Partnership Tracker

echo =========================================
echo Running Vendor Partnership Tracker...
echo =========================================
echo.

call npx ts-node examples/vendor-partnership.ts

echo.
echo Report complete!
echo.
pause
