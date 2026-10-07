/* visualization.js — bar rendering, step playback and controls. */
const Viz = (function () {
  const $ = id => document.getElementById(id);
  const SPEEDS = { slow: 1800, normal: 1000, fast: 400 };
  let steps = [], idx = 0, timer = null, playing = false, speed = SPEEDS.normal, answered = {}, meta = { algo: 'bubble', kind: 'sort' }, nBars = 0, hooks = {};

  function buildBars(n) {
    const host = $('bars'); host.innerHTML = ''; nBars = n;
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div'); c.className = 'col';
      c.innerHTML = '<div class="val"></div><div class="bar"></div><div class="tag"></div><div class="idx">' + i + '</div>';
      host.appendChild(c);
    }
  }
  function paint(arr, step) {
    if (arr.length !== nBars) buildBars(arr.length);
    const max = Math.max(1, Math.max.apply(null, arr)), cols = $('bars').children;
    for (let i = 0; i < arr.length; i++) {
      const c = cols[i], b = c.querySelector('.bar');
      c.querySelector('.val').textContent = arr[i];
      b.style.height = Math.max(8, Math.round(arr[i] / max * 220)) + 'px';
      b.className = 'bar ' + ((step && step.cls[i]) || '');
      c.querySelector('.tag').textContent = (step && step.tags[i]) || '';
    }
    $('curArr').textContent = arr.join('  ') || '–';
  }
  function stats(step) {
    const s = step ? step.stats : { comparisons: 0, swaps: 0, shifts: 0 };
    const t = [['Step', step ? (idx + 1) + ' / ' + steps.length : '–']];
    if (meta.kind === 'sort') t.push(['Pass', step && step.pass ? step.pass : '–']);
    t.push(['Comparisons', s.comparisons]);
    if (meta.kind === 'sort') t.push(meta.algo === 'insertion' ? ['Shifts', s.shifts] : ['Swaps', s.swaps]);
    $('stats').innerHTML = t.map(x => '<div class="stat"><span>' + x[0] + '</span><b>' + x[1] + '</b></div>').join('');
  }
  function explain(step) {
    $('explain').classList.toggle('done', !!(step && step.done));
    if (!step) {
      $('stepNum').textContent = 'Not started'; $('stepOp').textContent = '';
      $('stepText').textContent = 'Enter an array above and press ▶ Start Visualization. You can then play, pause or move step by step.';
      $('stepNext').textContent = 'Press Start Visualization.'; return;
    }
    $('stepNum').textContent = 'Step ' + (idx + 1);
    $('stepOp').textContent = step.op; $('stepText').textContent = step.text; $('stepNext').textContent = step.next;
  }
  function buttons() {
    const has = steps.length > 0;
    $('ctlStart').disabled = playing || !has;
    $('ctlPause').disabled = !playing;
    $('ctlPrev').disabled = !has || idx <= 0;
    $('ctlNext').disabled = !has || idx >= steps.length - 1;
    $('ctlReset').disabled = !has;
  }
  function pause() { clearTimeout(timer); timer = null; playing = false; buttons(); }
  function show(i) {
    if (!steps.length) return;
    idx = Math.max(0, Math.min(steps.length - 1, i));
    const s = steps[idx], last = idx === steps.length - 1;
    paint(s.arr, s); stats(s); explain(s);
    Quiz.render($('quiz'), s, idx, answered[idx],
      choice => { answered[idx] = choice; Store.recordPrediction(choice === s.q.answer); if (hooks.onScore) hooks.onScore(); show(idx); },
      () => play(), last);
    if (last || (s.q && answered[idx] === undefined)) pause(); else buttons();
  }
  function schedule(delay) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!playing) return;
      if (idx < steps.length - 1) { show(idx + 1); if (playing) schedule(speed); }
    }, delay);
  }
  function play() {
    if (!steps.length) return;
    const s = steps[idx];
    if (s.q && answered[idx] === undefined) { $('quiz').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    if (idx >= steps.length - 1) show(0);
    if (steps[idx].q && answered[idx] === undefined) return;
    playing = true; buttons(); schedule(idx === 0 ? 400 : 250);
  }
  function load(newSteps, m) { pause(); steps = newSteps; meta = m; answered = {}; idx = 0; nBars = 0; show(0); }
  function reset() {
    pause(); steps = []; idx = 0; answered = {};
    explain(null); stats(null); Quiz.render($('quiz'), null); buttons();
  }
  function preview(arr) { paint(arr, null); }
  function clearBars() { nBars = 0; $('bars').innerHTML = ''; $('curArr').textContent = '–'; }
  function setSpeed(k) { speed = SPEEDS[k] || SPEEDS.normal; if (playing) schedule(speed); }
  function init(h) {
    hooks = h || {};
    $('ctlStart').addEventListener('click', play);
    $('ctlPause').addEventListener('click', pause);
    $('ctlNext').addEventListener('click', () => { pause(); show(idx + 1); });
    $('ctlPrev').addEventListener('click', () => { pause(); show(idx - 1); });
    $('ctlReset').addEventListener('click', () => { if (hooks.onReset) hooks.onReset(); });
    $('speed').addEventListener('change', e => setSpeed(e.target.value));
    reset();
  }
  return { init, load, reset, preview, clearBars, play, pause, hasSteps: () => steps.length > 0 };
})();
