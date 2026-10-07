/* debugging.js — "Debug the algorithm" challenges (one per algorithm). */
const Debug = (function () {
  const CHALLENGES = {
    bubble: {
      title: 'Bubble Sort should sort in ascending order, but it does not.',
      code: 'function bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length - 1; j++) {\n      if (arr[j] < arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}',
      options: ['The comparison uses < so it swaps when the left value is smaller; the array ends up in descending order', 'The outer loop should start at i = 1', 'The swap line should be removed', 'The inner loop must run up to arr.length instead of arr.length - 1'],
      answer: 0,
      why: 'Bubble Sort must swap when the left element is GREATER than the right one (arr[j] > arr[j + 1]). With < the biggest values move to the front, giving a descending result.',
      fixed: 'function bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length - 1; j++) {\n      if (arr[j] > arr[j + 1]) {   // FIXED: > instead of <\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}'
    },
    selection: {
      title: 'Selection Sort finds the minimum correctly, but the array stays unsorted.',
      code: 'function selectionSort(arr) {\n  for (let i = 0; i < arr.length - 1; i++) {\n    let min = i;\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[j] < arr[min]) min = j;\n    }\n    [arr[i], arr[i]] = [arr[i], arr[i]];\n  }\n  return arr;\n}',
      options: ['The inner loop should start at j = 0', 'The condition should be arr[j] > arr[min]', 'The swap uses index i twice, so nothing moves; it should swap arr[i] with arr[min]', 'min should be initialised to arr.length'],
      answer: 2,
      why: 'The code finds min correctly, but then swaps arr[i] with itself. The minimum has to be swapped into position i: [arr[i], arr[min]] = [arr[min], arr[i]].',
      fixed: 'function selectionSort(arr) {\n  for (let i = 0; i < arr.length - 1; i++) {\n    let min = i;\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[j] < arr[min]) min = j;\n    }\n    [arr[i], arr[min]] = [arr[min], arr[i]];   // FIXED\n  }\n  return arr;\n}'
    },
    insertion: {
      title: 'Insertion Sort sometimes leaves the first element in the wrong place.',
      code: 'function insertionSort(arr) {\n  for (let i = 1; i < arr.length; i++) {\n    let key = arr[i];\n    let j = i - 1;\n    while (j > 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j--;\n    }\n    arr[j + 1] = key;\n  }\n  return arr;\n}',
      options: ['The outer loop should start at i = 0', 'The while condition should be j >= 0; with j > 0 the element at index 0 is never compared or shifted', 'The line arr[j + 1] = key should be arr[j] = key', 'The comparison should be arr[j] < key'],
      answer: 1,
      why: 'The loop stops when j reaches 0, so arr[0] is never compared with the key. For input like 3, 1 the 1 can never move before the 3. The condition must be j >= 0.',
      fixed: 'function insertionSort(arr) {\n  for (let i = 1; i < arr.length; i++) {\n    let key = arr[i];\n    let j = i - 1;\n    while (j >= 0 && arr[j] > key) {   // FIXED: j >= 0\n      arr[j + 1] = arr[j];\n      j--;\n    }\n    arr[j + 1] = key;\n  }\n  return arr;\n}'
    },
    linear: {
      title: 'Linear Search never finds the target when it is the first element.',
      code: 'function linearSearch(arr, target) {\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i] === target) {\n      return i;\n    }\n  }\n  return -1;\n}',
      options: ['It should return arr[i] instead of i', 'The loop condition should be i <= arr.length', 'The comparison should use < instead of ===', 'The loop starts at i = 1, so index 0 is skipped; it must start at i = 0'],
      answer: 3,
      why: 'Arrays start at index 0. Starting the loop at 1 means the first element is never checked, so a target at index 0 is reported as missing.',
      fixed: 'function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {   // FIXED: start at 0\n    if (arr[i] === target) {\n      return i;\n    }\n  }\n  return -1;\n}'
    },
    binary: {
      title: 'Binary Search sometimes runs forever.',
      code: 'function binarySearch(arr, target) {\n  let low = 0, high = arr.length - 1;\n  while (low <= high) {\n    let mid = Math.floor((low + high) / 2);\n    if (arr[mid] === target) return mid;\n    else if (arr[mid] < target) low = mid;\n    else high = mid - 1;\n  }\n  return -1;\n}',
      options: ['mid should be calculated with Math.ceil', 'When the target is larger, low = mid never moves past mid; it must be low = mid + 1', 'The loop should be while (low < high)', 'The function should sort the array inside the loop'],
      answer: 1,
      why: 'mid has already been checked and is not the target, so it must be excluded: low = mid + 1. With low = mid the range can stop shrinking (for example low = 3, high = 4) and the loop repeats forever.',
      fixed: 'function binarySearch(arr, target) {\n  let low = 0, high = arr.length - 1;\n  while (low <= high) {\n    let mid = Math.floor((low + high) / 2);\n    if (arr[mid] === target) return mid;\n    else if (arr[mid] < target) low = mid + 1;   // FIXED\n    else high = mid - 1;\n  }\n  return -1;\n}'
    }
  };
  const letter = i => String.fromCharCode(65 + i);
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function code(text) { const pre = el('pre', 'code'); pre.appendChild(el('code', null, text)); return pre; }

  function render(host, id, onScore) {
    const c = CHALLENGES[id], saved = Store.get().dbg[id];
    host.innerHTML = '';
    host.appendChild(el('h3', null, c.title));
    host.appendChild(code(c.code));
    host.appendChild(el('p', 'quiz-q', 'What is wrong with this code?'));
    const list = el('div', 'options');
    c.options.forEach((o, i) => {
      const lab = el('label', 'opt'), inp = el('input'); inp.type = 'radio'; inp.name = 'dbg'; inp.value = i;
      if (saved) { inp.disabled = true; if (i === saved.choice) inp.checked = true; if (i === c.answer) lab.classList.add('right'); if (i === saved.choice && !saved.correct) lab.classList.add('wrong'); }
      lab.appendChild(inp); lab.appendChild(el('span', null, letter(i) + '. ' + o)); list.appendChild(lab);
    });
    host.appendChild(list);
    if (!saved) {
      const btn = el('button', 'btn primary', 'Submit answer'); btn.disabled = true;
      list.addEventListener('change', () => { btn.disabled = false; });
      btn.addEventListener('click', () => {
        const sel = host.querySelector('input[name="dbg"]:checked'); if (!sel) return;
        const choice = Number(sel.value); Store.recordDebug(id, choice, choice === c.answer);
        render(host, id, onScore); if (onScore) onScore();
      });
      host.appendChild(btn);
    } else {
      host.appendChild(el('div', 'feedback ' + (saved.correct ? 'good' : 'bad'),
        (saved.correct ? '✅ Correct!' : '❌ Wrong. The correct answer is ' + letter(c.answer) + '.') + '\n\n' + c.why));
      host.appendChild(el('h4', null, 'Corrected code'));
      host.appendChild(code(c.fixed));
      host.appendChild(el('p', 'muted', 'Only your first answer to each challenge counts towards your score. Use "Reset Progress" to start over.'));
    }
  }
  return { CHALLENGES, render };
})();
