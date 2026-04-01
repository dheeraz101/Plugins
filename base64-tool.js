let currentApi = null;

export const meta = {
  id: 'base64-tool',
  name: 'Base64 Encoder',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .b64-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; display: flex; flex-direction: column; font-family: system-ui, sans-serif; overflow: hidden; }
    .b64-header { padding: 12px 16px; border-bottom: 1px solid #2a2a4a; color: #fff; font-size: 14px; font-weight: 600; }
    .b64-body { flex: 1; display: flex; flex-direction: column; padding: 12px; gap: 8px; }
    .b64-label { color: #888; font-size: 12px; }
    .b64-textarea { flex: 1; background: #252540; border: 1px solid #333; border-radius: 8px; color: #ddd; padding: 10px; font-size: 13px; font-family: 'Fira Code', monospace; outline: none; resize: none; }
    .b64-actions { display: flex; gap: 8px; }
    .b64-btn { flex: 1; padding: 8px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; }
    .b64-encode { background: #e94560; color: #fff; }
    .b64-decode { background: #7c6fff; color: #fff; }
    .b64-swap { background: #333; color: #aaa; width: 40px; flex: 0; }
    .b64-error { color: #e94560; font-size: 12px; padding: 4px 0; }
  `);

  const container = api.container;

  function render() {
    container.innerHTML = `
      <div class="b64-widget">
        <div class="b64-header">🔐 Base64 Encoder / Decoder</div>
        <div class="b64-body">
          <div class="b64-label">Input (plain text)</div>
          <textarea class="b64-textarea" id="b64-input" placeholder="Enter text to encode..."></textarea>
          <div class="b64-actions">
            <button class="b64-btn b64-encode" id="b64-enc">Encode →</button>
            <button class="b64-btn b64-decode" id="b64-dec">← Decode</button>
            <button class="b64-btn b64-swap" id="b64-swap">⇅</button>
          </div>
          <div class="b64-label">Output</div>
          <textarea class="b64-textarea" id="b64-output" placeholder="Result will appear here..."></textarea>
          <div class="b64-error" id="b64-error"></div>
        </div>
      </div>
    `;

    const input = container.querySelector('#b64-input');
    const output = container.querySelector('#b64-output');
    const error = container.querySelector('#b64-error');

    container.querySelector('#b64-enc').addEventListener('click', () => {
      try {
        output.value = btoa(unescape(encodeURIComponent(input.value)));
        error.textContent = '';
      } catch (e) { error.textContent = '❌ ' + e.message; }
    });

    container.querySelector('#b64-dec').addEventListener('click', () => {
      try {
        input.value = decodeURIComponent(escape(atob(output.value)));
        error.textContent = '';
      } catch (e) { error.textContent = '❌ Invalid Base64 string'; }
    });

    container.querySelector('#b64-swap').addEventListener('click', () => {
      const tmp = input.value;
      input.value = output.value;
      output.value = tmp;
    });
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
