let currentApi = null;

export const meta = {
  id: 'dark-theme',
  name: 'Dark Theme',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    :root {
      --board-bg: #0d0d1a !important;
    }
    #board {
      background: #0d0d1a !important;
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px) !important;
      background-size: 40px 40px !important;
    }
    body {
      background: #0d0d1a !important;
    }
  `, { global: true });

  api.notify('🌙 Dark theme applied!', 'success', 2000);
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
