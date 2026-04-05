let currentApi = null;

export const meta = {
  id: 'text-counter',
  name: 'Text Counter',
  version: '1.0.1',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    [data-plugin-id="${meta.id}"].bb-plugin-container {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      overflow: visible !important;
    }

    .tc-widget {
      width: 100%;
      height: 100%;
      background: #1e1e2f;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      font-family: system-ui, sans-serif;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.4);
    }

    .tc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    .tc-close {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      border: none;
      background: rgba(255,255,255,0.08);
      color: #fff;
      cursor: pointer;
      font-size: 14px;
    }

    .tc-close:hover {
      background: #ff4d4f;
    }

    .tc-body {
      flex: 1;
      display: flex;
    }

    .tc-textarea {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      resize: none;
      padding: 16px;
      color: #ddd;
      font-size: 14px;
      line-height: 1.6;
    }

    .tc-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: rgba(255,255,255,0.05);
    }

    .tc-stat {
      background: #1e1e2f;
      padding: 12px;
      text-align: center;
    }

    .tc-stat-val {
      color: #8b7dff;
      font-size: 18px;
      font-weight: 700;
    }

    .tc-stat-label {
      color: #777;
      font-size: 10px;
      margin-top: 2px;
      text-transform: uppercase;
    }
  `);

  const container = api.container;
  container.style.borderRadius = '20px';
  container.style.overflow = 'hidden';
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
        <div class="tc-header">
          <span>📊 Text Counter</span>
          <button class="tc-close" id="tc-close">✕</button>
        </div>
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

    container.querySelector('#tc-close').addEventListener('click', () => {
      container.style.display = 'none';
    });
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
