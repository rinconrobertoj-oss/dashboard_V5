@echo off
chcp 65001 > nul
echo ============================================
echo   ACTUALIZACION DASHBOARD UP - %date%
echo ============================================

set REPO=C:\Users\roberto.rincon\dashboard_V5
set INFORMES=C:\Users\roberto.rincon\NTT DATA EMEAL\NTTD-ACN Proyecto UP - Documentos\01. Oficina Técnica\22.Comunicación Informes Consejos

:: Calcular carpeta de la semana actual (mes + dia del viernes de hoy)
for /f "tokens=2 delims=/" %%a in ("%date%") do set MES=%%a
for /f "tokens=3 delims=/" %%a in ("%date%") do set DIA=%%a
set CARPETA=%MES%%DIA%

echo.
echo [1/4] Buscando Excel en carpeta %CARPETA%...
set EXCEL_ORIGEN=%INFORMES%\%CARPETA%\Informe.xlsx

if not exist "%EXCEL_ORIGEN%" (
    echo ERROR: No se encontro el archivo en %EXCEL_ORIGEN%
    echo Verifica que la carpeta %CARPETA% existe y contiene Informe.xlsx
    pause
    exit /b 1
)

echo       Encontrado: %EXCEL_ORIGEN%

echo.
echo [2/4] Copiando Excel al repositorio...
copy /Y "%EXCEL_ORIGEN%" "%REPO%\data\Informe.xlsx" > nul
echo       Copiado correctamente.

echo.
echo [3/4] Convirtiendo Excel a JSON...
cd /d "%REPO%"
node scripts\excel_to_json.js data\Informe.xlsx public\data.json
if %errorlevel% neq 0 (
    echo ERROR en la conversion del Excel.
    pause
    exit /b 1
)

echo.
echo [4/4] Publicando en GitHub Pages...
git add data\Informe.xlsx public\data.json
git commit -m "Informe semanal %CARPETA%"
npm run deploy
if %errorlevel% neq 0 (
    echo ERROR al publicar en GitHub Pages.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   DASHBOARD ACTUALIZADO CORRECTAMENTE
echo   https://rinconrobertoj-oss.github.io/dashboard_V5
echo ============================================
timeout /t 10
