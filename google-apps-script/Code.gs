/**
 * ============================================================================
 * SISTEMA DE COEVALUACIÓN DE EXPOSICIONES ADSO — SENA CIMM REGIONAL BOYACÁ
 * Ficha: 3232460 | Instructor: Osman Alonso Aranguren Escobar
 * Backend Serverless en Google Apps Script (Almacenamiento en Google Drive / Sheets)
 * ============================================================================
 *
 * INSTRUCCIONES DE DESPLIEGUE (SOLO INSTRUCTOR):
 * 1. Abra https://script.google.com y cree un "Nuevo proyecto".
 * 2. Pegue todo este código en Código.gs y guarde (Ctrl+S).
 * 3. Haga clic en "Implementar" -> "Nueva implementación" -> Tipo: "Aplicación web".
 * 4. Configure:
 *    - Ejecutar como: "Yo" (su cuenta de Google)
 *    - Quién tiene acceso: "Cualquier persona" (Anyone) -> permite que los aprendices
 *      envíen sus calificaciones sin tener permiso directo para abrir su hoja de Drive.
 * 5. Copie la URL terminada en /exec y colóquela en scriptUrlFija dentro de js/temario-data.js
 *    (o en el panel oculto del Instructor).
 */

const FOLDER_NAME = 'Evaluaciones_Exposiciones_ADSO_3232460';
const SPREADSHEET_NAME = 'Calificaciones_Exposiciones_ADSO_Ficha_3232460';

const SHEET_EVALUACIONES = 'Calificaciones_Aprendices';
const SHEET_DETALLE_ITEMS = 'Detalle_Items';
const SHEET_PLANILLA = 'Consolidado_12_Temas';

const TEMAS_CATALOGO = [
  { num: 1, titulo: 'API REST con Spring Boot (Java)' },
  { num: 2, titulo: 'App móvil con Flutter' },
  { num: 3, titulo: 'API REST con Node.js + Express' },
  { num: 4, titulo: 'Frontend con Angular' },
  { num: 5, titulo: 'Frontend con React' },
  { num: 6, titulo: 'Frontend con Vue.js' },
  { num: 7, titulo: 'Autenticación con JWT y roles (RBAC) en Spring Boot' },
  { num: 8, titulo: 'ORM con Hibernate (Java)' },
  { num: 9, titulo: 'Bases de datos y backends: SQL, BaaS e IA' },
  { num: 10, titulo: 'Docker: dockerizar una API' },
  { num: 11, titulo: 'Microservicios (trabajo en grupo)' },
  { num: 12, titulo: 'Consumir una API de IA (LLM)' }
];

function obtenerOCrearSpreadsheet_() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    ss = null;
  }

  if (!ss) {
    const props = PropertiesService.getScriptProperties();
    const savedId = props.getProperty('SPREADSHEET_ID');
    if (savedId) {
      try {
        ss = SpreadsheetApp.openById(savedId);
      } catch (e) {
        ss = null;
      }
    }
  }

  if (!ss) {
    let folder;
    const folders = DriveApp.getFoldersByName(FOLDER_NAME);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(FOLDER_NAME);
    }

    const files = folder.getFilesByName(SPREADSHEET_NAME);
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create(SPREADSHEET_NAME);
      const file = DriveApp.getFileById(ss.getId());
      file.moveTo(folder);
    }
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  }

  asegurarEstructuraHojas_(ss);
  return ss;
}

