let currentApi = null;
let rootEl = null;
let zones = [];
let onDrag, onDrop;

export const meta = {
  id: 'layout-sections',
  name: 'Layout System',
  version: '8.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  const { container, bus } = api;

  api.setPluginPermissions(meta.id, { isSystem: true });

  // ✅ SAFE GLOBAL CSS (no plugin override)
  api.injectCSS(meta.id, `
    .bb-layout-root {
      position: absolute;
      inset: 0;
      padding: 60px 20px 20px;
      display: flex;
      flex-direction: column;
      pointer-events: none;
      z-index: 0;
    }

    .bb-layout-grid {
      display: grid;
      gap: 20px;
      width: 100%;
      height: 100%;
      flex: 1;
    }

    .bb-zone {
      min-height: 120px;
      border: 2px dashed rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.04);
      border-radius: 14px;
      transition: 0.2s;
      pointer-events: auto;
      display: flex;
    }

    .bb-zone.highlight {
      border-color: #7c6fff;
      background: rgba(124,111,255,0.15);
      transform: scale(1.02);
    }

    .bb-zone > .bb-plugin-container {
      position: relative !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      transform: none !important;
    }

    .bb-zone:empty::after {
      content: "Drop here";
      margin: auto;
      font-size: 12px;
      opacity: 0.4;
    }
  `, { global: true });

  // ✅ USE CONTAINER (no board hacks)
  container.innerHTML = `<div class="bb-layout-root"></div>`;
  rootEl = container.firstChild;

  // Toolbar
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

  // Events
  onDrag = ({ el }) => {
    const zone = getZoneFromCenter(el);
    highlightZones(zone);
  };

  onDrop = ({ el }) => {
    if (!el) return;

    const id = el.dataset.pluginId;
    if (!id || id === meta.id || id === 'plugin-manager') return;

    const zone = getZoneFromCenter(el);
    if (!zone) return;

    if (el.parentElement === zone) return;

    currentApi.mountPlugin(id, zone);
    clearHighlights();
    saveLayout();
  };

  bus.on('plugin:dragstart', onDrag);
  bus.on('plugin:dragend', onDrop);

  loadLayout();
}

/* ------------------ CORE LOGIC ------------------ */

// ✅ CENTER POINT DETECTION ONLY
function getZoneFromCenter(el) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  for (const z of zones) {
    const zr = z.getBoundingClientRect();
    if (cx > zr.left && cx < zr.right && cy > zr.top && cy < zr.bottom) {
      return z;
    }
  }
  return null;
}

function highlightZones(activeZone) {
  zones.forEach(z => {
    z.classList.toggle('highlight', z === activeZone);
  });
}

function clearHighlights() {
  zones.forEach(z => z.classList.remove('highlight'));
}

/* ------------------ LAYOUT ------------------ */

function createLayout(cols) {
  if (!rootEl) return;

  // collect existing plugin ids
  const existing = zones.flatMap(z =>
    [...z.children].map(el => el.dataset.pluginId)
  );

  // rebuild clean
  rootEl.innerHTML = `
    <div class="bb-layout-grid" style="grid-template-columns: repeat(${cols},1fr)">
      ${Array.from({ length: cols }, (_, i) =>
        `<div class="bb-zone" data-zone="${i}"></div>`
      ).join('')}
    </div>
  `;

  zones = [...rootEl.querySelectorAll('.bb-zone')];

  // redistribute safely
  existing.forEach((id, i) => {
    const zone = zones[i % zones.length];
    if (zone && id) {
      currentApi.mountPlugin(id, zone);
    }
  });

  saveLayout();
}

/* ------------------ STORAGE ------------------ */

function saveLayout() {
  if (!currentApi) return;

  const data = zones.map(z =>
    [...z.children].map(el => el.dataset.pluginId)
  );

  currentApi.storage.setForPlugin(meta.id, 'layout', data);
}

function loadLayout() {
  const data = currentApi.storage.getForPlugin(meta.id, 'layout');

  if (!data) {
    createLayout(2); // default
    return;
  }

  createLayout(data.length);

  data.forEach((pluginIds, i) => {
    pluginIds.forEach(id => {
      const el = document.querySelector(`[data-plugin-id="${id}"]`);
      if (el && zones[i]) {
        currentApi.mountPlugin(id, zones[i]);
      }
    });
  });
}

/* ------------------ CLEANUP ------------------ */

export function teardown() {
  if (!currentApi) return;

  currentApi.removeCSS(meta.id);

  currentApi.bus.off('plugin:dragstart', onDrag);
  currentApi.bus.off('plugin:dragend', onDrop);

  currentApi.removeToolbarButton('layout-2');
  currentApi.removeToolbarButton('layout-3');

  rootEl = null;
  zones = [];
  currentApi = null;
}