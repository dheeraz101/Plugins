let currentApi = null;
let rootEl = null;
let onDrag, onDrop;

export const meta = {
  id: 'layout-sections',
  name: 'Layout System',
  version: '7.1.1',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  const { container, bus, storage } = api;

  // SYSTEM PERMISSION (important)
  api.setPluginPermissions(meta.id, { isSystem: true });

  // GLOBAL CSS (intentional)
  api.injectCSS(meta.id, `
    .bb-layout-root {
      position: absolute;
      inset: 0;
      index: -1;
      padding: 60px 20px 20px;
      display: grid;
      pointer-events: none;
    }

    .bb-layout-grid {
      display: grid;
      gap: 20px;
      width: 100%;
      height: 100%;
    }

    .bb-zone {
      index: 0;
      border: 2px dashed rgba(255,255,255,0.08);
      border-radius: 14px;
      background: rgba(255,255,255,0.02);
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
  `, { global: true });

  // ROOT
  rootEl = document.createElement('div');
  rootEl.className = 'bb-layout-root';
  container.appendChild(rootEl);

  // BUTTONS
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

  // EVENTS
  onDrag = ({ el }) => {
    const rect = el.getBoundingClientRect();

    document.querySelectorAll('.bb-zone').forEach(z => {
      const r = z.getBoundingClientRect();
      const hit = rect.left < r.right && rect.right > r.left &&
                  rect.top < r.bottom && rect.bottom > r.top;
      z.classList.toggle('highlight', hit);
    });
  };

  onDrop = ({ el }) => {
    if (!el) return;

    const id = el.dataset.pluginId;

    // ❌ BLOCK INVALID
    if (
      !id ||
      id === meta.id ||
      id === 'plugin-manager'
    ) return;

    const er = el.getBoundingClientRect();

    document.querySelectorAll('.bb-zone').forEach(z => {
      const r = z.getBoundingClientRect();

      const cx = er.left + er.width / 2;
      const cy = er.top + er.height / 2;

      const hit = cx > r.left && cx < r.right && cy > r.top && cy < r.bottom;

      const parent = el.parentElement;
      const sameZone = parent === z;

      if (
        hit &&
        !sameZone &&
        !el.contains(z) &&   // 🔥 prevents reverse nesting
        !z.contains(el)      // 🔥 prevents forward nesting
      ) {
        currentApi.mountPlugin(id, z);
      }

      z.classList.remove('highlight');
    });

    saveLayout();
  };

  bus.on('plugin:dragstart', onDrag);
  bus.on('plugin:dragend', onDrop);

  loadLayout();
}

// CREATE
function createLayout(cols) {
  if (!rootEl) return;

  // 🔥 STEP 1: collect existing plugins
  const existing = [...document.querySelectorAll('.bb-zone .bb-plugin-container')];

  // 🔥 STEP 2: rebuild layout
  rootEl.innerHTML = `
    <div class="bb-layout-grid" style="grid-template-columns: repeat(${cols},1fr)">
      ${'<div class="bb-zone"></div>'.repeat(cols)}
    </div>
  `;

  const zones = rootEl.querySelectorAll('.bb-zone');

  // 🔥 STEP 3: re-distribute plugins
  existing.forEach((el, i) => {
    const zone = zones[i % zones.length];
    const id = el.dataset.pluginId;

    if (zone && id) {
      currentApi.mountPlugin(id, zone);
    }
  });

  saveLayout();
}

// SAVE
function saveLayout() {
  if (!currentApi) return;

  const zones = [...document.querySelectorAll('.bb-zone')].map(z =>
    [...z.children].map(c => c.dataset.pluginId)
  );

  currentApi.storage.setForPlugin(meta.id, 'layout', zones);
}

// LOAD
function loadLayout() {
  const data = currentApi.storage.getForPlugin(meta.id, 'layout');
  if (!data) return;

  createLayout(data.length);

  const zones = document.querySelectorAll('.bb-zone');

  data.forEach((ids, i) => {
    ids.forEach(id => {
      const el = document.querySelector(`[data-plugin-id="${id}"]`);
      if (el && zones[i]) {
        currentApi.mountPlugin(id, zones[i]);
        el.dataset.docked = 'true';
      }
    });
  });
}

// CLEANUP
export function teardown() {
  if (!currentApi) return;

  currentApi.removeCSS(meta.id);

  currentApi.bus.off('plugin:dragstart', onDrag);
  currentApi.bus.off('plugin:dragend', onDrop);

  currentApi.removeToolbarButton('layout-2');
  currentApi.removeToolbarButton('layout-3');

  rootEl?.remove();

  rootEl = null;
  currentApi = null;
}