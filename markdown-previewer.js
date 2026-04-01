let currentApi = null;

export const meta = {
  id: 'markdown-previewer',
  name: 'Markdown Previewer',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  const saved = api.storage.getForPlugin(meta.id, 'content') || '# Hello World\n\nWrite your **markdown** here.\n\n- Item 1\n- Item 2\n\n> A blockquote\n\n```js\nconsole.log("code!");\n```';

  api.injectCSS(meta.id, `
    .md-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; display: flex; flex-direction: column; font-family: system-ui, sans-serif; overflow: hidden; }
    .md-header { display: flex; gap: 8px; padding: 10px; border-bottom: 1px solid #2a2a4a; }
    .md-tab { padding: 6px 14px; background: none; border: none; color: #888; cursor: pointer; border-radius: 6px; font-size: 13px; }
    .md-tab.active { background: #e94560; color: #fff; }
    .md-editor { flex: 1; display: flex; flex-direction: column; }
    .md-textarea { flex: 1; background: transparent; border: none; outline: none; resize: none; padding: 14px; color: #ddd; font-size: 13px; font-family: 'Fira Code', monospace; line-height: 1.6; }
    .md-preview { flex: 1; padding: 14px; overflow-y: auto; color: #ddd; font-size: 14px; line-height: 1.6; }
    .md-preview h1, .md-preview h2, .md-preview h3 { color: #fff; margin: 16px 0 8px; }
    .md-preview h1 { font-size: 22px; border-bottom: 1px solid #333; padding-bottom: 6px; }
    .md-preview code { background: #252540; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .md-preview pre { background: #252540; padding: 12px; border-radius: 8px; overflow-x: auto; }
    .md-preview pre code { background: none; padding: 0; }
    .md-preview blockquote { border-left: 3px solid #e94560; margin: 8px 0; padding-left: 12px; color: #aaa; }
    .md-preview ul, .md-preview ol { padding-left: 20px; }
    .md-preview a { color: #7c6fff; }
  `);

  const container = api.container;
  let mode = 'split';

  function parseMd(md) {
    return md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  function render() {
    const content = api.storage.getForPlugin(meta.id, 'content') || saved;
    container.innerHTML = `
      <div class="md-widget">
        <div class="md-header">
          <button class="md-tab ${mode==='edit'?'active':''}" data-m="edit">✏️ Edit</button>
          <button class="md-tab ${mode==='preview'?'active':''}" data-m="preview">👁️ Preview</button>
          <button class="md-tab ${mode==='split'?'active':''}" data-m="split">📐 Split</button>
        </div>
        <div class="md-editor" style="${mode==='split'?'flex-direction:row':''}">
          ${mode !== 'preview' ? `<textarea class="md-textarea" id="md-input" style="${mode==='split'?'width:50%;border-right:1px solid #2a2a4a':''}">${content}</textarea>` : ''}
          ${mode !== 'edit' ? `<div class="md-preview" style="${mode==='split'?'width:50%;overflow-y:auto':''}" id="md-output">${parseMd(content)}</div>` : ''}
        </div>
      </div>
    `;

    container.querySelectorAll('.md-tab').forEach(el => el.addEventListener('click', () => { mode = el.dataset.m; render(); }));
    const textarea = container.querySelector('#md-input');
    if (textarea) {
      const saveDebounced = api.debounce((val) => api.storage.setForPlugin(meta.id, 'content', val), 400);
      textarea.addEventListener('input', e => {
        saveDebounced(e.target.value);
        const output = container.querySelector('#md-output');
        if (output) output.innerHTML = parseMd(e.target.value);
      });
    }
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
