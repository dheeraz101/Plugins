let currentApi = null;

export const meta = {
  id: 'random-quote',
  name: 'Random Quotes',
  version: '1.1.0',
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

    .rq-widget {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1f1f2e, #141423);
      border-radius: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20px;
      box-sizing: border-box;
      font-family: system-ui, sans-serif;
      box-shadow: 0 20px 50px rgba(0,0,0,0.45);
      color: #fff;
    }

    .rq-header {
      display: flex;
      justify-content: flex-end;
    }

    .rq-close {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      border: none;
      background: rgba(255,255,255,0.08);
      color: #fff;
      cursor: pointer;
    }

    .rq-close:hover {
      background: #ff4d4f;
    }

    .rq-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
    }

    .rq-quote {
      font-size: 16px;
      line-height: 1.6;
      color: #e6e6f0;
      font-style: italic;
      margin-bottom: 16px;
    }

    .rq-loading {
      opacity: 0.6;
    }

    .rq-author {
      font-size: 13px;
      color: #8b7dff;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .rq-footer {
      display: flex;
      justify-content: center;
    }

    .rq-btn {
      padding: 8px 18px;
      background: rgba(139,125,255,0.2);
      border: 1px solid rgba(139,125,255,0.3);
      border-radius: 10px;
      color: #8b7dff;
      cursor: pointer;
      font-size: 13px;
    }

    .rq-btn:hover {
      background: rgba(139,125,255,0.3);
    }
  `);

  const container = api.container;

  // Ensure proper clipping
  container.style.borderRadius = '22px';
  container.style.overflow = 'hidden';

  let current = { text: 'Loading...', author: '' };
  let isFetching = false;

  function setLoading() {
    current = { text: 'Loading...', author: '' };
    render();
  }

  async function fetchQuote() {
    if (isFetching) return;
    isFetching = true;

    try {
      const res = await fetch('https://api.quotable.io/quotes/random');
      const data = await res.json();
      const q = Array.isArray(data) ? data[0] : data;

      if (!q || !q.content) throw new Error();

      current = {
        text: q.content,
        author: q.author
      };
    } catch {
      current = {
        text: "Network failed. So here's truth: discipline beats consistency.",
        author: "System"
      };
    }

    isFetching = false;
    render();
  }

  function render() {
    const isLoading = current.text === 'Loading...';

    container.innerHTML = `
      <div class="rq-widget">
        
        <div class="rq-header">
          <button class="rq-close" id="rq-close">✕</button>
        </div>

        <div class="rq-content">
          <div class="rq-quote ${isLoading ? 'rq-loading' : ''}">
            "${current.text}"
          </div>
          <div class="rq-author">— ${current.author}</div>
        </div>

        <div class="rq-footer">
          <button class="rq-btn" id="rq-new">✨ New Quote</button>
        </div>

      </div>
    `;

    // New quote
    container.querySelector('#rq-new').addEventListener('click', () => {
      setLoading();
      fetchQuote();
    });

    // Close (hide only)
    container.querySelector('#rq-close').addEventListener('click', () => {
      container.style.display = 'none';
    });
  }

  // Initial load
  render();
  fetchQuote();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}