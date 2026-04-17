# Dashboard UP - Actualizacion Semanal
$ErrorActionPreference = "Stop"

$REPO    = "C:\Users\roberto.rincon\dashboard_V5"
$BASE    = "C:\Users\roberto.rincon\NTT DATA EMEAL\NTTD-ACN Proyecto UP - Documentos"
$CARPETA = Get-Date -Format "MMdd"

# Construir ruta usando comodines para evitar problemas con caracteres especiales
$oficina  = (Get-ChildItem $BASE -Directory | Where-Object { $_.Name -like "01. Oficina*" }).FullName
$INFORMES = (Get-ChildItem $oficina -Directory | Where-Object { $_.Name -like "22.*" }).FullName

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ACTUALIZACION DASHBOARD UP - $CARPETA"     -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Ruta: $INFORMES"

# [1/4] Buscar Excel
Write-Host "`n[1/4] Buscando Excel en carpeta $CARPETA..."
$EXCEL = Join-Path $INFORMES "$CARPETA\Informe.xlsx"

if (-not (Test-Path $EXCEL)) {
    Write-Host "ERROR: No se encontro el archivo en:" -ForegroundColor Red
    Write-Host "  $EXCEL" -ForegroundColor Red
    Read-Host "Pulsa ENTER para salir"
    exit 1
}
Write-Host "      Encontrado: $EXCEL" -ForegroundColor Green

# [2/4] Copiar Excel al repo
Write-Host "`n[2/4] Copiando Excel al repositorio..."
Copy-Item -Path $EXCEL -Destination "$REPO\data\Informe.xlsx" -Force
Write-Host "      Copiado correctamente." -ForegroundColor Green

# [3/4] Convertir a JSON
Write-Host "`n[3/4] Convirtiendo Excel a JSON..."
Set-Location $REPO
node scripts\excel_to_json.js data\Informe.xlsx public\data.json
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR en la conversion del Excel." -ForegroundColor Red
    Read-Host "Pulsa ENTER para salir"
    exit 1
}
Write-Host "      Conversion completada." -ForegroundColor Green

# [4/4] Publicar en GitHub Pages
Write-Host "`n[4/4] Publicando en GitHub Pages..."
git add data\Informe.xlsx public\data.json
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "Informe semanal $CARPETA"
}
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al publicar en GitHub." -ForegroundColor Red
    Read-Host "Pulsa ENTER para salir"
    exit 1
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  DASHBOARD ACTUALIZADO CORRECTAMENTE"        -ForegroundColor Green
Write-Host "  https://rinconrobertoj-oss.github.io/dashboard_V5" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Green

# Notificacion emergente
Add-Type -AssemblyName System.Windows.Forms
$notify = New-Object System.Windows.Forms.NotifyIcon
$notify.Icon = [System.Drawing.SystemIcons]::Information
$notify.Visible = $true
$notify.ShowBalloonTip(10000, "Dashboard UP actualizado", "Informe $CARPETA publicado en GitHub Pages.", [System.Windows.Forms.ToolTipIcon]::Info)
Start-Sleep -Seconds 10
$notify.Dispose()

Read-Host "Pulsa ENTER para cerrar"
