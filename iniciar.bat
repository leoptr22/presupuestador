@echo off
cd /d "%~dp0"
echo.
echo   Iniciando Presupuestador Rojas...
echo   La pagina se abrira automaticamente en unos segundos.
echo.
start "Servidor Presupuestador" /min npm.cmd run dev -- --host 127.0.0.1 --port 4173
timeout /t 4 /nobreak >nul
start "" http://127.0.0.1:4173
exit
