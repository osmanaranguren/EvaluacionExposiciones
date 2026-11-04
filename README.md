# Sistema de Evaluación de Exposiciones ADSO — SENA CIMM Regional Boyacá

Aplicación web en **HTML5, JavaScript (ES6+) y Bootstrap 5.3** creada a partir del documento `Banco_Temas_Exposicion_ADSO.pdf` para evaluar las exposiciones del programa **Tecnólogo en Análisis y Desarrollo de Software (ADSO)** bajo la metodología *"Aprender enseñando"*.

## Estructura del Proyecto

- `index.html`: Interfaz principal responsiva (Evaluación, Cronómetro de 4 momentos, Historial, Planilla de Control de los 12 temas y Asistente de conexión a Google Drive).
- `css/styles.css`: Estilos institucionales SENA (`#39A900` / `#00324D`) y formato oficial de impresión/exportación PDF (`@media print`).
- `js/temario-data.js`: Catálogo íntegro de los **12 temas** y sus secciones evaluables extraídas de `Banco_Temas_Exposicion_ADSO.pdf`.
- `js/apps-script-template.js`: Plantilla embebida de Google Apps Script para copiar con 1 clic desde la interfaz.
- `js/app.js`: Motor de calificación SENA (`0 a 100`, Juicio `APROBADO (A)` >= 70 / `NO APROBADO (D)` < 70), evaluación individual o grupal, cronómetro de exposición, respaldo offline y sincronización con Google Drive / Google Sheets.
- `google-apps-script/Code.gs`: Código fuente del Web App de Google Apps Script que crea automáticamente la carpeta `Evaluaciones_Exposiciones_ADSO_SENA` y la hoja `Registro_Evaluaciones_Exposiciones_ADSO` en Google Drive con 3 pestañas (`Evaluaciones_Aprendices`, `Detalle_Items`, `Planilla_Control_12_Temas`).

## Cómo usar la aplicación

1. Abra el archivo `index.html` directamente en cualquier navegador moderno (Chrome, Edge, Firefox) o publíquelo en cualquier hosting estático (como GitHub Pages).
2. En la aplicación, diríjase a la pestaña **"Conectar Google Drive"** y siga los 6 pasos en pantalla (toma menos de 2 minutos) para desplegar `Code.gs` en [script.google.com](https://script.google.com) y pegar la URL `/exec`.
3. Vaya a **"1. Evaluar Exposición"**, ingrese la ficha, el aprendiz (o agregue los integrantes del grupo), elija uno de los 12 temas, califique los ítems y guarde directamente en su Google Drive.

