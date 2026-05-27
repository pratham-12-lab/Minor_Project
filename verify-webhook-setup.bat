@echo off
REM ============================================
REM GitHub Webhook Setup Verification Script
REM ============================================

echo.
echo ========================================
echo   GitHub Webhook Setup Verification
echo ========================================
echo.

REM Check if Jenkins is running
echo [1/5] Checking if Jenkins is running...
curl -s -o nul -w "%%{http_code}" http://localhost:8080 > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if "%STATUS%"=="200" (
    echo [OK] Jenkins is running on localhost:8080
) else if "%STATUS%"=="302" (
    echo [OK] Jenkins is running on localhost:8080 ^(redirected^)
) else if "%STATUS%"=="403" (
    echo [OK] Jenkins is running ^(authentication required^)
) else (
    echo [ERROR] Jenkins is not accessible on localhost:8080
    echo        Please start Jenkins first
    goto :end
)

echo.

REM Check if ngrok is installed
echo [2/5] Checking if ngrok is installed...
where ngrok >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] ngrok is installed
    echo      To start ngrok: ngrok http 8080
) else (
    echo [INFO] ngrok is not installed
    echo       Download from: https://ngrok.com/download
    echo       This is needed to expose Jenkins publicly
)

echo.

REM Check if Git is configured
echo [3/5] Checking Git configuration...
git config --get remote.origin.url >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Git remote is configured
    for /f "delims=" %%i in ('git config --get remote.origin.url') do set REPO_URL=%%i
    echo      Repository: %REPO_URL%
) else (
    echo [WARNING] Git remote not found
    echo          Make sure you're in the correct directory
)

echo.

REM Check if Jenkinsfile has triggers
echo [4/5] Checking Jenkinsfile configuration...
if exist "Job_Portal\Jenkinsfile" (
    findstr /C:"githubPush()" "Job_Portal\Jenkinsfile" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Jenkinsfile has githubPush^(^) trigger configured
    ) else (
        echo [ERROR] Jenkinsfile missing githubPush^(^) trigger
        echo        The trigger has been added, please commit and push
    )
) else (
    echo [ERROR] Jenkinsfile not found at Job_Portal\Jenkinsfile
)

echo.

REM Check Docker
echo [5/5] Checking Docker...
docker --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker is installed
    docker ps >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Docker daemon is running
    ) else (
        echo [WARNING] Docker daemon is not running
        echo          Start Docker Desktop
    )
) else (
    echo [ERROR] Docker is not installed
    echo        Install from: https://www.docker.com/products/docker-desktop
)

echo.
echo ========================================
echo   Next Steps
echo ========================================
echo.
echo 1. If Jenkins is running, configure the job:
echo    - Open Jenkins ^> Your Job ^> Configure
echo    - Enable: "GitHub hook trigger for GITScm polling"
echo    - Save
echo.
echo 2. Install required Jenkins plugins:
echo    - Git Plugin
echo    - GitHub Plugin
echo    - Pipeline Plugin
echo    - Docker Pipeline
echo.
echo 3. Expose Jenkins publicly:
echo    Option A: Run "ngrok http 8080"
echo    Option B: Configure port forwarding on router
echo.
echo 4. Add GitHub webhook:
echo    - Go to GitHub repo ^> Settings ^> Webhooks
echo    - Add webhook with URL: http://YOUR_JENKINS_URL:8080/github-webhook/
echo    - Content type: application/json
echo    - Events: Just the push event
echo.
echo 5. Test with: git push origin main
echo.
echo For detailed guide, see: GITHUB_WEBHOOK_SETUP_GUIDE.md
echo.

:end
pause