function asegurarEstructuraHojas_(ss) {
  // 1. Hoja de calificaciones individuales enviadas por cada aprendiz
  let shEval = ss.getSheetByName(SHEET_EVALUACIONES);
  if (!shEval) {
    shEval = ss.insertSheet(SHEET_EVALUACIONES);
    const headersEval = [
      'ID Evaluación',
      'Fecha y Hora Envío',
      'Fecha Exposición',
      'Ficha ADSO',
      'Aprendiz que Califica',
      'Documento / Correo',
      'N° Tema',
      'Tema de Exposición Evaluado',
      'Categoría / Tecnología',
      'Prom. Investigación (0-100)',
      'Prom. Construcción (0-100)',
      'Prom. Parte Especial (0-100)',
      'Prom. Práctica Compañeros (0-100)',
      'Prom. Entregables (0-100)',
      'Prom. Tiempo y Preguntas (0-100)',
      'Nota Otorgada (0-100)',
      'Juicio Evaluativo (A/D)',
      'Tiempo Registrado',
      'Enlace GitHub',
      'Observaciones al Grupo',
      'Detalle JSON'
    ];
    shEval.getRange(1, 1, 1, headersEval.length).setValues([headersEval]);
    formatearEncabezadoSena_(shEval, headersEval.length);

    const defaultSheet = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
    if (defaultSheet && ss.getSheets().length > 1) {
      ss.deleteSheet(defaultSheet);
    }
  }

  // 2. Hoja granular ítem por ítem
  let shItems = ss.getSheetByName(SHEET_DETALLE_ITEMS);
  if (!shItems) {
    shItems = ss.insertSheet(SHEET_DETALLE_ITEMS);
    const headersItems = [
      'ID Evaluación',
      'Fecha Exposición',
      'Ficha ADSO',
      'Aprendiz que Califica',
      'N° Tema',
      'Tema de Exposición',
      'Sección del Temario',
      'Ítem Evaluado',
      'Puntaje (0-100)',
      'Comentario Ítem'
    ];
    shItems.getRange(1, 1, 1, headersItems.length).setValues([headersItems]);
    formatearEncabezadoSena_(shItems, headersItems.length);
  }

  // 3. Hoja consolidada por Tema (1 al 12) para revisión rápida del Instructor
  let shPlanilla = ss.getSheetByName(SHEET_PLANILLA);
  if (!shPlanilla) {
    shPlanilla = ss.insertSheet(SHEET_PLANILLA);
    const headersPlanilla = [
      '#',
      'Tema de Exposición',
      'Total Calificaciones Recibidas',
      'Nota Promedio del Tema (0-100)',
      'Juicio Consolidado',
      'Última Fecha Evaluada',
      'Aprendices Evaluadores'
    ];
    shPlanilla.getRange(1, 1, 1, headersPlanilla.length).setValues([headersPlanilla]);
    formatearEncabezadoSena_(shPlanilla, headersPlanilla.length);

    const filasIniciales = TEMAS_CATALOGO.map(t => [t.num, t.titulo, 0, '', 'Pendiente', '', '']);
    shPlanilla.getRange(2, 1, filasIniciales.length, headersPlanilla.length).setValues(filasIniciales);
    shPlanilla.autoResizeColumns(1, headersPlanilla.length);
  }
}

