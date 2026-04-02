let currentApi = null;
let layoutRoot = null;
let zones = [];
let ghost = null;
let dragListeners = null;

export const meta = {
  id: 'layout-engine',
  name: 'Layout Engine',
  version: '2.0.0',
  compat: '>=3.3.0'
};

/* ============================================================
   CSS
   ============================================================ */
const CSS = `
  .bb-layout-root {
    position: absolute;
    inset: 0;
    padding: 56px 16px 16px;
    display: flex;
    gap: 10px;
    pointer-events: none;
    z-index: 1;
  }

  .bb-zone {
    flex: 1;
    min-width: 80px;
    border: 2px dashed rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.02);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    position: relative;
    transition: border-color 0.2s, background 0.2s;
    overflow: hidden;
  }

  .bb-zone.highlight {
    border-color: #7c6fff;
    background: rgba(124,111,255,0.08);
    box-shadow: inset 0 0 30px rgba(124,111,255,0.06);
  }

  .bb-zone-label {
    position: absolute;
    top: 8px;
    left: 12px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.15);
    pointer-events: none;
    z-index: 2;
  }

  .bb-zone .plugin-box,
  .bb-zone [data-plugin-id] {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    width: 100% !important;
    height: 100% !important;
    border-radius: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* Resizer handle */
  .bb-resizer {
    width: 8px;
    flex-shrink: 0;
    cursor: col-resize;
    position: relative;
    pointer-events: auto;
    border-radius: 4px;
    transition: background 0.15s;
    z-index: 5;
  }

  .bb-resizer::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 32px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    transition: background 0.15s, height 0.15s;
  }

  .bb-resizer:hover::after,
  .bb-resizer.active::after {
    background: #7c6fff;
    height: 48px;
  }

  /* Ghost outline during drag */
  .bb-layout-ghost {
    position: fixed;
    pointer-events: none;
    border: 2px solid #7c6fff;
    background: rgba(124,111,255,0.12);
    border-radius: 14px;
    z-index: 999999;
    transition: none;
  }

  /* Layout toolbar */
  .bb-layout-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(0,0,0,0.3);
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.06);
  }

  .bb-layout-btn {
    padding: 5px 12px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px;
    color: #aaa;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .bb-layout-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
    border-color: rgba(255,255,255,0.15);
  }

  .bb-layout-btn.active {
    background: rgba(124,111,255,0.2);
    border-color: rgba(124,111,255,0.4);
    color: #a78bfa;
  }

  .bb-layout-sep {
    width: 1px;
    height: 20px;
    background: rgba(255,255,255,0.1);
  }
`;

/* ============================================================
   SETUP
   ============================================================ */
