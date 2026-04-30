@echo off
title Actualizacion Total - PulsoOdds
echo ============================================
echo 🚀 INICIANDO PROCESO DE ACTUALIZACION TOTAL
echo ============================================
echo.

:: Entrar en la carpeta del script (por si acaso)
cd /d "%~dp0"

:: Ejecutar el script maestro con Node.js
node scripts/master_update.js

echo.
echo ============================================
echo ✨ PROCESO COMPLETADO
echo ============================================
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
