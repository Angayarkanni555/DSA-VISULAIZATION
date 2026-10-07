/* storage.js — progress + theme persistence (localStorage with in-memory fallback). */
const Store = (function () {
  const KEY = 'dsaVisualizer.v1';
  let fallback = null;
  const blank = () => ({ theme: null, explored: {}, pred: { attempted: 0, correct: 0 }, dbg: {} });
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? Object.assign(blank(), JSON.parse(raw)) : blank();
    } catch (e) { return fallback || blank(); }
  }
  let data = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { fallback = data; }
  }
  return {
    get: () => data,
    setTheme(t) { data.theme = t; save(); },
    markExplored(id) { data.explored[id] = true; save(); },
    recordPrediction(ok) { data.pred.attempted++; if (ok) data.pred.correct++; save(); },
    recordDebug(id, choice, ok) { if (!data.dbg[id]) { data.dbg[id] = { choice, correct: !!ok }; save(); } },
    resetProgress() { const t = data.theme; data = blank(); data.theme = t; save(); }
  };
})();
