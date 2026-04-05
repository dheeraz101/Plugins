let currentApi = null;
let interval = null;

export const meta = {
  id: 'countdown-timer',
  name: 'Countdown Timer',
  version: '1.0.2',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .cd-root {
      width: 100%;
      height: 100%;
      border-radius: 14px;
      overflow: hidden; /* 🔥 FIX: kills square bleed */
      display: flex;
      flex-direction: column;
      background: #1a1a2e;
    }

    .cd-header {
      display: flex;
      justify-content: flex-end;
      padding: 6px;
      background: transparent;
    }

    .cd-close {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: none;
      background: #ff3b30;
      color: white;
      font-size: 14px;
      cursor: pointer;
    }

    .cd-close:hover {
      background: #ff5c50;
    }

    .cd-widget {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: system-ui, sans-serif;
      padding: 20px;
      box-sizing: border-box;
    }

    .cd-time { font-size: 48px; font-weight: 700; color: #fff; font-variant-numeric: tabular-nums; margin-bottom: 12px; }
    .cd-time.urgent { color: #e94560; }
    .cd-inputs { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; }
    .cd-input { width: 50px; padding: 6px; text-align: center; background: #252540; border: 1px solid #444; border-radius: 8px; color: #fff; font-size: 16px; }
    .cd-sep { color: #666; font-size: 20px; }
    .cd-controls { display: flex; gap: 10px; }
    .cd-btn { padding: 8px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; }
    .cd-start { background: #2ecc71; color: #fff; }
    .cd-pause { background: #f39c12; color: #fff; }
    .cd-reset { background: #333; color: #aaa; }
  `);

  const container = api.container;
  let total = 0, remaining = 0, running = false;

  function render() {
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    const urgent = remaining <= 10 && remaining > 0 && running;

  container.innerHTML = `
    <div class="cd-root">
      <div class="cd-header">
        <button class="cd-close" id="cd-close">✕</button>
      </div>

      <div class="cd-widget">
        <div class="cd-time ${urgent ? 'urgent' : ''}">
          ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}
        </div>

        ${!running ? `
          <div class="cd-inputs">
            <input class="cd-input" id="cd-h" type="number" min="0" max="99" value="${h}">
            <span class="cd-sep">:</span>
            <input class="cd-input" id="cd-m" type="number" min="0" max="59" value="${m}">
            <span class="cd-sep">:</span>
            <input class="cd-input" id="cd-s" type="number" min="0" max="59" value="${s}">
          </div>
        ` : ''}

        <div class="cd-controls">
          <button class="cd-btn ${running ? 'cd-pause' : 'cd-start'}" id="cd-toggle">
            ${running ? 'Pause' : 'Start'}
          </button>
          <button class="cd-btn cd-reset" id="cd-reset">Reset</button>
        </div>
      </div>
    </div>
  `;

    container.querySelector('#cd-toggle').addEventListener('click', toggle);
    container.querySelector('#cd-reset').addEventListener('click', reset);
    container.querySelector('#cd-close').addEventListener('click', () => {
        container.style.display = 'none';
    });

    if (!running) {
      const hIn = container.querySelector('#cd-h');
      const mIn = container.querySelector('#cd-m');
      const sIn = container.querySelector('#cd-s');
      if (hIn && mIn && sIn) {
        [hIn, mIn, sIn].forEach(el => el.addEventListener('change', () => {
          remaining = (+hIn.value || 0) * 3600 + (+mIn.value || 0) * 60 + (+sIn.value || 0);
          total = remaining;
          render();
        }));
      }
    }
  }

  function toggle() {
    if (running) {
      running = false;
      clearInterval(interval); interval = null;
    } else {
      if (remaining <= 0) return;
      running = true;
      interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          remaining = 0;
          running = false;
          clearInterval(interval); interval = null;
          api.notify('⏰ Countdown finished!', 'warning', 5000);
        }
        render();
      }, 1000);
    }
    render();
  }

  function reset() {
    running = false;
    clearInterval(interval); interval = null;
    remaining = total || 300;
    render();
  }

  remaining = 300;
  total = 300;
  render();
}

export function teardown() {
  if (interval) clearInterval(interval);
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
  interval = null;
}
