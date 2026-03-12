# Carpeta de datos

Sube aquí el archivo Excel semanal con el nombre exacto:

**`informe.xlsx`**

## Cómo actualizar el dashboard cada viernes

1. Ve a esta carpeta en GitHub:
   `https://github.com/rinconrobertoj-oss/dashboard_V5/tree/main/data`

2. Haz clic en **"Add file"** → **"Upload files"**

3. Arrastra tu archivo Excel y asegúrate de que se llame `informe.xlsx`

4. Haz clic en **"Commit changes"**

GitHub Actions se encarga automáticamente de:
- Convertir el Excel a `data.json`
- Construir el dashboard
- Publicarlo en GitHub Pages (~2 minutos)

Puedes ver el progreso en:
`https://github.com/rinconrobertoj-oss/dashboard_V5/actions`
