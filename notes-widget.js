let currentApi = null;
let saveDebounced = null;

export const meta = {
  id: 'notes-widget',
  name: 'Notes Widget',
  version: '2.1.2',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  // Scoped CSS using the core's injectCSS
  api.injectCSS(meta.id, `
    .notes-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      border: 1px solid rgba(0,0,0,0.05);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    }

    .notes-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px 8px 16px;
    }

    .notes-textarea {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      resize: none;
      padding: 0 18px 18px 18px;
      color: #1d1d1f;
      font-size: 15px;
      line-height: 1.6;
      font-family: inherit;
    }

    .notes-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
      background: rgba(0,0,0,0.02);
      border-top: 1px solid rgba(0,0,0,0.04);
    }

    .notes-status { font-size: 11px; color: #86868b; font-weight: 500; }

    .notes-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
    }

    .notes-btn svg { width: 16px; height: 16px; stroke: #0071e3; fill: none; }

    @media (prefers-color-scheme: dark) {
      .notes-container { background: #1c1c1e; border-color: rgba(255,255,255,0.1); }
      .notes-textarea { color: #f5f5f7; }
      .notes-footer { background: rgba(255,255,255,0.03); border-top-color: rgba(255,255,255,0.05); }
      .notes-btn svg { stroke: #64d2ff; }
    }
  `);

  const container = api.container;
  // Set initial dimensions
  container.style.width = '300px';
  container.style.height = '350px';

  const saved = api.storage.get('content') || '';

  container.innerHTML = `
    <div class="notes-container">
      <div class="notes-header">
        <div class="notes-btn" id="notes-menu">
           <svg viewBox="0 0 24 24" stroke-width="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </div>
        <div class="notes-btn" id="notes-share">
           <svg viewBox="0 0 24 24" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </div>
      </div>
      <textarea class="notes-textarea" placeholder="New Note..."></textarea>
      <div class="notes-footer">
        <span class="notes-status" id="save-indicator">Saved</span>
        <span class="notes-status" id="char-count">0 chars</span>
      </div>
    </div>
  `;

  const textarea = container.querySelector('.notes-textarea');
  const indicator = container.querySelector('#save-indicator');
  const countDisplay = container.querySelector('#char-count');
  
  textarea.value = saved;
  countDisplay.innerText = `${saved.length} chars`;

  // Use the core's debounce utility
  saveDebounced = api.debounce((val) => {
    api.storage.set('content', val);
    indicator.innerText = 'Saved';
  }, 800);

  textarea.addEventListener('input', (e) => {
    indicator.innerText = 'Typing...';
    countDisplay.innerText = `${e.target.value.length} chars`;
    saveDebounced(e.target.value);
  });

  container.querySelector('#notes-share').addEventListener('click', () => {
    navigator.clipboard.writeText(textarea.value);
    indicator.innerText = 'Copied!';
    setTimeout(() => indicator.innerText = 'Saved', 2000);
  });

  const menuBtn = container.querySelector('#notes-menu');

  menuBtn.addEventListener('click', () => {
    container.style.display = 'none';
  });

  // Resizing works automatically now
  api.makeResizable(container);
}

export function teardown() {
  if (currentApi) {
    currentApi.removeCSS(meta.id);
  }
}