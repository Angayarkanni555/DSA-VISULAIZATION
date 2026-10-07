/* algorithms.js — pure step generators (no DOM). Each algorithm returns an array of steps:
   { arr, cls:{index:'css classes'}, tags:{index:'label'}, op, text, next, q, pass, stats, done } */
(function (root) {
  'use strict';
  const MAX_N = 10;
  const META = {
    bubble:    { name: 'Bubble Sort',    kind: 'sort',   icon: '🫧', desc: 'Compares neighbouring elements and swaps them when they are in the wrong order.', best: 'O(n)',  avg: 'O(n²)',    worst: 'O(n²)',    space: 'O(1)' },
    selection: { name: 'Selection Sort', kind: 'sort',   icon: '🎯', desc: 'Finds the smallest remaining element and places it at the front of the unsorted part.', best: 'O(n²)', avg: 'O(n²)',    worst: 'O(n²)',    space: 'O(1)' },
    insertion: { name: 'Insertion Sort', kind: 'sort',   icon: '🃏', desc: 'Takes one element at a time and inserts it into its correct place among the sorted ones.', best: 'O(n)',  avg: 'O(n²)',    worst: 'O(n²)',    space: 'O(1)' },
    linear:    { name: 'Linear Search',  kind: 'search', icon: '🔎', desc: 'Checks every element one by one until the target is found.', best: 'O(1)',  avg: 'O(n)',     worst: 'O(n)',     space: 'O(1)' },
    binary:    { name: 'Binary Search',  kind: 'search', icon: '✂️', desc: 'Halves a sorted array each step by comparing the target with the middle element.', best: 'O(1)',  avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)' }
  };

  /* ---------- helpers ---------- */
  const fmt = a => a.join(' ');
  const range = (a, b) => { const r = []; for (let i = a; i < b; i++) r.push(i); return r; };
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function makeQ(prompt, correct, wrong, why) {
    const options = shuffle([correct].concat(wrong));
    return { prompt, options, answer: options.indexOf(correct), why };
  }
  function recorder(input) {
    const a = input.slice(), st = { comparisons: 0, swaps: 0, shifts: 0 }, steps = [];
    return {
      a, st, steps,
      push(o) { steps.push(Object.assign({ arr: a.slice(), stats: Object.assign({}, st), cls: {}, tags: {}, op: '', next: '', q: null }, o)); }
    };
  }
  /* build a cls map: sorted indexes get 'sorted', extra {index:'class'} are appended */
  function marks(map, sorted) {
    const c = {};
    (sorted || []).forEach(i => { c[i] = 'sorted'; });
    for (const k in map) c[k] = c[k] ? c[k] + ' ' + map[k] : map[k];
    return c;
  }
  function begin(r, text, next) { r.push({ op: 'Ready to start', text, next }); }
  function finishSort(r) {
    r.push({ cls: marks({}, range(0, r.a.length)), op: 'Sorting Completed!', text: 'Sorting Completed!\n\nSorted Array:\n' + fmt(r.a), next: 'Press Reset to try another array.', done: true });
  }

  /* ---------- input validation ---------- */
  function parse(str) {
    const s = String(str == null ? '' : str).trim();
    if (!s) return { ok: false, error: 'Please enter some numbers, for example: 5, 2, 8, 1, 6' };
    const parts = s.split(/[\s,;]+/).filter(Boolean);
    for (const p of parts) if (!/^\d{1,3}$/.test(p)) return { ok: false, error: '"' + p + '" is not valid. Use whole numbers from 0 to 999 separated by commas.' };
    if (parts.length > MAX_N) return { ok: false, error: 'Please enter at most ' + MAX_N + ' numbers (you entered ' + parts.length + ') so the animation stays easy to follow.' };
    return { ok: true, arr: parts.map(Number) };
  }
  function parseTarget(str) {
    const s = String(str == null ? '' : str).trim();
    if (!/^\d{1,3}$/.test(s)) return { ok: false, error: 'Please enter the target as a whole number from 0 to 999.' };
    return { ok: true, value: Number(s) };
  }

  /* ---------- sorting ---------- */
  function bubble(input) {
    const r = recorder(input), a = r.a, n = a.length, st = r.st; let cmpN = 0, stop = false;
    begin(r, 'Bubble Sort compares neighbouring elements and swaps them if the left one is bigger. After every pass, the largest remaining value "bubbles up" to the end.\n\nArray: ' + fmt(a), 'Start the first pass by comparing the first two elements.');
    for (let p = 0; p < n - 1 && !stop; p++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - p; j++) {
        const sorted = range(n - p, n), x = a[j], y = a[j + 1], sw = x > y, tg = { [j]: 'j', [j + 1]: 'j+1' };
        st.comparisons++; cmpN++;
        r.push({
          pass: p + 1, cls: marks({ [j]: 'cmp', [j + 1]: 'cmp' }, sorted), tags: tg,
          op: 'Comparing ' + x + ' and ' + y,
          text: 'We are comparing ' + x + ' and ' + y + '.\n\nIs ' + x + ' greater than ' + y + '? If yes, they are in the wrong order and must be swapped.',
          next: 'Decide whether a swap is needed.',
          q: (cmpN === 1 || cmpN === 4) ? makeQ('We are comparing ' + x + ' and ' + y + '. What happens next?',
            sw ? 'Swap ' + x + ' and ' + y : 'Keep them as they are and move on',
            [sw ? 'Keep them as they are and move on' : 'Swap ' + x + ' and ' + y, 'Stop the algorithm', 'Delete ' + x],
            sw ? x + ' > ' + y + ', so Bubble Sort swaps them.' : x + ' ≤ ' + y + ', so they are already in the right order and no swap is needed.') : null
        });
        if (sw) {
          a[j] = y; a[j + 1] = x; st.swaps++; swapped = true;
          r.push({ pass: p + 1, cls: marks({ [j]: 'swap', [j + 1]: 'swap' }, sorted), tags: tg, op: x + ' > ' + y + ' → Swap', text: x + ' > ' + y + ', so the two elements are out of order. We swap them.\n\nArray: ' + fmt(a), next: 'Move one position to the right and compare the next pair.' });
        } else {
          r.push({ pass: p + 1, cls: marks({ [j]: 'cmp', [j + 1]: 'cmp' }, sorted), tags: tg, op: x + ' ≤ ' + y + ' → No swap', text: x + ' ≤ ' + y + ', so they are already in order. No swap needed.\n\nArray: ' + fmt(a), next: 'Move one position to the right and compare the next pair.' });
        }
      }
      r.push({ pass: p + 1, cls: marks({}, range(n - 1 - p, n)), op: 'Pass ' + (p + 1) + ' complete',
        text: 'End of pass ' + (p + 1) + ': ' + a[n - 1 - p] + ' is now in its final position.' + (swapped ? '' : '\n\nNo swaps happened in this pass, so the array is already sorted. We can stop early!'),
        next: swapped ? 'Start the next pass.' : 'Finish the algorithm.' });
      if (!swapped) stop = true;
    }
    finishSort(r); return r.steps;
  }

  function selection(input) {
    const r = recorder(input), a = r.a, n = a.length, st = r.st; let cmpN = 0;
    begin(r, 'Selection Sort repeatedly finds the smallest value in the unsorted part and swaps it into the next position.\n\nArray: ' + fmt(a), 'Start by assuming the first element is the minimum.');
    for (let i = 0; i < n - 1; i++) {
      let m = i; const sorted = range(0, i);
      r.push({ pass: i + 1, cls: marks({ [m]: 'min' }, sorted), tags: { [m]: 'min' }, op: 'Current minimum = ' + a[m],
        text: 'Pass ' + (i + 1) + ': we look for the smallest value in positions ' + i + ' to ' + (n - 1) + '. For now we assume the first one (' + a[m] + ') is the minimum.', next: 'Check the remaining elements one by one.' });
      for (let j = i + 1; j < n; j++) {
        const v = a[j], mv = a[m], isNew = v < mv; st.comparisons++; cmpN++;
        r.push({ pass: i + 1, cls: marks({ [m]: 'min', [j]: 'cmp' }, sorted), tags: { [m]: 'min', [j]: 'j' }, op: 'Checking ' + v,
          text: 'Checking ' + v + '. Is it smaller than the current minimum (' + mv + ')?', next: 'Update the minimum if needed.',
          q: (cmpN === 1 || cmpN === 4) ? makeQ('The current minimum is ' + mv + ' and we are checking ' + v + '. What happens next?',
            isNew ? v + ' becomes the new minimum' : 'The minimum stays ' + mv,
            [isNew ? 'The minimum stays ' + mv : v + ' becomes the new minimum', 'Swap immediately and stop', 'Delete ' + v],
            isNew ? v + ' < ' + mv + ', so ' + v + ' becomes the new minimum.' : v + ' ≥ ' + mv + ', so the minimum does not change.') : null });
        if (isNew) m = j;
        r.push({ pass: i + 1, cls: marks({ [m]: 'min', [j]: isNew ? 'min' : 'cmp' }, sorted), tags: { [m]: 'min', [j]: isNew ? 'min' : 'j' },
          op: isNew ? 'New minimum = ' + v : v + ' ≥ ' + mv + ' → keep ' + mv,
          text: isNew ? v + ' < ' + mv + ', so ' + v + ' is the new minimum.' : v + ' is not smaller than ' + mv + ', so the minimum stays ' + mv + '.', next: j < n - 1 ? 'Check the next element.' : 'The scan is finished: swap the minimum into place.' });
      }
      if (m !== i) {
        const x = a[i], y = a[m]; a[i] = y; a[m] = x; st.swaps++;
        r.push({ pass: i + 1, cls: marks({ [i]: 'swap', [m]: 'swap' }, sorted), tags: { [i]: 'i', [m]: 'min' }, op: 'Swap ' + y + ' with ' + x,
          text: 'Minimum found: ' + y + '.\n\nSwap ' + y + ' with ' + x + ' (the first unsorted element).\n\nArray: ' + fmt(a), next: 'Position ' + i + ' is now sorted. Start the next pass.' });
      } else {
        r.push({ pass: i + 1, cls: marks({ [i]: 'min' }, sorted), tags: { [i]: 'min' }, op: a[i] + ' is already in place',
          text: 'Minimum found: ' + a[i] + '. It is already at position ' + i + ', so no swap is needed.\n\nArray: ' + fmt(a), next: 'Start the next pass.' });
      }
    }
    finishSort(r); return r.steps;
  }

  function insertion(input) {
    const r = recorder(input), a = r.a, n = a.length, st = r.st; let cmpN = 0;
    begin(r, 'Insertion Sort grows a sorted section on the left. Each new element (the key) is moved left until it sits in the right place.\n\nArray: ' + fmt(a), 'The first element is a sorted section by itself. Take the second element as the first key.');
    for (let i = 1; i < n; i++) {
      const key = a[i]; let k = i, lastReason = '';
      r.push({ pass: i, cls: marks({ [i]: 'key' }, range(0, i)), tags: { [i]: 'key' }, op: 'Key = ' + key,
        text: 'Pass ' + i + ': take ' + key + ' as the key and insert it into the sorted part on its left (positions 0 to ' + (i - 1) + ').', next: 'Compare the key with the element to its left.' });
      while (k > 0) {
        const left = a[k - 1], shift = left > key; st.comparisons++; cmpN++;
        r.push({ pass: i, cls: marks({ [k]: 'key', [k - 1]: 'cmp' }, range(0, i + 1)), tags: { [k]: 'key', [k - 1]: 'j' }, op: 'Compare ' + key + ' with ' + left,
          text: 'Key = ' + key + '.\n\nCompare ' + key + ' with ' + left + '. Is ' + left + ' greater than the key?', next: 'Shift ' + left + ' right if it is greater, otherwise insert the key here.',
          q: (cmpN === 1 || cmpN === 4) ? makeQ('Key = ' + key + '. We compare it with ' + left + '. What happens next?',
            shift ? 'Shift ' + left + ' to the right' : 'Insert ' + key + ' here, no shift needed',
            [shift ? 'Insert ' + key + ' here, no shift needed' : 'Shift ' + left + ' to the right', 'Delete ' + key, 'Stop the algorithm'],
            shift ? left + ' > ' + key + ', so ' + left + ' is shifted one place to the right.' : left + ' ≤ ' + key + ', so the key is already in the right place.') : null });
        if (!shift) { lastReason = left + ' ≤ ' + key + ', so the key stays here. '; break; }
        a[k] = left; a[k - 1] = key; st.shifts++; k--;
        r.push({ pass: i, cls: marks({ [k]: 'key', [k + 1]: 'swap' }, range(0, i + 1)), tags: { [k]: 'key', [k + 1]: 'shifted' }, op: left + ' > ' + key + ' → Shift ' + left,
          text: left + ' > ' + key + ', so we shift ' + left + ' one place to the right. The key ' + key + ' moves one place to the left.\n\nArray: ' + fmt(a), next: k > 0 ? 'Compare the key with the next element on the left.' : 'The key reached the front of the array.' });
      }
      r.push({ pass: i, cls: marks({ [k]: 'key' }, range(0, i + 1)), tags: { [k]: 'insert' }, op: 'Insert ' + key + ' at index ' + k,
        text: lastReason + 'Insert ' + key + ' at index ' + k + '.\n\nThe sorted part is now: ' + fmt(a.slice(0, i + 1)) + '\n\nArray: ' + fmt(a), next: i < n - 1 ? 'Take the next element as the key.' : 'All elements are sorted.' });
    }
    finishSort(r); return r.steps;
  }

  /* ---------- searching ---------- */
  function linear(input, target) {
    const r = recorder(input), a = r.a, n = a.length, st = r.st;
    begin(r, 'Linear Search looks at every element from left to right until it finds the target.\n\nArray: ' + fmt(a) + '\nTarget: ' + target, 'Start checking from index 0.');
    for (let i = 0; i < n; i++) {
      const hit = a[i] === target, seen = {}; range(0, i).forEach(x => { seen[x] = 'dim'; });
      st.comparisons++;
      r.push({ cls: marks(Object.assign({}, seen, { [i]: 'cmp' })), tags: { [i]: 'i' }, op: 'Checking ' + a[i] + '...',
        text: 'Checking index ' + i + ': is ' + a[i] + ' equal to the target ' + target + '?', next: 'Decide whether the target was found.',
        q: (i === 0 || i === 2) ? makeQ('Target = ' + target + '. We check ' + a[i] + '. What happens next?',
          hit ? 'Found! Stop searching' : 'Not found here, move to the next element',
          [hit ? 'Not found here, move to the next element' : 'Found! Stop searching', 'Sort the array first', 'Delete ' + a[i]],
          hit ? a[i] + ' equals the target, so the search ends.' : a[i] + ' is not ' + target + ', so we move on to the next element.') : null });
      if (hit) {
        r.push({ cls: marks(Object.assign({}, seen, { [i]: 'found' })), tags: { [i]: 'found' }, op: 'FOUND!', text: 'Checking ' + a[i] + '...\nFOUND!\n\nTarget ' + target + ' found at index ' + i + '.', next: 'Press Reset to try again.', done: true });
        return r.steps;
      }
      r.push({ cls: marks(Object.assign({}, seen, { [i]: 'dim' })), tags: { [i]: 'i' }, op: a[i] + ' ≠ ' + target, text: 'Checking ' + a[i] + '...\nNot found.', next: i < n - 1 ? 'Check the next element.' : 'No elements are left.' });
    }
    const all = {}; range(0, n).forEach(x => { all[x] = 'dim'; });
    r.push({ cls: marks(all), op: 'Target not found', text: 'Target ' + target + ' not found.\n\nAll ' + n + ' elements were checked.', next: 'Press Reset to try again.', done: true });
    return r.steps;
  }

  function binary(input, target) {
    const r = recorder(input), a = r.a, n = a.length, st = r.st; let cmpN = 0;
    const sortedAlready = a.every((v, i) => i === 0 || a[i - 1] <= v);
    if (!sortedAlready) {
      r.push({ op: 'Binary Search requires a sorted array', text: 'Binary Search requires a sorted array.\n\nSorting the array automatically...\n\nOriginal: ' + fmt(a), next: 'The array will be sorted, then the search begins.' });
      a.sort((x, y) => x - y);
      r.push({ op: 'Array sorted', text: 'The array is now sorted:\n' + fmt(a), next: 'Begin the search with the whole array.' });
    } else begin(r, 'Binary Search works on a sorted array. Each step it looks at the middle element and throws away half of the remaining elements.\n\nArray: ' + fmt(a) + '\nTarget: ' + target, 'Begin the search with the whole array.');
    const outside = (lo, hi) => { const d = {}; range(0, n).forEach(i => { if (i < lo || i > hi) d[i] = 'dim'; }); return d; };
    const lmh = (lo, mid, hi) => { const t = {}; [[lo, 'L'], [mid, 'M'], [hi, 'H']].forEach(([i, l]) => { if (i >= 0 && i < n) t[i] = t[i] ? t[i] + '/' + l : l; }); return t; };
    let lo = 0, hi = n - 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2), mv = a[mid]; st.comparisons++; cmpN++;
      const dir = mv === target ? 'found' : mv < target ? 'right' : 'left';
      const names = { found: 'Target found at mid', right: 'Search the right half', left: 'Search the left half' };
      r.push({ cls: marks(Object.assign(outside(lo, hi), { [mid]: 'cmp' })), tags: lmh(lo, mid, hi), op: 'Low = ' + lo + ', Mid = ' + mid + ', High = ' + hi,
        text: 'Low = ' + lo + '\nMid = ' + mid + '\nHigh = ' + hi + '\n\nTarget = ' + target + '\nMid value = ' + mv + '\n\nCompare ' + target + ' with ' + mv + '.', next: 'Decide which part of the array can be eliminated.',
        q: (cmpN === 1 || cmpN === 3) ? makeQ('Target = ' + target + ' and the mid value is ' + mv + '. What happens next?', names[dir],
          Object.keys(names).filter(k => k !== dir).map(k => names[k]).concat(['Start again from index 0']),
          dir === 'found' ? mv + ' equals the target, so we found it.' : dir === 'right' ? target + ' > ' + mv + ', so the target can only be in the right half.' : target + ' < ' + mv + ', so the target can only be in the left half.') : null });
      if (dir === 'found') {
        r.push({ cls: marks(Object.assign(outside(lo, hi), { [mid]: 'found' })), tags: { [mid]: 'found' }, op: 'FOUND!', text: 'Mid value ' + mv + ' equals the target ' + target + '.\n\nTarget ' + target + ' found at index ' + mid + '.', next: 'Press Reset to try again.', done: true });
        return r.steps;
      }
      const oldLo = lo, oldHi = hi;
      if (dir === 'right') lo = mid + 1; else hi = mid - 1;
      r.push({ cls: marks(Object.assign(outside(lo, hi), { [mid]: 'dim' })), tags: lmh(lo, -1, hi), op: dir === 'right' ? 'Search right half' : 'Search left half',
        text: target + (dir === 'right' ? ' > ' : ' < ') + mv + '\n\n' + names[dir] + '.\nEliminate indexes ' + (dir === 'right' ? oldLo + ' to ' + mid : mid + ' to ' + oldHi) + ' (half of the range).\n\n' + (lo <= hi ? 'New range: index ' + lo + ' to ' + hi + '.' : 'No elements are left to search.'),
        next: lo <= hi ? 'Find the middle of the new range.' : 'Conclude that the target is not in the array.' });
    }
    const all = {}; range(0, n).forEach(x => { all[x] = 'dim'; });
    r.push({ cls: marks(all), op: 'Target not found', text: 'Target ' + target + ' not found.\n\nThe search range became empty (Low > High).', next: 'Press Reset to try again.', done: true });
    return r.steps;
  }

  function run(id, arr, target) { return { bubble, selection, insertion, linear, binary }[id](arr, target); }
  const api = { META, MAX_N, parse, parseTarget, run };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Algo = api;
})(typeof window !== 'undefined' ? window : this);
