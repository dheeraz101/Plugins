let currentApi = null;

export const meta = {
  id: 'text-counter',
  name: 'Text Counter',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .tc-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; display: flex; flex-direction: column; font-family: system-ui, sans-serif; overflow: hidden; }
    .tc-header { padding: 12px 16px; border-bottom: 1px solid #2a2a4a; color: #fff; font-size: 14px; font-weight: 600; }
    .tc-body { flex: 1; display: flex; flex-direction: column; }
    .tc-textarea { flex: 1; background: transparent; border: none; outline: none; resize: none; padding: 14px; color: #ddd; font-size: 14px; line-height: 1.6; }
    .tc-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #2a2a4a; border-top: 1px solid #2a2a4a; }
    .tc-stat { background: #1a1a2e; padding: 10px; text-align: center; }
    .tc-stat-val { color: #7c6fff; font-size: 20px; font-weight: 700; }
    .tc-stat-label { color: #666; font-size: 11px; margin-top: 2px; }
  `);

  const container = api.container;
  const saved = api.storage.getForPlugin(meta.id, 'text') || '';

  function count(text) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const lines = text ? text.split('\n').length : 0;
    const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, charsNoSpace, lines, sentences, paragraphs, readingTime };
  }

  function render() {
    const c = count(saved);
    container.innerHTML = `
      <div class="tc-widget">
        <div class="tc-header">📊 Text Counter</div>
        <div class="tc-body">
          <textarea class="tc-textarea" id="tc-input" placeholder="Type or paste your text here...">${saved}</textarea>
        </div>
        <div class="tc-stats">
          <div class="tc-stat"><div class="tc-stat-val">${c.words}</div><div class="tc-stat-label">Words</div></div>
          <div class="tc-stat"><div class="tc-stat-val">${c.chars}</div><div class="tc-stat-label">Characters</div></div>
          <div class="tc-stat"><div class="tc-stat-val">${c.charsNoSpace}</div><div class="tc-stat-label">No Spaces</div></div>
          <div class="tc-stat"><div class="tc-stat-val">${c.lines}</div><div class="tc-stat-label">Lines</div></div>
          <div class="tc-stat"><div class="tc-stat-val">${c.sentences}</div><div class="tc-stat-label">Sentences</div></div>
          <div class="tc-stat"><div class="tc-stat-val">${c.readingTime}m</div><div class="tc-stat-label">Read Time</div></div>
        </div>
      </div>
    `;

    const input = container.querySelector('#tc-input');
    const saveDebounced = api.debounce((val) => {
      api.storage.setForPlugin(meta.id, 'text', val);
      const c = count(val);
      const stats = container.querySelectorAll('.tc-stat-val');
      if (stats.length >= 6) {
        stats[0].textContent = c.words;
        stats[1].textContent = c.chars;
        stats[2].textContent = c.charsNoSpace;
        stats[3].textContent = c.lines;
        stats[4].textContent = c.sentences;
        stats[5].textContent = c.readingTime + 'm';
      }
    }, 200);
    input.addEventListener('input', e => saveDebounced(e.target.value));
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
