@echo off
echo ========================================
echo   Starting Ngrok Tunnel to Jenkins
echo ========================================
echo.
echo This will create a public URL for your Jenkins server
echo so GitHub webhooks can reach it.
echo.
echo IMPORTANT: Keep this window OPEN!
echo If you close it, the tunnel will stop.
echo.
echo ========================================
echo.

REM Check if ngrok is in PATH
where ngrok >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Ngrok found in PATH. Starting tunnel...
    echo.
    ngrok http 8080
) else (
    echo Ngrok not found in PATH.
    echo.
    echo Please enter the full path to ngrok.exe
    echo Example: C:\ngrok\ngrok.exe
    echo.
    set /p NGROK_PATH="Enter ngrok path: "
    
    if exist "%NGROK_PATH%" (
        echo.
        echo Starting ngrok...
        echo.
        "%NGROK_PATH%" http 8080
    ) else (
        echo.
        echo ERROR: Ngrok not found at: %NGROK_PATH%
        echo.
        echo Please download ngrok from: https://ngrok.com/download
        echo Extract it to a folder and run this script again.
        echo.
        pause
    )
)
