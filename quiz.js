/* quiz.js — renders the "Predict the next step" panel. */
const Quiz = (function () {
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  const letter = i => String.fromCharCode(65 + i);

  /* choice === undefined → unanswered. onSubmit(choiceIndex), onContinue() are callbacks. */
  function render(host, step, idx, choice, onSubmit, onContinue, isLast) {
    host.innerHTML = '';
    if (!step || !step.q) { host.hidden = true; return; }
    host.hidden = false;
    const q = step.q, answered = choice !== undefined;
    host.appendChild(el('h3', null, '🧠 PREDICT THE NEXT STEP'));
    host.appendChild(el('div', 'quiz-array', 'Array: ' + step.arr.join('  ')));
    host.appendChild(el('p', 'quiz-q', q.prompt));
    const list = el('div', 'options');
    q.options.forEach((o, i) => {
      const lab = el('label', 'opt');
      const inp = el('input'); inp.type = 'radio'; inp.name = 'pred'; inp.value = i; inp.disabled = answered;
      if (answered && i === choice) inp.checked = true;
      if (answered && i === q.answer) lab.classList.add('right');
      if (answered && i === choice && choice !== q.answer) lab.classList.add('wrong');
      lab.appendChild(inp); lab.appendChild(el('span', null, letter(i) + '. ' + o));
      list.appendChild(lab);
    });
    host.appendChild(list);
    if (!answered) {
      const btn = el('button', 'btn primary', 'Submit answer'); btn.disabled = true;
      list.addEventListener('change', () => { btn.disabled = false; });
      btn.addEventListener('click', () => { const c = host.querySelector('input[name="pred"]:checked'); if (c) onSubmit(Number(c.value)); });
      host.appendChild(btn);
    } else {
      const ok = choice === q.answer;
      host.appendChild(el('div', 'feedback ' + (ok ? 'good' : 'bad'),
        ok ? '✅ Correct!\n\n' + q.why : '❌ Incorrect.\n\nThe correct answer is ' + letter(q.answer) + '.\n\n' + q.why));
      if (!isLast) { const c = el('button', 'btn primary', 'Continue ▶'); c.addEventListener('click', onContinue); host.appendChild(c); }
    }
  }
  return { render };
})();
