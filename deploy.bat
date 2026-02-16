@echo off
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

echo Done!
pause