export function setup(api) {
  currentApi = api;

  // Inject CSS
  if (api.injectCSS) {
    api.injectCSS(meta.id, CSS, { global: true });
  } else {
    const style = document.createElement('style');
    style.id = `bb-css-${meta.id}`;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // Create layout root
  layoutRoot = document.createElement('div');
  layoutRoot.className = 'bb-layout-root';
  api.boardEl.appendChild(layoutRoot);

  // Register toolbar buttons
  addToolbarButtons(api);

  // Listen for drag events (if API supports them)
  dragListeners = {
    onStart: (e) => onDragStart(e),
    onEnd: (e) => onDragEnd(e)
  };

  if (api.bus) {
    api.bus.on('plugin:dragstart', dragListeners.onStart);
    api.bus.on('plugin:dragend', dragListeners.onEnd);
  }

  // Also listen for native drag events on the board
  api.boardEl.addEventListener('dragover', onBoardDragOver);
  api.boardEl.addEventListener('drop', onBoardDrop);

  // Load saved layout or default to 2 columns
  loadLayout();
}

/* ============================================================
   TOOLBAR
   ============================================================ */
function addToolbarButtons(api) {
  const bar = document.createElement('div');
  bar.className = 'bb-layout-bar';
  bar.id = 'bb-layout-toolbar';

  const buttons = [
    { label: '1 Col', cols: 1 },
    { label: '2 Col', cols: 2 },
    { label: '3 Col', cols: 3 },
    { label: '4 Col', cols: 4 },
  ];

  buttons.forEach(({ label, cols }) => {
    const btn = document.createElement('button');
    btn.className = 'bb-layout-btn';
    btn.textContent = label;
    btn.dataset.cols = cols;
    btn.onclick = () => {
      createLayout(cols);
      updateActiveButton(bar, cols);
    };
    bar.appendChild(btn);
  });

  // Clear layout button
  const sep = document.createElement('div');
  sep.className = 'bb-layout-sep';
  bar.appendChild(sep);

  const clearBtn = document.createElement('button');
  clearBtn.className = 'bb-layout-btn';
  clearBtn.textContent = 'Clear';
  clearBtn.onclick = () => {
    zones.forEach(z => z.innerHTML = '');
    saveLayout();
  };
  bar.appendChild(clearBtn);

  // Register in header or as floating bar
  if (api.registerUI) {
    api.registerUI('header-actions', bar, 'layout-toolbar');
  } else {
    // Fallback: fixed position
    bar.style.cssText = 'position:fixed;top:8px;right:120px;z-index:99999;';
    document.body.appendChild(bar);
  }
}

function updateActiveButton(bar, cols) {
  bar.querySelectorAll('.bb-layout-btn[data-cols]').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.cols) === cols);
  });
}

/* ============================================================
   LAYOUT CREATION
   ============================================================ */
function createLayout(cols) {
  layoutRoot.innerHTML = '';
  zones = [];

  for (let i = 0; i < cols; i++) {
    const zone = document.createElement('div');
    zone.className = 'bb-zone';
    zone.dataset.zone = i;

    // Zone label
    const label = document.createElement('div');
    label.className = 'bb-zone-label';
    label.textContent = cols === 1 ? 'Main' : `Zone ${i + 1}`;
    zone.appendChild(label);

    zones.push(zone);
    layoutRoot.appendChild(zone);

    // Add resizer between zones
    if (i < cols - 1) {
      const resizer = createResizer(zone);
      layoutRoot.appendChild(resizer);
    }
  }

  saveLayout();
}

/* ============================================================
   RESIZER
   ============================================================ */
function createResizer(leftZone) {
  const resizer = document.createElement('div');
  resizer.className = 'bb-resizer';

  let startX, startWidth;

  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startX = e.clientX;
    startWidth = leftZone.offsetWidth;
    resizer.classList.add('active');

    function onMove(e) {
      const dx = e.clientX - startX;
      const newWidth = Math.max(80, startWidth + dx);
      leftZone.style.flex = 'none';
      leftZone.style.width = newWidth + 'px';
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      resizer.classList.remove('active');
      saveLayout();
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  return resizer;
}

/* ============================================================
   GHOST SYSTEM
   ============================================================ */
function createGhost(el) {
  removeGhost();
  const r = el.getBoundingClientRect();

  ghost = document.createElement('div');
  ghost.className = 'bb-layout-ghost';
  ghost.style.left = r.left + 'px';
  ghost.style.top = r.top + 'px';
  ghost.style.width = r.width + 'px';
  ghost.style.height = r.height + 'px';
  document.body.appendChild(ghost);
}

function moveGhost(x, y) {
  if (!ghost) return;
  ghost.style.left = (x - ghost.offsetWidth / 2) + 'px';
  ghost.style.top = (y - ghost.offsetHeight / 2) + 'px';

  const zone = getZoneFromPoint(x, y);
  highlightZone(zone);
}

function removeGhost() {
  if (ghost) {
    ghost.remove();
    ghost = null;
  }
  clearHighlights();
}

/* ============================================================
   ZONE DETECTION
   ============================================================ */
function getZoneFromPoint(x, y) {
  for (const z of zones) {
    const r = z.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return z;
    }
  }
  return null;
}

