/**
 * Lógica principal — Sistema de Coevaluación de Exposiciones ADSO
 * SENA — CIMM Regional Boyacá · Ficha 3232460
 * Instructor: Osman Alonso Aranguren Escobar
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    SCRIPT_URL: 'adso_eval_script_url_v1',
    SHEET_META: 'adso_eval_sheet_meta_v1',
    LOCAL_RECORDS: 'adso_eval_records_v1',
    REMOTE_CACHE: 'adso_eval_remote_cache_v1',
    INSTRUCTOR_PIN_HASH: 'adso_eval_pin_hash_v1',
    APRENDIZ_NOMBRE: 'adso_eval_aprendiz_nombre_v1',
    APRENDIZ_DOC: 'adso_eval_aprendiz_doc_v1'
  };

  const state = {
    modoInstructor: false,
    temaActual: null,
    // Mapa keyItem ("seccionKey__idx") -> { puntaje: number|null, comentario: string }
    calificaciones: {},
    registrosRemotos: [],
    evaluacionModalActual: null,
    timer: {
      modoMinutos: 60,
      etapas: [],
      etapaIndex: 0,
      segundosRestantesEtapa: 600,
      segundosTotalesUsados: 0,
      corriendo: false,
      intervalId: null,
      silenciado: false
    }
  };

  const dom = {};

  document.addEventListener('DOMContentLoaded', initApp);

  function initApp() {
    cacheDom();
    cargarPreferenciasIniciales();
    poblarSelectoresTemas();
    configurarCronometro(60, true);
    renderizarCodigoAppsScript();
    registrarEventos();
    actualizarEstadoModoInstructorUI();
    refrescarVistasDatos();
    autoSincronizarPendientesAlIniciar();
  }

  async function autoSincronizarPendientesAlIniciar() {
    const scriptUrl = obtenerScriptUrl();
    if (!scriptUrl) return;
    const pendientes = obtenerRegistrosLocales().filter(r => !r.synced);
    if (pendientes.length === 0) return;

    try {
      const resp = await enviarRegistrosAGoogleDrive(scriptUrl, pendientes);
      if (resp && resp.ok) {
        marcarRegistrosSincronizados(pendientes.map(p => p.id));
        actualizarEstadoModoInstructorUI();
        refrescarVistasDatos();
        mostrarAlerta(
          'success',
          `<i class="bi bi-check-circle-fill me-1"></i>¡Listo! Se envió automáticamente ${pendientes.length === 1 ? 'tu calificación pendiente' : `tus ${pendientes.length} calificaciones pendientes`} al registro del instructor.`
        );
      }
    } catch (_) {
      // Se reintentará en el próximo envío o recarga
    }
  }

  function cacheDom() {
    dom.alertContainer = document.getElementById('alertContainer');
    dom.instructorOnlyHeader = document.getElementById('instructorOnlyHeader');
    dom.btnInstructorLock = document.getElementById('btnInstructorLock');
    dom.mainTabsCard = document.getElementById('mainTabsCard');
    dom.navItemConfig = document.getElementById('navItemConfig');
    dom.driveStatusBadge = document.getElementById('driveStatusBadge');
    dom.openSheetLink = document.getElementById('openSheetLink');
    dom.btnSyncPendingHeader = document.getElementById('btnSyncPendingHeader');
    dom.pendingCountHeader = document.getElementById('pendingCountHeader');
    dom.badgeTotalHistorial = document.getElementById('badgeTotalHistorial');

    // Formulario de calificación (Aprendiz)
    dom.formEvaluacion = document.getElementById('formEvaluacion');
    dom.inputFicha = document.getElementById('inputFicha');
    dom.inputFechaExposicion = document.getElementById('inputFechaExposicion');
    dom.inputNombreAprendiz = document.getElementById('inputNombreAprendiz');
    dom.inputDocumentoAprendiz = document.getElementById('inputDocumentoAprendiz');
    dom.selectTema = document.getElementById('selectTema');
    dom.infoTemaCard = document.getElementById('infoTemaCard');
    dom.temaCategoriaBadge = document.getElementById('temaCategoriaBadge');
    dom.temaTecnologiaBadge = document.getElementById('temaTecnologiaBadge');
    dom.temaSesionBadge = document.getElementById('temaSesionBadge');
    dom.temaTiempoBadge = document.getElementById('temaTiempoBadge');
    dom.temaResumenTexto = document.getElementById('temaResumenTexto');

    dom.accionesRapidasItems = document.getElementById('accionesRapidasItems');
    dom.btnLimpiarNotas = document.getElementById('btnLimpiarNotas');
    dom.emptyTemaPlaceholder = document.getElementById('emptyTemaPlaceholder');
    dom.seccionesItemsContainer = document.getElementById('seccionesItemsContainer');

    dom.inputGithubUrl = document.getElementById('inputGithubUrl');
    dom.inputObservaciones = document.getElementById('inputObservaciones');
    dom.btnGuardarEvaluacion = document.getElementById('btnGuardarEvaluacion');
    dom.btnVistaPreviaPdf = document.getElementById('btnVistaPreviaPdf');
    dom.btnReiniciarFormulario = document.getElementById('btnReiniciarFormulario');

    // Resumen en vivo
    dom.progresoItemsBadge = document.getElementById('progresoItemsBadge');
    dom.progresoItemsBar = document.getElementById('progresoItemsBar');
    dom.finalScoreBox = document.getElementById('finalScoreBox');
    dom.finalScoreNumber = document.getElementById('finalScoreNumber');
    dom.finalJuicioBadge = document.getElementById('finalJuicioBadge');
    dom.resumenSeccionesList = document.getElementById('resumenSeccionesList');

    // Cronómetro
    dom.selectModoTiempo = document.getElementById('selectModoTiempo');
    dom.boxTiempoPersonalizado = document.getElementById('boxTiempoPersonalizado');
    dom.inputMinutosCustom = document.getElementById('inputMinutosCustom');
    dom.btnAplicarTiempoCustom = document.getElementById('btnAplicarTiempoCustom');
    dom.btnMuteTimer = document.getElementById('btnMuteTimer');
    dom.iconMuteTimer = document.getElementById('iconMuteTimer');
    dom.timerStageLabel = document.getElementById('timerStageLabel');
    dom.timerCountdownDisplay = document.getElementById('timerCountdownDisplay');
    dom.timerElapsedTotal = document.getElementById('timerElapsedTotal');
    dom.timerTargetTotal = document.getElementById('timerTargetTotal');
    dom.timerStageProgress = document.getElementById('timerStageProgress');
    dom.btnTimerToggle = document.getElementById('btnTimerToggle');
    dom.btnTimerAdd5 = document.getElementById('btnTimerAdd5');
    dom.btnTimerNext = document.getElementById('btnTimerNext');
    dom.btnTimerReset = document.getElementById('btnTimerReset');
    dom.timerStagesContainer = document.getElementById('timerStagesContainer');

    // Historial y Consolidado (Modo Instructor)
    dom.btnRefrescarDrive = document.getElementById('btnRefrescarDrive');
    dom.btnSincronizarPendientes = document.getElementById('btnSincronizarPendientes');
    dom.btnExportarCsv = document.getElementById('btnExportarCsv');
    dom.kpiTotalEvaluados = document.getElementById('kpiTotalEvaluados');
    dom.kpiTotalAprobados = document.getElementById('kpiTotalAprobados');
    dom.kpiTotalDeficientes = document.getElementById('kpiTotalDeficientes');
    dom.kpiPromedioGeneral = document.getElementById('kpiPromedioGeneral');
    dom.filtroTexto = document.getElementById('filtroTexto');
    dom.filtroTema = document.getElementById('filtroTema');
    dom.filtroJuicio = document.getElementById('filtroJuicio');
    dom.btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
    dom.tablaHistorialBody = document.getElementById('tablaHistorialBody');
    dom.tablaPlanillaBody = document.getElementById('tablaPlanillaBody');
    dom.btnImprimirPlanilla = document.getElementById('btnImprimirPlanilla');

    // Configuración Google Drive y Clave Instructor
    dom.inputScriptUrl = document.getElementById('inputScriptUrl');
    dom.btnGuardarProbarUrl = document.getElementById('btnGuardarProbarUrl');
    dom.btnDesconectarUrl = document.getElementById('btnDesconectarUrl');
    dom.testConnectionResult = document.getElementById('testConnectionResult');
    dom.btnCopiarCodigoGs = document.getElementById('btnCopiarCodigoGs');
    dom.codeGsViewer = document.getElementById('codeGsViewer');
    dom.inputNuevoPin = document.getElementById('inputNuevoPin');
    dom.btnGuardarNuevoPin = document.getElementById('btnGuardarNuevoPin');
    dom.pinChangeResult = document.getElementById('pinChangeResult');

    // Modales y área de impresión
    dom.modalInstructorEl = document.getElementById('modalAccesoInstructor');
    dom.formAccesoInstructor = document.getElementById('formAccesoInstructor');
    dom.inputPinInstructor = document.getElementById('inputPinInstructor');
    dom.errorPinInstructor = document.getElementById('errorPinInstructor');

    dom.modalDetalleEl = document.getElementById('modalDetalleEvaluacion');
    dom.modalDetalleTitulo = document.getElementById('modalDetalleTitulo');
    dom.modalDetalleBody = document.getElementById('modalDetalleBody');
    dom.btnModalImprimirActa = document.getElementById('btnModalImprimirActa');
    dom.printReportArea = document.getElementById('printReportArea');
  }

  function cargarPreferenciasIniciales() {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    dom.inputFechaExposicion.value = `${yyyy}-${mm}-${dd}`;

    // Ficha ADSO fija y bloqueada (3232460)
    const fichaFija = window.ADSO_CONFIG.fichaDefault || '3232460';
    dom.inputFicha.value = fichaFija;
    dom.inputFicha.readOnly = true;

    // Recordar en este equipo el nombre del aprendiz para facilitar evaluar varias exposiciones seguidas
    dom.inputNombreAprendiz.value = localStorage.getItem(STORAGE_KEYS.APRENDIZ_NOMBRE) || '';
    dom.inputDocumentoAprendiz.value = localStorage.getItem(STORAGE_KEYS.APRENDIZ_DOC) || '';

    dom.inputScriptUrl.value = obtenerScriptUrl();
  }

  function poblarSelectoresTemas() {
    window.TEMARIO_ADSO.forEach(tema => {
      const opt1 = document.createElement('option');
      opt1.value = String(tema.id);
      opt1.textContent = `TEMA ${tema.id} — ${tema.titulo} (${tema.categoria})`;
      dom.selectTema.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = String(tema.id);
      opt2.textContent = `Tema ${tema.id}: ${tema.titulo}`;
      dom.filtroTema.appendChild(opt2);
    });

    // Poblar lista desplegable con los 21 aprendices de la Ficha 3232460
    const datalist = document.getElementById('datalistAprendicesFicha');
    if (datalist && Array.isArray(window.ADSO_CONFIG.aprendicesFicha)) {
      datalist.innerHTML = window.ADSO_CONFIG.aprendicesFicha
        .map(nombre => `<option value="${escaparAttr(nombre)}"></option>`)
        .join('');
    }
  }

  function normalizarClaveAprendiz(nombre) {
    const limpio = String(nombre ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();
    if (!limpio) return '';
    const tokens = limpio.split(/\s+/);
    // Primeras 3 palabras unifican ej. "Juan Jose Taita" y "Juan Jose Taita Avellaneda" sin colisionar entre los 21 aprendices
    return tokens.slice(0, 3).join(' ');
  }

  function obtenerNombreOficialAprendiz(nombre) {
    const clave = normalizarClaveAprendiz(nombre);
    const lista = window.ADSO_CONFIG.aprendicesFicha || [];
    const encontrado = lista.find(oficial => normalizarClaveAprendiz(oficial) === clave);
    return encontrado || String(nombre ?? '').trim();
  }

  function renderizarCodigoAppsScript() {
    if (window.GOOGLE_APPS_SCRIPT_CODE) {
      dom.codeGsViewer.textContent = window.GOOGLE_APPS_SCRIPT_CODE;
    }
  }

  // =========================================================================
  // SELECCIÓN DE TEMA Y RENDERIZADO DE ÍTEMS DEL TEMARIO
  // =========================================================================
  function seleccionarTema(temaIdStr) {
    const id = Number(temaIdStr);
    const tema = window.TEMARIO_ADSO.find(t => t.id === id) || null;
    state.temaActual = tema;
    state.calificaciones = {};

    if (!tema) {
      dom.infoTemaCard.classList.add('d-none');
      dom.accionesRapidasItems.classList.add('d-none');
      dom.emptyTemaPlaceholder.classList.remove('d-none');
      dom.seccionesItemsContainer.innerHTML = '';
      recalcularResumenEnVivo();
      return;
    }

    dom.infoTemaCard.classList.remove('d-none');
    dom.temaCategoriaBadge.textContent = `${tema.grupoTecnologia} · ${tema.categoria}`;
    dom.temaTecnologiaBadge.textContent = tema.tecnologia;
    dom.temaSesionBadge.textContent = tema.sesion;
    dom.temaTiempoBadge.innerHTML = `<i class="bi bi-clock me-1"></i>Tiempo máx: ${tema.tiempoMinutos} min`;
    dom.temaResumenTexto.textContent = tema.resumen;

    dom.accionesRapidasItems.classList.remove('d-none');
    dom.emptyTemaPlaceholder.classList.add('d-none');

    if (!state.timer.corriendo && state.timer.segundosTotalesUsados === 0) {
      configurarCronometro(tema.tiempoMinutos, true);
    }

    tema.secciones.forEach(sec => {
      sec.items.forEach((_, idx) => {
        const itemKey = `${sec.key}__${idx}`;
        state.calificaciones[itemKey] = { puntaje: null, comentario: '' };
      });
    });

    renderizarSeccionesTema(tema);
    recalcularResumenEnVivo();
  }

  function renderizarSeccionesTema(tema) {
    dom.seccionesItemsContainer.innerHTML = '';

    tema.secciones.forEach(sec => {
      const card = document.createElement('div');
      card.className = `card card-sena mb-4 ${sec.esEspecial ? 'card-especial' : ''}`;

      const itemsHtml = sec.items
        .map((textoItem, idx) => {
          const itemKey = `${sec.key}__${idx}`;
          return `
            <div class="eval-item-row ungraded" id="row_${itemKey}">
              <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                <div class="fw-semibold small text-dark flex-grow-1">
                  ${escaparHtml(textoItem)}
                </div>
                <button
                  type="button"
                  class="btn btn-sm btn-light border py-0 px-2 btn-toggle-item-comment"
                  data-item-key="${itemKey}"
                  title="Agregar comentario a este ítem"
                >
                  <i class="bi bi-chat-left-text"></i>
                </button>
              </div>

              <div class="row g-2 align-items-center">
                <div class="col-xl-5 d-flex flex-wrap gap-1">
                  <button type="button" class="btn btn-outline-success score-preset-btn" data-item-key="${itemKey}" data-preset="100">100 Exc.</button>
                  <button type="button" class="btn btn-outline-success score-preset-btn" data-item-key="${itemKey}" data-preset="85">85 Bien</button>
                  <button type="button" class="btn btn-outline-primary score-preset-btn" data-item-key="${itemKey}" data-preset="70">70 Aprueba</button>
                  <button type="button" class="btn btn-outline-warning text-dark score-preset-btn" data-item-key="${itemKey}" data-preset="50">50 Regular</button>
                  <button type="button" class="btn btn-outline-danger score-preset-btn" data-item-key="${itemKey}" data-preset="0">0 No</button>
                </div>

                <div class="col-xl-5 col-8">
                  <input
                    type="range"
                    class="form-range sena-range item-score-range"
                    min="0"
                    max="100"
                    step="1"
                    value="0"
                    data-item-key="${itemKey}"
                    id="range_${itemKey}"
                  />
                </div>

                <div class="col-xl-2 col-4 d-flex justify-content-end">
                  <input
                    type="number"
                    class="form-control form-control-sm score-input-num item-score-number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="—"
                    data-item-key="${itemKey}"
                    id="num_${itemKey}"
                  />
                </div>
              </div>

              <div class="mt-2 d-none" id="comment_box_${itemKey}">
                <input
                  type="text"
                  class="form-control form-control-sm item-comment-input"
                  data-item-key="${itemKey}"
                  placeholder="Comentario opcional sobre este ítem..."
                />
              </div>
            </div>
          `;
        })
        .join('');

      card.innerHTML = `
        <div class="card-header card-sena-header py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <i class="bi ${sec.icono} me-2 ${sec.esEspecial ? 'text-warning' : 'text-success'}"></i>
            <span>${escaparHtml(sec.titulo)}</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-secondary" id="sec_avg_${sec.key}">Promedio: —</span>
            <div class="dropdown">
              <button class="btn btn-sm btn-light border dropdown-toggle py-0 px-2" type="button" data-bs-toggle="dropdown">
                Sección rápida
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm small">
                <li><button class="dropdown-item btn-fill-section" type="button" data-sec-key="${sec.key}" data-score="100">Asignar 100 a esta sección</button></li>
                <li><button class="dropdown-item btn-fill-section" type="button" data-sec-key="${sec.key}" data-score="85">Asignar 85 a esta sección</button></li>
                <li><button class="dropdown-item btn-fill-section" type="button" data-sec-key="${sec.key}" data-score="70">Asignar 70 a esta sección</button></li>
                <li><button class="dropdown-item btn-fill-section" type="button" data-sec-key="${sec.key}" data-score="50">Asignar 50 a esta sección</button></li>
                <li><button class="dropdown-item btn-fill-section" type="button" data-sec-key="${sec.key}" data-score="0">Asignar 0 a esta sección</button></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="card-body p-3 p-md-4">
          ${itemsHtml}
        </div>
      `;

      dom.seccionesItemsContainer.appendChild(card);
    });
  }

  function actualizarPuntajeItem(itemKey, rawVal) {
    if (!state.calificaciones[itemKey]) return;

    let puntaje = null;
    if (rawVal !== '' && rawVal !== null && rawVal !== undefined && !Number.isNaN(Number(rawVal))) {
      puntaje = Math.max(0, Math.min(100, Math.round(Number(rawVal))));
    }

    state.calificaciones[itemKey].puntaje = puntaje;

    const numInput = document.getElementById(`num_${itemKey}`);
    const rangeInput = document.getElementById(`range_${itemKey}`);
    const rowEl = document.getElementById(`row_${itemKey}`);

    if (numInput && document.activeElement !== numInput) {
      numInput.value = puntaje !== null ? String(puntaje) : '';
    } else if (numInput && puntaje !== null && Number(numInput.value) !== puntaje) {
      numInput.value = String(puntaje);
    }

    if (rangeInput) {
      rangeInput.value = puntaje !== null ? String(puntaje) : '0';
    }

    if (rowEl) {
      rowEl.classList.remove('ungraded', 'graded-aprobado', 'graded-deficiente');
      if (puntaje === null) {
        rowEl.classList.add('ungraded');
      } else if (puntaje >= 70) {
        rowEl.classList.add('graded-aprobado');
      } else {
        rowEl.classList.add('graded-deficiente');
      }
    }

    recalcularResumenEnVivo();
  }

  function calcularMetricasActuales() {
    if (!state.temaActual) {
      return {
        totalItems: 0,
        calificados: 0,
        notaFinal: null,
        juicio: 'SIN CALIFICAR',
        promediosSeccion: {},
        listaSecciones: []
      };
    }

    let totalItems = 0;
    let calificados = 0;
    let sumaGlobal = 0;
    const promediosSeccion = {};
    const listaSecciones = [];

    state.temaActual.secciones.forEach(sec => {
      let sumaSec = 0;
      let countSec = 0;

      sec.items.forEach((_, idx) => {
        totalItems++;
        const itemKey = `${sec.key}__${idx}`;
        const val = state.calificaciones[itemKey]?.puntaje;
        if (val !== null && val !== undefined) {
          calificados++;
          sumaGlobal += val;
          sumaSec += val;
          countSec++;
        }
      });

      const promSec = countSec > 0 ? Math.round((sumaSec / countSec) * 10) / 10 : null;
      promediosSeccion[sec.key] = promSec;
      listaSecciones.push({
        key: sec.key,
        titulo: sec.titulo,
        promedio: promSec,
        calificados: countSec,
        total: sec.items.length
      });
    });

    const notaFinal = calificados > 0 ? Math.round((sumaGlobal / calificados) * 10) / 10 : null;
    let juicio = 'SIN CALIFICAR';
    if (notaFinal !== null) {
      juicio =
        notaFinal >= window.ADSO_CONFIG.notaMinimaAprobatoria
          ? 'APROBADO (A)'
          : 'NO APROBADO (D)';
    }

    return {
      totalItems,
      calificados,
      notaFinal,
      juicio,
      promediosSeccion,
      listaSecciones
    };
  }

  function recalcularResumenEnVivo() {
    const m = calcularMetricasActuales();

    dom.progresoItemsBadge.textContent = `${m.calificados} / ${m.totalItems} ítems`;
    const pct = m.totalItems > 0 ? Math.round((m.calificados / m.totalItems) * 100) : 0;
    dom.progresoItemsBar.style.width = `${pct}%`;

    m.listaSecciones.forEach(secInfo => {
      const badgeEl = document.getElementById(`sec_avg_${secInfo.key}`);
      if (!badgeEl) return;
      if (secInfo.promedio === null) {
        badgeEl.className = 'badge bg-secondary';
        badgeEl.textContent = 'Promedio: —';
      } else {
        badgeEl.className = secInfo.promedio >= 70 ? 'badge bg-success' : 'badge bg-danger';
        badgeEl.textContent = `Promedio: ${secInfo.promedio} pts`;
      }
    });

    dom.finalScoreBox.classList.remove('pendiente', 'aprobado', 'deficiente');
    if (m.notaFinal === null) {
      dom.finalScoreBox.classList.add('pendiente');
      dom.finalScoreNumber.textContent = '—';
      dom.finalJuicioBadge.className = 'badge bg-secondary fs-6 px-3 py-1';
      dom.finalJuicioBadge.textContent = 'SIN CALIFICAR';
    } else if (m.notaFinal >= 70) {
      dom.finalScoreBox.classList.add('aprobado');
      dom.finalScoreNumber.textContent = m.notaFinal.toFixed(1);
      dom.finalJuicioBadge.className = 'badge bg-success fs-6 px-3 py-1';
      dom.finalJuicioBadge.textContent = 'APROBADO (A)';
    } else {
      dom.finalScoreBox.classList.add('deficiente');
      dom.finalScoreNumber.textContent = m.notaFinal.toFixed(1);
      dom.finalJuicioBadge.className = 'badge bg-danger fs-6 px-3 py-1';
      dom.finalJuicioBadge.textContent = 'NO APROBADO (D)';
    }

    if (!state.temaActual) {
      dom.resumenSeccionesList.innerHTML =
        '<li class="list-group-item px-0 text-muted fst-italic">Seleccione un tema para ver el desglose.</li>';
      return;
    }

    dom.resumenSeccionesList.innerHTML = m.listaSecciones
      .map(s => {
        const badgeCls =
          s.promedio === null
            ? 'bg-secondary'
            : s.promedio >= 70
            ? 'bg-success'
            : 'bg-danger';
        const valTxt = s.promedio === null ? '—' : `${s.promedio}`;
        return `
          <li class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center gap-2">
            <span class="text-truncate" title="${escaparAttr(s.titulo)}">${escaparHtml(acortarTituloSeccion(s.titulo))}</span>
            <span class="badge ${badgeCls}">${valTxt}</span>
          </li>
        `;
      })
      .join('');
  }

  function acortarTituloSeccion(titulo) {
    if (titulo.includes('investigar')) return '1. Investigación previa';
    if (titulo.includes('construir y mostrar')) return '2. Construcción paso a paso';
    if (titulo.includes('Parte especial')) return '★ Parte especial (APK + Web)';
    if (titulo.includes('compañeros hagan')) return '3. Práctica compañeros';
    if (titulo.includes('Entregables')) return '4. Entregables exposición';
    if (titulo.includes('Manejo del tiempo')) return '5. Tiempo y preguntas';
    return titulo;
  }

  // =========================================================================
  // CRONÓMETRO DE LOS 4 MOMENTOS DE LA EXPOSICIÓN (Pág. 14 PDF)
  // =========================================================================
  function generarEtapasProporcionales(totalMin) {
    const mIntro = Math.max(2, Math.round(totalMin * 0.16));
    const mDemo = Math.max(4, Math.round(totalMin * 0.42));
    const mPractica = Math.max(3, Math.round(totalMin * 0.34));
    const mPreguntas = Math.max(1, totalMin - (mIntro + mDemo + mPractica));
    return [
      { key: 'intro', nombre: 'Introducción al tema', minutos: mIntro, descripcion: 'Qué es la tecnología y qué problema resuelve' },
      { key: 'demo', nombre: 'Demostración en vivo', minutos: mDemo, descripcion: 'Construcción y app funcionando en vivo' },
      { key: 'practica', nombre: '"Ahora háganlo ustedes"', minutos: mPractica, descripcion: 'Guiar a los compañeros a reproducir el ejercicio' },
      { key: 'preguntas', nombre: 'Preguntas', minutos: mPreguntas, descripcion: 'Dudas del grupo y del instructor' }
    ];
  }

  function configurarCronometro(minutosTotales, actualizarSelect) {
    pausarCronometro();
    const modo = Math.max(10, Math.min(240, Math.round(Number(minutosTotales) || 60)));
    state.timer.modoMinutos = modo;

    const perfiles = window.ADSO_CONFIG.perfilesTiempo || {};
    const esPreset = Boolean(perfiles[modo]);

    if (actualizarSelect && dom.selectModoTiempo) {
      dom.selectModoTiempo.value = esPreset ? String(modo) : 'custom';
      if (dom.boxTiempoPersonalizado) {
        dom.boxTiempoPersonalizado.classList.toggle('d-none', esPreset);
      }
      if (dom.inputMinutosCustom) {
        dom.inputMinutosCustom.value = String(modo);
      }
    }

    const fuente = esPreset ? perfiles[modo] : generarEtapasProporcionales(modo);
    state.timer.etapas = fuente.map(et => ({
      ...et,
      segundosTotales: et.minutos * 60
    }));
    state.timer.etapaIndex = 0;
    state.timer.segundosRestantesEtapa = state.timer.etapas[0].segundosTotales;
    state.timer.segundosTotalesUsados = 0;

    dom.timerTargetTotal.textContent = `${String(modo).padStart(2, '0')}:00`;
    renderizarEtapasCronometro();
    actualizarVistaCronometro();
  }

  function agregarCincoMinutosEtapaActual() {
    const etapa = state.timer.etapas[state.timer.etapaIndex];
    if (!etapa) return;
    etapa.minutos += 5;
    etapa.segundosTotales += 300;
    state.timer.segundosRestantesEtapa += 300;
    state.timer.modoMinutos += 5;
    dom.timerTargetTotal.textContent = `${String(state.timer.modoMinutos).padStart(2, '0')}:00`;
    renderizarEtapasCronometro();
    actualizarVistaCronometro();
  }

  function renderizarEtapasCronometro() {
    dom.timerStagesContainer.innerHTML = state.timer.etapas
      .map((et, idx) => {
        let cls = 'stage-btn';
        if (idx === state.timer.etapaIndex) cls += ' active';
        else if (idx < state.timer.etapaIndex) cls += ' completed';

        return `
          <button type="button" class="${cls} d-flex justify-content-between align-items-center" data-stage-idx="${idx}">
            <span class="text-truncate me-2"><strong>${idx + 1}.</strong> ${escaparHtml(et.nombre)}</span>
            <span class="badge ${idx === state.timer.etapaIndex ? 'bg-light text-dark' : 'bg-secondary'}">${et.minutos} min</span>
          </button>
        `;
      })
      .join('');
  }

  function actualizarVistaCronometro() {
    const etapaActual = state.timer.etapas[state.timer.etapaIndex];
    if (!etapaActual) return;

    dom.timerStageLabel.textContent = `${state.timer.etapaIndex + 1}. ${etapaActual.nombre}`;
    dom.timerCountdownDisplay.textContent = formatearSegundos(state.timer.segundosRestantesEtapa);
    dom.timerElapsedTotal.textContent = formatearSegundos(state.timer.segundosTotalesUsados);

    dom.timerCountdownDisplay.classList.remove('text-dark', 'text-warning', 'text-danger');
    if (state.timer.segundosRestantesEtapa < 0) {
      dom.timerCountdownDisplay.classList.add('text-danger');
    } else if (state.timer.segundosRestantesEtapa <= 60) {
      dom.timerCountdownDisplay.classList.add('text-warning');
    } else {
      dom.timerCountdownDisplay.classList.add('text-dark');
    }

    const pctRestante = Math.max(
      0,
      Math.min(100, Math.round((state.timer.segundosRestantesEtapa / etapaActual.segundosTotales) * 100))
    );
    dom.timerStageProgress.style.width = `${pctRestante}%`;
    dom.timerStageProgress.className = `progress-bar ${
      state.timer.segundosRestantesEtapa < 0
        ? 'bg-danger'
        : state.timer.segundosRestantesEtapa <= 60
        ? 'bg-warning'
        : 'bg-primary'
    }`;

    dom.btnTimerToggle.innerHTML = state.timer.corriendo
      ? '<i class="bi bi-pause-fill me-1"></i>Pausar'
      : '<i class="bi bi-play-fill me-1"></i>Iniciar';
  }

  function alternarCronometro() {
    if (state.timer.corriendo) {
      pausarCronometro();
    } else {
      state.timer.corriendo = true;
      state.timer.intervalId = setInterval(() => {
        state.timer.segundosRestantesEtapa -= 1;
        state.timer.segundosTotalesUsados += 1;
        if (state.timer.segundosRestantesEtapa === 0) {
          emitirSonidoEtapa();
        }
        actualizarVistaCronometro();
      }, 1000);
      actualizarVistaCronometro();
    }
  }

  function pausarCronometro() {
    state.timer.corriendo = false;
    if (state.timer.intervalId) {
      clearInterval(state.timer.intervalId);
      state.timer.intervalId = null;
    }
    if (dom.btnTimerToggle) {
      actualizarVistaCronometro();
    }
  }

  function cambiarEtapaCronometro(nuevoIdx) {
    if (nuevoIdx < 0 || nuevoIdx >= state.timer.etapas.length) return;
    state.timer.etapaIndex = nuevoIdx;
    state.timer.segundosRestantesEtapa = state.timer.etapas[nuevoIdx].segundosTotales;
    renderizarEtapasCronometro();
    actualizarVistaCronometro();
  }

  function emitirSonidoEtapa() {
    if (state.timer.silenciado) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (_) {
      // Ignorar bloqueo de audio del navegador
    }
  }

  // =========================================================================
  // ENVÍO DE CALIFICACIÓN DEL APRENDIZ A GOOGLE SHEETS
  // =========================================================================
  async function manejarEnvioFormulario(ev) {
    ev.preventDefault();
    pausarCronometro();

    const nombreAprendiz = dom.inputNombreAprendiz.value.trim();
    const documentoAprendiz = dom.inputDocumentoAprendiz.value.trim();

    if (!nombreAprendiz) {
      mostrarAlerta('warning', 'Por favor ingrese su nombre completo (Aprendiz que califica).');
      dom.inputNombreAprendiz.focus();
      return;
    }

    if (!state.temaActual) {
      mostrarAlerta('warning', 'Por favor seleccione el Tema de Exposición (1 al 12) que va a calificar.');
      dom.selectTema.focus();
      return;
    }

    const metricas = calcularMetricasActuales();
    if (metricas.calificados === 0) {
      mostrarAlerta('warning', 'Califique los ítems del temario (escala de 0 a 100) antes de enviar.');
      return;
    }

    if (metricas.calificados < metricas.totalItems) {
      const faltantes = metricas.totalItems - metricas.calificados;
      const confirmarIncompleto = window.confirm(
        `Aún faltan ${faltantes} ítem(s) sin calificar en este tema.\n\n¿Desea enviar la calificación únicamente con los ${metricas.calificados} ítems calificados?`
      );
      if (!confirmarIncompleto) return;
    }

    // Evitar doble envío del mismo tema por el mismo aprendiz (1 única calificación por aprendiz y tema)
    const claveEvaluador = normalizarClaveAprendiz(nombreAprendiz);
    const nombreEstandarizado = obtenerNombreOficialAprendiz(nombreAprendiz);
    const todosExistentes = obtenerTodosLosRegistrosUnificados();
    const yaCalificoEsteTema = todosExistentes.some(
      r =>
        Number(r.temaId) === state.temaActual.id &&
        normalizarClaveAprendiz(r.nombreAprendiz) === claveEvaluador
    );
    if (yaCalificoEsteTema) {
      mostrarAlerta(
        'warning',
        `<strong>${escaparHtml(nombreEstandarizado)}</strong>: ya registraste tu calificación para el <strong>Tema ${state.temaActual.id} (${escaparHtml(state.temaActual.titulo)})</strong>. Solo se permite 1 calificación por aprendiz en cada tema.`
      );
      return;
    }

    // Recordar nombre y documento del aprendiz en su navegador para las siguientes exposiciones
    localStorage.setItem(STORAGE_KEYS.APRENDIZ_NOMBRE, nombreEstandarizado);
    localStorage.setItem(STORAGE_KEYS.APRENDIZ_DOC, documentoAprendiz);

    const ficha = window.ADSO_CONFIG.fichaDefault || '3232460';
    const itemsDetalle = [];
    state.temaActual.secciones.forEach(sec => {
      sec.items.forEach((texto, idx) => {
        const key = `${sec.key}__${idx}`;
        const regItem = state.calificaciones[key] || { puntaje: null, comentario: '' };
        if (regItem.puntaje !== null) {
          itemsDetalle.push({
            seccionKey: sec.key,
            seccionTitulo: sec.titulo,
            texto: texto,
            puntaje: regItem.puntaje,
            comentario: (regItem.comentario || '').trim()
          });
        }
      });
    });

    const tiempoUsado =
      state.timer.segundosTotalesUsados > 0
        ? `${formatearSegundos(state.timer.segundosTotalesUsados)} / ${state.timer.modoMinutos}:00`
        : `Estándar (${state.timer.modoMinutos} min)`;

    const idDeterministico = `EVAL-T${state.temaActual.id}-${claveEvaluador.replace(/\s+/g, '_')}`;

    const registro = {
      id: idDeterministico,
      grupoId: `TEMA-${state.temaActual.id}`,
      fechaRegistro: new Date().toISOString(),
      fechaExposicion: dom.inputFechaExposicion.value,
      ficha: ficha,
      modalidadRegistro: 'Coevaluación Aprendiz',
      nombreAprendiz: nombreEstandarizado,
      documentoAprendiz: documentoAprendiz,
      integrantesGrupo: nombreEstandarizado,
      temaId: state.temaActual.id,
      temaTitulo: state.temaActual.titulo,
      tecnologia: `${state.temaActual.categoria} · ${state.temaActual.tecnologia}`,
      promediosSeccion: {
        investigacion: metricas.promediosSeccion.investigacion ?? null,
        hacer: metricas.promediosSeccion.hacer ?? null,
        especial: metricas.promediosSeccion.especial ?? null,
        lograr: metricas.promediosSeccion.lograr ?? null,
        entregables: metricas.promediosSeccion.entregables ?? null,
        tiempoPreguntas: metricas.promediosSeccion.tiempoPreguntas ?? null
      },
      notaFinal: metricas.notaFinal,
      juicio: metricas.juicio,
      tiempoUsado: tiempoUsado,
      githubUrl: dom.inputGithubUrl.value.trim(),
      extraUrl: '',
      instructor: window.ADSO_CONFIG.instructorDefault,
      observaciones: dom.inputObservaciones.value.trim(),
      itemsDetalle: itemsDetalle,
      synced: false
    };

    // Guardar en respaldo local
    guardarRegistrosLocales([registro]);

    const scriptUrl = obtenerScriptUrl();
    if (!scriptUrl) {
      refrescarVistasDatos();
      actualizarEstadoModoInstructorUI();
      if (state.modoInstructor) {
        mostrarAlerta(
          'warning',
          'Calificación guardada localmente. Pegue la URL `/exec` en la pestaña "Conectar Google Drive" (y en `scriptUrlFija` de `js/temario-data.js`) para recibir las notas de los aprendices en Google Sheets.'
        );
      } else {
        mostrarAlerta(
          'warning',
          'El enlace de envío aún no ha sido activado por el instructor. Por favor infórmele al instructor antes de cerrar esta pestaña.'
        );
      }
      return;
    }

    bloquearBotonGuardar(true);
    try {
      const respuesta = await enviarRegistrosAGoogleDrive(scriptUrl, [registro]);
      if (respuesta && respuesta.ok) {
        marcarRegistrosSincronizados([registro.id]);
        if (respuesta.spreadsheetUrl && state.modoInstructor) {
          guardarMetaSheet({
            url: respuesta.spreadsheetUrl,
            name: respuesta.spreadsheetName || 'Calificaciones_Exposiciones_ADSO_Ficha_3232460'
          });
        }
        actualizarEstadoModoInstructorUI();
        refrescarVistasDatos();
        mostrarAlerta(
          'success',
          `<i class="bi bi-check-circle-fill me-1"></i>¡Gracias, <strong>${escaparHtml(nombreAprendiz)}</strong>! Tu calificación para el <strong>Tema ${registro.temaId} (${escaparHtml(registro.temaTitulo)})</strong> fue enviada correctamente. Nota otorgada: <strong>${metricas.notaFinal.toFixed(1)} / 100</strong>.`
        );
        limpiarTemaYNotasTrasEnvio();
      } else {
        throw new Error((respuesta && respuesta.error) || 'Error en el servidor.');
      }
    } catch (err) {
      refrescarVistasDatos();
      actualizarEstadoModoInstructorUI();
      mostrarAlerta(
        'danger',
        `Hubo un inconveniente de red al enviar la calificación (${escaparHtml(err.message)}). Tu evaluación quedó respaldada en este navegador; intenta nuevamente en unos segundos.`
      );
    } finally {
      bloquearBotonGuardar(false);
    }
  }

  async function enviarRegistrosAGoogleDrive(scriptUrl, registros) {
    const bodyStr = JSON.stringify({ registros: registros });
    try {
      const resp = await fetch(scriptUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: bodyStr
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      return await resp.json();
    } catch (err) {
      // Fallback no-cors: el navegador envía el POST completo a Google Apps Script aunque bloquee la lectura de cabeceras CORS
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: bodyStr
      });
      return {
        ok: true,
        modoNoCors: true,
        mensaje: 'Calificación enviada (modo compatible CORS).'
      };
    }
  }

  function limpiarTemaYNotasTrasEnvio() {
    dom.selectTema.value = '';
    seleccionarTema('');
    dom.inputGithubUrl.value = '';
    dom.inputObservaciones.value = '';
    configurarCronometro(60, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // MODO INSTRUCTOR (CANDADO + PIN + CONSULTA DESDE GOOGLE SHEETS)
  // =========================================================================
  function hashPin(str) {
    const s = String(str ?? '').trim();
    let h = 7;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) % 1000000007;
    }
    return String(h);
  }

  function obtenerHashPinActual() {
    return (
      localStorage.getItem(STORAGE_KEYS.INSTRUCTOR_PIN_HASH) ||
      window.ADSO_CONFIG.instructorPinHashDefault ||
      '396662581'
    );
  }

  function manejarClicCandadoInstructor() {
    if (state.modoInstructor) {
      state.modoInstructor = false;
      actualizarEstadoModoInstructorUI();
      return;
    }
    dom.inputPinInstructor.value = '';
    dom.errorPinInstructor.classList.add('d-none');
    const modal = bootstrap.Modal.getOrCreateInstance(dom.modalInstructorEl);
    modal.show();
    setTimeout(() => dom.inputPinInstructor.focus(), 250);
  }

  async function manejarSubmitPinInstructor(ev) {
    ev.preventDefault();
    const ingresado = dom.inputPinInstructor.value.trim();
    if (hashPin(ingresado) === obtenerHashPinActual()) {
      state.modoInstructor = true;
      dom.errorPinInstructor.classList.add('d-none');
      const modal = bootstrap.Modal.getInstance(dom.modalInstructorEl);
      if (modal) modal.hide();
      actualizarEstadoModoInstructorUI();
      if (obtenerScriptUrl()) {
        await consultarEvaluacionesDrive(false);
      }
    } else {
      dom.errorPinInstructor.classList.remove('d-none');
      dom.inputPinInstructor.select();
    }
  }

  function guardarNuevaClaveInstructor() {
    const nuevo = (dom.inputNuevoPin.value || '').trim();
    if (nuevo.length < 4) {
      dom.pinChangeResult.innerHTML =
        '<span class="text-danger">Ingrese al menos 4 caracteres para la nueva clave.</span>';
      return;
    }
    localStorage.setItem(STORAGE_KEYS.INSTRUCTOR_PIN_HASH, hashPin(nuevo));
    dom.inputNuevoPin.value = '';
    dom.pinChangeResult.innerHTML =
      '<span class="text-success fw-semibold"><i class="bi bi-check-circle-fill me-1"></i>Clave actualizada correctamente en este navegador.</span>';
  }

  function actualizarEstadoModoInstructorUI() {
    const url = obtenerScriptUrl();
    const meta = obtenerMetaSheet();
    const pendientes = obtenerRegistrosLocales().filter(r => !r.synced).length;

    // VISTA APRENDIZ (Bloqueado por defecto): oculta Pestañas, Conectar Google Drive y Abrir Sheet
    if (!state.modoInstructor) {
      dom.mainTabsCard.classList.add('d-none');
      dom.instructorOnlyHeader.classList.add('d-none');
      dom.openSheetLink.classList.add('d-none');
      dom.btnSyncPendingHeader.classList.add('d-none');
      dom.btnSincronizarPendientes.classList.add('d-none');
      dom.btnVistaPreviaPdf.classList.add('d-none');

      dom.btnInstructorLock.className = 'btn btn-sm btn-outline-light opacity-50';
      dom.btnInstructorLock.innerHTML = '<i class="bi bi-lock-fill"></i>';
      dom.btnInstructorLock.title = 'Acceso Instructor';

      const paneEval = document.getElementById('pane-evaluar');
      if (paneEval && !paneEval.classList.contains('active')) {
        const evalTab = document.getElementById('evaluar-tab');
        if (evalTab) new bootstrap.Tab(evalTab).show();
      }
      return;
    }

    // VISTA INSTRUCTOR DESBLOQUEADA
    dom.mainTabsCard.classList.remove('d-none');
    dom.instructorOnlyHeader.classList.remove('d-none');
    dom.btnVistaPreviaPdf.classList.remove('d-none');

    dom.btnInstructorLock.className = 'btn btn-sm btn-warning fw-semibold shadow-sm';
    dom.btnInstructorLock.innerHTML = '<i class="bi bi-unlock-fill me-1"></i>Salir Modo Instructor';
    dom.btnInstructorLock.title = 'Volver a la vista limpia de aprendices';

    if (url) {
      dom.driveStatusBadge.className = 'badge bg-success px-3 py-2 shadow-sm';
      dom.driveStatusBadge.innerHTML = '<i class="bi bi-cloud-check-fill me-1"></i>Conectado a Google Sheets';
    } else {
      dom.driveStatusBadge.className = 'badge bg-secondary px-3 py-2';
      dom.driveStatusBadge.innerHTML = '<i class="bi bi-cloud-slash me-1"></i>Google Drive sin configurar';
    }

    if (meta && meta.url && url) {
      dom.openSheetLink.href = meta.url;
      dom.openSheetLink.classList.remove('d-none');
    } else {
      dom.openSheetLink.classList.add('d-none');
    }

    if (pendientes > 0) {
      dom.pendingCountHeader.textContent = String(pendientes);
      dom.btnSyncPendingHeader.classList.remove('d-none');
      dom.btnSincronizarPendientes.classList.remove('d-none');
    } else {
      dom.btnSyncPendingHeader.classList.add('d-none');
      dom.btnSincronizarPendientes.classList.add('d-none');
    }
  }

  async function sincronizarPendientesConDrive() {
    if (!state.modoInstructor) return;
    const scriptUrl = obtenerScriptUrl();
    if (!scriptUrl) {
      mostrarAlerta('info', 'Configure primero la URL `/exec` en la pestaña "Conectar Google Drive".');
      return;
    }

    const pendientes = obtenerRegistrosLocales().filter(r => !r.synced);
    if (pendientes.length === 0) {
      mostrarAlerta('success', 'No hay calificaciones pendientes por subir en este equipo.');
      return;
    }

    try {
      dom.btnSyncPendingHeader.disabled = true;
      dom.btnSincronizarPendientes.disabled = true;

      const resp = await enviarRegistrosAGoogleDrive(scriptUrl, pendientes);
      if (resp && resp.ok) {
        marcarRegistrosSincronizados(pendientes.map(p => p.id));
        await consultarEvaluacionesDrive(false);
        actualizarEstadoModoInstructorUI();
        mostrarAlerta('success', `Se subieron ${pendientes.length} calificación(es) pendiente(s) a Google Sheets.`);
      } else {
        throw new Error((resp && resp.error) || 'Error en Apps Script');
      }
    } catch (err) {
      mostrarAlerta('danger', `Error al sincronizar: ${escaparHtml(err.message)}`);
    } finally {
      dom.btnSyncPendingHeader.disabled = false;
      dom.btnSincronizarPendientes.disabled = false;
    }
  }

  async function consultarEvaluacionesDrive(mostrarMensajeExito) {
    if (!state.modoInstructor) return;
    const scriptUrl = obtenerScriptUrl();
    if (!scriptUrl) {
      if (mostrarMensajeExito) {
        mostrarAlerta('info', 'Aún no ha configurado la URL `/exec` de Google Apps Script.');
      }
      refrescarVistasDatos();
      return;
    }

    try {
      dom.btnRefrescarDrive.disabled = true;
      const sep = scriptUrl.includes('?') ? '&' : '?';
      const listUrl = `${scriptUrl}${sep}action=list&t=${Date.now()}`;
      let resp = null;
      try {
        resp = await fetch(listUrl, {
          method: 'GET',
          credentials: 'omit',
          redirect: 'follow',
          cache: 'no-store'
        });
      } catch (_) {
        resp = await fetch(listUrl);
      }
      if (!resp || !resp.ok) throw new Error(`HTTP ${resp ? resp.status : 'error'}`);
      const data = await resp.json();

      if (!data.ok) {
        throw new Error(data.error || 'Error reportado por Apps Script.');
      }

      state.registrosRemotos = Array.isArray(data.evaluaciones)
        ? data.evaluaciones.map(r => ({ ...r, synced: true }))
        : [];

      try {
        localStorage.setItem(STORAGE_KEYS.REMOTE_CACHE, JSON.stringify(state.registrosRemotos));
      } catch (_) {
        // Ignorar si excede cuota
      }

      if (data.spreadsheetUrl) {
        guardarMetaSheet({
          url: data.spreadsheetUrl,
          name: data.spreadsheetName || 'Calificaciones_Exposiciones_ADSO_Ficha_3232460'
        });
      }

      actualizarEstadoModoInstructorUI();
      refrescarVistasDatos();

      if (mostrarMensajeExito) {
        const unicos = obtenerTodosLosRegistrosUnificados().length;
        mostrarAlerta(
          'success',
          `Calificaciones actualizadas desde Google Sheets (${unicos} calificaciones únicas de aprendices).`
        );
      }
    } catch (_) {
      actualizarEstadoModoInstructorUI();
      refrescarVistasDatos();
      if (mostrarMensajeExito) {
        const unicos = obtenerTodosLosRegistrosUnificados().length;
        mostrarAlerta(
          'success',
          `Mostrando ${unicos} calificaciones consolidadas de aprendices.`
        );
      }
    } finally {
      dom.btnRefrescarDrive.disabled = false;
    }
  }

  // =========================================================================
  // HISTORIAL, CONSOLIDADO DE 12 TEMAS Y EXPORTACIONES (MODO INSTRUCTOR)
  // =========================================================================
  function obtenerCacheRemotaGuardada() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.REMOTE_CACHE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {
      // ignorar
    }
    return [];
  }

  function obtenerSnapshotNubeInicial() {
    if (
      window.ADSO_CLOUD_SNAPSHOT &&
      Array.isArray(window.ADSO_CLOUD_SNAPSHOT.evaluaciones)
    ) {
      return window.ADSO_CLOUD_SNAPSHOT.evaluaciones.map(r => ({ ...r, synced: true }));
    }
    return [];
  }

  function obtenerTodosLosRegistrosUnificados() {
    const locales = obtenerRegistrosLocales();
    const cacheRemota = obtenerCacheRemotaGuardada();
    const snapshotInicial = obtenerSnapshotNubeInicial();

    const combinados = [
      ...state.registrosRemotos.map(r => ({ ...r, synced: true })),
      ...cacheRemota.map(r => ({ ...r, synced: true })),
      ...snapshotInicial,
      ...locales
    ];

    // Ordenar del más reciente al más antiguo
    combinados.sort((a, b) => {
      const fa = a.fechaRegistro || a.fechaExposicion || '';
      const fb = b.fechaRegistro || b.fechaExposicion || '';
      return fb.localeCompare(fa);
    });

    // Deduplicar estrictamente por (Tema + Aprendiz): máximo 1 calificación única por aprendiz en cada tema
    const mapaUnicoPorTemaAprendiz = new Map();
    combinados.forEach(reg => {
      if (!reg || !reg.temaId || !reg.nombreAprendiz) return;
      const claveAp = normalizarClaveAprendiz(reg.nombreAprendiz) || reg.id;
      const claveUnica = `T${Number(reg.temaId)}__${claveAp}`;
      if (!mapaUnicoPorTemaAprendiz.has(claveUnica)) {
        mapaUnicoPorTemaAprendiz.set(claveUnica, {
          ...reg,
          nombreAprendiz: obtenerNombreOficialAprendiz(reg.nombreAprendiz)
        });
      }
    });

    return Array.from(mapaUnicoPorTemaAprendiz.values());
  }

  function refrescarVistasDatos() {
    const todos = obtenerTodosLosRegistrosUnificados();
    dom.badgeTotalHistorial.textContent = String(todos.length);

    const aprobados = todos.filter(r => Number(r.notaFinal) >= 70).length;
    const deficientes = todos.length - aprobados;
    const promGral =
      todos.length > 0
        ? (todos.reduce((acc, r) => acc + Number(r.notaFinal || 0), 0) / todos.length).toFixed(1)
        : '—';

    dom.kpiTotalEvaluados.textContent = String(todos.length);
    dom.kpiTotalAprobados.textContent = String(aprobados);
    dom.kpiTotalDeficientes.textContent = String(deficientes);
    dom.kpiPromedioGeneral.textContent = promGral;

    renderizarTablaHistorial(todos);
    renderizarPlanillaControl12Temas(todos);
  }

  function renderizarTablaHistorial(todos) {
    const q = (dom.filtroTexto.value || '').trim().toLowerCase();
    const temaFiltro = dom.filtroTema.value;
    const juicioFiltro = dom.filtroJuicio.value;

    const filtrados = todos.filter(r => {
      if (temaFiltro && String(r.temaId) !== temaFiltro) return false;
      if (juicioFiltro === 'APROBADO' && Number(r.notaFinal) < 70) return false;
      if (juicioFiltro === 'NO APROBADO' && Number(r.notaFinal) >= 70) return false;
      if (q) {
        const textoBusqueda = `${r.nombreAprendiz} ${r.documentoAprendiz} ${r.ficha} ${r.temaTitulo}`.toLowerCase();
        if (!textoBusqueda.includes(q)) return false;
      }
      return true;
    });

    if (filtrados.length === 0) {
      dom.tablaHistorialBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">
            No se encontraron calificaciones con los filtros actuales.
          </td>
        </tr>
      `;
      return;
    }

    dom.tablaHistorialBody.innerHTML = filtrados
      .map(r => {
        const aprueba = Number(r.notaFinal) >= 70;
        const badgeJuicio = aprueba
          ? '<span class="badge bg-success">APROBADO (A)</span>'
          : '<span class="badge bg-danger">NO APROBADO (D)</span>';
        const badgeSync = r.synced
          ? '<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-cloud-check me-1"></i>En Sheet</span>'
          : '<span class="badge bg-warning-subtle text-dark border border-warning-subtle"><i class="bi bi-laptop me-1"></i>Local</span>';

        return `
          <tr>
            <td class="text-nowrap">${escaparHtml(r.fechaExposicion || '')}</td>
            <td>${escaparHtml(r.ficha || '3232460')}</td>
            <td>
              <div class="fw-bold text-dark">${escaparHtml(r.nombreAprendiz)}</div>
              ${r.documentoAprendiz ? `<div class="text-muted" style="font-size:0.75rem;">${escaparHtml(r.documentoAprendiz)}</div>` : ''}
            </td>
            <td>
              <span class="badge bg-dark me-1">T${r.temaId}</span>
              <span>${escaparHtml(r.temaTitulo)}</span>
            </td>
            <td class="text-center fw-bold fs-6 ${aprueba ? 'text-success' : 'text-danger'}">
              ${Number(r.notaFinal).toFixed(1)}
            </td>
            <td class="text-center">${badgeJuicio}</td>
            <td class="text-center">${badgeSync}</td>
            <td class="text-end text-nowrap">
              ${
                r.githubUrl
                  ? `<a href="${escaparAttr(r.githubUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-dark me-1" title="Abrir repositorio GitHub"><i class="bi bi-github"></i></a>`
                  : ''
              }
              <button type="button" class="btn btn-sm btn-outline-primary btn-ver-detalle me-1" data-eval-id="${escaparAttr(r.id)}" title="Ver detalle de calificación">
                <i class="bi bi-eye-fill"></i>
              </button>
              <button type="button" class="btn btn-sm btn-outline-secondary btn-imprimir-fila" data-eval-id="${escaparAttr(r.id)}" title="Imprimir / Guardar PDF">
                <i class="bi bi-printer"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  function renderizarPlanillaControl12Temas(todos) {
    const totalEsperado = window.ADSO_CONFIG.totalAprendicesFicha || 21;
    const listaOficial = window.ADSO_CONFIG.aprendicesFicha || [];

    dom.tablaPlanillaBody.innerHTML = window.TEMARIO_ADSO.map(tema => {
      const evalsTema = todos.filter(r => Number(r.temaId) === tema.id);
      const evaluadoresUnicos = Array.from(new Set(evalsTema.map(e => e.nombreAprendiz).filter(Boolean)));
      const clavesQueCalificaron = new Set(evaluadoresUnicos.map(n => normalizarClaveAprendiz(n)));
      const faltantes = listaOficial.filter(oficial => !clavesQueCalificaron.has(normalizarClaveAprendiz(oficial)));

      let notaTexto = '<span class="text-muted">—</span>';
      let juicioBadge = '<span class="badge bg-light text-secondary border">Pendiente</span>';

      if (evalsTema.length > 0) {
        const prom =
          Math.round(
            (evalsTema.reduce((acc, e) => acc + Number(e.notaFinal || 0), 0) / evalsTema.length) * 10
          ) / 10;
        const aprueba = prom >= 70;
        notaTexto = `<strong class="${aprueba ? 'text-success' : 'text-danger'}">${prom.toFixed(1)}</strong>`;
        juicioBadge = aprueba
          ? '<span class="badge bg-success">APROBADO (A)</span>'
          : '<span class="badge bg-danger">NO APROBADO (D)</span>';
      }

      const completo = evalsTema.length >= totalEsperado;
      const badgeCountClass = completo
        ? 'bg-success'
        : evalsTema.length > 0
        ? 'bg-primary'
        : 'bg-secondary';

      const htmlFaltantes =
        evalsTema.length > 0 && faltantes.length > 0
          ? `<div class="mt-1 small text-danger"><i class="bi bi-exclamation-circle me-1"></i><strong>Faltan por calificar (${faltantes.length}):</strong> ${escaparHtml(faltantes.join(', '))}</div>`
          : '';

      return `
        <tr>
          <td class="text-center fw-bold">${tema.id}</td>
          <td class="fw-semibold">${escaparHtml(tema.titulo)}</td>
          <td class="text-muted">${escaparHtml(tema.sesion)}</td>
          <td class="text-center"><span class="badge ${badgeCountClass}">${evalsTema.length} / ${totalEsperado}</span></td>
          <td>
            ${evaluadoresUnicos.length > 0 ? `<div>${escaparHtml(evaluadoresUnicos.join(', '))}</div>${htmlFaltantes}` : '<span class="text-muted fst-italic">Sin calificaciones aún</span>'}
          </td>
          <td class="text-center">${notaTexto}</td>
          <td class="text-center">${juicioBadge}</td>
        </tr>
      `;
    }).join('');
  }

  function abrirModalDetalle(evalId) {
    const todos = obtenerTodosLosRegistrosUnificados();
    const reg = todos.find(r => r.id === evalId);
    if (!reg) return;

    state.evaluacionModalActual = reg;
    const aprueba = Number(reg.notaFinal) >= 70;

    dom.modalDetalleTitulo.textContent = `Calificación de ${reg.nombreAprendiz} — Tema ${reg.temaId}`;

    const itemsRows =
      Array.isArray(reg.itemsDetalle) && reg.itemsDetalle.length > 0
        ? reg.itemsDetalle
            .map(
              it => `
            <tr>
              <td class="small text-secondary">${escaparHtml(acortarTituloSeccion(it.seccionTitulo || ''))}</td>
              <td class="small">
                ${escaparHtml(it.texto)}
                ${it.comentario ? `<div class="text-primary fst-italic mt-1">Nota: ${escaparHtml(it.comentario)}</div>` : ''}
              </td>
              <td class="text-center fw-bold ${Number(it.puntaje) >= 70 ? 'text-success' : 'text-danger'}">${it.puntaje}</td>
            </tr>
          `
            )
            .join('')
        : '<tr><td colspan="3" class="text-center text-muted">Detalle por ítem no disponible.</td></tr>';

    dom.modalDetalleBody.innerHTML = `
      <div class="row g-3 mb-3">
        <div class="col-md-8">
          <div class="p-3 rounded-3 bg-light border h-100 small">
            <div><strong>Aprendiz Evaluador:</strong> ${escaparHtml(reg.nombreAprendiz)} ${reg.documentoAprendiz ? `(${escaparHtml(reg.documentoAprendiz)})` : ''}</div>
            <div><strong>Ficha ADSO:</strong> ${escaparHtml(reg.ficha || '3232460')} &nbsp;|&nbsp; <strong>Fecha:</strong> ${escaparHtml(reg.fechaExposicion)}</div>
            <div><strong>Tema Calificado:</strong> Tema ${reg.temaId} — ${escaparHtml(reg.temaTitulo)}</div>
            <div><strong>Tiempo:</strong> ${escaparHtml(reg.tiempoUsado || '')}</div>
            ${reg.githubUrl ? `<div class="mt-1"><strong>GitHub:</strong> <a href="${escaparAttr(reg.githubUrl)}" target="_blank" rel="noopener noreferrer">${escaparHtml(reg.githubUrl)}</a></div>` : ''}
          </div>
        </div>
        <div class="col-md-4">
          <div class="final-score-box ${aprueba ? 'aprobado' : 'deficiente'} h-100 d-flex flex-column justify-content-center">
            <div class="small fw-bold text-uppercase">Nota Otorgada</div>
            <div class="final-score-number my-1">${Number(reg.notaFinal).toFixed(1)}</div>
            <div><span class="badge ${aprueba ? 'bg-success' : 'bg-danger'}">${escaparHtml(reg.juicio)}</span></div>
          </div>
        </div>
      </div>

      ${
        reg.observaciones
          ? `<div class="alert alert-secondary small py-2 mb-3"><strong>Retroalimentación escrita por el aprendiz:</strong> ${escaparHtml(reg.observaciones)}</div>`
          : ''
      }

      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle">
          <thead class="table-light">
            <tr>
              <th style="width: 24%;">Sección</th>
              <th>Ítem / Criterio Evaluado</th>
              <th style="width: 90px;" class="text-center">Puntaje</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </div>
    `;

    const modal = bootstrap.Modal.getOrCreateInstance(dom.modalDetalleEl);
    modal.show();
  }

  function imprimirActaEvaluacion(reg) {
    const aprueba = Number(reg.notaFinal) >= 70;
    const filasItems = (reg.itemsDetalle || [])
      .map(
        it => `
        <tr>
          <td>${escaparHtml(acortarTituloSeccion(it.seccionTitulo || ''))}</td>
          <td>
            ${escaparHtml(it.texto)}
            ${it.comentario ? `<br><em>Observación ítem: ${escaparHtml(it.comentario)}</em>` : ''}
          </td>
          <td style="text-align:center; font-weight:bold;">${it.puntaje} / 100</td>
        </tr>
      `
      )
      .join('');

    dom.printReportArea.innerHTML = `
      <div class="print-header-bar d-flex justify-content-between align-items-start">
        <div>
          <h2 class="h4 fw-bold mb-1">SENA — CIMM Regional Boyacá · Tecnólogo ADSO</h2>
          <div class="fw-semibold">Registro de Coevaluación de Exposición — Ficha 3232460</div>
        </div>
        <div class="text-end small">
          <div><strong>Fecha:</strong> ${escaparHtml(reg.fechaExposicion)}</div>
          <div><strong>Instructor:</strong> ${escaparHtml(window.ADSO_CONFIG.instructorDefault)}</div>
        </div>
      </div>

      <table class="table print-table mb-3">
        <tbody>
          <tr>
            <th style="width: 24%;">Aprendiz que Califica</th>
            <td><strong>${escaparHtml(reg.nombreAprendiz)}</strong> ${reg.documentoAprendiz ? `(${escaparHtml(reg.documentoAprendiz)})` : ''}</td>
            <th style="width: 18%;">Nota (0-100)</th>
            <td style="width: 18%; text-align:center; font-size: 14pt; font-weight: bold;">${Number(reg.notaFinal).toFixed(1)}</td>
          </tr>
          <tr>
            <th>Tema Evaluado</th>
            <td><strong>TEMA ${reg.temaId}:</strong> ${escaparHtml(reg.temaTitulo)}</td>
            <th>Juicio SENA</th>
            <td style="text-align:center; font-weight:bold;">${aprueba ? 'APROBADO (A)' : 'NO APROBADO (D)'}</td>
          </tr>
        </tbody>
      </table>

      <h3 class="h6 fw-bold mt-3 mb-2">Desglose de Ítems Evaluados según el Temario</h3>
      <table class="table print-table mb-3">
        <thead>
          <tr>
            <th style="width: 24%;">Sección</th>
            <th>Criterio Evaluado</th>
            <th style="width: 14%; text-align:center;">Calificación</th>
          </tr>
        </thead>
        <tbody>${filasItems}</tbody>
      </table>

      <div class="border p-2 mb-4" style="min-height: 60px;">
        <strong>Observaciones / Retroalimentación:</strong><br/>
        ${escaparHtml(reg.observaciones || 'Sin observaciones adicionales.')}
      </div>
    `;

    window.print();
  }

  function imprimirVistaPreviaFormularioActual() {
    if (!state.temaActual) {
      mostrarAlerta('warning', 'Seleccione un tema y diligencie la calificación antes de generar el PDF.');
      return;
    }
    const metricas = calcularMetricasActuales();
    const itemsDetalle = [];
    state.temaActual.secciones.forEach(sec => {
      sec.items.forEach((texto, idx) => {
        const k = `${sec.key}__${idx}`;
        const c = state.calificaciones[k];
        itemsDetalle.push({
          seccionTitulo: sec.titulo,
          texto: texto,
          puntaje: c && c.puntaje !== null ? c.puntaje : '—',
          comentario: c ? c.comentario : ''
        });
      });
    });

    imprimirActaEvaluacion({
      fechaExposicion: dom.inputFechaExposicion.value,
      ficha: '3232460',
      nombreAprendiz: dom.inputNombreAprendiz.value.trim() || 'Aprendiz sin especificar',
      documentoAprendiz: dom.inputDocumentoAprendiz.value.trim(),
      temaId: state.temaActual.id,
      temaTitulo: state.temaActual.titulo,
      notaFinal: metricas.notaFinal || 0,
      juicio: metricas.juicio,
      observaciones: dom.inputObservaciones.value.trim(),
      itemsDetalle: itemsDetalle
    });
  }

  function imprimirPlanilla12Temas() {
    const todos = obtenerTodosLosRegistrosUnificados();
    const filas = window.TEMARIO_ADSO.map(tema => {
      const evs = todos.filter(r => Number(r.temaId) === tema.id);
      const evaluadores = Array.from(new Set(evs.map(e => e.nombreAprendiz).filter(Boolean))).join(', ');
      const prom =
        evs.length > 0
          ? (evs.reduce((a, b) => a + Number(b.notaFinal || 0), 0) / evs.length).toFixed(1)
          : '';
      const juicio = evs.length > 0 ? (Number(prom) >= 70 ? 'APROBADO (A)' : 'NO APROBADO (D)') : '';

      return `
        <tr>
          <td style="text-align:center; font-weight:bold;">${tema.id}</td>
          <td>${escaparHtml(tema.titulo)}</td>
          <td style="text-align:center;">${evs.length}</td>
          <td>${escaparHtml(evaluadores)}</td>
          <td style="text-align:center; font-weight:bold;">${prom ? `${prom} (${juicio})` : ''}</td>
        </tr>
      `;
    }).join('');

    dom.printReportArea.innerHTML = `
      <div class="print-header-bar">
        <h2 class="h4 fw-bold mb-1">SENA — CIMM Regional Boyacá · Tecnólogo ADSO (Ficha 3232460)</h2>
        <div><strong>Consolidado de Calificaciones por Tema (Temas 1 al 12)</strong> &nbsp;|&nbsp; Instructor: ${escaparHtml(window.ADSO_CONFIG.instructorDefault)}</div>
      </div>
      <table class="table print-table">
        <thead>
          <tr>
            <th style="width: 45px; text-align:center;">#</th>
            <th style="width: 28%;">Tema de Exposición</th>
            <th style="width: 85px; text-align:center;">Votos</th>
            <th>Aprendices Evaluadores</th>
            <th style="width: 170px; text-align:center;">Promedio / Juicio</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    `;
    window.print();
  }

  function exportarHistorialCsv() {
    const todos = obtenerTodosLosRegistrosUnificados();
    if (todos.length === 0) {
      mostrarAlerta('info', 'No hay calificaciones registradas para exportar.');
      return;
    }

    const encabezados = [
      'ID Evaluacion',
      'Fecha Exposicion',
      'Ficha ADSO',
      'Aprendiz que Califica',
      'Documento / Correo',
      'Num Tema',
      'Tema de Exposicion',
      'Nota Otorgada (0-100)',
      'Juicio Evaluativo',
      'Tiempo Registrado',
      'Repositorio GitHub',
      'Observaciones'
    ];

    const escaparCsv = val => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const lineas = [encabezados.map(escaparCsv).join(',')];
    todos.forEach(r => {
      lineas.push(
        [
          r.id,
          r.fechaExposicion,
          r.ficha || '3232460',
          r.nombreAprendiz,
          r.documentoAprendiz,
          r.temaId,
          r.temaTitulo,
          r.notaFinal,
          r.juicio,
          r.tiempoUsado,
          r.githubUrl,
          r.observaciones
        ]
          .map(escaparCsv)
          .join(',')
      );
    });

    const blob = new Blob(['\uFEFF' + lineas.join('\r\n')], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Calificaciones_ADSO_3232460_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // =========================================================================
  // CONFIGURACIÓN GOOGLE DRIVE (MODO INSTRUCTOR)
  // =========================================================================
  async function guardarYProbarUrlScript() {
    const url = dom.inputScriptUrl.value.trim();
    if (!url) {
      mostrarAlerta('warning', 'Pegue primero la URL de la Aplicación Web generada por Google Apps Script.');
      dom.inputScriptUrl.focus();
      return;
    }

    if (!url.startsWith('https://script.google.com/')) {
      dom.testConnectionResult.innerHTML =
        '<div class="alert alert-warning py-2 mb-0">La URL debe comenzar con <code>https://script.google.com/macros/s/.../exec</code></div>';
      return;
    }

    localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, url);
    dom.btnGuardarProbarUrl.disabled = true;
    dom.testConnectionResult.innerHTML =
      '<div class="text-primary"><span class="spinner-border spinner-border-sm me-2"></span>Verificando conexión con su Google Sheet...</div>';

    try {
      const sep = url.includes('?') ? '&' : '?';
      const pingUrl = `${url}${sep}action=ping&t=${Date.now()}`;
      let data = null;

      try {
        const resp = await fetch(pingUrl);
        if (resp.ok) {
          data = await resp.json();
        }
      } catch (_) {
        // Fallback no-cors cuando se abre desde file:// o el navegador restringe cabeceras CORS en redirección 302
        await fetch(pingUrl, { mode: 'no-cors' });
        data = {
          ok: true,
          spreadsheetUrl:
            window.ADSO_CONFIG.spreadsheetUrlDefault ||
            'https://docs.google.com/spreadsheets/d/1hrr-fU02hmKoPQnRgkbOMrkMXXWEK3h5YqPK3B3Eie4/edit',
          spreadsheetName:
            window.ADSO_CONFIG.spreadsheetNameDefault ||
            'Registro_Evaluaciones_Exposiciones_ADSO'
        };
      }

      if (!data || !data.ok) throw new Error((data && data.error) || 'Error reportado por el script.');

      const sheetUrlFinal =
        data.spreadsheetUrl ||
        window.ADSO_CONFIG.spreadsheetUrlDefault ||
        'https://docs.google.com/spreadsheets/d/1hrr-fU02hmKoPQnRgkbOMrkMXXWEK3h5YqPK3B3Eie4/edit';
      const sheetNameFinal =
        data.spreadsheetName ||
        window.ADSO_CONFIG.spreadsheetNameDefault ||
        'Registro_Evaluaciones_Exposiciones_ADSO';

      guardarMetaSheet({
        url: sheetUrlFinal,
        name: sheetNameFinal
      });

      dom.testConnectionResult.innerHTML = `
        <div class="alert alert-success py-2 mb-0">
          <i class="bi bi-check-circle-fill me-1"></i>
          <strong>¡Conectado exitosamente!</strong> Archivo en Google Drive:
          <a href="${escaparAttr(sheetUrlFinal)}" target="_blank" rel="noopener noreferrer" class="fw-bold">${escaparHtml(sheetNameFinal)}</a>
        </div>
      `;

      actualizarEstadoModoInstructorUI();
      await consultarEvaluacionesDrive(false);
    } catch (err) {
      actualizarEstadoModoInstructorUI();
      dom.testConnectionResult.innerHTML = `
        <div class="alert alert-danger py-2 mb-0">
          <strong>No fue posible conectar:</strong> ${escaparHtml(err.message)}.
        </div>
      `;
    } finally {
      dom.btnGuardarProbarUrl.disabled = false;
    }
  }

  // =========================================================================
  // EVENTOS DOM
  // =========================================================================
  function registrarEventos() {
    dom.selectTema.addEventListener('change', ev => {
      seleccionarTema(ev.target.value);
    });

    dom.seccionesItemsContainer.addEventListener('click', ev => {
      const presetBtn = ev.target.closest('.score-preset-btn');
      if (presetBtn) {
        actualizarPuntajeItem(
          presetBtn.getAttribute('data-item-key'),
          presetBtn.getAttribute('data-preset')
        );
        return;
      }

      const secBtn = ev.target.closest('.btn-fill-section');
      if (secBtn && state.temaActual) {
        const secKey = secBtn.getAttribute('data-sec-key');
        const score = Number(secBtn.getAttribute('data-score'));
        const secObj = state.temaActual.secciones.find(s => s.key === secKey);
        if (secObj) {
          secObj.items.forEach((_, idx) => {
            actualizarPuntajeItem(`${secKey}__${idx}`, score);
          });
        }
        return;
      }

      const commentBtn = ev.target.closest('.btn-toggle-item-comment');
      if (commentBtn) {
        const key = commentBtn.getAttribute('data-item-key');
        const box = document.getElementById(`comment_box_${key}`);
        if (box) {
          box.classList.toggle('d-none');
          if (!box.classList.contains('d-none')) {
            box.querySelector('input')?.focus();
          }
        }
      }
    });

    dom.seccionesItemsContainer.addEventListener('input', ev => {
      const target = ev.target;
      const key = target.getAttribute('data-item-key');
      if (!key) return;

      if (
        target.classList.contains('item-score-range') ||
        target.classList.contains('item-score-number')
      ) {
        actualizarPuntajeItem(key, target.value);
      } else if (target.classList.contains('item-comment-input')) {
        if (state.calificaciones[key]) {
          state.calificaciones[key].comentario = target.value;
        }
      }
    });

    document.querySelectorAll('[data-fill-all]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = Number(btn.getAttribute('data-fill-all'));
        Object.keys(state.calificaciones).forEach(k => {
          if (state.calificaciones[k].puntaje === null) {
            actualizarPuntajeItem(k, val);
          }
        });
      });
    });

    dom.btnLimpiarNotas.addEventListener('click', () => {
      Object.keys(state.calificaciones).forEach(k => {
        actualizarPuntajeItem(k, '');
      });
    });

    // Cronómetro
    dom.selectModoTiempo.addEventListener('change', ev => {
      const val = ev.target.value;
      if (val === 'custom') {
        dom.boxTiempoPersonalizado.classList.remove('d-none');
        dom.inputMinutosCustom.focus();
      } else {
        dom.boxTiempoPersonalizado.classList.add('d-none');
        configurarCronometro(Number(val), false);
      }
    });
    dom.btnAplicarTiempoCustom.addEventListener('click', () => {
      const customMin = Number(dom.inputMinutosCustom.value || 60);
      configurarCronometro(customMin, false);
    });
    dom.btnTimerToggle.addEventListener('click', alternarCronometro);
    dom.btnTimerAdd5.addEventListener('click', agregarCincoMinutosEtapaActual);
    dom.btnTimerNext.addEventListener('click', () => {
      const sig = (state.timer.etapaIndex + 1) % state.timer.etapas.length;
      cambiarEtapaCronometro(sig);
    });
    dom.btnTimerReset.addEventListener('click', () => {
      configurarCronometro(state.timer.modoMinutos, false);
    });
    dom.btnMuteTimer.addEventListener('click', () => {
      state.timer.silenciado = !state.timer.silenciado;
      dom.iconMuteTimer.className = state.timer.silenciado
        ? 'bi bi-volume-mute-fill text-danger'
        : 'bi bi-volume-up-fill';
    });
    dom.timerStagesContainer.addEventListener('click', ev => {
      const btn = ev.target.closest('[data-stage-idx]');
      if (!btn) return;
      cambiarEtapaCronometro(Number(btn.getAttribute('data-stage-idx')));
    });

    // Envío y limpieza
    dom.formEvaluacion.addEventListener('submit', manejarEnvioFormulario);
    dom.btnVistaPreviaPdf.addEventListener('click', imprimirVistaPreviaFormularioActual);
    dom.btnReiniciarFormulario.addEventListener('click', () => {
      if (window.confirm('¿Desea limpiar los ítems actuales del formulario?')) {
        limpiarTemaYNotasTrasEnvio();
      }
    });

    // Historial, filtros y Planilla
    dom.filtroTexto.addEventListener('input', refrescarVistasDatos);
    dom.filtroTema.addEventListener('change', refrescarVistasDatos);
    dom.filtroJuicio.addEventListener('change', refrescarVistasDatos);
    dom.btnLimpiarFiltros.addEventListener('click', () => {
      dom.filtroTexto.value = '';
      dom.filtroTema.value = '';
      dom.filtroJuicio.value = '';
      refrescarVistasDatos();
    });

    dom.btnRefrescarDrive.addEventListener('click', () => consultarEvaluacionesDrive(true));
    dom.btnSincronizarPendientes.addEventListener('click', sincronizarPendientesConDrive);
    dom.btnSyncPendingHeader.addEventListener('click', sincronizarPendientesConDrive);
    dom.btnExportarCsv.addEventListener('click', exportarHistorialCsv);

    dom.tablaHistorialBody.addEventListener('click', ev => {
      const btnVer = ev.target.closest('.btn-ver-detalle');
      if (btnVer) {
        abrirModalDetalle(btnVer.getAttribute('data-eval-id'));
        return;
      }
      const btnPrint = ev.target.closest('.btn-imprimir-fila');
      if (btnPrint) {
        const id = btnPrint.getAttribute('data-eval-id');
        const reg = obtenerTodosLosRegistrosUnificados().find(r => r.id === id);
        if (reg) imprimirActaEvaluacion(reg);
      }
    });

    dom.btnModalImprimirActa.addEventListener('click', () => {
      if (state.evaluacionModalActual) {
        imprimirActaEvaluacion(state.evaluacionModalActual);
      }
    });

    dom.btnImprimirPlanilla.addEventListener('click', imprimirPlanilla12Temas);

    // Modo Instructor
    dom.btnInstructorLock.addEventListener('click', manejarClicCandadoInstructor);
    dom.formAccesoInstructor.addEventListener('submit', manejarSubmitPinInstructor);
    dom.btnGuardarNuevoPin.addEventListener('click', guardarNuevaClaveInstructor);

    // Configuración Google Drive
    dom.btnGuardarProbarUrl.addEventListener('click', guardarYProbarUrlScript);
    dom.btnDesconectarUrl.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEYS.SCRIPT_URL);
      localStorage.removeItem(STORAGE_KEYS.SHEET_META);
      dom.inputScriptUrl.value = window.ADSO_CONFIG.scriptUrlFija || '';
      dom.testConnectionResult.innerHTML = '';
      actualizarEstadoModoInstructorUI();
      mostrarAlerta('info', 'Se limpió la URL guardada en el navegador.');
    });

    dom.btnCopiarCodigoGs.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.GOOGLE_APPS_SCRIPT_CODE || '');
        const originalHtml = dom.btnCopiarCodigoGs.innerHTML;
        dom.btnCopiarCodigoGs.innerHTML = '<i class="bi bi-check2-all me-1"></i>¡Código copiado!';
        dom.btnCopiarCodigoGs.classList.replace('btn-navy', 'btn-success');
        setTimeout(() => {
          dom.btnCopiarCodigoGs.innerHTML = originalHtml;
          dom.btnCopiarCodigoGs.classList.replace('btn-success', 'btn-navy');
        }, 2500);
      } catch (_) {
        mostrarAlerta('warning', 'Seleccione manualmente el código y presione Ctrl+C.');
      }
    });
  }

  // =========================================================================
  // HELPERS
  // =========================================================================
  function obtenerScriptUrl() {
    return (
      window.ADSO_CONFIG.scriptUrlFija ||
      localStorage.getItem(STORAGE_KEYS.SCRIPT_URL) ||
      ''
    ).trim();
  }

  function guardarMetaSheet(meta) {
    localStorage.setItem(STORAGE_KEYS.SHEET_META, JSON.stringify(meta));
  }

  function obtenerMetaSheet() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SHEET_META);
      if (raw) return JSON.parse(raw);
    } catch (_) {
      // ignorar
    }
    if (window.ADSO_CONFIG.spreadsheetUrlDefault) {
      return {
        url: window.ADSO_CONFIG.spreadsheetUrlDefault,
        name: window.ADSO_CONFIG.spreadsheetNameDefault || 'Registro_Evaluaciones_Exposiciones_ADSO'
      };
    }
    return null;
  }

  function obtenerRegistrosLocales() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_RECORDS);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function guardarRegistrosLocales(nuevos) {
    const actuales = obtenerRegistrosLocales();
    localStorage.setItem(STORAGE_KEYS.LOCAL_RECORDS, JSON.stringify([...nuevos, ...actuales]));
  }

  function marcarRegistrosSincronizados(ids) {
    const setIds = new Set(ids);
    const actuales = obtenerRegistrosLocales().map(r =>
      setIds.has(r.id) ? { ...r, synced: true } : r
    );
    localStorage.setItem(STORAGE_KEYS.LOCAL_RECORDS, JSON.stringify(actuales));
  }

  function bloquearBotonGuardar(bloqueado) {
    dom.btnGuardarEvaluacion.disabled = bloqueado;
    dom.btnGuardarEvaluacion.innerHTML = bloqueado
      ? '<span class="spinner-border spinner-border-sm me-2"></span>Enviando calificación...'
      : '<i class="bi bi-send-check-fill me-2"></i>Enviar Calificación';
  }

  function mostrarAlerta(tipo, htmlMensaje) {
    dom.alertContainer.innerHTML = `
      <div class="alert alert-${tipo} alert-dismissible fade show shadow-sm mb-0" role="alert">
        ${htmlMensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
      </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function formatearSegundos(seg) {
    const esNegativo = seg < 0;
    const abs = Math.abs(seg);
    const m = String(Math.floor(abs / 60)).padStart(2, '0');
    const s = String(abs % 60).padStart(2, '0');
    return `${esNegativo ? '-' : ''}${m}:${s}`;
  }

  function generarIdCorto() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  function escaparHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escaparAttr(str) {
    return escaparHtml(str);
  }
})();
