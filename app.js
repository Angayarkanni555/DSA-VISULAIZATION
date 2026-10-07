/* app.js — wires the UI: cards, inputs, theme, debugging tabs, complexity, progress. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const IDS = Object.keys(Algo.META);
  const DEFAULTS = { sort: { arr: '5, 2, 8, 1, 6' }, search: { arr: '10, 20, 30, 40, 50', target: '40' } };
  let current = 'bubble', dbgCurrent = 'bubble';

  /* ---------- theme ---------- */
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    $('themeBtn').textContent = t === 'dark' ? '☀ Light' : '🌙 Dark';
    $('themeBtn').setAttribute('aria-label', 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' theme');
  }
  function initTheme() {
    const saved = Store.get().theme;
    setTheme(saved || (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
    $('themeBtn').addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next); Store.setTheme(next);
    });
  }

  /* ---------- cards & tabs ---------- */
  function buildCards() {
    $('cards').innerHTML = '';
    IDS.forEach(id => {
      const m = Algo.META[id], c = document.createElement('article'); c.className = 'card'; c.dataset.id = id;
      c.innerHTML = '<div class="card-top"><span class="ico">' + m.icon + '</span><span class="chip">' + (m.kind === 'sort' ? 'Sorting' : 'Searching') + '</span></div>' +
        '<h3>' + m.name + '</h3><p>' + m.desc + '</p>' +
        '<div class="cx"><span>Average</span><b>' + m.avg + '</b></div><div class="cx"><span>Space</span><b>' + m.space + '</b></div>' +
        '<button class="btn primary">Visualize</button>';
      c.querySelector('button').addEventListener('click', () => { selectAlgo(id); $('visualizer').scrollIntoView({ behavior: 'smooth' }); });
      $('cards').appendChild(c);
    });
  }
  function buildTabs(host, active, onPick) {
    host.innerHTML = '';
    IDS.forEach(id => {
      const b = document.createElement('button'); b.className = 'tab' + (id === active ? ' active' : ''); b.textContent = Algo.META[id].name;
      b.addEventListener('click', () => onPick(id)); host.appendChild(b);
    });
  }

  /* ---------- visualizer ---------- */
  function showError(msg) { const e = $('err'); e.textContent = msg || ''; e.hidden = !msg; }
  function refreshPreview() {
    Viz.reset(); showError('');
    const p = Algo.parse($('arrInput').value);
    if (p.ok) Viz.preview(p.arr); else Viz.clearBars();
  }
  function selectAlgo(id) {
    current = id; const m = Algo.META[id], d = DEFAULTS[m.kind];
    $('vizName').textContent = m.name; $('vizDesc').textContent = m.desc;
    $('arrInput').value = d.arr; if (d.target) $('targetInput').value = d.target;
    $('targetWrap').hidden = m.kind !== 'search';
    document.querySelectorAll('.card').forEach(c => c.classList.toggle('active', c.dataset.id === id));
    buildTabs($('algoTabs'), id, selectAlgo);
    refreshPreview();
  }
  function randomArray() {
    const n = 5 + Math.floor(Math.random() * 6), arr = [];
    for (let i = 0; i < n; i++) arr.push(1 + Math.floor(Math.random() * 99));
    $('arrInput').value = arr.join(', ');
    if (Algo.META[current].kind === 'search') $('targetInput').value = Math.random() < 0.6 ? arr[Math.floor(Math.random() * n)] : 1 + Math.floor(Math.random() * 99);
    refreshPreview();
  }
  function startVisualization() {
    const p = Algo.parse($('arrInput').value);
    if (!p.ok) { showError(p.error); Viz.clearBars(); return; }
    let target;
    if (Algo.META[current].kind === 'search') {
      const t = Algo.parseTarget($('targetInput').value);
      if (!t.ok) { showError(t.error); return; }
      target = t.value;
    }
    showError('');
    Viz.load(Algo.run(current, p.arr, target), { algo: current, kind: Algo.META[current].kind });
    Store.markExplored(current); renderProgress();
    Viz.play();
  }

  /* ---------- complexity ---------- */
  function buildComplexity() {
    $('cxBody').innerHTML = IDS.map(id => { const m = Algo.META[id];
      return '<tr><th scope="row">' + m.name + '</th><td>' + m.best + '</td><td>' + m.avg + '</td><td>' + m.worst + '</td><td>' + m.space + '</td></tr>'; }).join('');
  }

  /* ---------- progress ---------- */
  function row(label, value, pct) {
    return '<div class="prow"><div class="plabel"><span>' + label + '</span><b>' + value + '</b></div><div class="meter"><i style="width:' + pct + '%"></i></div></div>';
  }
  function renderProgress() {
    const d = Store.get(), ex = Object.keys(d.explored).length, pa = d.pred.attempted, pc = d.pred.correct;
    const keys = Object.keys(d.dbg), da = keys.length, dc = keys.filter(k => d.dbg[k].correct).length;
    const tot = pa + da, pct = tot ? Math.round((pc + dc) / tot * 100) : 0;
    $('progressBody').innerHTML =
      row('Algorithms Explored', ex + '/' + IDS.length, ex / IDS.length * 100) +
      row('Predictions Correct', pc + '/' + pa, pa ? pc / pa * 100 : 0) +
      row('Debugging Correct', dc + '/' + da, da ? dc / da * 100 : 0) +
      '<div class="overall"><span>Overall Score</span><b id="overall">' + pct + '%</b></div>' + row('', '', pct);
  }

  /* ---------- init ---------- */
  function init() {
    initTheme(); buildCards(); buildComplexity();
    Viz.init({ onScore: renderProgress, onReset: () => { Viz.reset(); refreshPreview(); } });
    $('startVizBtn').addEventListener('click', startVisualization);
    $('randBtn').addEventListener('click', randomArray);
    $('resetVizBtn').addEventListener('click', refreshPreview);
    $('arrInput').addEventListener('input', refreshPreview);
    $('targetInput').addEventListener('input', () => { if (Viz.hasSteps()) refreshPreview(); showError(''); });
    $('arrInput').addEventListener('keydown', e => { if (e.key === 'Enter') startVisualization(); });
    function dbg(id) { dbgCurrent = id; buildTabs($('dbgTabs'), id, dbg); Debug.render($('dbgBody'), id, renderProgress); }
    dbg(dbgCurrent);
    $('resetProgress').addEventListener('click', () => {
      if (!confirm('Reset all progress and scores?')) return;
      Store.resetProgress(); renderProgress(); dbg(dbgCurrent);
    });
    selectAlgo(current); renderProgress();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
