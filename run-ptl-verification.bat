@echo off
REM Run PTL Verification Report

echo =========================================
echo Running PTL Verification...
echo =========================================
echo.

call npx ts-node examples/ptl-verification.ts

echo.
echo Report complete!
echo.
pause
