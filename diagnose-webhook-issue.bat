@echo off
REM ============================================
REM Webhook Issue Diagnostic Script
REM ============================================

echo.
echo ========================================
echo   WEBHOOK TROUBLESHOOTING DIAGNOSTIC
echo ========================================
echo.

REM Test 1: Check if Jenkins is running
echo [TEST 1] Checking if Jenkins is running...
curl -s -o nul -w "%%{http_code}" http://localhost:8080 > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if "%STATUS%"=="200" (
    echo [OK] Jenkins is running on localhost:8080
) else if "%STATUS%"=="302" (
    echo [OK] Jenkins is running ^(redirected^)
) else if "%STATUS%"=="403" (
    echo [OK] Jenkins is running ^(auth required^)
) else (
    echo [ERROR] Jenkins is NOT accessible on localhost:8080
    echo        Status code: %STATUS%
    echo        Please start Jenkins first!
    goto :end
)

echo.

REM Test 2: Check webhook endpoint
echo [TEST 2] Testing Jenkins webhook endpoint...
curl -s -o nul -w "%%{http_code}" http://localhost:8080/github-webhook/ > temp_webhook.txt
set /p WEBHOOK_STATUS=<temp_webhook.txt
del temp_webhook.txt

if "%WEBHOOK_STATUS%"=="200" (
    echo [OK] Webhook endpoint responds: %WEBHOOK_STATUS%
) else if "%WEBHOOK_STATUS%"=="302" (
    echo [OK] Webhook endpoint responds: %WEBHOOK_STATUS%
) else if "%WEBHOOK_STATUS%"=="403" (
    echo [OK] Webhook endpoint responds: %WEBHOOK_STATUS%
) else (
    echo [WARNING] Webhook endpoint status: %WEBHOOK_STATUS%
)

echo.

REM Test 3: Check if Jenkinsfile has triggers
echo [TEST 3] Checking Jenkinsfile configuration...
if exist "Job_Portal\Jenkinsfile" (
    findstr /C:"githubPush()" "Job_Portal\Jenkinsfile" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Jenkinsfile has githubPush^(^) trigger
    ) else (
        echo [ERROR] Jenkinsfile missing githubPush^(^) trigger
    )
) else (
    echo [ERROR] Jenkinsfile not found
)

echo.

REM Test 4: Check Git configuration
echo [TEST 4] Checking Git configuration...
git config --get remote.origin.url >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "delims=" %%i in ('git config --get remote.origin.url') do set REPO_URL=%%i
    echo [OK] Git remote configured
    echo      Repository: %REPO_URL%
) else (
    echo [ERROR] Git remote not configured
)

echo.
echo ========================================
echo   DIAGNOSIS SUMMARY
echo ========================================
echo.

echo MOST COMMON ISSUES:
echo.
echo 1. "GitHub hook trigger" NOT enabled in Jenkins job
echo    ^> Go to: Jenkins ^> Your Job ^> Configure ^> Build Triggers
echo    ^> Check: [X] GitHub hook trigger for GITScm polling
echo    ^> Click: Save
echo.
echo 2. Jenkins not publicly accessible
echo    ^> GitHub cannot reach localhost or private IPs
echo    ^> Solution: Use ngrok
echo    ^> Command: ngrok http 8080
echo    ^> Update GitHub webhook with ngrok URL
echo.
echo 3. Wrong webhook URL in GitHub
echo    ^> Must be: http://YOUR_JENKINS:8080/github-webhook/
echo    ^> Note the trailing slash /
echo.

echo ========================================
echo   NEXT STEPS
echo ========================================
echo.
echo STEP 1: Check GitHub Webhook Delivery
echo   ^> Go to: GitHub ^> Settings ^> Webhooks ^> Recent Deliveries
echo   ^> Is it GREEN (checkmark) or RED (X)?
echo.
echo   If RED (Connection refused/timeout):
echo     - Jenkins is not publicly accessible
echo     - Use ngrok: ngrok http 8080
echo     - Update GitHub webhook URL with ngrok URL
echo.
echo   If GREEN (200 OK):
echo     - Webhook is reaching Jenkins
echo     - Problem is Jenkins configuration
echo     - Check "GitHub hook trigger" is enabled in job
echo.
echo STEP 2: Verify Jenkins Job Configuration
echo   ^> Open: http://localhost:8080
echo   ^> Click: Your pipeline job
echo   ^> Click: Configure
echo   ^> Scroll to: Build Triggers
echo   ^> Verify: [X] GitHub hook trigger for GITScm polling
echo   ^> Click: Save
echo.
echo STEP 3: Test Again
echo   git add .
echo   git commit -m "test webhook"
echo   git push origin main
echo.
echo ========================================
echo   OPEN JENKINS NOW?
echo ========================================
echo.
choice /C YN /M "Open Jenkins in browser"
if %ERRORLEVEL% EQU 1 (
    start http://localhost:8080
)

echo.
choice /C YN /M "Open GitHub webhooks page"
if %ERRORLEVEL% EQU 1 (
    echo.
    echo Please manually navigate to:
    echo https://github.com/YOUR_USERNAME/YOUR_REPO/settings/hooks
    echo.
)

echo.
echo For detailed troubleshooting, see:
echo   WEBHOOK_TROUBLESHOOTING_STEPS.md
echo.

:end
pause
