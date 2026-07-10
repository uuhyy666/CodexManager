@echo off
echo Uruchamiam serwer menedzera kont Codex...
start /B node server.js
timeout /t 2 > NUL
start http://localhost:3000
echo Menedzer uruchomiony w tle. Mozesz zamknac to okno (serwer bedzie dzialac dalej, az go nie wylaczysz w przegladarce).
pause
