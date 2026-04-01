let currentApi = null;

export const meta = {
  id: 'color-picker',
  name: 'Color Picker',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .cp-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; padding: 16px; box-sizing: border-box; font-family: system-ui, sans-serif; }
    .cp-preview { width: 100%; height: 80px; border-radius: 10px; margin-bottom: 12px; border: 2px solid #333; }
    .cp-label { color: #888; font-size: 12px; margin-bottom: 4px; }
    .cp-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cp-row input[type=range] { flex: 1; accent-color: #e94560; }
    .cp-row .cp-val { color: #fff; font-size: 13px; width: 36px; text-align: right; font-variant-numeric: tabular-nums; }
    .cp-hex-row { display: flex; gap: 8px; margin-top: 8px; }
    .cp-hex { flex: 1; padding: 8px; background: #252540; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; font-family: monospace; text-align: center; }
    .cp-copy { padding: 8px 14px; background: #e94560; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
  `);

  const container = api.container;
  let r = 233, g = 69, b = 96;

  function render() {
    const hex = '#' + [r,g,b].map(c => c.toString(16).padStart(2,'0')).join('');
    container.innerHTML = `
      <div class="cp-widget">
        <div class="cp-preview" style="background:${hex}"></div>
        <div class="cp-label">Red</div>
        <div class="cp-row"><input type="range" min="0" max="255" value="${r}" id="cp-r"><span class="cp-val">${r}</span></div>
        <div class="cp-label">Green</div>
        <div class="cp-row"><input type="range" min="0" max="255" value="${g}" id="cp-g"><span class="cp-val">${g}</span></div>
        <div class="cp-label">Blue</div>
        <div class="cp-row"><input type="range" min="0" max="255" value="${b}" id="cp-b"><span class="cp-val">${b}</span></div>
        <div class="cp-hex-row">
          <input class="cp-hex" value="${hex}" readonly id="cp-hex">
          <button class="cp-copy" id="cp-copy">Copy</button>
        </div>
      </div>
    `;

    container.querySelector('#cp-r').addEventListener('input', e => { r = +e.target.value; render(); });
    container.querySelector('#cp-g').addEventListener('input', e => { g = +e.target.value; render(); });
    container.querySelector('#cp-b').addEventListener('input', e => { b = +e.target.value; render(); });
    container.querySelector('#cp-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(hex);
      api.notify('Color copied: ' + hex, 'success');
    });
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