function highlightZone(active) {
  zones.forEach(z => z.classList.toggle('highlight', z === active));
}

function clearHighlights() {
  zones.forEach(z => z.classList.remove('highlight'));
}

/* ============================================================
   DRAG & DROP HANDLERS
   ============================================================ */
function onDragStart(e) {
  const el = e?.el || e?.detail?.el;
  if (el) createGhost(el);

  // Track mouse for ghost movement
  document.addEventListener('mousemove', onMouseMoveDuringDrag);
}

function onDragEnd(e) {
  document.removeEventListener('mousemove', onMouseMoveDuringDrag);

  const el = e?.el || e?.detail?.el;
  if (!el) { removeGhost(); return; }

  const rect = el.getBoundingClientRect();
  const zone = getZoneFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);

  removeGhost();

  if (!zone) return;

  const id = el.dataset?.pluginId || el.id;
  if (!id || id === meta.id || id === 'plugin-manager') return;

  // Move plugin box into zone
  el.style.position = 'relative';
  el.style.top = 'auto';
  el.style.left = 'auto';
  el.style.width = '100%';
  el.style.height = '100%';
  zone.appendChild(el);

  saveLayout();
}

function onMouseMoveDuringDrag(e) {
  moveGhost(e.clientX, e.clientY);
}

// Board-level drag/drop fallback (for plugins that use native HTML drag)
function onBoardDragOver(e) {
  e.preventDefault();
  moveGhost(e.clientX, e.clientY);
}

function onBoardDrop(e) {
  e.preventDefault();
  removeGhost();
}

/* ============================================================
   STORAGE
   ============================================================ */
function saveLayout() {
  if (!currentApi) return;

  const data = {
    cols: zones.length,
    zones: zones.map(z => {
      const childIds = [];
      z.querySelectorAll('[data-plugin-id]').forEach(el => {
        if (el.dataset.pluginId) childIds.push(el.dataset.pluginId);
      });
      return {
        width: z.style.flex === 'none' ? z.style.width : null,
        plugins: childIds
      };
    })
  };

  currentApi.storage.setForPlugin(meta.id, 'layout', data);
}

function loadLayout() {
  const data = currentApi.storage.getForPlugin(meta.id, 'layout');

  if (!data || !data.cols) {
    createLayout(2);
    return;
  }

  createLayout(data.cols);

  if (data.zones) {
    data.zones.forEach((zData, i) => {
      if (i >= zones.length) return;
      const zone = zones[i];

      if (zData.width) {
        zone.style.flex = 'none';
        zone.style.width = zData.width;
      }
    });
  }

  // Update active button
  const bar = document.querySelector('#bb-layout-toolbar');
  if (bar) updateActiveButton(bar, data.cols);
}

/* ============================================================
   CLEANUP
   ============================================================ */
export function teardown() {
  if (!currentApi) return;

  // Remove CSS
  if (currentApi.removeCSS) {
    currentApi.removeCSS(meta.id);
  } else {
    document.getElementById(`bb-css-${meta.id}`)?.remove();
  }

  // Remove drag listeners
  if (currentApi.bus && dragListeners) {
    currentApi.bus.off('plugin:dragstart', dragListeners.onStart);
    currentApi.bus.off('plugin:dragend', dragListeners.onEnd);
  }
  document.removeEventListener('mousemove', onMouseMoveDuringDrag);
  currentApi.boardEl.removeEventListener('dragover', onBoardDragOver);
  currentApi.boardEl.removeEventListener('drop', onBoardDrop);

  // Remove toolbar
  const bar = document.querySelector('#bb-layout-toolbar');
  if (bar) bar.remove();

  // Remove layout root
  if (layoutRoot) {
    layoutRoot.remove();
    layoutRoot = null;
  }

  // Remove ghost
  removeGhost();

  zones = [];
  currentApi = null;
}
