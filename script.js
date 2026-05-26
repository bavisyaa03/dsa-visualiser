// ─── GLOBALS ───────────────────────────────────────────────────────────────
let array = [];
let steps = [];        // list of animation frames
let stepIndex = 0;
let sortTimer = null;
let isSorting = false;
let comparisons = 0;

const COMPLEXITY = {
  bubble: { time: "O(n²)", space: "O(1)" },
  merge:  { time: "O(n log n)", space: "O(n)" },
  quick:  { time: "O(n log n) avg", space: "O(log n)" },
  bfs:    { time: "O(V + E)", space: "O(V)" },
  dfs:    { time: "O(V + E)", space: "O(V)" },
};

// ─── TAB SWITCHING ──────────────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));

  if (tab === 'sorting') {
    document.querySelectorAll('.tab')[0].classList.add('active');
    document.getElementById('sorting-section').classList.remove('hidden');
  } else {
    document.querySelectorAll('.tab')[1].classList.add('active');
    document.getElementById('graph-section').classList.remove('hidden');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  SORTING
// ═══════════════════════════════════════════════════════════════════════════

function generateArray() {
  resetSort();
  const size = parseInt(document.getElementById('size-slider').value);
  array = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
  renderBars(array, []);
  updateComplexity();
}

function updateComplexity() {
  const algo = document.getElementById('algo-select').value;
  const c = COMPLEXITY[algo];
  document.getElementById('complexity-time').textContent  = "Time: " + c.time;
  document.getElementById('complexity-space').textContent = "Space: " + c.space;
}

function renderBars(arr, highlights) {
  // highlights = [{index, class}]
  const container = document.getElementById('bar-container');
  container.innerHTML = '';
  const maxVal = Math.max(...arr);

  arr.forEach((val, i) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = (val / maxVal * 100) + '%';

    const h = highlights.find(h => h.index === i);
    if (h) bar.classList.add(h.class);

    container.appendChild(bar);
  });
}

function resetSort() {
  clearInterval(sortTimer);
  isSorting = false;
  steps = [];
  stepIndex = 0;
  comparisons = 0;
  document.getElementById('comparisons-label').textContent = "Comparisons: 0";
  if (array.length > 0) renderBars(array, []);
}

// ── BUILD STEPS ──────────────────────────────────────────────────────────────

function buildBubbleSteps(arr) {
  const a = [...arr], s = [];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      s.push({ arr: [...a], highlights: [
        { index: j,   class: 'comparing' },
        { index: j+1, class: 'comparing' }
      ]});
      if (a[j] > a[j+1]) { [a[j], a[j+1]] = [a[j+1], a[j]]; }
    }
  }
  s.push({ arr: [...a], highlights: a.map((_, i) => ({ index: i, class: 'sorted' })) });
  return s;
}

function buildMergeSteps(arr) {
  const a = [...arr], s = [];
  function merge(arr, l, m, r) {
    const left = arr.slice(l, m+1), right = arr.slice(m+1, r+1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      s.push({ arr: [...arr], highlights: [
        { index: k, class: 'comparing' },
        { index: l+i, class: 'pivot' }
      ]});
      if (left[i] <= right[j]) { arr[k++] = left[i++]; }
      else { arr[k++] = right[j++]; }
    }
    while (i < left.length) arr[k++] = left[i++];
    while (j < right.length) arr[k++] = right[j++];
  }
  function mergeSort(arr, l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    mergeSort(arr, l, m);
    mergeSort(arr, m+1, r);
    merge(arr, l, m, r);
  }
  mergeSort(a, 0, a.length - 1);
  s.push({ arr: [...a], highlights: a.map((_, i) => ({ index: i, class: 'sorted' })) });
  return s;
}

