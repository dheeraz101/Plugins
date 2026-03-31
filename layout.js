let currentApi = null;
let rootEl = null;
let zones = [];
let ghost = null;

let onDragStart, onDragEnd;

export const meta = {
  id: 'layout-sections',
  name: 'Layout Engine',
  version: '9.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  const { container, bus } = api;

  api.setPluginPermissions(meta.id, { isSystem: true });

  /* ---------------- CSS ---------------- */

  api.injectCSS(meta.id, `
    .bb-layout-root {
      position: absolute;
      inset: 0;
      padding: 60px 20px 20px;
      display: flex;
      pointer-events: none;
    }

    .bb-zone {
      flex: 1;
      min-width: 100px;
      border: 2px dashed rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.04);
      border-radius: 14px;
      margin-right: 10px;
      display: flex;
      pointer-events: auto;
      position: relative;
    }

    .bb-zone:last-child {
      margin-right: 0;
    }

    .bb-zone.highlight {
      border-color: #7c6fff;
      background: rgba(124,111,255,0.15);
    }

    .bb-zone > .bb-plugin-container {
      position: relative !important;
      width: 100% !important;
      height: 100% !important;
    }

    /* RESIZER */
    .bb-resizer {
      width: 6px;
      cursor: col-resize;
      background: transparent;
      position: relative;
      pointer-events: auto;
    }

    .bb-resizer:hover {
      background: rgba(124,111,255,0.5);
    }

    /* GHOST */
    .bb-ghost {
      position: fixed;
      pointer-events: none;
      border: 2px solid #7c6fff;
      background: rgba(124,111,255,0.1);
      border-radius: 12px;
      z-index: 999999;
    }
  `, { global: true });

  /* ---------------- ROOT ---------------- */

  container.innerHTML = `<div class="bb-layout-root"></div>`;
  rootEl = container.firstChild;

  /* ---------------- TOOLBAR ---------------- */

  api.registerToolbarButton({
    id: 'layout-2',
    label: '2 Col',
    onClick: () => createLayout(2)
  });

  api.registerToolbarButton({
    id: 'layout-3',
    label: '3 Col',
    onClick: () => createLayout(3)
  });

  /* ---------------- DRAG EVENTS ---------------- */

  onDragStart = ({ el }) => {
    createGhost(el);
  };

  onDragEnd = ({ el }) => {
    const zone = getZoneFromCenter(el);
    removeGhost();

    if (!zone) return;

    const id = el.dataset.pluginId;
    if (!id || id === meta.id || id === 'plugin-manager') return;

    currentApi.mountPlugin(id, zone);
    saveLayout();
  };

  bus.on('plugin:dragstart', onDragStart);
  bus.on('plugin:dragend', onDragEnd);

  loadLayout();
}

/* ---------------- GHOST SYSTEM ---------------- */

function createGhost(el) {
  removeGhost();

  const r = el.getBoundingClientRect();

  ghost = document.createElement('div');
  ghost.className = 'bb-ghost';
  ghost.style.left = r.left + 'px';
  ghost.style.top = r.top + 'px';
  ghost.style.width = r.width + 'px';
  ghost.style.height = r.height + 'px';

  document.body.appendChild(ghost);

  document.addEventListener('mousemove', moveGhost);
}

function moveGhost(e) {
  if (!ghost) return;

  ghost.style.left = e.clientX - ghost.offsetWidth / 2 + 'px';
  ghost.style.top = e.clientY - ghost.offsetHeight / 2 + 'px';

  const zone = getZoneFromPoint(e.clientX, e.clientY);
  highlightZone(zone);
}

function removeGhost() {
  ghost?.remove();
  ghost = null;
  document.removeEventListener('mousemove', moveGhost);
  clearHighlights();
}

/* ---------------- ZONE DETECTION ---------------- */

function getZoneFromPoint(x, y) {
  for (const z of zones) {
    const r = z.getBoundingClientRect();
    if (x > r.left && x < r.right && y > r.top && y < r.bottom) {
      return z;
    }
  }
  return null;
}

function getZoneFromCenter(el) {
  const r = el.getBoundingClientRect();
  return getZoneFromPoint(
    r.left + r.width / 2,
    r.top + r.height / 2
  );
}

function highlightZone(active) {
  zones.forEach(z => {
    z.classList.toggle('highlight', z === active);
  });
}

function clearHighlights() {
  zones.forEach(z => z.classList.remove('highlight'));
}

/* ---------------- LAYOUT ---------------- */

function createLayout(cols) {
  rootEl.innerHTML = '';
  zones = [];

  for (let i = 0; i < cols; i++) {
    const zone = document.createElement('div');
    zone.className = 'bb-zone';
    zone.dataset.zone = i;

    zones.push(zone);
    rootEl.appendChild(zone);

    if (i < cols - 1) {
      const resizer = createResizer(zone);
      rootEl.appendChild(resizer);
    }
  }

  saveLayout();
}

/* ---------------- RESIZER ---------------- */

function createResizer(leftZone) {
  const resizer = document.createElement('div');
  resizer.className = 'bb-resizer';

  let startX, startWidth;

  resizer.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    startWidth = leftZone.offsetWidth;

    function onMove(e) {
      const dx = e.clientX - startX;
      leftZone.style.flex = 'none';
      leftZone.style.width = startWidth + dx + 'px';
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      saveLayout();
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  return resizer;
}

/* ---------------- STORAGE ---------------- */

function saveLayout() {
  if (!currentApi) return;

  const data = zones.map(z => ({
    width: z.style.width || null,
    plugins: [...z.children].map(el => el.dataset.pluginId)
  }));

  currentApi.storage.setForPlugin(meta.id, 'layout', data);
}

function loadLayout() {
  const data = currentApi.storage.getForPlugin(meta.id, 'layout');

  if (!data) {
    createLayout(2);
    return;
  }

  createLayout(data.length);

  data.forEach((zData, i) => {
    const zone = zones[i];

    if (zData.width) {
      zone.style.flex = 'none';
      zone.style.width = zData.width;
    }

    zData.plugins.forEach(id => {
      const el = document.querySelector(`[data-plugin-id="${id}"]`);
      if (el) currentApi.mountPlugin(id, zone);
    });
  });
}

/* ---------------- CLEANUP ---------------- */

export function teardown() {
  if (!currentApi) return;

  currentApi.removeCSS(meta.id);

  currentApi.bus.off('plugin:dragstart', onDragStart);
  currentApi.bus.off('plugin:dragend', onDragEnd);

  currentApi.removeToolbarButton('layout-2');
  currentApi.removeToolbarButton('layout-3');

  removeGhost();

  rootEl = null;
  zones = [];
  currentApi = null;
}