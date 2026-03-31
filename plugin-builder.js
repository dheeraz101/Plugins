export const meta = {
  id: 'plugin-builder',
  name: 'Plugin Builder',
  version: '1.0.0',
  compat: '>=3.3.0'
};

let currentApi = null;
let builderEl = null;

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .pb-root {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #111;
      color: #e0e0e0;
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 13px;
      border-radius: 12px;
      overflow: hidden;
    }

    .pb-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: #1a1a1e;
      border-bottom: 1px solid #2a2a2e;
      flex-shrink: 0;
    }

    .pb-toolbar .pb-title {
      font-weight: 700;
      font-size: 14px;
      color: #7c6fff;
      margin-right: auto;
      font-family: system-ui, sans-serif;
    }

    .pb-btn {
      padding: 6px 12px;
      border: 1px solid #333;
      border-radius: 6px;
      background: #222;
      color: #ccc;
      cursor: pointer;
      font-size: 12px;
      font-family: system-ui, sans-serif;
      transition: all 0.15s;
    }

    .pb-btn:hover { background: #333; color: #fff; }
    .pb-btn.primary { background: #7c6fff; border-color: #7c6fff; color: #fff; }
    .pb-btn.primary:hover { background: #6a5ce0; }
    .pb-btn.danger { background: #e5484d22; border-color: #e5484d; color: #ff6b6b; }
    .pb-btn.danger:hover { background: #e5484d44; }
    .pb-btn.success { background: #2ecc7122; border-color: #2ecc71; color: #2ecc71; }
    .pb-btn.success:hover { background: #2ecc7144; }

    .pb-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .pb-editor-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #2a2a2e;
      min-width: 0;
    }

    .pb-tabs {
      display: flex;
      background: #161618;
      border-bottom: 1px solid #2a2a2e;
      flex-shrink: 0;
    }

    .pb-tab {
      padding: 8px 16px;
      border: none;
      background: none;
      color: #666;
      cursor: pointer;
      font-size: 12px;
      font-family: system-ui, sans-serif;
      border-bottom: 2px solid transparent;
      transition: all 0.15s;
    }

    .pb-tab:hover { color: #aaa; }
    .pb-tab.active { color: #7c6fff; border-bottom-color: #7c6fff; }

    .pb-editor-wrap {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    .pb-editor {
      width: 100%;
      height: 100%;
      background: #0d0d0d;
      color: #e0e0e0;
      border: none;
      outline: none;
      resize: none;
      padding: 16px;
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 13px;
      line-height: 1.6;
      tab-size: 2;
      white-space: pre;
      overflow: auto;
    }

    .pb-meta-form {
      padding: 16px;
      display: none;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
      flex: 1;
    }

    .pb-meta-form.active { display: flex; }
    .pb-editor-wrap.hidden { display: none; }

    .pb-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .pb-field label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: system-ui, sans-serif;
    }

    .pb-field input,
    .pb-field select,
    .pb-field textarea {
      background: #1a1a1e;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 8px 10px;
      color: #e0e0e0;
      font-size: 13px;
      font-family: inherit;
      outline: none;
    }

    .pb-field input:focus,
    .pb-field select:focus,
    .pb-field textarea:focus {
      border-color: #7c6fff;
    }

    .pb-preview-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .pb-preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      background: #161618;
      border-bottom: 1px solid #2a2a2e;
      flex-shrink: 0;
    }

    .pb-preview-header span {
      font-size: 12px;
      color: #888;
      font-family: system-ui, sans-serif;
    }

    .pb-preview-area {
      flex: 1;
      position: relative;
      background: #f8f9fa;
      overflow: hidden;
    }

    .pb-preview-board {
      width: 100%;
      height: 100%;
      position: relative;
      background-image:
        linear-gradient(#ddd 1px, transparent 1px),
        linear-gradient(90deg, #ddd 1px, transparent 1px);
      background-size: 40px 40px;
    }

    .pb-console {
      height: 140px;
      flex-shrink: 0;
      border-top: 1px solid #2a2a2e;
      background: #0a0a0a;
      display: flex;
      flex-direction: column;
    }

    .pb-console-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 14px;
      background: #161618;
      border-bottom: 1px solid #2a2a2e;
      flex-shrink: 0;
    }

    .pb-console-header span {
      font-size: 11px;
      color: #888;
      font-family: system-ui, sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .pb-console-output {
      flex: 1;
      overflow-y: auto;
      padding: 8px 14px;
      font-size: 12px;
      line-height: 1.5;
    }

    .pb-console-line {
      margin-bottom: 2px;
      display: flex;
      gap: 8px;
    }

    .pb-console-line .pb-log-tag {
      color: #555;
      flex-shrink: 0;
    }

    .pb-console-line.log { color: #aaa; }
    .pb-console-line.warn { color: #f39c12; }
    .pb-console-line.error { color: #e74c3c; }
    .pb-console-line.success { color: #2ecc71; }

    .pb-resizer {
      width: 4px;
      cursor: col-resize;
      background: #2a2a2e;
      flex-shrink: 0;
      transition: background 0.15s;
    }

    .pb-resizer:hover { background: #7c6fff; }

    .pb-templates-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
    }

    .pb-template-card {
      background: #1a1a1e;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .pb-template-card:hover {
      border-color: #7c6fff;
      background: #222;
    }

    .pb-template-card .pb-tpl-name {
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 4px;
      font-family: system-ui, sans-serif;
    }

    .pb-template-card .pb-tpl-desc {
      font-size: 11px;
      color: #888;
      font-family: system-ui, sans-serif;
    }

    .pb-editor::-webkit-scrollbar,
    .pb-console-output::-webkit-scrollbar,
    .pb-meta-form::-webkit-scrollbar {
      width: 6px;
    }

    .pb-editor::-webkit-scrollbar-track,
    .pb-console-output::-webkit-scrollbar-track,
    .pb-meta-form::-webkit-scrollbar-track {
      background: transparent;
    }

    .pb-editor::-webkit-scrollbar-thumb,
    .pb-console-output::-webkit-scrollbar-thumb,
    .pb-meta-form::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
    }
  `);

  // ── TEMPLATES ──
  const TEMPLATES = {
    blank: {
      name: 'Blank Plugin',
      desc: 'Empty starter',
      code: `export const meta = {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  compat: '>=3.3.0'
};

let currentApi = null;

export function setup(api) {
  currentApi = api;
  const container = api.container;

  container.innerHTML = \`
    <div style="padding: 20px; background: #1a1a2e; color: #eee; border-radius: 12px; font-family: system-ui;">
      <h3 style="margin: 0 0 10px 0;">Hello World</h3>
      <p>My first plugin!</p>
    </div>
  \`;
}

export function teardown() {
  currentApi?.removeCSS(meta.id);
}`
    },
    counter: {
      name: 'Counter',
      desc: 'Click counter with save',
      code: `export const meta = {
  id: 'my-counter',
  name: 'Counter',
  version: '1.0.0',
  compat: '>=3.3.0'
};

let currentApi = null;

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, \`
    .ctr-widget {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 24px;
      border-radius: 16px;
      text-align: center;
      font-family: system-ui;
    }
    .ctr-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 18px;
      cursor: pointer;
      margin: 4px;
    }
    .ctr-btn:hover { background: rgba(255,255,255,0.3); }
  \`);

  let count = api.storage.getForPlugin(meta.id, 'count') || 0;

  const container = api.container;
  container.innerHTML = \`
    <div class="ctr-widget">
      <div style="font-size: 14px; opacity: 0.8;">Counter</div>
      <div id="ctr-val" style="font-size: 48px; font-weight: 700; margin: 16px 0;">\${count}</div>
      <button class="ctr-btn" id="ctr-inc">+1</button>
      <button class="ctr-btn" id="ctr-reset">Reset</button>
    </div>
  \`;

  container.querySelector('#ctr-inc').addEventListener('click', () => {
    count++;
    container.querySelector('#ctr-val').textContent = count;
    api.storage.setForPlugin(meta.id, 'count', count);
    api.bus.emit('counter:changed', { value: count });
    api.notify('Count: ' + count, 'info', 1000);
  });

  container.querySelector('#ctr-reset').addEventListener('click', () => {
    count = 0;
    container.querySelector('#ctr-val').textContent = 0;
    api.storage.setForPlugin(meta.id, 'count', 0);
    api.notify('Reset!', 'success');
  });
}

export function teardown() {
  currentApi?.removeCSS(meta.id);
}`
    },
    notes: {
      name: 'Sticky Note',
      desc: 'Text note with auto-save',
      code: `export const meta = {
  id: 'my-sticky-note',
  name: 'Sticky Note',
  version: '1.0.0',
  compat: '>=3.3.0'
};

let currentApi = null;
let saveTimer = null;

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, \`
    .sn-note {
      width: 100%;
      height: 100%;
      background: #fffde7;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .sn-note textarea {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      resize: none;
      padding: 16px;
      font-size: 14px;
      font-family: 'Comic Sans MS', cursive, system-ui;
      color: #333;
      line-height: 1.5;
    }
  \`);

  const saved = api.storage.getForPlugin(meta.id, 'text') || '';

  const container = api.container;
  container.innerHTML = \`
    <div class="sn-note">
      <textarea placeholder="Write your note...">\${saved}</textarea>
    </div>
  \`;

  const textarea = container.querySelector('textarea');

  const debouncedSave = api.debounce((val) => {
    api.storage.setForPlugin(meta.id, 'text', val);
    api.notify('Saved', 'success', 1000);
  }, 500);

  textarea.addEventListener('input', (e) => {
    debouncedSave(e.target.value);
  });
}

export function teardown() {
  currentApi?.removeCSS(meta.id);
}`
    },
    clock: {
      name: 'Clock',
      desc: 'Live clock widget',
      code: `export const meta = {
  id: 'my-clock',
  name: 'Clock',
  version: '1.0.0',
  compat: '>=3.3.0'
};

let currentApi = null;
let interval = null;

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, \`
    .clk-widget {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #0f0f23;
      border-radius: 14px;
      font-family: monospace;
    }
    .clk-time {
      color: #7c6fff;
      font-weight: bold;
    }
    .clk-date {
      color: #666;
      font-size: 12px;
      margin-top: 8px;
    }
  \`);

  const container = api.container;
  container.innerHTML = \`
    <div class="clk-widget">
      <div class="clk-time" id="clk-time"></div>
      <div class="clk-date" id="clk-date"></div>
    </div>
  \`;

  function update() {
    const now = new Date();
    const timeEl = container.querySelector('#clk-time');
    const dateEl = container.querySelector('#clk-date');
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString();
      timeEl.style.fontSize = Math.max(container.offsetWidth / 6, 16) + 'px';
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }
  }

  interval = setInterval(update, 1000);
  update();
}

export function teardown() {
  clearInterval(interval);
  currentApi?.removeCSS(meta.id);
}`
    },
    apiDemo: {
      name: 'API Explorer',
      desc: 'Shows all API features',
      code: `export const meta = {
  id: 'api-explorer',
  name: 'API Explorer',
  version: '1.0.0',
  compat: '>=3.3.0'
};

let currentApi = null;

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, \`
    .ae-root {
      background: #111;
      color: #eee;
      padding: 20px;
      border-radius: 12px;
      font-family: system-ui;
      font-size: 13px;
      line-height: 1.6;
    }
    .ae-section { margin-bottom: 16px; }
    .ae-title { color: #7c6fff; font-weight: 700; margin-bottom: 6px; }
    .ae-btn {
      padding: 6px 12px;
      background: #7c6fff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin: 2px;
      font-size: 12px;
    }
    .ae-btn:hover { background: #6a5ce0; }
  \`);

  const container = api.container;
  container.innerHTML = \`
    <div class="ae-root">
      <div class="ae-section">
        <div class="ae-title">🔔 Notifications</div>
        <button class="ae-btn" data-type="info">Info</button>
        <button class="ae-btn" data-type="success">Success</button>
        <button class="ae-btn" data-type="warning">Warning</button>
        <button class="ae-btn" data-type="error">Error</button>
      </div>
      <div class="ae-section">
        <div class="ae-title">💾 Storage</div>
        <button class="ae-btn" id="ae-save">Save Test</button>
        <button class="ae-btn" id="ae-load">Load Test</button>
      </div>
      <div class="ae-section">
        <div class="ae-title">📡 Events</div>
        <button class="ae-btn" id="ae-emit">Emit Event</button>
        <span id="ae-event-log" style="color:#2ecc71;font-size:11px;"></span>
      </div>
      <div class="ae-section">
        <div class="ae-title">ℹ️ API Info</div>
        <div style="color:#888;font-size:12px;">
          Version: \\\${api.version}<br>
          Plugin ID: \\\${api.getPluginId()}
        </div>
      </div>
    </div>
  \`;

  container.querySelector('[data-type="info"]').onclick = () => api.notify('Info notification', 'info');
  container.querySelector('[data-type="success"]').onclick = () => api.notify('Success!', 'success');
  container.querySelector('[data-type="warning"]').onclick = () => api.notify('Warning!', 'warning');
  container.querySelector('[data-type="error"]').onclick = () => api.notify('Error!', 'error');

  container.querySelector('#ae-save').onclick = () => {
    api.storage.setForPlugin(meta.id, 'test', { time: Date.now() });
    api.notify('Saved!', 'success', 1500);
  };

  container.querySelector('#ae-load').onclick = () => {
    const data = api.storage.getForPlugin(meta.id, 'test');
    api.notify(data ? JSON.stringify(data) : 'No data found', 'info', 3000);
  };

  container.querySelector('#ae-emit').onclick = () => {
    api.bus.emit('explorer:test', { hello: true, time: Date.now() });
    const log = container.querySelector('#ae-event-log');
    log.textContent = '✓ Event emitted!';
    setTimeout(() => log.textContent = '', 2000);
  };
}

export function teardown() {
  currentApi?.removeCSS(meta.id);
}`
    }
  };

  let currentCode = TEMPLATES.blank.code;
  let activeTab = 'code';

  // ── BUILD UI ──
  builderEl = document.createElement('div');
  builderEl.className = 'pb-root';

  builderEl.innerHTML = `
    <div class="pb-toolbar">
      <span class="pb-title">🔧 Plugin Builder</span>
      <button class="pb-btn" id="pb-templates-btn">📋 Templates</button>
      <button class="pb-btn success" id="pb-run-btn">▶ Run</button>
      <button class="pb-btn primary" id="pb-export-btn">⬇ Export .js</button>
      <button class="pb-btn danger" id="pb-clear-btn">🗑 Clear</button>
    </div>
    <div class="pb-body">
      <div class="pb-editor-pane">
        <div class="pb-tabs">
          <button class="pb-tab active" data-tab="code">Code</button>
          <button class="pb-tab" data-tab="meta">Meta</button>
          <button class="pb-tab" data-tab="templates">Templates</button>
        </div>
        <div class="pb-editor-wrap" id="pb-code-panel">
          <textarea class="pb-editor" id="pb-editor" spellcheck="false"></textarea>
        </div>
        <div class="pb-meta-form" id="pb-meta-panel">
          <div class="pb-field">
            <label>Plugin ID (kebab-case)</label>
            <input id="pb-meta-id" placeholder="my-plugin" />
          </div>
          <div class="pb-field">
            <label>Display Name</label>
            <input id="pb-meta-name" placeholder="My Plugin" />
          </div>
          <div class="pb-field">
            <label>Version</label>
            <input id="pb-meta-version" placeholder="1.0.0" />
          </div>
          <div class="pb-field">
            <label>Compatibility</label>
            <input id="pb-meta-compat" placeholder=">=3.3.0" />
          </div>
          <div class="pb-field">
            <label>Apply Meta to Code</label>
            <button class="pb-btn primary" id="pb-apply-meta">Apply</button>
          </div>
        </div>
        <div class="pb-meta-form" id="pb-templates-panel">
          <div style="font-size:13px;color:#aaa;font-family:system-ui;margin-bottom:4px;">Pick a template to start:</div>
          <div class="pb-templates-grid" id="pb-tpl-grid"></div>
        </div>
      </div>
      <div class="pb-resizer" id="pb-resizer"></div>
      <div class="pb-preview-pane">
        <div class="pb-preview-header">
          <span>Preview</span>
          <button class="pb-btn" id="pb-reload-preview" style="padding:3px 8px;font-size:11px;">↻ Reload</button>
        </div>
        <div class="pb-preview-area">
          <div class="pb-preview-board" id="pb-preview-board"></div>
        </div>
      </div>
    </div>
    <div class="pb-console">
      <div class="pb-console-header">
        <span>Console</span>
        <button class="pb-btn" id="pb-clear-console" style="padding:2px 8px;font-size:11px;">Clear</button>
      </div>
      <div class="pb-console-output" id="pb-console-output"></div>
    </div>
  `;

  const container = api.container;
  container.appendChild(builderEl);

  const editor = builderEl.querySelector('#pb-editor');
  const previewBoard = builderEl.querySelector('#pb-preview-board');
  const consoleOutput = builderEl.querySelector('#pb-console-output');

  editor.value = currentCode;

  // ── CONSOLE ──
  function logToConsole(level, ...args) {
    const line = document.createElement('div');
    line.className = `pb-console-line ${level}`;
    const tag = document.createElement('span');
    tag.className = 'pb-log-tag';
    tag.textContent = level === 'log' ? '›' : level === 'warn' ? '⚠' : level === 'error' ? '✕' : '✓';
    const text = document.createElement('span');
    text.textContent = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
    line.appendChild(tag);
    line.appendChild(text);
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  builderEl.querySelector('#pb-clear-console').onclick = () => {
    consoleOutput.innerHTML = '';
  };

  // ── TABS ──
  builderEl.querySelectorAll('.pb-tab').forEach(tab => {
    tab.onclick = () => {
      builderEl.querySelectorAll('.pb-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const codePanel = builderEl.querySelector('#pb-code-panel');
      const metaPanel = builderEl.querySelector('#pb-meta-panel');
      const tplPanel = builderEl.querySelector('#pb-templates-panel');

      codePanel.classList.add('hidden');
      metaPanel.classList.remove('active');
      tplPanel.classList.remove('active');
      codePanel.style.display = 'none';

      if (tab.dataset.tab === 'code') {
        codePanel.classList.remove('hidden');
        codePanel.style.display = 'block';
      } else if (tab.dataset.tab === 'meta') {
        metaPanel.classList.add('active');
      } else if (tab.dataset.tab === 'templates') {
        tplPanel.classList.add('active');
      }
    };
  });

  // ── TEMPLATES ──
  const tplGrid = builderEl.querySelector('#pb-tpl-grid');
  Object.entries(TEMPLATES).forEach(([key, tpl]) => {
    const card = document.createElement('div');
    card.className = 'pb-template-card';
    card.innerHTML = `
      <div class="pb-tpl-name">${tpl.name}</div>
      <div class="pb-tpl-desc">${tpl.desc}</div>
    `;
    card.onclick = () => {
      editor.value = tpl.code;
      currentCode = tpl.code;
      api.notify(`Template "${tpl.name}" loaded`, 'success', 1500);
      builderEl.querySelector('[data-tab="code"]').click();
      runPreview();
    };
    tplGrid.appendChild(card);
  });

  builderEl.querySelector('#pb-templates-btn').onclick = () => {
    builderEl.querySelector('[data-tab="templates"]').click();
  };

  // ── META APPLY ──
  builderEl.querySelector('#pb-apply-meta').onclick = () => {
    const id = builderEl.querySelector('#pb-meta-id').value.trim();
    const name = builderEl.querySelector('#pb-meta-name').value.trim();
    const version = builderEl.querySelector('#pb-meta-version').value.trim();
    const compat = builderEl.querySelector('#pb-meta-compat').value.trim();

    if (!id || !name || !version) {
      api.notify('ID, Name, and Version are required', 'error');
      return;
    }

    let code = editor.value;

    const metaRegex = /export\s+const\s+meta\s*=\s*\{[\s\S]*?\};/;
    let metaStr = `export const meta = {\n  id: '${id}',\n  name: '${name}',\n  version: '${version}'`;
    if (compat) metaStr += `,\n  compat: '${compat}'`;
    metaStr += `\n};`;

    if (metaRegex.test(code)) {
      code = code.replace(metaRegex, metaStr);
    } else {
      code = metaStr + '\n\n' + code;
    }

    editor.value = code;
    api.notify('Meta applied!', 'success', 1500);
  };

  // ── PREVIEW RUNTIME ──
  let previewInstance = null;

  function createPreviewApi() {
    const fakeContainer = document.createElement('div');
    fakeContainer.style.cssText = 'position:absolute;inset:0;';
    previewBoard.innerHTML = '';
    previewBoard.appendChild(fakeContainer);

    const previewBus = {
      listeners: {},
      on(e, cb) { (this.listeners[e] = this.listeners[e] || []).push(cb); },
      off(e, cb) { if (this.listeners[e]) this.listeners[e] = this.listeners[e].filter(f => f !== cb); },
      emit(e, d) { (this.listeners[e] || []).forEach(cb => { try { cb(d); } catch(err) { logToConsole('error', err.message); } }); }
    };

    const previewStorage = {
      _data: {},
      getForPlugin(id, key) { return this._data[`${id}:${key}`] ?? null; },
      setForPlugin(id, key, val) { this._data[`${id}:${key}`] = val; }
    };

    return {
      version: api.version,
      boardEl: previewBoard,
      bus: previewBus,
      container: fakeContainer,
      getPluginId: () => 'preview',
      storage: previewStorage,
      notify: (msg, type, dur) => logToConsole('success', `[notify:${type}] ${msg}`),
      injectCSS: (id, css, opts) => {
        const style = document.createElement('style');
        style.textContent = css;
        previewBoard.appendChild(style);
        return style;
      },
      removeCSS: () => {},
      makeDraggable: () => {},
      makeResizable: () => {},
      debounce: api.debounce,
      throttle: api.throttle,
      setPluginPermissions: () => {},
      registerToolbarButton: () => {},
      removeToolbarButton: () => {},
      registerContextMenuItem: () => {},
      registerShortcut: () => { return () => {}; }
    };
  }

  async function runPreview() {
    const code = editor.value;
    currentCode = code;
    logToConsole('log', 'Running preview...');

    if (previewInstance && typeof previewInstance.teardown === 'function') {
      try { previewInstance.teardown(); } catch(e) {}
    }
    previewBoard.innerHTML = '';

    try {
      const blob = new Blob([code], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);

      try {
        const mod = await import(url);

        if (!mod.meta || !mod.setup) {
          throw new Error('Plugin must export "meta" and "setup"');
        }

        logToConsole('success', `Loaded: ${mod.meta.name} v${mod.meta.version}`);

        const previewApi = createPreviewApi();
        await mod.setup(previewApi);
        previewInstance = mod;

        logToConsole('success', 'Preview running ✓');
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      logToConsole('error', `Error: ${err.message}`);
      previewBoard.innerHTML = `
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:system-ui;">
          <div style="text-align:center;color:#e74c3c;padding:20px;">
            <div style="font-size:48px;margin-bottom:12px;">❌</div>
            <div style="font-weight:600;margin-bottom:8px;">Plugin Error</div>
            <div style="font-size:13px;color:#999;max-width:400px;word-break:break-all;">${err.message}</div>
          </div>
        </div>
      `;
    }
  }

  // ── BUTTONS ──
  builderEl.querySelector('#pb-run-btn').onclick = runPreview;
  builderEl.querySelector('#pb-reload-preview').onclick = runPreview;

  builderEl.querySelector('#pb-clear-btn').onclick = () => {
    editor.value = '';
    previewBoard.innerHTML = '';
    consoleOutput.innerHTML = '';
    logToConsole('log', 'Cleared');
  };

  builderEl.querySelector('#pb-export-btn').onclick = () => {
    const code = editor.value;
    const blob = new Blob([code], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plugin.js';
    a.click();
    URL.revokeObjectURL(url);
    api.notify('Plugin exported as plugin.js', 'success');
    logToConsole('success', 'Exported plugin.js');
  };

  // ── KEYBOARD SHORTCUTS ──
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = start + 2;
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      runPreview();
    }
  });

  // ── RESIZER ──
  const resizer = builderEl.querySelector('#pb-resizer');
  const editorPane = builderEl.querySelector('.pb-editor-pane');
  const previewPane = builderEl.querySelector('.pb-preview-pane');

  let resizing = false;
  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    resizing = true;
    const startX = e.clientX;
    const startWidth = editorPane.offsetWidth;

    function onMove(e) {
      if (!resizing) return;
      const totalWidth = editorPane.offsetWidth + previewPane.offsetWidth;
      const newWidth = Math.max(200, Math.min(totalWidth - 200, startWidth + (e.clientX - startX)));
      editorPane.style.flex = 'none';
      editorPane.style.width = newWidth + 'px';
      previewPane.style.flex = '1';
    }

    function onUp() {
      resizing = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // ── AUTO-RUN ON LOAD ──
  runPreview();

  logToConsole('log', 'Plugin Builder ready — Ctrl+Enter to run');
  logToConsole('log', 'Pick a template or start coding!');
}

export function teardown() {
  currentApi?.removeCSS(meta.id);
  builderEl?.remove();
  builderEl = null;
  currentApi = null;
}