function buildQuickSteps(arr) {
  const a = [...arr], s = [];
  function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      s.push({ arr: [...arr], highlights: [
        { index: j,    class: 'comparing' },
        { index: high, class: 'pivot' }
      ]});
      if (arr[j] < pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; }
    }
    [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
    return i + 1;
  }
  function quickSort(arr, low, high) {
    if (low < high) {
      const pi = partition(arr, low, high);
      quickSort(arr, low, pi - 1);
      quickSort(arr, pi + 1, high);
    }
  }
  quickSort(a, 0, a.length - 1);
  s.push({ arr: [...a], highlights: a.map((_, i) => ({ index: i, class: 'sorted' })) });
  return s;
}

// ── PLAYBACK ────────────────────────────────────────────────────────────────

function startSort() {
  if (isSorting) return;
  if (array.length === 0) generateArray();

  const algo = document.getElementById('algo-select').value;
  updateComplexity();

  const base = [...array];
  if (algo === 'bubble') steps = buildBubbleSteps(base);
  else if (algo === 'merge') steps = buildMergeSteps(base);
  else steps = buildQuickSteps(base);

  stepIndex = 0;
  comparisons = 0;
  isSorting = true;

  const speed = 1050 - parseInt(document.getElementById('speed-slider').value);

  sortTimer = setInterval(() => {
    if (stepIndex >= steps.length) {
      clearInterval(sortTimer);
      isSorting = false;
      return;
    }
    const frame = steps[stepIndex++];
    comparisons++;
    document.getElementById('comparisons-label').textContent = "Comparisons: " + comparisons;
    renderBars(frame.arr, frame.highlights);
  }, speed);
}

function stepSort() {
  if (steps.length === 0) {
    if (array.length === 0) generateArray();
    const algo = document.getElementById('algo-select').value;
    updateComplexity();
    const base = [...array];
    if (algo === 'bubble') steps = buildBubbleSteps(base);
    else if (algo === 'merge') steps = buildMergeSteps(base);
    else steps = buildQuickSteps(base);
    stepIndex = 0;
  }
  if (stepIndex >= steps.length) return;
  const frame = steps[stepIndex++];
  comparisons++;
  document.getElementById('comparisons-label').textContent = "Comparisons: " + comparisons;
  renderBars(frame.arr, frame.highlights);
}

// Slider labels
document.getElementById('size-slider').addEventListener('input', function() {
  document.getElementById('size-label').textContent = this.value;
  generateArray();
});

document.getElementById('speed-slider').addEventListener('input', function() {
  const v = parseInt(this.value);
  document.getElementById('speed-label').textContent =
    v < 300 ? 'Slow' : v < 700 ? 'Mid' : 'Fast';
});

document.getElementById('algo-select').addEventListener('change', () => {
  resetSort();
  updateComplexity();
});

// ═══════════════════════════════════════════════════════════════════════════
//  GRAPH TRAVERSAL
// ═══════════════════════════════════════════════════════════════════════════

const canvas = document.getElementById('graph-canvas');
const ctx    = canvas.getContext('2d');

let nodes = [], edges = [], nodeStates = [];
let traversalTimer = null;

const NODE_R   = 22;
const COLORS = {
  unvisited: { fill: '#1e1e24', stroke: '#5b8dee', text: '#e8e8f0' },
  queued:    { fill: '#f9a825', stroke: '#f9a825', text: '#0d0d0f' },
  visited:   { fill: '#3ecf8e', stroke: '#3ecf8e', text: '#0d0d0f' },
};

