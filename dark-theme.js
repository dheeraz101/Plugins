let currentApi = null;
let styleEl = null;

export const meta = {
  id: 'dark-theme',
  name: 'Dark Theme',
  version: '2.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  const CSS = `
    :root {
      --board-bg: #0a0a12;
      --board-text: #e4e4ed;
      --board-accent: #7c6fff;
      --board-accent-glow: rgba(124,111,255,0.15);
      --board-border: rgba(255,255,255,0.07);
      --board-surface: #12121e;
      --board-surface-hover: #1a1a2e;
      --board-muted: #6b6b80;
      --board-danger: #ff5c5c;
      --board-success: #2ecc71;
      --board-warning: #f5a623;
    }

    body, html {
      background: var(--board-bg) !important;
      color: var(--board-text) !important;
    }

    #board, .board, [class*="board"] {
      background: var(--board-bg) !important;
      color: var(--board-text) !important;
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px) !important;
      background-size: 40px 40px !important;
    }

    /* Plugin boxes */
    .plugin-box, [data-plugin-id] {
      background: var(--board-surface) !important;
      color: var(--board-text) !important;
      border-color: var(--board-border) !important;
    }

    .plugin-box:hover, [data-plugin-id]:hover {
      background: var(--board-surface-hover) !important;
      border-color: rgba(255,255,255,0.12) !important;
    }

    /* Buttons */
    .pm-btn, button:not([style*="background"]) {
      border-radius: 8px !important;
      transition: all 0.15s ease !important;
    }

    .pm-btn.primary, .primary {
      background: var(--board-accent) !important;
      color: #fff !important;
    }

    .pm-btn.secondary, .secondary {
      background: rgba(255,255,255,0.06) !important;
      color: var(--board-text) !important;
      border: 1px solid var(--board-border) !important;
    }

    .pm-btn.danger, .danger {
      background: rgba(255,92,92,0.12) !important;
      color: var(--board-danger) !important;
    }

    /* Scrollbars */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

    /* Selection */
    ::selection { background: var(--board-accent-glow); color: #fff; }

    /* Inputs */
    input, textarea, select {
      background: rgba(255,255,255,0.04) !important;
      border: 1px solid var(--board-border) !important;
      color: var(--board-text) !important;
      border-radius: 8px !important;
    }

    input:focus, textarea:focus, select:focus {
      border-color: var(--board-accent) !important;
      box-shadow: 0 0 0 2px var(--board-accent-glow) !important;
    }

    /* Layout zones */
    .bb-zone {
      border-color: rgba(255,255,255,0.06) !important;
      background: rgba(255,255,255,0.015) !important;
    }

    .bb-zone.highlight {
      border-color: var(--board-accent) !important;
      background: var(--board-accent-glow) !important;
    }
  `;

  if (api.injectCSS) {
    api.injectCSS(meta.id, CSS, { global: true });
  } else {
    styleEl = document.createElement('style');
    styleEl.id = `bb-css-${meta.id}`;
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
  }

  if (api.notify) api.notify('🌙 Dark theme applied', 'success', 2000);
}

export function teardown() {
  if (currentApi?.removeCSS) {
    currentApi.removeCSS(meta.id);
  } else if (styleEl) {
    styleEl.remove();
    styleEl = null;
  }
  currentApi = null;
}
