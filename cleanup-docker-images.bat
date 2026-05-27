@echo off
REM Docker Image Cleanup Script for Job Portal Project
REM This script removes duplicate and old Docker images

echo ========================================
echo Docker Image Cleanup Script
echo ========================================
echo.

echo Current Docker Images:
echo ----------------------------------------
docker images
echo.

echo ========================================
echo Cleanup Options:
echo ========================================
echo 1. Remove old compose-generated images (job_portal-*)
echo 2. Remove old version tags (v1.0)
echo 3. Remove all dangling images
echo 4. Full cleanup (all unused images)
echo 5. Show disk usage
echo 6. Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto remove_compose
if "%choice%"=="2" goto remove_old_versions
if "%choice%"=="3" goto remove_dangling
if "%choice%"=="4" goto full_cleanup
if "%choice%"=="5" goto show_usage
if "%choice%"=="6" goto end

:remove_compose
echo.
echo Removing compose-generated images...
docker rmi job_portal-backend 2>nul
docker rmi job_portal-frontend 2>nul
echo Done!
goto show_result

:remove_old_versions
echo.
echo Removing old version tags...
docker rmi pratham-12-lab/job-portal-backend:v1.0 2>nul
docker rmi pratham-12-lab/job-portal-frontend:v1.0 2>nul
echo Done!
goto show_result

:remove_dangling
echo.
echo Removing dangling images...
docker image prune -f
echo Done!
goto show_result

:full_cleanup
echo.
echo WARNING: This will remove ALL unused images!
set /p confirm="Are you sure? (y/n): "
if /i "%confirm%"=="y" (
    docker image prune -a -f
    echo Done!
) else (
    echo Cancelled.
)
goto show_result

:show_usage
echo.
echo Docker Disk Usage:
echo ----------------------------------------
docker system df
echo.
pause
goto end

:show_result
echo.
echo ========================================
echo Remaining Images:
echo ========================================
docker images
echo.

:end
echo.
echo Cleanup script finished.
pause
