@echo off
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
echo Starte Mathe II ^& 3D-Computergrafik Lernumgebung...
echo Oeffne http://localhost:5173 im Browser.
npm.cmd run dev
pause