function formatearEncabezadoSena_(sheet, numCols) {
  const headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange
    .setBackground('#39A900')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

/**
 * Peticiones GET (Usadas únicamente desde el Modo Instructor).
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'list';
    const ss = obtenerOCrearSpreadsheet_();

    if (action === 'ping') {
      return respuestaJson_({
        ok: true,
        mensaje: 'Conexión exitosa con Google Drive / Google Sheets.',
        spreadsheetName: ss.getName(),
        spreadsheetUrl: ss.getUrl()
      });
    }

    const shEval = ss.getSheetByName(SHEET_EVALUACIONES);
    const lastRow = shEval.getLastRow();
    const evaluaciones = [];

    if (lastRow > 1) {
      const numCols = shEval.getLastColumn();
      const values = shEval.getRange(2, 1, lastRow - 1, Math.max(numCols, 21)).getValues();
      for (let i = 0; i < values.length; i++) {
        const row = values[i];
        if (!row[0]) continue;
        let detalleParsed = null;
        try {
          detalleParsed = row[20] ? JSON.parse(row[20]) : null;
        } catch (err) {
          detalleParsed = null;
        }
        evaluaciones.push({
          id: String(row[0]),
          fechaRegistro: row[1] instanceof Date ? row[1].toISOString() : String(row[1] || ''),
          fechaExposicion: row[2] instanceof Date ? Utilities.formatDate(row[2], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(row[2] || ''),
          ficha: String(row[3] || '3232460'),
          nombreAprendiz: String(row[4] || ''),
          documentoAprendiz: String(row[5] || ''),
          temaId: Number(row[6] || 0),
          temaTitulo: String(row[7] || ''),
          tecnologia: String(row[8] || ''),
          promediosSeccion: {
            investigacion: row[9] !== '' ? Number(row[9]) : null,
            hacer: row[10] !== '' ? Number(row[10]) : null,
            especial: row[11] !== '' ? Number(row[11]) : null,
            lograr: row[12] !== '' ? Number(row[12]) : null,
            entregables: row[13] !== '' ? Number(row[13]) : null,
            tiempoPreguntas: row[14] !== '' ? Number(row[14]) : null
          },
          notaFinal: Number(row[15] || 0),
          juicio: String(row[16] || ''),
          tiempoUsado: String(row[17] || ''),
          githubUrl: String(row[18] || ''),
          observaciones: String(row[19] || ''),
          itemsDetalle: detalleParsed
        });
      }
    }

    evaluaciones.reverse();

    return respuestaJson_({
      ok: true,
      spreadsheetUrl: ss.getUrl(),
      spreadsheetName: ss.getName(),
      total: evaluaciones.length,
      evaluaciones: evaluaciones
    });
  } catch (error) {
    return respuestaJson_({ ok: false, error: error.toString() });
  }
}

/**
 * Peticiones POST (Recibe las calificaciones enviadas por los aprendices).
 * NO expone la URL del Google Sheet en la respuesta por privacidad.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No se recibieron datos en la solicitud POST.');
    }

    const payload = JSON.parse(e.postData.contents);
    const ss = obtenerOCrearSpreadsheet_();
    const shEval = ss.getSheetByName(SHEET_EVALUACIONES);
    const shItems = ss.getSheetByName(SHEET_DETALLE_ITEMS);

    const registros = Array.isArray(payload.registros) ? payload.registros : [payload];
    const idsGuardados = [];

    const idsExistentes = new Set();
    if (shEval.getLastRow() > 1) {
      const colIds = shEval.getRange(2, 1, shEval.getLastRow() - 1, 1).getValues();
      colIds.forEach(r => { if (r[0]) idsExistentes.add(String(r[0])); });
    }

    const filasEval = [];
    const filasItems = [];

    registros.forEach(reg => {
      const evalId = String(reg.id || Utilities.getUuid());
      if (idsExistentes.has(evalId)) {
        idsGuardados.push(evalId);
        return;
      }

      const proms = reg.promediosSeccion || {};
      filasEval.push([
        evalId,
        reg.fechaRegistro || new Date().toISOString(),
        reg.fechaExposicion || '',
        '3232460',
        reg.nombreAprendiz || '',
        reg.documentoAprendiz || '',
        Number(reg.temaId || 0),
        reg.temaTitulo || '',
        reg.tecnologia || '',
        proms.investigacion !== null && proms.investigacion !== undefined ? proms.investigacion : '',
        proms.hacer !== null && proms.hacer !== undefined ? proms.hacer : '',
        proms.especial !== null && proms.especial !== undefined ? proms.especial : '',
        proms.lograr !== null && proms.lograr !== undefined ? proms.lograr : '',
        proms.entregables !== null && proms.entregables !== undefined ? proms.entregables : '',
        proms.tiempoPreguntas !== null && proms.tiempoPreguntas !== undefined ? proms.tiempoPreguntas : '',
        Number(reg.notaFinal || 0),
        reg.juicio || (Number(reg.notaFinal || 0) >= 70 ? 'APROBADO (A)' : 'NO APROBADO (D)'),
        reg.tiempoUsado || '',
        reg.githubUrl || '',
        reg.observaciones || '',
        JSON.stringify(reg.itemsDetalle || [])
      ]);

      if (Array.isArray(reg.itemsDetalle)) {
        reg.itemsDetalle.forEach(item => {
          filasItems.push([
            evalId,
            reg.fechaExposicion || '',
            '3232460',
            reg.nombreAprendiz || '',
            Number(reg.temaId || 0),
            reg.temaTitulo || '',
            item.seccionTitulo || '',
            item.texto || '',
            Number(item.puntaje || 0),
            item.comentario || ''
          ]);
        });
      }

      idsGuardados.push(evalId);
    });

    if (filasEval.length > 0) {
      shEval.getRange(shEval.getLastRow() + 1, 1, filasEval.length, filasEval[0].length).setValues(filasEval);
    }
    if (filasItems.length > 0) {
      shItems.getRange(shItems.getLastRow() + 1, 1, filasItems.length, filasItems[0].length).setValues(filasItems);
    }

    actualizarPlanillaControl_(ss);

    return respuestaJson_({
      ok: true,
      mensaje: 'Calificación registrada exitosamente.',
      idsGuardados: idsGuardados
    });
  } catch (error) {
    return respuestaJson_({ ok: false, error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function actualizarPlanillaControl_(ss) {
  const shEval = ss.getSheetByName(SHEET_EVALUACIONES);
  const shPlanilla = ss.getSheetByName(SHEET_PLANILLA);
  if (!shEval || !shPlanilla) return;

  const porTema = {};
  TEMAS_CATALOGO.forEach(t => {
    porTema[t.num] = { evaluadores: [], fechas: new Set(), notas: [] };
  });

  const lastRow = shEval.getLastRow();
  if (lastRow > 1) {
    const rows = shEval.getRange(2, 1, lastRow - 1, 21).getValues();
    rows.forEach(r => {
      const numTema = Number(r[6]);
      if (!porTema[numTema]) return;
      if (r[4]) porTema[numTema].evaluadores.push(String(r[4]).trim());
      if (r[2]) {
        const fStr = r[2] instanceof Date
          ? Utilities.formatDate(r[2], Session.getScriptTimeZone(), 'yyyy-MM-dd')
          : String(r[2]);
        porTema[numTema].fechas.add(fStr);
      }
      if (r[15] !== '') porTema[numTema].notas.push(Number(r[15]));
    });
  }

  const nuevasFilas = TEMAS_CATALOGO.map(t => {
    const info = porTema[t.num];
    const totalCalif = info.notas.length;
    const prom = totalCalif > 0
      ? Math.round((info.notas.reduce((a, b) => a + b, 0) / totalCalif) * 10) / 10
      : '';
    const juicio = totalCalif > 0 ? (prom >= 70 ? 'APROBADO (A)' : 'NO APROBADO (D)') : 'Pendiente';
    const fechasArr = Array.from(info.fechas);
    return [
      t.num,
      t.titulo,
      totalCalif,
      prom,
      juicio,
      fechasArr.length > 0 ? fechasArr[fechasArr.length - 1] : '',
      Array.from(new Set(info.evaluadores)).join(', ')
    ];
  });

  shPlanilla.getRange(2, 1, nuevasFilas.length, 7).setValues(nuevasFilas);
}

function respuestaJson_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
