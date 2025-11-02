@echo off
REM Run Executive Intelligence Summary Report

echo =========================================
echo Generating Intelligence Report...
echo =========================================
echo.

call npx ts-node examples/basic-usage.ts

echo.
echo =========================================
echo Report Complete!
echo =========================================
echo.
echo The report is displayed above.
echo You can redirect to a file with:
echo   run-report.bat ^> report.txt
echo.
pause
