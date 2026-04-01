let currentApi = null;

export const meta = {
  id: 'password-generator',
  name: 'Password Generator',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .pg-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; padding: 20px; box-sizing: border-box; font-family: system-ui, sans-serif; }
    .pg-title { color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 16px; }
    .pg-output { background: #252540; border-radius: 10px; padding: 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
    .pg-password { flex: 1; color: #2ecc71; font-size: 18px; font-family: 'Fira Code', monospace; word-break: break-all; }
    .pg-copy { padding: 6px 14px; background: #e94560; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; }
    .pg-field { margin-bottom: 12px; }
    .pg-label { color: #888; font-size: 12px; margin-bottom: 6px; display: flex; justify-content: space-between; }
    .pg-slider { width: 100%; accent-color: #e94560; }
    .pg-checks { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .pg-check { display: flex; align-items: center; gap: 6px; color: #ccc; font-size: 13px; cursor: pointer; }
    .pg-check input { accent-color: #e94560; }
    .pg-gen { width: 100%; padding: 10px; background: #e94560; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 700; }
    .pg-strength { margin-top: 10px; height: 4px; border-radius: 2px; background: #333; overflow: hidden; }
    .pg-strength-bar { height: 100%; border-radius: 2px; transition: all 0.3s; }
  `);

  const container = api.container;
  let length = 16, upper = true, lower = true, nums = true, symbols = true;

  function generate() {
    let chars = '';
    if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (nums) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
    let pw = '';
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    for (let i = 0; i < length; i++) pw += chars[arr[i] % chars.length];
    return pw;
  }

  function strength(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (pw.length >= 16) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[a-z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }

  function render() {
    const pw = generate();
    const str = strength(pw);
    const pct = (str / 7) * 100;
    const color = pct < 40 ? '#e94560' : pct < 70 ? '#f39c12' : '#2ecc71';

    container.innerHTML = `
      <div class="pg-widget">
        <div class="pg-title">🔑 Password Generator</div>
        <div class="pg-output">
          <div class="pg-password">${pw}</div>
          <button class="pg-copy" id="pg-copy">Copy</button>
        </div>
        <div class="pg-field">
          <div class="pg-label"><span>Length</span><span>${length}</span></div>
          <input type="range" class="pg-slider" min="6" max="64" value="${length}" id="pg-len">
        </div>
        <div class="pg-checks">
          <label class="pg-check"><input type="checkbox" ${upper?'checked':''} id="pg-upper"> A-Z</label>
          <label class="pg-check"><input type="checkbox" ${lower?'checked':''} id="pg-lower"> a-z</label>
          <label class="pg-check"><input type="checkbox" ${nums?'checked':''} id="pg-nums"> 0-9</label>
          <label class="pg-check"><input type="checkbox" ${symbols?'checked':''} id="pg-sym"> !@#$</label>
        </div>
        <button class="pg-gen" id="pg-gen">⚡ Generate New</button>
        <div class="pg-strength"><div class="pg-strength-bar" style="width:${pct}%;background:${color}"></div></div>
      </div>
    `;

    container.querySelector('#pg-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(pw);
      api.notify('Password copied!', 'success');
    });
    container.querySelector('#pg-gen').addEventListener('click', render);
    container.querySelector('#pg-len').addEventListener('input', e => { length = +e.target.value; render(); });
    container.querySelector('#pg-upper').addEventListener('change', e => { upper = e.target.checked; render(); });
    container.querySelector('#pg-lower').addEventListener('change', e => { lower = e.target.checked; render(); });
    container.querySelector('#pg-nums').addEventListener('change', e => { nums = e.target.checked; render(); });
    container.querySelector('#pg-sym').addEventListener('change', e => { symbols = e.target.checked; render(); });
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
