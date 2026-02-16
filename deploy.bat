@echo off
echo Checking for existing git processes...
if exist ".git/index.lock" (
    echo Removing stuck lock file...
    del ".git/index.lock"
)

echo Initializing Git...
git init

echo Adding files...
git add .

echo Committing changes...
git commit -m "feat: Website redesign, 3D background, and new report logic"

echo Configuring remote...
git branch -M main
git remote add origin https://github.com/ziadakeel55/gama-reports.git
git remote set-url origin https://github.com/ziadakeel55/gama-reports.git

echo Pushing to GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Could not push to GitHub. 
    echo Please check your internet connection and try again.
)

echo Done!
pause
