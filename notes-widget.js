let currentApi = null;
let saveDebounced = null;

export const meta = {
  id: 'notes-widget',
  name: 'Notes Widget',
  version: '2.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .notes {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: #161618;
      border-radius: 14px;
      overflow: hidden;
    }

    .notes textarea {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      resize: none;
      padding: 14px;
      color: #eee;
      font-size: 14px;
      font-family: system-ui;
    }
  `);

  const container = api.container;

  const saved = api.storage.getForPlugin(meta.id, 'content') || '';

  container.innerHTML = `
    <div class="notes">
      <textarea placeholder="Start writing..."></textarea>
    </div>
  `;

  const textarea = container.querySelector('textarea');
  textarea.value = saved;

  saveDebounced = api.debounce((val) => {
    api.storage.setForPlugin(meta.id, 'content', val);
  }, 400);

  textarea.addEventListener('input', (e) => {
    saveDebounced(e.target.value);
  });
}

export function teardown() {
  if (!currentApi) return;

  currentApi.removeCSS(meta.id);

  currentApi = null;
  saveDebounced = null;
}