# DSA Visualizer – Interactive Algorithm Learning Platform

## Problem Statement (PS-02 – DSA Visualization Platform)
"Students often memorize DSA solutions without understanding how or why the algorithms work. This project proposes an interactive platform that teaches algorithms through visualization, prediction-based questions, and debugging, helping students understand each step rather than simply memorizing code."

## Objective
Help students understand *why* each step of an algorithm happens by letting them watch it run, predict what comes next, and find bugs in broken code.

## Features
- Dashboard with 5 algorithm cards (name, description, complexity, **Visualize** button)
- Animated vertical bars with highlighted comparisons, swaps, minimum, key, low/mid/high and sorted/found states
- Play, Pause, Next Step, Previous Step, Reset and Slow/Normal/Fast speed control
- Beginner-friendly "Current Step" explanation panel (what is happening and what comes next)
- Live counters: step, pass, comparisons, swaps or shifts
- **Prediction quiz** that pauses the animation ("What happens next?") for all 5 algorithms
- **Debug the algorithm** challenges (buggy code, multiple choice, explanation, corrected code) for all 5 algorithms
- Complexity table (best / average / worst / space)
- Progress and score saved in `localStorage`, with Reset Progress
- Light / dark theme (saved), responsive layout for mobile, tablet and desktop

## Technologies
HTML5, CSS3, vanilla JavaScript. No frameworks, no libraries, no backend, no build step.

## Algorithms
Sorting: Bubble Sort, Selection Sort, Insertion Sort. Searching: Linear Search, Binary Search.

## Input
- **Enter numbers**: 1–10 whole numbers from 0 to 999, separated by commas or spaces (for example `5, 2, 8, 1, 6`). Duplicates are allowed.
- **Target** (searching only): one whole number.
- **Generate Random Array** creates 5–10 random values. Invalid or empty input shows a friendly error message.

## Output
The bar animation, the step explanation, the counters and a final result such as `Sorting Completed! Sorted Array: 1 2 5 6 8`, `Target 40 found at index 3.` or `Target not found.`

## How Visualization Works
`js/algorithms.js` runs the chosen algorithm once and records every step (array state, highlighted positions, labels, text, counters). `js/visualization.js` then plays those recorded steps. Because all steps are stored, **Previous Step** and **Next Step** work in both directions and playback can be paused at any time. Binary Search automatically sorts an unsorted array first and tells you it is doing so.

## How Prediction Questions Work
At selected comparisons the animation pauses and asks "What happens next?" with four options. Submit an answer to see ✅ Correct or ❌ Incorrect, the right letter and the reason. Press **Continue** to resume. Each answered question is added to your prediction score.

## How Debugging Works
Open the **Debug the Algorithm** section, pick an algorithm, read the buggy snippet and choose what is wrong. You get Correct/Wrong feedback, an explanation and the corrected code. Only the first answer to each challenge is scored.

## Complexity Analysis
| Algorithm | Best | Average | Worst | Space |
|---|---|---|---|---|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) |
| Linear Search | O(1) | O(n) | O(n) | O(1) |
| Binary Search | O(1) | O(log n) | O(log n) | O(1) |

Bubble Sort here stops early when a pass makes no swaps, which gives the O(n) best case.

## How to Run
1. Extract the ZIP.
2. Open `DSA-Visualization-Platform/index.html` in any modern browser (Chrome, Edge, Firefox, Safari).

No installation or server is needed.

## Project Structure
```
DSA-Visualization-Platform/
├── index.html
├── README.md
├── css/style.css
├── js/ (app, algorithms, visualization, quiz, debugging, storage)
└── assets/favicon.svg
```

## Future Enhancements
More algorithms (merge, quick, heap sort, BFS/DFS), custom prediction difficulty, code highlighting synchronized with each step, keyboard shortcuts, and downloadable progress reports.
