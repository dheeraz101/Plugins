let currentApi = null;

export const meta = {
  id: 'json-formatter',
  name: 'JSON Formatter',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  const saved = api.storage.getForPlugin(meta.id, 'json') || '{"name": "Blank Board", "version": "1.0", "plugins": ["clock", "notes"]}';

  api.injectCSS(meta.id, `
    .jf-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; display: flex; flex-direction: column; font-family: system-ui, sans-serif; overflow: hidden; }
    .jf-header { display: flex; gap: 8px; padding: 10px; border-bottom: 1px solid #2a2a4a; align-items: center; }
    .jf-title { color: #fff; font-size: 14px; font-weight: 600; flex: 1; }
    .jf-btn { padding: 6px 12px; background: #252540; color: #aaa; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .jf-btn:hover { background: #333355; color: #fff; }
    .jf-btn.primary { background: #e94560; color: #fff; }
    .jf-body { flex: 1; display: flex; flex-direction: column; }
    .jf-textarea { flex: 1; background: transparent; border: none; outline: none; resize: none; padding: 12px; color: #ddd; font-size: 13px; font-family: 'Fira Code', monospace; line-height: 1.5; }
    .jf-output { flex: 1; padding: 12px; overflow: auto; font-family: 'Fira Code', monospace; font-size: 13px; line-height: 1.5; }
    .jf-error { color: #e94560; padding: 12px; font-size: 13px; }
    .jf-key { color: #e94560; }
    .jf-string { color: #2ecc71; }
    .jf-number { color: #f39c12; }
    .jf-bool { color: #7c6fff; }
    .jf-null { color: #888; }
  `);

  const container = api.container;
  let indent = 2;

  function syntaxHighlight(json) {
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
      let cls = 'jf-number';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'jf-key' : 'jf-string';
      } else if (/true|false/.test(match)) {
        cls = 'jf-bool';
      } else if (/null/.test(match)) {
        cls = 'jf-null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  }

  function render() {
    const json = api.storage.getForPlugin(meta.id, 'json') || saved;
    let formatted = '', error = '';
    try {
      formatted = JSON.stringify(JSON.parse(json), null, indent);
    } catch (e) {
      error = e.message;
    }

    container.innerHTML = `
      <div class="jf-widget">
        <div class="jf-header">
          <span class="jf-title">JSON Formatter</span>
          <button class="jf-btn" id="jf-2">2 spaces</button>
          <button class="jf-btn" id="jf-4">4 spaces</button>
          <button class="jf-btn" id="jf-min">Minify</button>
          <button class="jf-btn primary" id="jf-copy">Copy</button>
        </div>
        <div class="jf-body">
          <textarea class="jf-textarea" id="jf-input" placeholder="Paste JSON here...">${json}</textarea>
          ${error ? `<div class="jf-error">❌ ${error}</div>` : `<div class="jf-output"><pre style="margin:0;white-space:pre-wrap">${syntaxHighlight(formatted)}</pre></div>`}
        </div>
      </div>
    `;

    const input = container.querySelector('#jf-input');
    const saveDebounced = api.debounce((val) => api.storage.setForPlugin(meta.id, 'json', val), 400);
    input.addEventListener('input', e => saveDebounced(e.target.value));

    container.querySelector('#jf-2').addEventListener('click', () => { indent = 2; render(); });
    container.querySelector('#jf-4').addEventListener('click', () => { indent = 4; render(); });
    container.querySelector('#jf-min').addEventListener('click', () => { indent = 0; render(); });
    container.querySelector('#jf-copy').addEventListener('click', () => {
      try {
        navigator.clipboard.writeText(JSON.stringify(JSON.parse(input.value), null, indent));
        api.notify('JSON copied!', 'success');
      } catch { api.notify('Invalid JSON', 'error'); }
    });
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
