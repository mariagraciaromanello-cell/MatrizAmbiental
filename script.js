(function () {
  'use strict';

  var KEY = 'matrizAmbiental.v1';
  var GROUPS = ['Agua', 'Suelo', 'Aire', 'Biodiversidad', 'Paisaje', 'Socioeconómico', 'Otros'];
  var TYPES = { industrial: 'Industrial', agro: 'Agropecuario / agroindustrial', minero: 'Minero', urbano: 'Urbanístico / inmobiliario', infra: 'Infraestructura', energia: 'Energético', residuos: 'Gestión de residuos', agua: 'Agua / saneamiento', otro: 'Otro' };
  var STAGES = { construccion: 'Construcción', operacion: 'Funcionamiento / operación', ampliacion: 'Ampliación / modificación', cierre: 'Cierre / abandono' };
  var PROFILES = { larioja: 'La Rioja', generico: 'Genérico', personalizado: 'Personalizado' };
  var PROFILE_HINT = {
    larioja: 'Incluye un bloque ampliado de factores hídricos como sugerencia. No asigna valoraciones: la identificación y valoración de cada interacción es del profesional.',
    generico: 'Selección general de factores ambientales, totalmente editable.',
    personalizado: 'Base mínima editable para que armes tus propios factores.'
  };

  var FACTORS = {
    larioja: {
      'Agua': ['Disponibilidad del recurso hídrico', 'Consumo de agua', 'Fuente de abastecimiento', 'Agua superficial', 'Agua subterránea', 'Calidad del agua', 'Generación de efluentes', 'Tratamiento de efluentes', 'Disposición final de efluentes', 'Riesgo de contaminación hídrica', 'Competencia con otros usos del recurso'],
      'Suelo': ['Ocupación del suelo', 'Erosión', 'Salinización', 'Contaminación del suelo', 'Pérdida de suelo productivo'],
      'Aire': ['Material particulado', 'Emisiones gaseosas', 'Olores', 'Ruido'],
      'Biodiversidad': ['Vegetación / flora', 'Fauna', 'Hábitat / fragmentación'],
      'Paisaje': ['Paisaje'],
      'Socioeconómico': ['Población', 'Empleo y actividad económica', 'Salud y seguridad', 'Infraestructura y servicios', 'Actividades productivas']
    },
    generico: {
      'Agua': ['Disponibilidad del recurso hídrico', 'Calidad del agua', 'Generación de efluentes'],
      'Suelo': ['Ocupación del suelo', 'Erosión', 'Contaminación del suelo'],
      'Aire': ['Material particulado', 'Emisiones gaseosas', 'Ruido'],
      'Biodiversidad': ['Vegetación / flora', 'Fauna'],
      'Paisaje': ['Paisaje'],
      'Socioeconómico': ['Población', 'Empleo y actividad económica', 'Salud y seguridad']
    },
    personalizado: {
      'Agua': ['Calidad del agua'],
      'Suelo': ['Contaminación del suelo'],
      'Aire': ['Emisiones gaseosas'],
      'Biodiversidad': ['Vegetación / flora'],
      'Socioeconómico': ['Población']
    }
  };

  var ACTIONS = {
    industrial: ['Movimiento de suelo', 'Construcción de instalaciones', 'Uso de maquinaria', 'Transporte de insumos y productos', 'Consumo de agua', 'Consumo de energía', 'Generación de efluentes', 'Emisiones atmosféricas', 'Generación de residuos', 'Almacenamiento de sustancias', 'Operación de instalaciones'],
    agro: ['Preparación del terreno', 'Riego', 'Uso de fertilizantes', 'Uso de fitosanitarios', 'Cosecha', 'Transporte', 'Consumo de agua', 'Generación de residuos', 'Generación de efluentes'],
    minero: ['Desmonte', 'Movimiento de suelo', 'Excavación', 'Extracción', 'Transporte', 'Uso de maquinaria', 'Consumo de agua', 'Generación de residuos', 'Generación de efluentes', 'Emisiones y polvo', 'Cierre y restauración'],
    urbano: ['Desmonte', 'Movimiento de suelo', 'Excavación', 'Construcción', 'Tránsito y transporte', 'Consumo de agua', 'Generación de residuos', 'Generación de efluentes', 'Ocupación permanente del suelo'],
    infra: ['Desmonte', 'Movimiento de suelo', 'Excavación', 'Construcción', 'Transporte', 'Uso de maquinaria', 'Consumo de agua', 'Generación de residuos', 'Generación de efluentes', 'Operación y mantenimiento'],
    energia: ['Preparación del terreno', 'Construcción', 'Montaje de equipos', 'Transporte', 'Consumo de agua', 'Emisiones', 'Generación de residuos', 'Operación', 'Mantenimiento'],
    residuos: ['Recepción de residuos', 'Transporte', 'Almacenamiento', 'Tratamiento', 'Generación de efluentes', 'Emisiones y olores', 'Generación de residuos secundarios', 'Disposición final'],
    agua: ['Captación', 'Conducción', 'Tratamiento', 'Consumo de agua', 'Generación de efluentes', 'Descarga', 'Operación y mantenimiento', 'Generación de residuos'],
    otro: ['Movimiento de suelo', 'Construcción', 'Transporte', 'Uso de maquinaria', 'Consumo de agua', 'Generación de efluentes', 'Generación de residuos', 'Operación y mantenimiento']
  };

  var CRIT = [
    { key: 'intensity', label: 'Intensidad', opts: [['Baja', 1], ['Media', 3], ['Alta', 5]] },
    { key: 'extent', label: 'Extensión', opts: [['Puntual', 1], ['Local', 3], ['Regional', 5]] },
    { key: 'duration', label: 'Duración', opts: [['Temporal', 1], ['Prolongada', 3], ['Permanente', 5]] },
    { key: 'reversibility', label: 'Reversibilidad', opts: [['Fácilmente reversible', 1], ['Parcialmente reversible', 3], ['Irreversible', 5]] },
    { key: 'probability', label: 'Probabilidad', opts: [['Baja', 1], ['Media', 3], ['Alta', 5]] }
  ];
  var LEVELS = [
    { min: 1875, name: 'Muy alto', cls: 'l-muyalto' },
    { min: 625, name: 'Alto', cls: 'l-alto' },
    { min: 125, name: 'Moderado', cls: 'l-moderado' },
    { min: 1, name: 'Bajo', cls: 'l-bajo' }
  ];

  var state;
  var currentStep = 1;
  var statusTimer = null;
  var itemCtx = null;   // { kind, id }
  var impactCtx = null; // { aid, fid }
  var lastFocus = null;
  var printRestore = null;

  function $(id) { return document.getElementById(id); }
  function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') el.textContent = attrs[k];
      else if (k === 'class') el.className = attrs[k];
      else el.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return el;
  }

  function blankState() {
    return {
      project: { name: '', location: '', type: 'industrial', stage: 'construccion', profile: 'larioja', description: '' },
      factors: [], actions: [], impacts: {},
      meta: { factorsProfile: null, actionsType: null }
    };
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; }
  }

  function loadState() {
    var s = blankState();
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return s;
      var d = JSON.parse(raw);
      if (d && typeof d === 'object') {
        if (d.project) Object.keys(s.project).forEach(function (k) { if (typeof d.project[k] === 'string') s.project[k] = d.project[k]; });
        if (!TYPES[s.project.type]) s.project.type = 'industrial';
        if (!STAGES[s.project.stage]) s.project.stage = 'construccion';
        if (!PROFILES[s.project.profile]) s.project.profile = 'larioja';
        if (Array.isArray(d.factors)) s.factors = d.factors.filter(function (f) { return f && f.id && f.name; }).map(function (f) {
          return { id: String(f.id), name: String(f.name), group: GROUPS.indexOf(f.group) >= 0 ? f.group : 'Otros', selected: !!f.selected };
        });
        if (Array.isArray(d.actions)) s.actions = d.actions.filter(function (a) { return a && a.id && a.name; }).map(function (a) {
          return { id: String(a.id), name: String(a.name), selected: !!a.selected };
        });
        if (d.impacts && typeof d.impacts === 'object') Object.keys(d.impacts).forEach(function (k) {
          var im = d.impacts[k];
          if (im && (im.nature === 'neg' || im.nature === 'pos') && computeValue(im) !== null) s.impacts[k] = im;
        });
        if (d.meta) { s.meta.factorsProfile = d.meta.factorsProfile || null; s.meta.actionsType = d.meta.actionsType || null; }
      }
    } catch (e) { /* datos corruptos: se ignora */ }
    return s;
  }

  function setStatus(msg, bad) {
    var el = $('status');
    el.textContent = msg;
    el.className = 'status' + (bad ? ' bad' : '');
    clearTimeout(statusTimer);
    if (msg) statusTimer = setTimeout(function () { el.textContent = ''; el.className = 'status'; }, 4500);
  }

  /* ---------- Cálculo ---------- */
  function computeValue(im) {
    var v = 1;
    for (var i = 0; i < CRIT.length; i++) {
      var n = Number(im[CRIT[i].key]);
      if (!isFinite(n) || [1, 3, 5].indexOf(n) < 0) return null;
      v *= n;
    }
    return isFinite(v) ? v : null;
  }
  function levelOf(v) {
    for (var i = 0; i < LEVELS.length; i++) if (v >= LEVELS[i].min) return LEVELS[i];
    return LEVELS[LEVELS.length - 1];
  }
  function critLabel(key, val) {
    var c = CRIT.filter(function (x) { return x.key === key; })[0];
    var o = c.opts.filter(function (x) { return x[1] === Number(val); })[0];
    return o ? o[0] : '';
  }

  /* ---------- Sugerencias ---------- */
  function loadFactorSuggestions() {
    var base = FACTORS[state.project.profile] || FACTORS.generico;
    state.factors = [];
    GROUPS.forEach(function (g) {
      (base[g] || []).forEach(function (n) { state.factors.push({ id: uid('f'), name: n, group: g, selected: true }); });
    });
    state.meta.factorsProfile = state.project.profile;
    cleanImpacts();
  }
  function loadActionSuggestions() {
    var list = (ACTIONS[state.project.type] || ACTIONS.otro).slice();
    if (state.project.stage === 'cierre') {
      ['Desmantelamiento de instalaciones', 'Restauración del sitio'].forEach(function (n) { if (list.indexOf(n) < 0) list.push(n); });
    }
    var seen = {};
    state.actions = [];
    list.forEach(function (n) {
      if (seen[n]) return;
      seen[n] = 1;
      state.actions.push({ id: uid('a'), name: n, selected: true });
    });
    state.meta.actionsType = state.project.type;
    cleanImpacts();
  }
  function cleanImpacts() {
    var fids = {}, aids = {};
    state.factors.forEach(function (f) { fids[f.id] = 1; });
    state.actions.forEach(function (a) { aids[a.id] = 1; });
    Object.keys(state.impacts).forEach(function (k) {
      var p = k.split('|');
      if (!aids[p[0]] || !fids[p[1]]) delete state.impacts[k];
    });
  }

  /* ---------- Navegación ---------- */
  function validProject() {
    var name = $('pName').value.trim();
    var err = $('projectError');
    if (!name) {
      err.textContent = 'Ingresá el nombre del proyecto para continuar.';
      err.hidden = false;
      $('pName').focus();
      return false;
    }
    err.hidden = true;
    return true;
  }

  function goStep(n) {
    n = Math.max(1, Math.min(5, n));
    if (n > 1 && !validProject()) {
      if (currentStep !== 1) n = 1; else return;
    }
    if (n === 2 && state.meta.factorsProfile !== state.project.profile) {
      var hasImp = Object.keys(state.impacts).length > 0;
      if (state.factors.length === 0 || state.meta.factorsProfile === null || !hasImp ||
          confirm('Cambiaste el perfil ambiental. ¿Reemplazar los factores por las sugerencias del nuevo perfil? Se eliminarán las interacciones cargadas.')) {
        loadFactorSuggestions();
      } else { state.meta.factorsProfile = state.project.profile; }
    }
    if (n === 3 && state.meta.actionsType !== state.project.type) {
      var hasImp2 = Object.keys(state.impacts).length > 0;
      if (state.actions.length === 0 || state.meta.actionsType === null || !hasImp2 ||
          confirm('Cambiaste el tipo de proyecto. ¿Reemplazar las acciones por las sugerencias del nuevo tipo? Se eliminarán las interacciones cargadas.')) {
        loadActionSuggestions();
      } else { state.meta.actionsType = state.project.type; }
    }
    currentStep = n;
    for (var i = 1; i <= 5; i++) $('step' + i).hidden = (i !== n);
    Array.prototype.forEach.call($('stepNav').querySelectorAll('button'), function (b) {
      if (Number(b.getAttribute('data-step')) === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    $('prevBtn').hidden = (n === 1);
    $('nextBtn').hidden = (n === 5);
    if (n === 2) renderFactors();
    if (n === 3) renderActions();
    if (n === 4) renderMatrix();
    if (n === 5) renderSummary();
    persist();
    var hd = $('h' + n);
    if (hd) { hd.focus({ preventScroll: true }); }
    window.scrollTo(0, 0);
  }

  /* ---------- Paso 1 ---------- */
  function fillProjectForm() {
    var p = state.project;
    $('pName').value = p.name; $('pLocation').value = p.location;
    $('pType').value = p.type; $('pStage').value = p.stage;
    $('pProfile').value = p.profile; $('pDesc').value = p.description;
    $('profileHint').textContent = PROFILE_HINT[p.profile];
  }
  function readProjectForm() {
    var p = state.project;
    p.name = $('pName').value.trim(); p.location = $('pLocation').value.trim();
    p.type = $('pType').value; p.stage = $('pStage').value;
    p.profile = $('pProfile').value; p.description = $('pDesc').value.trim();
    $('profileHint').textContent = PROFILE_HINT[p.profile];
    persist();
  }

  /* ---------- Pasos 2 y 3 ---------- */
  function itemRow(kind, it) {
    var cb = h('input', { type: 'checkbox', id: kind + 'cb_' + it.id, 'data-act': 'toggle', 'data-kind': kind, 'data-id': it.id });
    cb.checked = !!it.selected;
    var lab = h('label', { 'for': kind + 'cb_' + it.id }, cb, document.createTextNode(it.name));
    var ed = h('button', { type: 'button', 'class': 'btn btn-secondary btn-sm', 'data-act': 'edit', 'data-kind': kind, 'data-id': it.id, 'aria-label': 'Editar ' + it.name, text: 'Editar' });
    var del = h('button', { type: 'button', 'class': 'btn btn-danger btn-sm', 'data-act': 'delete', 'data-kind': kind, 'data-id': it.id, 'aria-label': 'Eliminar ' + it.name, text: 'Eliminar' });
    del.style.marginRight = '0';
    return h('div', { 'class': 'item' }, lab, h('div', { 'class': 'btns' }, ed, del));
  }
  function renderFactors() {
    var box = $('factorsList');
    box.textContent = '';
    if (!state.factors.length) { box.appendChild(h('p', { 'class': 'empty', text: 'No hay factores. Agregá uno o restaurá las sugerencias.' })); return; }
    GROUPS.forEach(function (g) {
      var items = state.factors.filter(function (f) { return f.group === g; });
      if (!items.length) return;
      var sec = h('div', { 'class': 'group' + (g === 'Agua' ? ' water' : '') }, h('h3', { text: g }));
      items.forEach(function (f) { sec.appendChild(itemRow('factor', f)); });
      box.appendChild(sec);
    });
  }
  function renderActions() {
    var box = $('actionsList');
    box.textContent = '';
    if (!state.actions.length) { box.appendChild(h('p', { 'class': 'empty', text: 'No hay acciones. Agregá una o restaurá las sugerencias.' })); return; }
    var sec = h('div', { 'class': 'group' }, h('h3', { text: 'Acciones del proyecto' }));
    state.actions.forEach(function (a) { sec.appendChild(itemRow('action', a)); });
    box.appendChild(sec);
  }

  function onListClick(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var kind = t.getAttribute('data-kind'), id = t.getAttribute('data-id'), act = t.getAttribute('data-act');
    var list = kind === 'factor' ? state.factors : state.actions;
    var item = list.filter(function (x) { return x.id === id; })[0];
    if (!item) return;
    if (act === 'toggle') { item.selected = t.checked; persist(); }
    else if (act === 'edit') openItemModal(kind, item);
    else if (act === 'delete') {
      if (!confirm('¿Eliminar «' + item.name + '»? También se eliminarán sus interacciones en la matriz.')) return;
      var idx = list.indexOf(item);
      list.splice(idx, 1);
      cleanImpacts(); persist();
      if (kind === 'factor') renderFactors(); else renderActions();
      setStatus('Elemento eliminado.');
    }
  }

  /* ---------- Modal de factor/acción ---------- */
  function openModal(id) { lastFocus = document.activeElement; $(id).hidden = false; }
  function closeModal(id) {
    $(id).hidden = true;
    if (lastFocus && lastFocus.focus && document.body.contains(lastFocus)) lastFocus.focus();
  }
  function openItemModal(kind, item) {
    itemCtx = { kind: kind, id: item ? item.id : null };
    $('itemTitle').textContent = (item ? 'Editar ' : 'Agregar ') + (kind === 'factor' ? 'factor' : 'acción');
    $('itemName').value = item ? item.name : '';
    $('itemGroupWrap').hidden = (kind !== 'factor');
    $('itemGroup').value = item && item.group ? item.group : 'Otros';
    $('itemError').hidden = true;
    openModal('itemModal');
    $('itemName').focus();
  }
  function submitItem(e) {
    e.preventDefault();
    var name = $('itemName').value.trim();
    if (!name) { $('itemError').textContent = 'El nombre es obligatorio.'; $('itemError').hidden = false; $('itemName').focus(); return; }
    var kind = itemCtx.kind;
    var list = kind === 'factor' ? state.factors : state.actions;
    var item = itemCtx.id ? list.filter(function (x) { return x.id === itemCtx.id; })[0] : null;
    if (item) { item.name = name; if (kind === 'factor') item.group = $('itemGroup').value; }
    else if (kind === 'factor') list.push({ id: uid('f'), name: name, group: $('itemGroup').value, selected: true });
    else list.push({ id: uid('a'), name: name, selected: true });
    persist();
    closeModal('itemModal');
    if (kind === 'factor') renderFactors(); else renderActions();
    setStatus('Cambios aplicados.');
  }

  /* ---------- Matriz ---------- */
  function selFactors() {
    var out = [];
    GROUPS.forEach(function (g) { state.factors.forEach(function (f) { if (f.selected && f.group === g) out.push(f); }); });
    return out;
  }
  function selActions() { return state.actions.filter(function (a) { return a.selected; }); }

  function renderMatrix() {
    var fs = selFactors(), as = selActions();
    var table = $('matrixTable');
    table.textContent = '';
    $('matrixEmpty').hidden = !(fs.length === 0 || as.length === 0);
    $('matrixWrap').hidden = (fs.length === 0 || as.length === 0);
    if (fs.length === 0 || as.length === 0) return;

    var thead = h('thead');
    var r1 = h('tr', { 'class': 'grp' }, h('th', { 'class': 'corner', rowspan: '2', text: 'Acciones \\ Factores' }));
    var i = 0;
    while (i < fs.length) {
      var g = fs[i].group, c = 0;
      while (i + c < fs.length && fs[i + c].group === g) c++;
      r1.appendChild(h('th', { colspan: String(c), 'class': g === 'Agua' ? 'water' : '', text: g }));
      i += c;
    }
    var r2 = h('tr');
    fs.forEach(function (f) { r2.appendChild(h('th', { scope: 'col', text: f.name })); });
    thead.appendChild(r1); thead.appendChild(r2);
    table.appendChild(thead);

    var tb = h('tbody');
    as.forEach(function (a) {
      var tr = h('tr', null, h('th', { scope: 'row', text: a.name }));
      fs.forEach(function (f) {
        var im = state.impacts[a.id + '|' + f.id];
        var val = im ? computeValue(im) : null;
        var btn = h('button', { type: 'button', 'class': 'cell' + (val !== null ? ' ' + im.nature : ''), 'data-aid': a.id, 'data-fid': f.id });
        if (val !== null) {
          btn.setAttribute('aria-label', a.name + ' sobre ' + f.name + ': impacto ' + (im.nature === 'neg' ? 'negativo' : 'positivo') + ', valor preliminar ' + val + ', nivel ' + levelOf(val).name + '. Editar');
          btn.appendChild(h('span', { 'class': 'sym', text: im.nature === 'neg' ? '−' : '+' }));
          btn.appendChild(h('span', { 'class': 'val', text: String(val) }));
        } else {
          btn.setAttribute('aria-label', a.name + ' sobre ' + f.name + ': sin interacción identificada. Crear interacción');
        }
        tr.appendChild(h('td', null, btn));
      });
      tb.appendChild(tr);
    });
    table.appendChild(tb);
  }

  /* ---------- Ficha de impacto ---------- */
  function buildCriteria() {
    var box = $('criteria');
    CRIT.forEach(function (c) {
      var sel = h('select', { id: 'c_' + c.key });
      sel.appendChild(h('option', { value: '', text: 'Seleccionar…' }));
      c.opts.forEach(function (o) { sel.appendChild(h('option', { value: String(o[1]), text: o[0] + ' = ' + o[1] })); });
      sel.addEventListener('change', updatePreview);
      box.appendChild(h('div', { 'class': 'field' }, h('label', { 'for': 'c_' + c.key, text: c.label }), sel));
    });
  }
  function readImpactForm() {
    var im = { nature: '', obs: $('iObs').value.trim() };
    var r = document.querySelector('input[name="nature"]:checked');
    if (r) im.nature = r.value;
    CRIT.forEach(function (c) { im[c.key] = Number($('c_' + c.key).value); });
    return im;
  }
  function updatePreview() {
    var v = computeValue(readImpactForm());
    var el = $('impactPreview');
    if (v === null) { el.textContent = 'Valor preliminar: completá los cinco criterios para calcularlo.'; return; }
    el.textContent = 'Valor preliminar: ' + v + ' — nivel ' + levelOf(v).name + ' (orientativo)';
  }
  function openImpact(aid, fid) {
    var a = state.actions.filter(function (x) { return x.id === aid; })[0];
    var f = state.factors.filter(function (x) { return x.id === fid; })[0];
    if (!a || !f) return;
    impactCtx = { aid: aid, fid: fid };
    var im = state.impacts[aid + '|' + fid];
    $('impactAction').textContent = a.name;
    $('impactFactor').textContent = f.name + ' (' + f.group + ')';
    Array.prototype.forEach.call(document.querySelectorAll('input[name="nature"]'), function (r) { r.checked = !!im && r.value === im.nature; });
    CRIT.forEach(function (c) { $('c_' + c.key).value = im ? String(im[c.key]) : ''; });
    $('iObs').value = im ? (im.obs || '') : '';
    $('impactDelete').hidden = !im;
    $('impactError').hidden = true;
    $('impactTitle').textContent = im ? 'Editar interacción' : 'Nueva interacción';
    updatePreview();
    openModal('impactModal');
    document.querySelector('input[name="nature"]').focus();
  }
  function submitImpact(e) {
    e.preventDefault();
    var im = readImpactForm();
    var err = $('impactError');
    if (im.nature !== 'neg' && im.nature !== 'pos') { err.textContent = 'Indicá la naturaleza del impacto (negativo o positivo).'; err.hidden = false; return; }
    if (computeValue(im) === null) { err.textContent = 'Completá los cinco criterios de valoración para guardar la interacción.'; err.hidden = false; return; }
    state.impacts[impactCtx.aid + '|' + impactCtx.fid] = im;
    persist();
    closeModal('impactModal');
    renderMatrix();
    setStatus('Interacción guardada.');
  }
  function deleteImpact() {
    if (!impactCtx || !confirm('¿Eliminar esta interacción?')) return;
    delete state.impacts[impactCtx.aid + '|' + impactCtx.fid];
    persist();
    closeModal('impactModal');
    renderMatrix();
    setStatus('Interacción eliminada.');
  }

  /* ---------- Resumen ---------- */
  function getImpactList() {
    var out = [];
    selActions().forEach(function (a) {
      selFactors().forEach(function (f) {
        var im = state.impacts[a.id + '|' + f.id];
        if (!im) return;
        var v = computeValue(im);
        if (v === null) return;
        out.push({ action: a, factor: f, im: im, value: v, level: levelOf(v) });
      });
    });
    return out;
  }
  function renderSummary() {
    var p = state.project, list = getImpactList();
    var dl = $('sumProject');
    dl.textContent = '';
    [['Nombre', p.name], ['Ubicación', p.location || 'No indicada'], ['Tipo', TYPES[p.type]], ['Etapa', STAGES[p.stage]], ['Perfil ambiental', PROFILES[p.profile]], ['Descripción', p.description || 'Sin descripción']].forEach(function (r) {
      dl.appendChild(h('dt', { text: r[0] })); dl.appendChild(h('dd', { text: r[1] }));
    });

    var neg = list.filter(function (x) { return x.im.nature === 'neg'; }).length;
    var counts = $('sumCounts');
    counts.textContent = '';
    function card(cls, n, label) { counts.appendChild(h('div', { 'class': 'count ' + cls }, h('b', { text: String(n) }), document.createTextNode(label))); }
    card('', list.length, 'Interacciones evaluadas');
    card('neg', neg, 'Impactos negativos');
    card('pos', list.length - neg, 'Impactos positivos');
    LEVELS.slice().reverse().forEach(function (L) {
      card(L.cls, list.filter(function (x) { return x.level.name === L.name; }).length, 'Nivel ' + L.name);
    });

    var byF = {};
    list.forEach(function (x) { byF[x.factor.id] = (byF[x.factor.id] || 0) + 1; });
    var ranked = selFactors().filter(function (f) { return byF[f.id]; }).sort(function (a, b) { return byF[b.id] - byF[a.id]; }).slice(0, 10);
    var bars = $('sumBars');
    bars.textContent = '';
    if (!ranked.length) bars.appendChild(h('p', { text: 'Todavía no hay interacciones evaluadas.' }));
    var max = ranked.length ? byF[ranked[0].id] : 1;
    ranked.forEach(function (f) {
      var fill = h('div', { 'class': 'bar-fill' + (f.group === 'Agua' ? ' water' : '') });
      fill.style.width = Math.round(byF[f.id] / max * 100) + '%';
      bars.appendChild(h('div', { 'class': 'bar-row' }, h('span', { text: f.name }), h('div', { 'class': 'bar-track' }, fill), h('b', { text: String(byF[f.id]) })));
    });

    var tb = $('sumTable').querySelector('tbody');
    tb.textContent = '';
    if (!list.length) tb.appendChild(h('tr', null, h('td', { colspan: '6', text: 'Sin interacciones evaluadas.' })));
    list.forEach(function (x) {
      tb.appendChild(h('tr', null,
        h('td', { text: x.action.name }), h('td', { text: x.factor.name }),
        h('td', { text: x.im.nature === 'neg' ? 'Negativo' : 'Positivo' }),
        h('td', { text: String(x.value) }),
        h('td', null, h('span', { 'class': 'badge ' + x.level.cls, text: x.level.name })),
        h('td', { text: x.im.obs || '' })));
    });
  }

  /* ---------- Exportación ---------- */
  function csvCell(v) {
    var s = String(v == null ? '' : v);
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function downloadCsv() {
    if (!validProject()) { goStep(1); return; }
    var list = getImpactList();
    if (!list.length) { setStatus('No hay interacciones para exportar.', true); return; }
    var p = state.project;
    var rows = [['Proyecto', 'Ubicación', 'Tipo', 'Etapa', 'Perfil', 'Acción', 'Factor', 'Naturaleza', 'Intensidad', 'Extensión', 'Duración', 'Reversibilidad', 'Probabilidad', 'Valor preliminar', 'Nivel', 'Observaciones']];
    list.forEach(function (x) {
      rows.push([p.name, p.location, TYPES[p.type], STAGES[p.stage], PROFILES[p.profile], x.action.name, x.factor.name,
        x.im.nature === 'neg' ? 'Negativo' : 'Positivo',
        critLabel('intensity', x.im.intensity), critLabel('extent', x.im.extent), critLabel('duration', x.im.duration),
        critLabel('reversibility', x.im.reversibility), critLabel('probability', x.im.probability),
        x.value, x.level.name, x.im.obs || '']);
    });
    var csv = '\uFEFF' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = h('a', { href: url, download: 'matriz-ambiental-' + (p.name.replace(/[^\w\-]+/g, '_').slice(0, 40) || 'proyecto') + '.csv' });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
    setStatus('CSV descargado.');
  }

  function beforePrint() {
    if (printRestore) return;
    printRestore = { step: currentStep };
    renderMatrix(); renderSummary();
    $('step1').hidden = true; $('step2').hidden = true; $('step3').hidden = true;
    $('step4').hidden = false; $('step5').hidden = false;
  }
  function afterPrint() {
    if (!printRestore) return;
    var s = printRestore.step;
    printRestore = null;
    for (var i = 1; i <= 5; i++) $('step' + i).hidden = (i !== s);
  }

  /* ---------- Proyecto ---------- */
  function saveProject() {
    readProjectForm();
    if (persist()) setStatus('Proyecto guardado en este navegador.');
    else setStatus('No se pudo guardar: el almacenamiento local no está disponible.', true);
  }
  function newProject() {
    if (!confirm('¿Crear un nuevo proyecto? Se perderán los datos no exportados del proyecto actual.')) return;
    state = blankState();
    persist();
    fillProjectForm();
    $('projectError').hidden = true;
    goStep(1);
    setStatus('Nuevo proyecto iniciado.');
  }

  /* ---------- Inicio ---------- */
  function init() {
    GROUPS.forEach(function (g) { $('itemGroup').appendChild(h('option', { value: g, text: g })); });
    buildCriteria();
    state = loadState();
    fillProjectForm();

    $('saveBtn').addEventListener('click', saveProject);
    $('newBtn').addEventListener('click', newProject);
    $('prevBtn').addEventListener('click', function () { goStep(currentStep - 1); });
    $('nextBtn').addEventListener('click', function () { goStep(currentStep + 1); });
    Array.prototype.forEach.call($('stepNav').querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () { goStep(Number(b.getAttribute('data-step'))); });
    });
    ['pName', 'pLocation', 'pType', 'pStage', 'pProfile', 'pDesc'].forEach(function (id) {
      $(id).addEventListener('input', readProjectForm);
      $(id).addEventListener('change', readProjectForm);
    });
    $('projectForm').addEventListener('submit', function (e) { e.preventDefault(); });

    $('factorsList').addEventListener('click', onListClick);
    $('factorsList').addEventListener('change', onListClick);
    $('actionsList').addEventListener('click', onListClick);
    $('actionsList').addEventListener('change', onListClick);
    $('addFactorBtn').addEventListener('click', function () { openItemModal('factor', null); });
    $('addActionBtn').addEventListener('click', function () { openItemModal('action', null); });
    $('resetFactorsBtn').addEventListener('click', function () {
      if (!confirm('¿Restaurar los factores sugeridos? Se perderán tus cambios en factores y las interacciones cargadas.')) return;
      loadFactorSuggestions(); persist(); renderFactors(); setStatus('Factores sugeridos restaurados.');
    });
    $('resetActionsBtn').addEventListener('click', function () {
      if (!confirm('¿Restaurar las acciones sugeridas? Se perderán tus cambios en acciones y las interacciones cargadas.')) return;
      loadActionSuggestions(); persist(); renderActions(); setStatus('Acciones sugeridas restauradas.');
    });

    $('itemForm').addEventListener('submit', submitItem);
    $('itemCancel').addEventListener('click', function () { closeModal('itemModal'); });
    $('impactForm').addEventListener('submit', submitImpact);
    $('impactCancel').addEventListener('click', function () { closeModal('impactModal'); });
    $('impactDelete').addEventListener('click', deleteImpact);
    $('impactForm').addEventListener('change', updatePreview);

    $('matrixTable').addEventListener('click', function (e) {
      var c = e.target.closest('.cell');
      if (c) openImpact(c.getAttribute('data-aid'), c.getAttribute('data-fid'));
    });

    $('csvBtn').addEventListener('click', downloadCsv);
    $('printBtn').addEventListener('click', function () {
      if (!validProject()) { goStep(1); return; }
      window.print();
    });
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!$('itemModal').hidden) closeModal('itemModal');
      else if (!$('impactModal').hidden) closeModal('impactModal');
    });
    ['itemModal', 'impactModal'].forEach(function (id) {
      $(id).addEventListener('mousedown', function (e) { if (e.target === $(id)) closeModal(id); });
    });

    goStep(1);
    if (state.project.name) setStatus('Se recuperó el último proyecto guardado.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
