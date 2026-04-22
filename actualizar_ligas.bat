@echo off
title Actualizador de Clasificaciones - PulsoOdds
echo ========================================
echo   INICIANDO ACTUALIZACION DE LIGAS
echo ========================================
echo.
node scripts/scrape-flashscore.js
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
