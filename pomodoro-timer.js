let currentApi = null;
let interval = null;

export const meta = {
  id: 'pomodoro-timer',
  name: 'Pomodoro Timer',
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

    .pomodoro {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      background: #1e1e2f;
      border-radius: 22px;
      padding: 18px;
      box-sizing: border-box;
      font-family: system-ui, sans-serif;
      box-shadow: 0 20px 50px rgba(0,0,0,0.45);
      color: #fff;
    }

    .pom-header {
      display: flex;
      justify-content: flex-end;
    }

    .pom-close {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      border: none;
      background: rgba(255,255,255,0.08);
      color: #fff;
      cursor: pointer;
    }

    .pom-close:hover {
      background: #ff4d4f;
    }

    .pom-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      text-align: center;
    }

    .pomodoro-label {
      color: #e94560;
      font-size: 12px;
      letter-spacing: 2px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    .pomodoro-time {
      font-size: 48px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      margin-bottom: 14px;
    }

    .pomodoro-controls {
      display: flex;
      gap: 10px;
    }

    .pomodoro-controls button {
      padding: 8px 16px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
    }

    .pomodoro-btn-start { background: #e94560; color: #fff; }
    .pomodoro-btn-pause { background: #f39c12; color: #fff; }
    .pomodoro-btn-reset { background: #333; color: #aaa; }

    .pomodoro-btn-start:hover { background: #c0392b; }
    .pomodoro-btn-pause:hover { background: #e67e22; }
    .pomodoro-btn-reset:hover { background: #555; }

    .pomodoro-session {
      text-align: center;
      color: #888;
      font-size: 12px;
      margin-top: 10px;
    }
  `);

  const container = api.container;

  // Fix clipping
  container.style.borderRadius = '22px';
  container.style.overflow = 'hidden';

  let state = api.storage.getForPlugin(meta.id, 'state') || {
    remaining: 25 * 60,
    running: false,
    mode: 'work',
    sessions: 0
  };

  function render() {
    const mins = Math.floor(state.remaining / 60).toString().padStart(2, '0');
    const secs = (state.remaining % 60).toString().padStart(2, '0');
    const modeLabel = state.mode === 'work' ? '🍅 Focus Time' : '☕ Break Time';

    container.innerHTML = `
      <div class="pomodoro">

        <div class="pom-header">
          <button class="pom-close" id="pom-close">✕</button>
        </div>

        <div class="pom-center">
          <div class="pomodoro-label">${modeLabel}</div>
          <div class="pomodoro-time">${mins}:${secs}</div>

          <div class="pomodoro-controls">
            <button class="pomodoro-btn-start" id="pom-start">
              ${state.running ? 'Running...' : 'Start'}
            </button>
            <button class="pomodoro-btn-pause" id="pom-pause">Pause</button>
            <button class="pomodoro-btn-reset" id="pom-reset">Reset</button>
          </div>
        </div>

        <div class="pomodoro-session">
          Sessions completed: ${state.sessions}
        </div>

      </div>
    `;

    container.querySelector('#pom-start').addEventListener('click', startTimer);
    container.querySelector('#pom-pause').addEventListener('click', pauseTimer);
    container.querySelector('#pom-reset').addEventListener('click', resetTimer);

    // CLOSE (hide only)
    container.querySelector('#pom-close').addEventListener('click', () => {
      state.running = false;
      clearInterval(interval);
      interval = null;
      save();
      container.style.display = 'none';
    });
  }

  function save() {
    api.storage.setForPlugin(meta.id, 'state', state);
  }

  function startTimer() {
    if (state.running) return;

    state.running = true;
    save();

    interval = setInterval(() => {
      state.remaining--;

      if (state.remaining <= 0) {
        if (state.mode === 'work') {
          state.sessions++;
          state.mode = 'break';
          state.remaining = 5 * 60;
          api.notify('🍅 Pomodoro done! Take a break.', 'success');
        } else {
          state.mode = 'work';
          state.remaining = 25 * 60;
          api.notify('☕ Break over! Back to work.', 'info');
        }
      }

      save();
      render();
    }, 1000);

    render();
  }

  function pauseTimer() {
    state.running = false;
    clearInterval(interval);
    interval = null;
    save();
    render();
  }

  function resetTimer() {
    state.running = false;
    clearInterval(interval);
    interval = null;
    state.remaining = state.mode === 'work' ? 25 * 60 : 5 * 60;
    save();
    render();
  }

  render();
}

export function teardown() {
  if (interval) clearInterval(interval);
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
  interval = null;
}