function generateGraph() {
  resetGraph();
  const W = canvas.width, H = canvas.height;
  const count = 8;
  nodes = [];

  // Place nodes in a circle + center
  const cx = W / 2, cy = H / 2, r = 140;
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    nodes.push({ id: i, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  nodes.push({ id: count, x: cx, y: cy }); // center node

  // Random edges (connected enough)
  edges = [];
  const addEdge = (a, b) => {
    if (!edges.find(e => (e.a===a&&e.b===b)||(e.a===b&&e.b===a)))
      edges.push({ a, b });
  };

  // Ring
  for (let i = 0; i < count; i++) addEdge(i, (i+1) % count);
  // Spokes to center
  for (let i = 0; i < count; i += 2) addEdge(i, count);
  // A few random cross edges
  for (let i = 0; i < 4; i++) {
    const a = Math.floor(Math.random() * count);
    const b = Math.floor(Math.random() * count);
    if (a !== b) addEdge(a, b);
  }

  nodeStates = new Array(nodes.length).fill('unvisited');
  updateGraphComplexity();
  drawGraph();
}

function buildAdjList() {
  const adj = Array.from({ length: nodes.length }, () => []);
  edges.forEach(({ a, b }) => { adj[a].push(b); adj[b].push(a); });
  return adj;
}

function startTraversal() {
  if (nodes.length === 0) generateGraph();
  nodeStates = new Array(nodes.length).fill('unvisited');
  updateGraphComplexity();

  const algo = document.getElementById('traversal-select').value;
  const adj  = buildAdjList();
  const order = [];

  // Collect visit order
  if (algo === 'bfs') {
    const queue = [0], visited = new Set([0]);
    while (queue.length) {
      const cur = queue.shift();
      order.push({ node: cur, queued: [...queue] });
      for (const nb of adj[cur]) {
        if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
      }
    }
  } else {
    const visited = new Set();
    const stack   = [];
    function dfs(v) {
      visited.add(v);
      stack.push(v);
      order.push({ node: v, queued: [...stack] });
      for (const nb of adj[v]) {
        if (!visited.has(nb)) dfs(nb);
      }
      stack.pop();
    }
    dfs(0);
  }

  let i = 0;
  const visitedSoFar = [];
  const orderEl = document.getElementById('traversal-order');
  orderEl.innerHTML = 'Order: ';

  traversalTimer = setInterval(() => {
    if (i >= order.length) {
      clearInterval(traversalTimer);
      return;
    }
    const { node, queued } = order[i++];
    visitedSoFar.push(node);

    nodeStates = nodeStates.map((_, idx) => {
      if (visitedSoFar.includes(idx)) return 'visited';
      if (queued.includes(idx)) return 'queued';
      return 'unvisited';
    });

    document.getElementById('visited-label').textContent =
      `Visited: ${visitedSoFar.length} / ${nodes.length}`;

    const span = document.createElement('span');
    span.textContent = node + (i < order.length ? ' → ' : '');
    orderEl.appendChild(span);

    drawGraph();
  }, 600);
}

function resetGraph() {
  clearInterval(traversalTimer);
  nodeStates = new Array(nodes.length).fill('unvisited');
  document.getElementById('traversal-order').innerHTML = '';
  document.getElementById('visited-label').textContent = `Visited: 0 / ${nodes.length}`;
  drawGraph();
}

function updateGraphComplexity() {
  const algo = document.getElementById('traversal-select').value;
  const c = COMPLEXITY[algo];
  document.getElementById('graph-complexity-time').textContent  = "Time: " + c.time;
  document.getElementById('graph-complexity-space').textContent = "Space: " + c.space;
}

function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw edges
  ctx.strokeStyle = '#2a2a34';
  ctx.lineWidth = 2;
  edges.forEach(({ a, b }) => {
    ctx.beginPath();
    ctx.moveTo(nodes[a].x, nodes[a].y);
    ctx.lineTo(nodes[b].x, nodes[b].y);
    ctx.stroke();
  });

  // Draw nodes
  nodes.forEach((node, i) => {
    const state  = nodeStates[i] || 'unvisited';
    const colors = COLORS[state];

    // Glow for queued
    if (state === 'queued') {
      ctx.shadowColor = '#f9a825';
      ctx.shadowBlur  = 12;
    } else if (state === 'visited') {
      ctx.shadowColor = '#3ecf8e';
      ctx.shadowBlur  = 8;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_R, 0, 2 * Math.PI);
    ctx.fillStyle   = colors.fill;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth   = 2.5;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle  = colors.text;
    ctx.font       = '600 13px JetBrains Mono, monospace';
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.id, node.x, node.y);
  });
}

document.getElementById('traversal-select').addEventListener('change', () => {
  resetGraph();
  updateGraphComplexity();
});

// ─── INIT ────────────────────────────────────────────────────────────────────
generateArray();
generateGraph();